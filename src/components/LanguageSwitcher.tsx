import React, { useState } from 'react';
import { useTexts } from '../contexts/TextContext';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import type { LanguageCode } from '../constants/languages';

/**
 * Small, unobtrusive language selector component
 * Positioned at bottom-left, appears on hover with opacity transition
 * Displays buttons for all supported languages
 */
export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage, allLanguages } = useTexts();
  const [isHovering, setIsHovering] = useState(false);

  // Defensive check: ensure allLanguages is an array
  if (!Array.isArray(allLanguages) || allLanguages.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 transition-all duration-300 ease-in-out ${
        isHovering ? 'opacity-100 scale-100' : 'opacity-10 hover:opacity-100 scale-95 hover:scale-100'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ zIndex: 50, pointerEvents: isHovering ? 'auto' : 'none' }}
    >
      <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        {allLanguages.map((lang) => {
          const langInfo = SUPPORTED_LANGUAGES[lang as LanguageCode];
          const isActive = currentLanguage === lang;

          return (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang as LanguageCode);
                setIsHovering(false);
              }}
              className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-all font-medium ${
                isActive
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
              title={langInfo.nativeName}
              aria-label={`Switch to ${langInfo.name}`}
            >
              {lang.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
