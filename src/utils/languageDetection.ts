// Language auto-detection and preference management

import { SUPPORTED_LANGUAGES, BROWSER_LANGUAGE_MAP, DEFAULT_LANGUAGE } from '../constants/languages';
import type { LanguageCode } from '../constants/languages';

/**
 * Detects the user's preferred language in this order:
 * 1. Previously stored language preference in localStorage
 * 2. Browser's navigator.language with exact match
 * 3. Browser's navigator.languages array with prefix matching
 * 4. Fallback to English
 */
export function detectBrowserLanguage(): LanguageCode {
  // Check if user previously selected a language
  const stored = localStorage.getItem('language') as LanguageCode | null;
  if (stored && SUPPORTED_LANGUAGES[stored]) {
    return stored;
  }

  // Try navigator.language first (most specific, single value)
  if (navigator.language && BROWSER_LANGUAGE_MAP[navigator.language]) {
    return BROWSER_LANGUAGE_MAP[navigator.language];
  }

  // Try navigator.languages array (ordered by preference)
  if (navigator.languages && navigator.languages.length > 0) {
    for (const lang of navigator.languages) {
      // Try exact match first
      if (BROWSER_LANGUAGE_MAP[lang]) {
        return BROWSER_LANGUAGE_MAP[lang];
      }

      // Try prefix match (e.g., "es" from "es-MX")
      const prefix = lang.split('-')[0].toLowerCase();
      if (BROWSER_LANGUAGE_MAP[prefix]) {
        return BROWSER_LANGUAGE_MAP[prefix];
      }
    }
  }

  // Fallback to English if nothing matches
  return DEFAULT_LANGUAGE;
}

/**
 * Save the user's language preference to localStorage
 */
export function setLanguagePreference(lang: LanguageCode): void {
  localStorage.setItem('language', lang);
}

/**
 * Retrieve the stored language preference from localStorage
 * Returns null if nothing is stored or the stored value is invalid
 */
export function getStoredLanguage(): LanguageCode | null {
  const stored = localStorage.getItem('language') as LanguageCode | null;
  return stored && SUPPORTED_LANGUAGES[stored] ? stored : null;
}

/**
 * Clear the stored language preference (resets to auto-detection on next visit)
 */
export function clearLanguagePreference(): void {
  localStorage.removeItem('language');
}
