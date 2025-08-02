
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from './use-language';
import { translateText } from '@/ai/flows/translate-text';

const translationsCache: { [lang: string]: { [originalText: string]: string } } = {};

export function useTranslation(texts: { [key: string]: string }) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<{ [key: string]: string }>(texts);
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
    const textsToTranslate = textValues.filter(originalText => !cachedTranslations[originalText]);

    if (textsToTranslate.length === 0) {
      const newTranslations: { [key: string]: string } = {};
      for (const key in texts) {
        const originalText = texts[key];
        newTranslations[key] = cachedTranslations[originalText] || originalText;
      }
      setTranslations(newTranslations);
      return;
    }

    setIsTranslating(true);
    
    try {
        const translationPromises = textsToTranslate.map(async (originalText) => {
            try {
                const result = await translateText({ text: originalText, targetLanguage: language });
                return { translatedText: result.translatedText, originalText };
            } catch (error) {
                console.error(`Could not translate '${originalText}':`, error);
                return { translatedText: originalText, originalText }; // Keep original text on error
            }
        });

      const settledTranslations = await Promise.all(translationPromises);

      settledTranslations.forEach(({ originalText, translatedText }) => {
        cachedTranslations[originalText] = translatedText;
      });

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
  }, [language, texts, textValues]);

  useEffect(() => {
    translateAll();
  }, [language, translateAll]);

  const t = (key: keyof typeof texts): string => {
    return translations[key] || texts[key];
  };

  return { t, isTranslating, currentLanguage: language };
}
