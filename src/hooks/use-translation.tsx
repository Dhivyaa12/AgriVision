
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './use-language';
import { translateText } from '@/ai/flows/translate-text';

const translationsCache: { [lang: string]: { [originalText: string]: string } } = {};

export function useTranslation(texts: { [key: string]: string }) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<{ [key: string]: string }>(texts);
  const [isTranslating, setIsTranslating] = useState(false);

  const translateAll = useCallback(async () => {
    if (language === 'en') {
      setTranslations(texts);
      return;
    }

    // Check if all required translations are already in the cache for the current language
    if (translationsCache[language]) {
      const allTextsAreCached = Object.values(texts).every(
        (originalText) => translationsCache[language][originalText]
      );

      if (allTextsAreCached) {
        const newTranslations: { [key: string]: string } = {};
        for (const key in texts) {
          newTranslations[key] = translationsCache[language][texts[key]];
        }
        setTranslations(newTranslations);
        return; // All translations found in cache, no need to call API
      }
    }

    setIsTranslating(true);
    const newTranslations: { [key: string]: string } = { ...texts };

    if (!translationsCache[language]) {
      translationsCache[language] = {};
    }

    // Create a list of promises for translations not in the cache
    const translationPromises = Object.keys(texts)
      .filter((key) => !translationsCache[language][texts[key]])
      .map(async (key) => {
        const originalText = texts[key];
        try {
          const result = await translateText({ text: originalText, targetLanguage: language });
          return { key, translatedText: result.translatedText, originalText };
        } catch (error) {
          console.error(`Could not translate '${originalText}':`, error);
          return { key, translatedText: originalText, originalText }; // Keep original text on error
        }
      });
      
    // Execute all translation requests in parallel
    const settledTranslations = await Promise.all(translationPromises);

    // Apply cached and new translations
    for (const key in texts) {
        const originalText = texts[key];
        if (translationsCache[language][originalText]) {
            newTranslations[key] = translationsCache[language][originalText];
        }
    }

    settledTranslations.forEach(({ key, translatedText, originalText }) => {
      newTranslations[key] = translatedText;
      translationsCache[language][originalText] = translatedText;
    });

    setTranslations(newTranslations);
    setIsTranslating(false);
  }, [language, texts]);

  useEffect(() => {
    translateAll();
  }, [language, translateAll]);

  const t = (key: keyof typeof texts): string => {
    return translations[key] || texts[key];
  };

  return { t, isTranslating, currentLanguage: language };
}
