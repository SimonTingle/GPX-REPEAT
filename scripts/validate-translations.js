#!/usr/bin/env node

/**
 * Validation script: Checks that all languages have all required keys
 * Usage: node scripts/validate-translations.js
 *
 * This script compares each language against English (master) and reports
 * any missing keys. Useful to run before building or deploying.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load texts.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const textsPath = path.join(__dirname, '../src/constants/texts.json');
const texts = JSON.parse(fs.readFileSync(textsPath, 'utf-8'));

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

// Get all keys in English (master)
const masterKeys = findAllKeys(texts.en || {});

console.log('🔍 Validating translations...\n');

let hasErrors = false;
const report = {};

// Check each language
const languages = Object.keys(texts).filter(lang => lang !== 'en');

for (const lang of languages) {
  const langText = texts[lang] || {};
  const langKeys = findAllKeys(langText);

  // Find missing keys
  const missingKeys = masterKeys.filter(key => !langKeys.includes(key));

  report[lang] = {
    total: masterKeys.length,
    present: langKeys.length,
    missing: missingKeys.length,
    completeness: Math.round((langKeys.length / masterKeys.length) * 100),
    missingKeys,
  };

  if (missingKeys.length > 0) {
    console.warn(`⚠️  Language "${lang}" is missing ${missingKeys.length} key(s):`);
    missingKeys.slice(0, 5).forEach(key => console.warn(`   - ${key}`));
    if (missingKeys.length > 5) {
      console.warn(`   ... and ${missingKeys.length - 5} more\n`);
    } else {
      console.log('');
    }
    hasErrors = true;
  } else {
    console.log(`✅ ${lang.toUpperCase()}: Complete (${langKeys.length}/${masterKeys.length} keys)\n`);
  }
}

// Summary
console.log('\n📊 Translation Summary:');
console.log('─'.repeat(50));
for (const [lang, data] of Object.entries(report)) {
  const bar = '█'.repeat(Math.floor(data.completeness / 5)) + '░'.repeat(20 - Math.floor(data.completeness / 5));
  console.log(`${lang.toUpperCase()}: [${bar}] ${data.completeness}% (${data.present}/${data.total})`);
}

if (!hasErrors) {
  console.log('\n✅ All translations are complete!\n');
  process.exit(0);
} else {
  console.log('\n💡 Tip: Use scripts/merge-translations.js to auto-fill missing keys with English.\n');
  process.exit(1);
}
