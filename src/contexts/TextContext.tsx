import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import texts from '../constants/texts.json';
import { detectBrowserLanguage, setLanguagePreference, getStoredLanguage } from '../utils/languageDetection';
import type { LanguageCode } from '../constants/languages';

interface TextContextType {
  t: (path: string, language?: LanguageCode) => string;
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  texts: Record<string, any>;
  allLanguages: LanguageCode[];
}

const TextContext = createContext<TextContextType | undefined>(undefined);

export const TextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize language: check stored, then auto-detect, then default
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const stored = getStoredLanguage();
    if (stored) return stored;
    return detectBrowserLanguage();
  });

  // Persist language choice to localStorage whenever it changes
  useEffect(() => {
    setLanguagePreference(currentLanguage);
  }, [currentLanguage]);

  // Resolve a dot-path within a language object; returns undefined if not found
  const resolvePath = (langObj: any, keys: string[]): any => {
    let value: any = langObj;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return undefined;
    }
    return value;
  };

  // Get text function with language fallback
  const t = (path: string, language?: LanguageCode): string => {
    const lang = language || currentLanguage;
    const keys = path.split('.');

    // Try the requested language, then fall back to English
    let value = resolvePath(texts[lang], keys);
    if (value === undefined) {
      value = resolvePath(texts['en'], keys);
    }

    if (value === undefined) {
      console.warn(`Missing text key: ${path} in language ${lang}`);
      return path;
    }

    // Guard against non-string leaf values (arrays/objects) — t() is for text only
    if (typeof value !== 'string') {
      console.warn(`Text key "${path}" is not a string (got ${Array.isArray(value) ? 'array' : typeof value}). Use the raw texts object for non-string values.`);
      return path;
    }

    return value;
  };

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
  };

  // Use useMemo to prevent unnecessary re-renders
  const value = useMemo(() => {
    const allLanguages = (Object.keys(texts) as LanguageCode[]).sort((a, b) => {
      // Keep English first
      if (a === 'en') return -1;
      if (b === 'en') return 1;
      return a.localeCompare(b);
    });

    return {
      t,
      currentLanguage,
      setLanguage,
      texts,
      allLanguages,
    };
  }, [currentLanguage]);

  return <TextContext.Provider value={value}>{children}</TextContext.Provider>;
};

export const useTexts = (): TextContextType => {
  const context = useContext(TextContext);
  if (!context) {
    throw new Error('useTexts must be used within TextProvider');
  }
  return context;
};
