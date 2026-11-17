/**
 * Master Foundation — Six-Language Routing & Localization Helper (Zero Dependencies)
 * Enforces ar (RTL) + en, fr, ru, de, es (LTR), route preservation on switch,
 * parameter interpolation, and tracking of missing or unverified translations.
 */

export const SUPPORTED_LANGUAGES = ['ar', 'en', 'fr', 'ru', 'de', 'es'];
export const RTL_LANGUAGES = new Set(['ar']);

export function resolveLanguage(requested, fallback = 'en') {
  const code = String(requested || '').toLowerCase().slice(0, 2);
  if (SUPPORTED_LANGUAGES.includes(code)) return code;
  return SUPPORTED_LANGUAGES.includes(fallback) ? fallback : 'en';
}

export function getDirection(langCode) {
  return RTL_LANGUAGES.has(resolveLanguage(langCode)) ? 'rtl' : 'ltr';
}

/**
 * Preserve equivalent route when switching languages.
 * If translatedSlugsByLang is provided (e.g. { ar: 'عن-الشركة', en: 'about-us' }),
 * switches directly to the translated slug; otherwise swaps the leading /:lang prefix.
 */
export function buildEquivalentLanguageUrl(currentPathname, targetLang, translatedSlugsByLang = null) {
  const lang = resolveLanguage(targetLang);

  if (translatedSlugsByLang && typeof translatedSlugsByLang[lang] === 'string' && translatedSlugsByLang[lang].trim() !== '') {
    const cleanSlug = translatedSlugsByLang[lang].replace(/^\/+/, '');
    return `/${lang}/${cleanSlug}`;
  }

  const normalized = String(currentPathname || '/').replace(/^\/+/, '');
  const segments = normalized ? normalized.split('/') : [];

  if (segments.length > 0 && SUPPORTED_LANGUAGES.includes(segments[0])) {
    segments[0] = lang;
    return `/${segments.join('/')}`;
  }

  return normalized ? `/${lang}/${normalized}` : `/${lang}`;
}

export function formatTranslation(template, params = null) {
  const text = String(template ?? '');
  if (!params || typeof params !== 'object') return text;
  return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  ));
}

export function resolveTranslationValue(dictionary, dottedKey, params = null) {
  const resolved = String(dottedKey || '')
    .split('.')
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), dictionary);
  if (typeof resolved !== 'string') return resolved;
  return formatTranslation(resolved, params);
}

/**
 * Summarize missing or unverified translations for Admin Dashboard reporting.
 */
export function inspectTranslationStatus(records = []) {
  const summary = {};
  for (const lang of SUPPORTED_LANGUAGES) {
    summary[lang] = { total: 0, verified: 0, unverified: 0, missing: 0 };
  }

  for (const record of records) {
    const lang = record?.language_code;
    if (!summary[lang]) continue;
    summary[lang].total += 1;
    const text = String(record.value ?? '').trim();
    if (!text) {
      summary[lang].missing += 1;
    } else if (record.is_verified === true) {
      summary[lang].verified += 1;
    } else {
      summary[lang].unverified += 1;
    }
  }

  return summary;
}
