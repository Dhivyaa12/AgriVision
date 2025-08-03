
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

  const requestsByLang: { [lang: string]: typeof translationQueue } = {};
  const currentQueue = [...translationQueue];
  translationQueue = [];

  currentQueue.forEach(item => {
    if (!requestsByLang[item.targetLanguage]) {
      requestsByLang[item.targetLanguage] = [];
    }
    requestsByLang[item.targetLanguage].push(item);
  });

  for (const lang in requestsByLang) {
    const batch = requestsByLang[lang];
    const uniqueTexts = [...new Set(batch.map(item => item.originalText))];
    
    // Filter out texts that are already in the cache for this language
    const textsToTranslate = uniqueTexts.filter(text => !translationsCache[lang]?.[text]);

    if (textsToTranslate.length > 0) {
      try {
        // Batch all unique texts for the current language into a single prompt
        const combinedText = textsToTranslate.join('\n---\n');
        const result = await translateText({ text: combinedText, targetLanguage: lang });
        const translatedTexts = result.translatedText.split('\n---\n');

        if (!translationsCache[lang]) {
          translationsCache[lang] = {};
        }

        textsToTranslate.forEach((originalText, index) => {
          // Fallback in case the model doesn't return the same number of lines
          const translated = translatedTexts[index] || originalText;
          translationsCache[lang][originalText] = translated;
        });

      } catch (error) {
        console.error(`Failed to translate batch for language ${lang}:`, error);
        // On error, reject all promises in this batch
        batch.forEach(item => item.reject(error));
        continue; // Move to the next language batch
      }
    }
    
    // Resolve all promises for this language batch using the (now populated) cache
    batch.forEach(item => {
      const translated = translationsCache[lang]?.[item.originalText];
      if (translated) {
        item.resolve(translated);
      } else {
        // This can happen if the translation failed but wasn't caught, or for an empty string.
        // Resolve with original text as a fallback.
        item.resolve(item.originalText);
      }
    });
  }
  
  isProcessingQueue = false;
  // If new items were added while processing, run again
  if(translationQueue.length > 0) {
    setTimeout(processTranslationQueue, 100);
  }
};


const getTranslation = (originalText: string, targetLanguage: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!originalText || targetLanguage === 'en') {
      resolve(originalText);
      return;
    }

    if (translationsCache[targetLanguage]?.[originalText]) {
      resolve(translationsCache[targetLanguage][originalText]);
      return;
    }
    
    translationQueue.push({ originalText, targetLanguage, resolve, reject });
    
    if (!isProcessingQueue) {
       // Debounce queue processing
      setTimeout(processTranslationQueue, 100);
    }
  });
};


// --- The React Hook ---

export function useTranslation<T extends { [key: string]: string }>(texts: T) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<{ [K in keyof T]: string }>(() => {
    const initialTranslations: any = {};
    for (const key in texts) {
      const originalText = texts[key];
      initialTranslations[key] = translationsCache[language]?.[originalText] || originalText;
    }
    return initialTranslations;
  });
  const [isTranslating, setIsTranslating] = useState(false);


  useEffect(() => {
    // Create a stable reference to the texts object for the effect dependency array.
    const textsString = JSON.stringify(texts);

    if (language === 'en') {
      const englishTexts: any = {};
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
      
      const newTranslations: any = {};
      results.forEach(({ key, translatedText }) => {
        newTranslations[key] = translatedText;
      });
      setTranslations(newTranslations);

      setIsTranslating(false);
    };

    translateAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, JSON.stringify(texts)]);

  const t = useCallback((key: keyof T): string => {
    return translations[key] || texts[key] || '';
  }, [translations, texts]);

  return { t, isTranslating, currentLanguage: language };
}
