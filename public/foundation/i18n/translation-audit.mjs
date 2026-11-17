#!/usr/bin/env node
/**
 * Master Foundation — Six-Language Translation Audit Helper (Zero Dependencies)
 * 1. Verifies key parity across ar, en, fr, ru, de, es JSON dictionaries.
 * 2. Scans foundation/layouts/*.html data-i18n keys and validation/*.mjs keys
 *    so orphaned UI/validation keys are caught automatically.
 * 3. Reports verification status (_meta.verified).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foundationDir = path.resolve(__dirname, '..');
const LANGUAGES = ['ar', 'en', 'fr', 'ru', 'de', 'es'];

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k === '_meta') continue;
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValue(obj, dottedKey) {
  return dottedKey.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function collectReferencedKeys() {
  const refs = new Set();

  const layoutsDir = path.join(foundationDir, 'layouts');
  if (fs.existsSync(layoutsDir)) {
    for (const entry of fs.readdirSync(layoutsDir)) {
      if (!entry.endsWith('.html')) continue;
      const html = fs.readFileSync(path.join(layoutsDir, entry), 'utf8');
      for (const match of html.matchAll(/data-i18n="([a-zA-Z0-9_.-]+)"/g)) {
        refs.add(match[1]);
      }
    }
  }

  const codeFiles = [
    path.join(foundationDir, 'forms', 'validator.mjs'),
    path.join(foundationDir, 'security', 'token-utils.mjs')
  ];
  for (const file of codeFiles) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const match of src.matchAll(/'(validation\.[a-zA-Z0-9_.-]+)'/g)) {
      refs.add(match[1]);
    }
  }

  return refs;
}

const dictionaries = {};
for (const lang of LANGUAGES) {
  const filePath = path.join(__dirname, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] Missing translation file: ${filePath}`);
    process.exitCode = 1;
    continue;
  }
  dictionaries[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const allKeys = new Set(collectReferencedKeys());
for (const dict of Object.values(dictionaries)) {
  for (const key of flattenKeys(dict)) {
    allKeys.add(key);
  }
}

let hasMissing = false;
console.log(`Master Foundation i18n Audit (${allKeys.size} keys across ${LANGUAGES.length} languages, including HTML/JS references)\n`);

for (const lang of LANGUAGES) {
  const dict = dictionaries[lang];
  if (!dict) continue;
  const missing = [];
  for (const key of allKeys) {
    const val = getValue(dict, key);
    if (typeof val !== 'string' || val.trim() === '') {
      missing.push(key);
    }
  }
  if (missing.length > 0) hasMissing = true;
  const verified = Boolean(dict._meta?.verified);
  const direction = dict._meta?.direction || 'unknown';
  console.log(
    `- ${lang.toUpperCase()} (${direction}): missing=${missing.length}, verified=${verified}`
  );
  if (missing.length > 0) {
    console.log(`  Missing keys: ${missing.join(', ')}`);
  }
}

if (hasMissing) {
  process.exitCode = 1;
}
