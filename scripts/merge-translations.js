#!/usr/bin/env node

/**
 * Merge script: Auto-fills missing translation keys with English values
 * Usage: node scripts/merge-translations.js
 *
 * This script:
 * 1. Identifies missing keys in each language compared to English (master)
 * 2. Fills in missing keys with English values
 * 3. Writes updated texts.json back to disk
 * 4. Marks newly added keys in a report for translator review
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load texts.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const textsPath = path.join(__dirname, '../src/constants/texts.json');
const texts = JSON.parse(fs.readFileSync(textsPath, 'utf-8'));

// Helper: recursively navigate through nested objects
function getNestedValue(obj, keyPath) {
  const keys = keyPath.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

// Helper: recursively set nested value
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

// Helper: recursively find all keys
function findAllKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...findAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const master = texts.en || {};
const masterKeys = findAllKeys(master);

console.log('🔄 Merging translations with English master...\n');

let totalAdded = 0;
const mergeReport = {};

// Process each language
const languages = Object.keys(texts).filter(lang => lang !== 'en');

for (const lang of languages) {
  const langText = texts[lang] || {};
  const langKeys = findAllKeys(langText);
  const missingKeys = masterKeys.filter(key => !langKeys.includes(key));

  if (missingKeys.length > 0) {
    console.log(`🔧 Filling ${lang.toUpperCase()}: ${missingKeys.length} missing keys\n`);

    // Add missing keys from master
    for (const keyPath of missingKeys) {
      const value = getNestedValue(master, keyPath);
      if (value !== undefined) {
        setNestedValue(langText, keyPath, value);
        totalAdded++;
      }
    }

    // Update texts with merged language
    texts[lang] = langText;

    // Record in report
    mergeReport[lang] = {
      added: missingKeys.length,
      missingKeys,
    };
  } else {
    console.log(`✅ ${lang.toUpperCase()}: Already complete\n`);
  }
}

// Write back to disk
fs.writeFileSync(textsPath, JSON.stringify(texts, null, 2) + '\n');

// Summary
console.log('─'.repeat(50));
console.log(`\n✅ Merge complete! Added ${totalAdded} key(s) across all languages.\n`);

if (Object.keys(mergeReport).length > 0) {
  console.log('📝 Keys marked for translator review:\n');
  for (const [lang, data] of Object.entries(mergeReport)) {
    if (data.missingKeys.length > 0) {
      console.log(`${lang.toUpperCase()}:`);
      data.missingKeys.slice(0, 3).forEach(key => {
        console.log(`  • ${key}`);
      });
      if (data.missingKeys.length > 3) {
        console.log(`  ... and ${data.missingKeys.length - 3} more\n`);
      } else {
        console.log('');
      }
    }
  }
  console.log('💡 Translators should review these keys and provide accurate translations.\n');
}

console.log(`📂 Updated: ${textsPath}\n`);
