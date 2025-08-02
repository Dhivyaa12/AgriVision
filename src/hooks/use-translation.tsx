
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './use-language';
import { translateText } from '@/ai/flows/translate-text';

// --- Translation Manager (Singleton) ---
// This will manage a global cache and a queue to prevent API rate limiting.

const translationsCache: { [lang: string]: { [originalText: string]: string } } = {};
let translationQueue: { originalText: string; targetLanguage: string; resolve: (translated: string) => void; reject: (e: any) => void }[] = [];
let isProcessingQueue = false;

const processTranslationQueue = async () => {
  if (isProcessingQueue || translationQueue.length === 0) {
    return;
  }
  isProcessingQueue = true;

  // Batch requests by language
  const requestsByLang: { [lang: string]: typeof translationQueue } = {};
  translationQueue.forEach(item => {
    if (!requestsByLang[item.targetLanguage]) {
      requestsByLang[item.targetLanguage] = [];
    }
    requestsByLang[item.targetLanguage].push(item);
  });
  
  translationQueue = [];

  for (const lang in requestsByLang) {
    const batch = requestsByLang[lang];
    // Create a single translation request for a batch of unique texts
    const uniqueTexts = [...new Set(batch.map(item => item.originalText))];
    
    try {
      // In a real-world scenario, you might batch these into a single API call if the API supports it.
      // For now, we process them sequentially with a small delay to respect rate limits.
      for (const text of uniqueTexts) {
        if (translationsCache[lang]?.[text]) continue; // Already translated by another concurrent process

        const result = await translateText({ text, targetLanguage: lang });
        
        if (!translationsCache[lang]) {
          translationsCache[lang] = {};
        }
        translationsCache[lang][text] = result.translatedText;
        await new Promise(res => setTimeout(res, 200)); // Delay between requests
      }

      // Resolve all promises for this language batch
      batch.forEach(item => {
        const translated = translationsCache[lang][item.originalText];
        if (translated) {
          item.resolve(translated);
        } else {
          // Should not happen, but as a fallback, return original text
          item.resolve(item.originalText);
        }
      });

    } catch (error) {
      console.error(`Failed to translate batch for language ${lang}:`, error);
      batch.forEach(item => item.reject(error));
    }
  }
  
  isProcessingQueue = false;
  // If new items were added while processing, run again
  if(translationQueue.length > 0) {
      setTimeout(processTranslationQueue, 500);
  }
};

const getTranslation = (originalText: string, targetLanguage: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (targetLanguage === 'en') {
      resolve(originalText);
      return;
    }

    if (translationsCache[targetLanguage]?.[originalText]) {
      resolve(translationsCache[targetLanguage][originalText]);
      return;
    }
    
    // Check if the same request is already in the queue
    if (translationQueue.some(item => item.originalText === originalText && item.targetLanguage === targetLanguage)) {
       // It's already queued, let the existing promise handle it. We will just wait.
       const checkInterval = setInterval(() => {
           if (translationsCache[targetLanguage]?.[originalText]) {
               clearInterval(checkInterval);
               resolve(translationsCache[targetLanguage][originalText]);
           }
       }, 100);
       return;
    }

    translationQueue.push({ originalText, targetLanguage, resolve, reject });
    
    // Debounce queue processing
    setTimeout(processTranslationQueue, 100);
  });
};


// --- The React Hook ---

export function useTranslation(texts: { [key: string]: string }) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Set initial state from cache or default texts
  useEffect(() => {
    const initialTranslations: { [key: string]: string } = {};
    for (const key in texts) {
      const originalText = texts[key];
      initialTranslations[key] = translationsCache[language]?.[originalText] || originalText;
    }
    setTranslations(initialTranslations);
  }, [language, texts]);


  useEffect(() => {
    if (language === 'en') {
      const englishTexts: { [key: string]: string } = {};
       for (const key in texts) {
          englishTexts[key] = texts[key];
      }
      setTranslations(englishTexts);
      return;
    }

    const translateAll = async () => {
      setIsTranslating(true);
      const promises = Object.keys(texts).map(async (key) => {
        const originalText = texts[key];
        try {
          const translatedText = await getTranslation(originalText, language);
          return { key, translatedText };
        } catch (error) {
          console.error(`Failed to translate "${originalText}"`, error);
          return { key, translatedText: originalText }; // Fallback to original
        }
      });

      const results = await Promise.all(promises);
      
      setTranslations(prev => {
        const newTranslations = { ...prev };
        results.forEach(({ key, translatedText }) => {
          newTranslations[key] = translatedText;
        });
        return newTranslations;
      });

      setIsTranslating(false);
    };

    translateAll();
  }, [language, texts]);

  const t = useCallback((key: keyof typeof texts): string => {
    return translations[key] || texts[key];
  }, [translations, texts]);

  return { t, isTranslating, currentLanguage: language };
}
