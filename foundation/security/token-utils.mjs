/**
 * Master Foundation — Server-Side Token & Password Policy Utilities (Zero Dependencies)
 * Designed for Node.js backends implementing password reset, email verification,
 * session token hashing, and password strength validation.
 */

import crypto from 'node:crypto';

const COMMON_WEAK_PASSWORDS = new Set([
  'password123',
  '1234567890',
  'qwerty12345',
  'admin12345',
  'letmein1234',
  'welcome1234',
  'changeme123'
]);

/**
 * Generate a high-entropy URL-safe token and its SHA-256 hash.
 * Store ONLY `tokenHash` in the database; send `rawToken` to the user.
 */
export function generateOpaqueToken(entropyBytes = 32) {
  const rawToken = crypto.randomBytes(entropyBytes).toString('base64url');
  const tokenHash = hashTokenSha256(rawToken);
  return { rawToken, tokenHash };
}

export function hashTokenSha256(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken || '')).digest('hex');
}

const HEX_REGEX = /^[0-9a-f]+$/i;

export function constantTimeEqualHex(hexA, hexB) {
  if (typeof hexA !== 'string' || typeof hexB !== 'string') return false;
  if (hexA.length !== hexB.length || hexA.length === 0 || hexA.length % 2 !== 0) return false;
  if (!HEX_REGEX.test(hexA) || !HEX_REGEX.test(hexB)) return false;
  const bufA = Buffer.from(hexA, 'hex');
  const bufB = Buffer.from(hexB, 'hex');
  if (bufA.length === 0 || bufA.length !== bufB.length || bufA.length * 2 !== hexA.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Enforce baseline password policy matching config/security-policy.json.
 * @param {string} password
 * @param {{ minLength?: number, maxLength?: number }} [policy]
 */
export function validatePasswordStrength(password, policy = {}) {
  const minLength = policy.minLength ?? 10;
  const maxLength = policy.maxLength ?? 128;
  const value = typeof password === 'string' ? password : '';
  const issues = [];

  if (value.length < minLength) issues.push('validation.minLength');
  if (value.length > maxLength) issues.push('validation.maxLength');
  if (!/[A-Z]/.test(value)) issues.push('validation.passwordNeedsUppercase');
  if (!/[a-z]/.test(value)) issues.push('validation.passwordNeedsLowercase');
  if (!/[0-9]/.test(value)) issues.push('validation.passwordNeedsNumber');
  if (COMMON_WEAK_PASSWORDS.has(value.toLowerCase())) issues.push('validation.passwordTooCommon');

  return {
    valid: issues.length === 0,
    issues
  };
}

