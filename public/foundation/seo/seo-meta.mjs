/**
 * Master Foundation — Multilingual SEO Metadata Builder (Zero Dependencies)
 * Produces structured canonical, Open Graph, and 6-language hreflang metadata.
 */

const MANDATORY_LANGUAGES = ['ar', 'en', 'fr', 'ru', 'de', 'es'];

/**
 * @param {object} input
 * @param {string} input.siteOrigin - e.g. https://example.com
 * @param {string} input.siteName
 * @param {string} input.language - active language code
 * @param {string} input.title
 * @param {string} input.description
 * @param {Record<string, string>} input.localizedUrls - map of langCode -> relative path (e.g. { ar: '/ar/about', en: '/en/about' })
 * @param {string} [input.ogImageUrl]
 * @param {string} [input.defaultLanguage='en']
 */
export function buildSeoMetadata({
  siteOrigin,
  siteName,
  language,
  title,
  description,
  localizedUrls = {},
  ogImageUrl = '',
  defaultLanguage = 'en'
}) {
  const cleanOrigin = String(siteOrigin || '').replace(/\/+$/, '');
  const activePath = localizedUrls[language] || `/${language}`;
  const canonicalUrl = `${cleanOrigin}${activePath}`;

  const alternates = MANDATORY_LANGUAGES.map((lang) => ({
    hreflang: lang,
    href: `${cleanOrigin}${localizedUrls[lang] || `/${lang}`}`
  }));

  alternates.push({
    hreflang: 'x-default',
    href: `${cleanOrigin}${localizedUrls[defaultLanguage] || `/${defaultLanguage}`}`
  });

  return {
    title,
    description,
    canonicalUrl,
    alternates,
    openGraph: {
      type: 'website',
      locale: language,
      siteName,
      title,
      description,
      url: canonicalUrl,
      image: ogImageUrl || null
    }
  };
}

