/**
 * Master Foundation — Output Escaping & Input Sanitization Helpers (Zero Dependencies)
 * Complements backend parameterized SQL queries and strict CSP headers.
 */

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

export function stripControlChars(value) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
}

export function normalizeEmail(email) {
  return stripControlChars(email).toLowerCase();
}

/**
 * Allow only safe navigation URLs (relative path, fragment, http, https, mailto, tel).
 * Rejects javascript:, data:, vbscript:, and malformed schemes.
 */
export function sanitizeSafeUrl(rawUrl, fallback = '#') {
  const value = stripControlChars(rawUrl);
  if (!value || value.includes('\\')) return fallback;

  if (value.startsWith('/')) {
    if (/^\/[/\\]/.test(value)) return fallback;
    try {
      const sentinel = 'https://origin.invalid';
      const parsedRelative = new URL(value, sentinel);
      return parsedRelative.origin === sentinel ? value : fallback;
    } catch {
      return fallback;
    }
  }
  if (value.startsWith('#')) return value;

  try {
    const parsed = new URL(value);
    const allowed = new Set(['http:', 'https:', 'mailto:', 'tel:']);
    return allowed.has(parsed.protocol) ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Build a clean WhatsApp wa.me URL from centrally configured Website Settings.
 */
export function buildWhatsAppLink(rawPhone) {
  const digits = String(rawPhone ?? '').replace(/[^\d]/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

