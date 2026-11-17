/**
 * Master Foundation — CSRF Protection & Trusted Origin URL Builder (Zero Dependencies)
 * Provides session-bound HMAC-SHA256 anti-CSRF token generation/verification
 * and safe APP_URL-based link construction (preventing Host Header Poisoning).
 */

import crypto from 'node:crypto';

function signPayload(secret, payload) {
  return crypto.createHmac('sha256', String(secret)).update(payload).digest('base64url');
}

/**
 * Generate a session-bound HMAC-SHA256 CSRF token.
 */
export function generateCsrfToken({ secret, sessionId }) {
  if (!secret || String(secret).length < 32) {
    throw new Error('CSRF secret must be at least 32 characters.');
  }
  if (!sessionId) {
    throw new Error('Session ID is required for session-bound CSRF token.');
  }
  const nonce = crypto.randomBytes(16).toString('base64url');
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${sessionId}.${issuedAt}.${nonce}`;
  const sig = signPayload(secret, payload);
  return `${issuedAt}.${nonce}.${sig}`;
}

/**
 * Verify a session-bound CSRF token using constant-time comparison.
 */
export function verifyCsrfToken({ secret, sessionId, token, maxAgeSeconds = 43200 }) {
  if (!secret || String(secret).length < 32 || !sessionId || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [issuedAtStr, nonce, providedSig] = parts;
  if (!/^\d+$/.test(issuedAtStr)) return false;
  const issuedAt = Number.parseInt(issuedAtStr, 10);
  if (!Number.isFinite(issuedAt) || !nonce || !providedSig) return false;

  const now = Math.floor(Date.now() / 1000);
  if (issuedAt > now + 60 || now - issuedAt > maxAgeSeconds) return false;

  const expectedSig = signPayload(secret, `${sessionId}.${issuedAt}.${nonce}`);
  const bufA = Buffer.from(providedSig, 'utf8');
  const bufB = Buffer.from(expectedSig, 'utf8');
  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Build an absolute URL strictly from configured APP_URL (never untrusted Host headers).
 */
export function buildTrustedAppUrl(appUrlEnv, relativePath, queryParams = {}) {
  const base = new URL(String(appUrlEnv || ''));
  if (base.protocol !== 'http:' && base.protocol !== 'https:') {
    throw new Error('APP_URL must use http or https protocol.');
  }
  const rawPath = String(relativePath ?? '/').trim();
  if (rawPath.includes('\\') || rawPath.startsWith('//') || /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(rawPath)) {
    throw new Error('Trusted URL relativePath must be a local path within APP_URL origin.');
  }
  const cleanPath = rawPath === '' ? '/' : (rawPath.startsWith('/') ? rawPath : `/${rawPath}`);
  if (cleanPath.startsWith('//')) {
    throw new Error('Trusted URL relativePath cannot be protocol-relative.');
  }
  const target = new URL(cleanPath, base.origin);
  if (target.origin !== base.origin) {
    throw new Error('Trusted URL resolved origin must match APP_URL origin.');
  }
  for (const [k, v] of Object.entries(queryParams)) {
    if (v !== undefined && v !== null) {
      target.searchParams.set(k, String(v));
    }
  }
  return target.toString();
}

