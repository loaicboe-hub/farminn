# Security & Rate Limiting Policy

Security and rate limiting are mandatory from project inception and must be **enforced on the server backend**, never only visually in frontend components.

Authoritative baseline thresholds live in `config/security-policy.json`, `config/rbac.json`, and `foundation/security/`.

---

## 1. Rate Limiting & Brute-Force Protection

Enforce sliding-window or fixed-window counters (via Redis on VPS or DB `rate_limit_buckets` / host-compatible store on Shared Hosting; `foundation/security/rate-limiter.mjs` provides a bounded single-process starter implementation and tier config):

- **Login (`POST /api/auth/login`)**: Max 5 failed attempts per 15-minute window keyed by IP + normalized email; enforce temporary lockout (`RATE_LIMIT_LOGIN_LOCKOUT_SECONDS`) and log `auth.login.locked`.
- **Password Reset (`POST /api/auth/forgot-password`)**: Max 3 requests per 15-minute window per IP + email.
- **In-Session Password Verification (`accountPasswordVerify`)**: Max 5 failed current-password checks per 15-minute window per `user_id` + IP.
- **Public Inquiry / Contact Forms (`publicForms`)**: Max 5 submissions per 5-minute window per IP.
- **Authenticated Admin APIs (`apiAuthenticated`)**: Default 120 requests/minute per user + IP.
- **Public APIs (`apiPublic`)**: Default 60 requests/minute per IP.
- **Proxy Awareness**: Only trust `X-Forwarded-For` when `TRUST_PROXY=true` behind a verified reverse proxy (Nginx/Cloudflare/Load Balancer) that overwrites the header cleanly.

---

## 2. Authentication, Sessions & Access Control

- **Password Hashing**: Argon2id preferred, bcrypt cost >= 12, or Node `crypto.scrypt` (`N >= 16384`). Never store plain-text passwords or expose `password_hash`.
- **Session & Cookie Security**: Random high-entropy session token hashed before DB storage (`user_sessions`), `HttpOnly`, `SameSite=Lax` (or `Strict`), `Secure=true` over HTTPS, session ID rotation upon login, password change, and privilege changes.
- **Trusted Origin / Host Safety**: Construct absolute application links (password reset, verification, canonical tags) strictly from validated `APP_URL` (`buildTrustedAppUrl` in `foundation/security/csrf.mjs`), never from untrusted `Host` / `X-Forwarded-Host` headers. Restrict CORS origins explicitly via `CORS_ALLOWED_ORIGINS` (never wildcard `*` with credentials).
- **RBAC Enforcement**: Every admin/protected API handler must validate active session AND required permission (`config/rbac.json`) on the server. Prevent privilege escalation by rejecting non-`super_admin` edits to `super_admin` accounts and rejecting role assignments exceeding the caller's privileges.

---

## 3. Injection, XSS, CSRF & Request Limits

- **SQL Injection Prevention**: Use parameterized prepared statements / ORM query bindings exclusively. Never concatenate user input into SQL strings.
- **XSS & URL Safety**: Use context-aware escaping (`escapeHtml`) and safe URL scheme allowlists (`sanitizeSafeUrl` in `input-sanitizer.mjs`). Prefer structured non-HTML JSON blocks for CMS content (`content_json` / `body_json`); if rich HTML is ever enabled in a project, enforce a vetted server-side HTML allowlist sanitizer before storage and rendering.
- **CSRF Protection**: Enforce session-bound anti-CSRF tokens (`generateCsrfToken` / `verifyCsrfToken` in `foundation/security/csrf.mjs`, configured with `CSRF_SECRET` from `.env`) on all state-changing authenticated `POST`/`PUT`/`PATCH`/`DELETE` requests.
- **Request Body Size Limits**: Enforce `MAX_JSON_BODY_BYTES` (1 MB), `MAX_FORM_BODY_BYTES` (2 MB), and `MAX_MULTIPART_REQUEST_BYTES` (12 MB) from `.env` / `config/security-policy.json` in both reverse proxy and application middleware.

---

## 4. File Upload Security

Use `foundation/security/upload-policy.mjs` (or equivalent strict server validation in PHP/Python):
1. Enforce authenticated upload permissions (`media.upload`).
2. Enforce request size limits (`MAX_MULTIPART_REQUEST_BYTES`) and per-category size caps (`image` 5 MB, `brandIcon` 1 MB, `document` 10 MB).
3. Reject dangerous/executable extensions (`.php`, `.phtml`, `.phar`, `.js`, `.html`, `.svg` from untrusted sources, `.docm`, `.xlsm`, `.zip`, `.exe`, `.sh`, etc.).
4. Verify declared MIME type AND strict binary signatures (magic bytes, ISOBMFF `avif`/`avis` brand checks, ICO signature, clean OOXML ZIP markers without `vbaProject.bin` macros).
5. Rename uploaded files to randomized UUID filenames (`stored_filename`) and store outside the executable public webroot (or disable script execution in upload folders via `.htaccess` / Nginx rules).

---

## 5. Headers, Error Handling & Security Logging

- **Security Headers**: Apply `foundation/security/security-headers.json` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` when HTTPS is live, and tailored `CSP`). Apply `Referrer-Policy: no-referrer` on token-bearing password reset / email verification pages.
- **Safe Error Handling**: Never leak stack traces, SQL queries, file paths, or `.env` values to clients (`APP_DEBUG=false` in production). Log full errors internally on the server.
- **Security Event Audit Trail**: Record login failures, lockouts, password changes, resets, role assignments, permission denials, rejected uploads, and rate-limit triggers in `security_events`.
