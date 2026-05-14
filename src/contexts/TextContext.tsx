import React, { createContext, useContext } from 'react';
import texts from '../constants/texts.json';

// Type-safe text structure
type TextKeys = typeof texts;

interface TextContextType {
  t: (path: string) => string;
  texts: TextKeys;
}

const TextContext = createContext<TextContextType | undefined>(undefined);

export const TextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = (path: string): string => {
    const keys = path.split('.');
    let value: any = texts;

    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        console.warn(`Missing text key: ${path}`);
        return path;
      }
    }

    return String(value);
  };

  return (
    <TextContext.Provider value={{ t, texts }}>
      {children}
    </TextContext.Provider>
  );
};

export const useTexts = (): TextContextType => {
  const context = useContext(TextContext);
  if (!context) {
    throw new Error('useTexts must be used within TextProvider');
  }
  return context;
};
