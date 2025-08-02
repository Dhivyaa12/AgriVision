
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from './use-language';
import { translateText } from '@/ai/flows/translate-text';

const translationsCache: { [lang: string]: { [originalText: string]: string } } = {};

export function useTranslation(texts: { [key: string]: string }) {
  const { language } = useLanguage();
  
  const getInitialTranslations = useCallback(() => {
    const initial: { [key: string]: string } = {};
    const cachedTranslations = translationsCache[language] || {};
    for (const key in texts) {
        initial[key] = cachedTranslations[texts[key]] || texts[key];
    }
    return initial;
  }, [language, texts]);

  const [translations, setTranslations] = useState<{ [key: string]: string }>(getInitialTranslations);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const translateAll = useCallback(async () => {
    if (language === 'en') {
      const englishTexts: { [key: string]: string } = {};
      for (const key in texts) {
          englishTexts[key] = texts[key];
      }
      setTranslations(englishTexts);
      return;
    }

    if (!translationsCache[language]) {
      translationsCache[language] = {};
    }
    
    const cachedTranslationsForLang = translationsCache[language];
    
    const textsToTranslate = Object.keys(texts)
      .filter(key => !cachedTranslationsForLang[texts[key]])
      .map(key => ({ key, originalText: texts[key] }));

    if (textsToTranslate.length === 0) {
        setTranslations(getInitialTranslations());
        return;
    }
    
    setIsTranslating(true);
    
    try {
      const translationPromises = textsToTranslate.map(async ({ originalText }) => {
        try {
          const result = await translateText({ text: originalText, targetLanguage: language });
          return { originalText, translatedText: result.translatedText };
        } catch (error) {
          console.error(`Could not translate '${originalText}':`, error);
          return { originalText, translatedText: originalText }; // Keep original text on error
        }
      });

      const settledTranslations = await Promise.all(translationPromises);

      settledTranslations.forEach(({ originalText, translatedText }) => {
        cachedTranslationsForLang[originalText] = translatedText;
      });

      setTranslations(getInitialTranslations());

    } catch(e) {
        console.error("Translation failed", e)
    } finally {
        setIsTranslating(false);
    }
  }, [language, texts, getInitialTranslations]);

  useEffect(() => {
    translateAll();
  }, [language, translateAll]);

  const t = useCallback((key: keyof typeof texts): string => {
    return translations[key] || texts[key];
  }, [translations, texts]);

  return { t, isTranslating, currentLanguage: language };
}
