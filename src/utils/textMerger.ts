// Developer tooling for translation management and auto-update

/**
 * Recursively finds all keys in the master (English) text that are missing
 * from a translated version. Helps identify incomplete translations.
 */
export function findMissingKeys(
  masterText: any,
  translatedText: any,
  path: string = ''
): string[] {
  const missing: string[] = [];

  for (const key in masterText) {
    const fullPath = path ? `${path}.${key}` : key;

    // If it's a nested object, recurse
    if (
      typeof masterText[key] === 'object' &&
      masterText[key] !== null &&
      !Array.isArray(masterText[key])
    ) {
      const nestedMissing = findMissingKeys(
        masterText[key],
        translatedText?.[key] || {},
        fullPath
      );
      missing.push(...nestedMissing);
    } else {
      // Check if key exists in translation
      if (!(key in (translatedText || {}))) {
        missing.push(fullPath);
      }
    }
  }

  return missing;
}

/**
 * Deep merges a translation into the master text structure.
 * Uses master text (English) values for any missing keys.
 * Useful for filling in incomplete translations without breaking the app.
 */
function deepMerge(master: any, translated: any): any {
  const result = { ...master };

  if (!translated) return result;

  for (const key in translated) {
    if (
      typeof translated[key] === 'object' &&
      translated[key] !== null &&
      !Array.isArray(translated[key])
    ) {
      // Recursively merge nested objects
      result[key] = deepMerge(master[key] || {}, translated[key]);
    } else if (translated[key] !== undefined) {
      // Use translated value if it exists and is not undefined
      result[key] = translated[key];
    }
  }

  // Fill in any missing keys from master
  for (const key in master) {
    if (!(key in result)) {
      result[key] = master[key];
    }
  }

  return result;
}

/**
 * Merges all language translations with the master (English) text.
 * Ensures that every language has all required keys, filling gaps with English.
 * Used to generate the final texts structure passed to components.
 */
export function mergeLanguagesWithMaster(
  masterText: any,
  translationsByLang: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = { en: masterText };

  for (const [lang, translated] of Object.entries(translationsByLang)) {
    if (lang !== 'en') {
      result[lang] = deepMerge(masterText, translated);
    }
  }

  return result;
}

/**
 * Validates that all required keys exist in a language object.
 * Compares against the English master.
 */
export function validateTranslation(
  masterText: any,
  languageText: any
): {
  isValid: boolean;
  missingCount: number;
  missingKeys: string[];
} {
  const missingKeys = findMissingKeys(masterText, languageText);
  return {
    isValid: missingKeys.length === 0,
    missingCount: missingKeys.length,
    missingKeys,
  };
}

/**
 * Generates a report of all language completeness
 */
export function generateTranslationReport(
  masterText: any,
  textsByLanguage: Record<string, any>
): Record<
  string,
  {
    isComplete: boolean;
    missingCount: number;
    missingPercentage: number;
  }
> {
  const report: Record<
    string,
    {
      isComplete: boolean;
      missingCount: number;
      missingPercentage: number;
    }
  > = {};

  // Count total keys in master
  function countKeys(obj: any): number {
    let count = 0;
    for (const key in obj) {
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        count += countKeys(obj[key]);
      } else {
        count++;
      }
    }
    return count;
  }

  const totalKeys = countKeys(masterText);

  for (const [lang, text] of Object.entries(textsByLanguage)) {
    if (lang === 'en') {
      report[lang] = {
        isComplete: true,
        missingCount: 0,
        missingPercentage: 0,
      };
    } else {
      const validation = validateTranslation(masterText, text);
      report[lang] = {
        isComplete: validation.isValid,
        missingCount: validation.missingCount,
        missingPercentage:
          totalKeys > 0
            ? Math.round(
                (validation.missingCount / totalKeys) * 100 * 100
              ) / 100
            : 0,
      };
    }
  }

  return report;
}
