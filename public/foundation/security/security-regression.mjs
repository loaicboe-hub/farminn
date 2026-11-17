#!/usr/bin/env node
/**
 * Master Foundation — Targeted Security Helper Regression Tests (Zero Dependencies)
 * Verifies cryptographic token comparisons, CSRF & APP_URL bounds, URL sanitization,
 * upload magic-byte & anti-macro checks, email header injection guards, and rate limiting.
 */

import assert from 'node:assert/strict';
import { generateOpaqueToken, hashTokenSha256, constantTimeEqualHex, validatePasswordStrength } from './token-utils.mjs';
import { generateCsrfToken, verifyCsrfToken, buildTrustedAppUrl } from './csrf.mjs';
import { escapeHtml, stripControlChars, normalizeEmail, sanitizeSafeUrl, buildWhatsAppLink } from './input-sanitizer.mjs';
import { validateUpload } from './upload-policy.mjs';
import { MemoryRateLimitStore, createRateLimiter } from './rate-limiter.mjs';
import { buildPasswordResetEmail, buildEmailVerificationEmail, checkSmtpConfiguration } from '../mail/email-templates.mjs';

// 1. Token Utils — strict hex equality & exact regression checks from verification report
const { rawToken, tokenHash } = generateOpaqueToken();
assert.ok(rawToken.length >= 43);
assert.equal(tokenHash, hashTokenSha256(rawToken));
assert.equal(constantTimeEqualHex(tokenHash, tokenHash), true);
assert.equal(constantTimeEqualHex(tokenHash.toUpperCase(), tokenHash.toLowerCase()), true);
assert.equal(constantTimeEqualHex(tokenHash, '0'.repeat(64)), false);
assert.equal(constantTimeEqualHex('zzzz', 'yyyy'), false);
assert.equal(constantTimeEqualHex('deadzz', 'deadyy'), false);
assert.equal(constantTimeEqualHex('abc', 'abd'), false);
assert.equal(constantTimeEqualHex('abcd', 'ab'), false);
assert.equal(constantTimeEqualHex('', ''), false);
assert.equal(validatePasswordStrength('StrongPass123').valid, true);
assert.equal(validatePasswordStrength('Password123').issues.includes('validation.passwordTooCommon'), true);

// 2. CSRF & APP_URL origin binding — regression checks
const secret = '0123456789abcdef0123456789abcdef';
const csrfToken = generateCsrfToken({ secret, sessionId: 'session-123' });
assert.equal(verifyCsrfToken({ secret, sessionId: 'session-123', token: csrfToken }), true);
assert.equal(verifyCsrfToken({ secret, sessionId: 'session-other', token: csrfToken }), false);
assert.equal(verifyCsrfToken({ secret: 'short-secret', sessionId: 'session-123', token: csrfToken }), false);
const [, noncePart, sigPart] = csrfToken.split('.');
assert.equal(verifyCsrfToken({ secret, sessionId: 'session-123', token: `${Math.floor(Date.now() / 1000)}abc.${noncePart}.${sigPart}` }), false);

assert.equal(
  buildTrustedAppUrl('https://site.example.com/sub', '/reset-password', { token: 't1' }),
  'https://site.example.com/reset-password?token=t1'
);
assert.equal(
  buildTrustedAppUrl('https://site.example.com', 'verify-email', { token: 'v1' }),
  'https://site.example.com/verify-email?token=v1'
);
assert.throws(() => buildTrustedAppUrl('https://site.example.com', '//evil.com/phish', { token: 'secret' }));
assert.throws(() => buildTrustedAppUrl('https://site.example.com', '/\\evil.com/phish', { token: 'secret' }));
assert.throws(() => buildTrustedAppUrl('https://site.example.com', '\\\\evil.com/phish'));
assert.throws(() => buildTrustedAppUrl('https://site.example.com', 'https://evil.com/phish'));
assert.throws(() => buildTrustedAppUrl('javascript:alert(1)', '/reset-password'));

