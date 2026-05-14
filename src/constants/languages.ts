// Supported languages and browser language code mapping

export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Map browser language codes to supported languages
// Handles both exact matches (e.g., 'en') and regional variants (e.g., 'es-MX' → 'es')
export const BROWSER_LANGUAGE_MAP: Record<string, LanguageCode> = {
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-AU': 'en',
  'en-CA': 'en',
  'en-NZ': 'en',
  'en-ZA': 'en',
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'es-CO': 'es',
  'es-PE': 'es',
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  'it': 'it',
  'it-IT': 'it',
  'it-CH': 'it',
  'pt': 'pt',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'ja': 'ja',
  'ja-JP': 'ja',
  'zh': 'zh',
  'zh-Hans': 'zh',
  'zh-Hans-CN': 'zh',
  'zh-Hant': 'zh',
  'zh-Hant-TW': 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'zh-HK': 'zh',
};
