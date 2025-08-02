
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from './use-language';
import { translateText } from '@/ai/flows/translate-text';

const translationsCache: { [lang: string]: { [originalText: string]: string } } = {};

export function useTranslation(texts: { [key: string]: string }) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<{ [key: string]: string }>(() => {
    // Initialize with English texts
    const initial: { [key: string]: string } = {};
    for (const key in texts) {
        initial[key] = texts[key];
    }
    return initial;
  });
  const [isTranslating, setIsTranslating] = useState(false);
  
  const textValues = useMemo(() => Object.values(texts), [texts]);

  const translateAll = useCallback(async () => {
    if (language === 'en') {
      setTranslations(texts);
      return;
    }

    if (!translationsCache[language]) {
      translationsCache[language] = {};
    }
    
    const cachedTranslations = translationsCache[language];
    
    // Check if all required translations are already in the cache
    const allCached = Object.keys(texts).every(key => cachedTranslations[texts[key]]);

    if (allCached) {
        const newTranslations: { [key: string]: string } = {};
        for (const key in texts) {
            newTranslations[key] = cachedTranslations[texts[key]];
        }
        setTranslations(newTranslations);
        return;
    }
    
    setIsTranslating(true);
    
    try {
        const textsToTranslate = Object.keys(texts)
            .filter(key => !cachedTranslations[texts[key]])
            .map(key => ({ key, originalText: texts[key] }));

        if (textsToTranslate.length > 0) {
            const translationPromises = textsToTranslate.map(async ({ key, originalText }) => {
                try {
                    const result = await translateText({ text: originalText, targetLanguage: language });
                    return { key, originalText, translatedText: result.translatedText };
                } catch (error) {
                    console.error(`Could not translate '${originalText}':`, error);
                    return { key, originalText, translatedText: originalText }; // Keep original text on error
                }
            });
    
          const settledTranslations = await Promise.all(translationPromises);
    
          settledTranslations.forEach(({ originalText, translatedText }) => {
            cachedTranslations[originalText] = translatedText;
          });
        }

      const newTranslations: { [key: string]: string } = {};
       for (const key in texts) {
        const originalText = texts[key];
        newTranslations[key] = cachedTranslations[originalText] || originalText;
      }
      setTranslations(newTranslations);

    } catch(e) {
        console.error("Translation failed", e)
    } finally {
        setIsTranslating(false);
    }
  }, [language, texts]);

  useEffect(() => {
    translateAll();
  }, [language, translateAll]);

  const t = (key: keyof typeof texts): string => {
    return translations[key] || texts[key];
  };

  return { t, isTranslating, currentLanguage: language };
}