// 3. Input & URL Sanitization — regression checks including backslash & protocol-relative bypasses
assert.equal(escapeHtml('<script>"\'&'), '&lt;script&gt;&quot;&#39;&amp;');
assert.equal(stripControlChars('Hello\r\nBcc:evil@example.com'), 'HelloBcc:evil@example.com');
assert.equal(normalizeEmail('  User@Example.COM\r\n '), 'user@example.com');
assert.equal(sanitizeSafeUrl('/ar/about?q=1'), '/ar/about?q=1');
assert.equal(sanitizeSafeUrl('#contact'), '#contact');
assert.equal(sanitizeSafeUrl('https://example.com/ok'), 'https://example.com/ok');
assert.equal(sanitizeSafeUrl('mailto:info@example.com'), 'mailto:info@example.com');
assert.equal(sanitizeSafeUrl('tel:+201001234567'), 'tel:+201001234567');
assert.equal(sanitizeSafeUrl('//evil.com'), '#');
assert.equal(sanitizeSafeUrl('/\\evil.com'), '#');
assert.equal(sanitizeSafeUrl('/path\\evil.com'), '#');
assert.equal(sanitizeSafeUrl('javascript:alert(1)'), '#');
assert.equal(sanitizeSafeUrl('data:text/html,<script>'), '#');
assert.equal(buildWhatsAppLink('+20 100 123 4567'), 'https://wa.me/201001234567');

// 4. Upload Policy — aligned AVIF 4-byte brand slots, ICO, PNG, OOXML, anti-macro
const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0]);
const validIco = Buffer.concat([Buffer.from([0x00, 0x00, 0x01, 0x00]), Buffer.alloc(16)]);
const validAvifMajor = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypavif'), Buffer.from([0, 0, 0, 0]), Buffer.from('mif1avif')]);
const validAvifCompat = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypmif1'), Buffer.from([0, 0, 0, 0]), Buffer.from('mif1avif')]);
const fakeAvifMinorVer = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypmp42'), Buffer.from('avif'), Buffer.from('mp42isom')]);
const fakeAvifMisaligned = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypmif1'), Buffer.from([0, 0, 0, 0]), Buffer.from('xxavifxx')]);
const validDocx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('....[Content_Types].xml....word/document.xml')]);
const upperMacroDocx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('....[Content_Types].xml....word/VBAPROJECT.BIN')]);
const fakeZipAsDocx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('....payload.jar....')]);

assert.equal(validateUpload({ originalName: 'shell.php.png', mimeType: 'image/png', buffer: validPng, category: 'image' }).valid, true);
assert.equal(validateUpload({ originalName: 'fav.ico', mimeType: 'image/x-icon', buffer: validIco, category: 'brandIcon' }).valid, true);
assert.equal(validateUpload({ originalName: 'major.avif', mimeType: 'image/avif', buffer: validAvifMajor, category: 'image' }).valid, true);
assert.equal(validateUpload({ originalName: 'compat.avif', mimeType: 'image/avif', buffer: validAvifCompat, category: 'image' }).valid, true);
assert.equal(validateUpload({ originalName: 'minor.avif', mimeType: 'image/avif', buffer: fakeAvifMinorVer, category: 'image' }).valid, false);
assert.equal(validateUpload({ originalName: 'misaligned.avif', mimeType: 'image/avif', buffer: fakeAvifMisaligned, category: 'image' }).valid, false);
assert.equal(validateUpload({ originalName: 'doc.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: validDocx, category: 'document' }).valid, true);
assert.equal(validateUpload({ originalName: 'macro.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: upperMacroDocx, category: 'document' }).valid, false);
assert.equal(validateUpload({ originalName: 'fake.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: fakeZipAsDocx, category: 'document' }).valid, false);
assert.equal(validateUpload({ originalName: 'xss.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg></svg>'), category: 'image' }).valid, false);

// 5. Rate Limiter — bounded capacity & accountPasswordVerify tier
const store = new MemoryRateLimitStore({ maxEntries: 3 });
const limiter = createRateLimiter({ store });
for (let i = 1; i <= 5; i++) {
  assert.equal((await limiter.check('accountPasswordVerify', 'u1:127.0.0.1')).allowed, true);
}
assert.equal((await limiter.check('accountPasswordVerify', 'u1:127.0.0.1')).allowed, false);
await limiter.check('login', 'u2');
await limiter.check('login', 'u3');
await limiter.check('login', 'u4');
assert.ok(store.buckets.size <= 3);

// 6. Mail CRLF stripping & SMTP guard
assert.equal(checkSmtpConfiguration({ SMTP_ENABLED: 'false' }).configured, false);
assert.equal(checkSmtpConfiguration({ SMTP_ENABLED: 'true', SMTP_HOST: 'CHANGE_ME' }).configured, false);
const resetMail = buildPasswordResetEmail({ lang: 'ar', siteName: 'Test\r\nBcc:evil@example.com', resetUrl: 'https://example.com/reset?t=1' });
assert.equal(/[\r\n]/.test(resetMail.subject), false);
assert.equal(resetMail.html.includes('dir="rtl"'), true);
assert.throws(() => buildEmailVerificationEmail({ lang: 'en', siteName: 'Test', verifyUrl: '/\\evil.com' }));

console.log('Master Foundation Security Regression Tests: ALL PASSED');

