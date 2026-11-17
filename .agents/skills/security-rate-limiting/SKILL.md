---
name: security-rate-limiting
description: >-
  Guides backend enforcement of API rate limiting, brute-force protection,
  CSRF/XSS/SQLi defenses, upload validation, security headers, and security
  event logging. Use when creating or updating API endpoints, forms, uploads,
  or security middleware.
---

# Security & Rate Limiting Skill

Security must be enforced on the actual backend from the start—never visually in the frontend only.

Baseline policy: `config/security-policy.json`, `foundation/security/security-headers.json`, `foundation/security/upload-policy.mjs`, `foundation/security/csrf.mjs`, `foundation/security/rate-limiter.mjs`, `foundation/security/input-sanitizer.mjs`.

## Mandatory Controls

1. **Rate Limiting**: Enforce IP-based and user-based limits on login (5/15min), password reset (3/15min), in-session password verify (5/15min), public contact/inquiry forms (5/5min), public APIs (60/min), and authenticated APIs (120/min). Only read `X-Forwarded-For` when `TRUST_PROXY=true`.
2. **Input, Host & Query Safety**: Validate and sanitize all request parameters on the server (`validator.mjs`, `input-sanitizer.mjs`); use parameterized queries exclusively; enforce request body size limits (`MAX_*_BODY_BYTES`); build absolute links only from `APP_URL` (`buildTrustedAppUrl`).
3. **CSRF & XSS**: Require session-bound CSRF verification (`csrf.mjs`) on state-changing authenticated endpoints; escape dynamic HTML output and prefer structured JSON blocks or vetted HTML allowlist sanitization.
4. **Upload Protection**: Enforce auth + `media.upload`, size caps, extension/MIME allowlists, magic-byte inspection (`upload-policy.mjs`), UUID filenames, and non-executable upload directories.
5. **Secrets & Errors**: Never expose `.env` credentials, API keys, password hashes, or stack traces to clients or frontend bundles.
6. **Audit Trail**: Write security events (`security_events` table) for login failures/lockouts, permission denials, password changes, role updates, rejected uploads, and rate-limit hits.

## Critical Security Rule

If you discover a critical security flaw during normal work, immediately alert the user with impact and fix details. Do **not** run a full security audit automatically unless explicitly requested.

