# Master Foundation — Technical Quality Review

**Review Date:** 2026-11-11  
**Remediation & Re-Verification Date:** 2026-11-11  
**Review Mode:** Initial Read-Only Audit Followed by Approved Additive Remediation & Targeted Verification  
**Scope:** Database Schemas (`mysql` & `postgresql`), Authentication & Account Management, Security & Rate Limiting, Six-Language Multilingual System, Universal Admin Dashboard, and Cross-Project Architecture & Reusability.

---

## Executive Summary & Overall Readiness Assessment

**Initial Readiness (Pre-Remediation):** `CONDITIONAL PASS` — **0 CRITICAL**, **11 HIGH**, **16 MEDIUM**, **3 LOW** (**30 actionable findings**, plus **7 PASS** baseline items). *(Note: Initial executive table typo listed 10H/14M/4L=28; all 30 numbered findings in Sections 1–6 have been accounted for and resolved below.)*

**Post-Remediation Readiness:** **READY FOR PROJECT CLONING (`PASS — REMEDIATED`)**

All 30 findings (`DB-01`–`DB-08`, `AUTH-01`–`AUTH-06`, `SEC-01`–`SEC-06`, `I18N-01`–`I18N-03`, `ADM-01`–`ADM-03`, `ARCH-01`–`ARCH-04`) have been addressed additively across schemas, config schemas, zero-dependency security/i18n/form/mail helpers, HTML layout blueprints, documentation, and skills—while preserving stack neutrality and avoiding fake backend claims. Items that depend on a copied project's chosen server runtime or hosting environment (live DB migrations, password hashing execution, Redis/DB rate-limit store wiring, server HTTP middleware, and SMTP delivery) are explicitly flagged below as **Requires Project-Specific Implementation**.

### Findings Summary by Severity

| Severity | Initial Count | Resolved in Foundation | Requires Project-Specific Wiring (Runtime) | Summary |
| :--- | :---: | :---: | :---: | :--- |
| **CRITICAL** | 0 | 0 | 0 | No exposed secrets, live auth bypasses, or fabricated backend claims exist. |
| **HIGH** | 11 | 11 | 5 (paired runtime wiring) | All 11 schema, upload, rate-limit, CSRF, auth HTML, i18n key parity, Admin shell, and doc drift gaps resolved at foundation level. |
| **MEDIUM** | 16 | 16 | 7 (paired runtime wiring) | All 16 trigger, index, schema contract, CRLF, SMTP 503, `.env.example`, cookie, interpolation, RBAC, portability, and deployment snippet gaps resolved. |
| **LOW** | 3 | 3 | 1 (optional MySQL deferred FK) | All 3 FK index, `language_code` constraint/note, reset token `Referrer-Policy`, and module convention gaps resolved. |
| **PASS** | 7 | — | — | Core additive, honest, non-cloned foundation principles preserved throughout. |

---

## 1. Database Schemas Review

Inspected:
- `foundation/database/mysql/001_core_schema.sql`
- `foundation/database/postgresql/001_core_schema.sql`
- `foundation/database/README.md`

### Findings

#### [HIGH] DB-01 — `role_permissions` Has No Seed Mapping for System Roles
- **File Path(s):** `foundation/database/mysql/001_core_schema.sql` (lines 20–27, 214–217), `foundation/database/postgresql/001_core_schema.sql` (lines 18–24, 202–206), `config/rbac.json`
- **Exact Issue:** Both SQL schemas insert the three system roles (`super_admin`, `admin`, `editor`) into `roles`, while `role_permissions` remains completely empty with no seed script or SQL statements synchronizing permissions from `config/rbac.json`.
- **Why It Matters:** A backend querying `role_permissions` upon project initialization will reject `admin` and `editor` operations until an undocumented manual seed step runs.
- **Recommended Correction:** Add an idempotent SQL seed (`INSERT IGNORE` / `ON CONFLICT DO NOTHING`) or a stack-neutral JSON-to-SQL bootstrap specification mapping `config/rbac.json` system role permissions into `role_permissions`.
- **Action Type:** Code Change (SQL Blueprint / Seed Helper) + Project-Specific Implementation

#### [HIGH] DB-02 — Missing Foreign Key Constraints on User Audit & Ownership Columns
- **File Path(s):** `foundation/database/mysql/001_core_schema.sql` (lines 41, 109, 122–123, 142, 185, 196), `foundation/database/postgresql/001_core_schema.sql` (lines 38, 101, 114–115, 134, 173, 184)
- **Exact Issue:** Audit columns (`media_items.uploaded_by`, `website_settings.updated_by`, `pages.created_by`, `pages.updated_by`, `page_translations.updated_by`, `translation_entries.verified_by`, and `security_events.user_id`) store user IDs as raw `BIGINT` values without foreign key constraints (`ON DELETE SET NULL`) or indexes.
- **Why It Matters:** Deleting or reconciling user records leaves orphaned IDs without referential integrity, and querying `security_events` by `user_id` (required by User Management account activity review) performs full table scans.
- **Recommended Correction:** Add `ON DELETE SET NULL` foreign key constraints to `users(id)` for all user-reference columns (applying `media_items.uploaded_by` via `ALTER TABLE` after `users` creation to resolve the circular reference with `users.avatar_media_id`) and add indexes on `security_events(user_id, created_at)`.
- **Action Type:** Code Change (SQL Blueprint)

#### [HIGH] DB-03 — No Schema Support for Safe Two-Step Email Address Change Verification
- **File Path(s):** `foundation/database/mysql/001_core_schema.sql` (lines 47–63, 92–101), `foundation/database/postgresql/001_core_schema.sql` (lines 44–58, 85–93)
- **Exact Issue:** `users` only stores `email` and `email_verified_at`, and `email_verification_tokens` lacks a `target_email` column (nor does `users` have `pending_email`).
- **Why It Matters:** When an authenticated administrator edits their email in Account Settings, overwriting `users.email` before verification risks account lockout on typo or hijacking, while resetting `email_verified_at` to `NULL` breaks verified-only login checks before the new address is confirmed.
- **Recommended Correction:** Add `target_email VARCHAR(190) NULL` (and `purpose VARCHAR(32) NOT NULL DEFAULT 'registration'`) to `email_verification_tokens` and/or `pending_email VARCHAR(190) NULL` to `users` so the current verified email remains active until the token for the new email is confirmed.
- **Action Type:** Code Change (SQL Blueprint) + Documentation Change

#### [MEDIUM] DB-04 — Missing `updated_at` Auto-Update Trigger in PostgreSQL
- **File Path(s):** `foundation/database/postgresql/001_core_schema.sql` (lines 15, 40, 57, 102, 117, 135, 149, 162, 175, 198), compared against `foundation/database/mysql/001_core_schema.sql` (`ON UPDATE CURRENT_TIMESTAMP`)
- **Exact Issue:** MySQL automatically refreshes `updated_at` on row modifications via `ON UPDATE CURRENT_TIMESTAMP`, whereas PostgreSQL only specifies `DEFAULT NOW()` on insert and defines no `BEFORE UPDATE` trigger function.
- **Why It Matters:** Behavioral divergence between the two engines causes `updated_at` timestamps in PostgreSQL projects to remain frozen at creation time unless every update query explicitly sets `updated_at = NOW()`.
- **Recommended Correction:** Add a reusable `set_updated_at()` trigger function and attach `BEFORE UPDATE` triggers to all tables with `updated_at` in `postgresql/001_core_schema.sql`.
- **Action Type:** Code Change (SQL Blueprint)

#### [MEDIUM] DB-05 — Missing `contact_inquiries` Core Table Despite Public Form Blueprint
- **File Path(s):** `foundation/database/mysql/001_core_schema.sql`, `foundation/database/postgresql/001_core_schema.sql`, `foundation/layouts/public-shell.html` (line 95)
- **Exact Issue:** `public-shell.html` defines an inquiry form targeting `/api/public/contact`, and `config/security-policy.json` configures `publicForms` rate limiting, yet neither core SQL schema includes a `contact_inquiries` table.
- **Why It Matters:** Every corporate or business website requires basic contact inquiry persistence regardless of whether optional industry modules (`import-export`, `tourism`, etc.) are activated.
- **Recommended Correction:** Add an additive `contact_inquiries` table (name, email, phone, subject, message, language_code, status, source_ip, created_at) to both core schemas.
- **Action Type:** Code Change (SQL Blueprint)

#### [MEDIUM] DB-06 — `users.preferred_language` `CHAR(2)` Inconsistent with `VARCHAR(8)` Elsewhere
- **File Path(s):** `foundation/database/mysql/001_core_schema.sql` (line 55), `foundation/database/postgresql/001_core_schema.sql` (line 52)
- **Exact Issue:** `users.preferred_language` uses `CHAR(2)`, while `page_translations`, `homepage_section_translations`, and `translation_entries` all use `VARCHAR(8)`.
- **Why It Matters:** Prevents future BCP-47 regional/script language extensions (e.g., `pt-BR`, `zh-Hans`) without schema alteration.
- **Recommended Correction:** Change `users.preferred_language` to `VARCHAR(8) NOT NULL DEFAULT 'en'`.
- **Action Type:** Code Change (SQL Blueprint)

#### [MEDIUM] DB-07 — Missing Operational Indexes for Queries & Token/Session Cleanup
- **File Path(s):** `foundation/database/mysql/001_core_schema.sql`, `foundation/database/postgresql/001_core_schema.sql`
- **Exact Issue:** Missing indexes on `user_sessions(user_id, revoked_at, expires_at)`, `password_reset_tokens(expires_at)`, `email_verification_tokens(expires_at)`, `media_items(folder, created_at)`, `pages(is_visible, sort_order)`, `homepage_sections(is_visible, sort_order)`, `translation_entries(language_code, is_verified)`, and `security_events(ip_address, created_at)`.
- **Why It Matters:** Admin Dashboard metrics (e.g., counting unverified translations or published pages), session validity checks, and expired-token pruning will degrade into full table scans as data grows.
- **Recommended Correction:** Add composite and cleanup indexes to both SQL schemas.
- **Action Type:** Code Change (SQL Blueprint)

#### [LOW] DB-08 — PostgreSQL Does Not Auto-Index Foreign Keys (`users.role_id`, `users.avatar_media_id`, `page_translations.og_image_media_id`) & Unconstrained `language_code`
- **File Path(s):** `foundation/database/postgresql/001_core_schema.sql` (lines 50–51, 131, 147)
- **Exact Issue:** Unlike MySQL/InnoDB, PostgreSQL does not automatically create indexes on foreign key columns; additionally, `language_code` columns have no check constraint or reference validation.
- **Why It Matters:** Role-deletion checks or media-deletion `ON DELETE SET NULL` cascades can lock/scan tables in PostgreSQL without FK indexes; unconstrained `language_code` risks typos entering translation tables.
- **Recommended Correction:** Add explicit FK indexes in PostgreSQL and consider documenting/adding `CHECK (language_code IN ('ar','en','fr','ru','de','es'))` or app-level enforcement.
- **Action Type:** Code Change (SQL Blueprint)

#### [PASS] DB-09 — Core Relational Coverage & Additive Safety
- **File Path(s):** `foundation/database/mysql/001_core_schema.sql`, `foundation/database/postgresql/001_core_schema.sql`
- **Verification:** Both blueprints properly separate Shared Hosting (`MySQL/MariaDB`) vs. VPS (`PostgreSQL`), use `CREATE TABLE IF NOT EXISTS`, define UTF-8 (`utf8mb4`), separate centralized `website_settings` from `users`/`user_sessions`, track translation verification (`is_verified`), and contain zero fake user credentials or mock metrics.

---

## 2. Authentication Review

Inspected:
- `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md`
- `foundation/layouts/auth-login.html`, `auth-forgot-password.html`, `auth-reset-password.html`, `admin-shell.html`
- `foundation/security/token-utils.mjs`, `foundation/mail/email-templates.mjs`
- `.env.example`, `config/security-policy.json`, `.agents/skills/authentication-account-management/SKILL.md`

### Findings

#### [HIGH] AUTH-01 — Missing UI Blueprints for Email Verification, Configurable Registration, and Full Account Settings Controls
- **File Path(s):** `foundation/layouts/` (`auth-login.html`, `auth-forgot-password.html`, `auth-reset-password.html`, `admin-shell.html` lines 136–162)
- **Exact Issue:**
  1. `foundation/layouts/` provides login, forgot-password, and reset-password pages, but lacks blueprints for `/verify-email` (token verification / resend verification form) and `/register` (gated behind `ALLOW_PUBLIC_REGISTRATION=true`).
  2. `admin-shell.html` Account Settings (`#account-settings`) only shows `full_name`, `email`, and disabled buttons for password change and revoking other sessions—omitting `mobile_number`, `avatar` upload/preview, `preferred_language`, the current-password verification modal/inputs, and an active sessions list (`user_sessions` showing IP/user-agent/last seen).
- **Why It Matters:** Developers starting a project copy must design these mandatory Account Settings and verification screens from scratch despite them being core foundation requirements.
- **Recommended Correction:** Add `auth-verify-email.html`, `auth-register.html` (marked disabled by default), and expand `#account-settings` in `admin-shell.html` with full personal profile, password change (current/new/confirm), avatar, and active sessions table blueprints.
- **Action Type:** Code Change (Blueprint HTML)

#### [HIGH] AUTH-02 — Host Header Poisoning Risk Not Explicit in Password Reset URL Construction
- **File Path(s):** `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md` (line 24), `foundation/mail/email-templates.mjs` (line 130)
- **Exact Issue:** Documentation specifies generating and emailing a reset link, and `email-templates.mjs` accepts `resetUrl`, but neither document explicitly mandates deriving reset/verification URL origins strictly from `APP_URL` in `.env` rather than HTTP `Host` / `X-Forwarded-Host` headers.
- **Why It Matters:** Building reset links from request headers lets attackers poison password reset links to steal single-use tokens.
- **Recommended Correction:** Document explicitly in `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md` and `docs/SECURITY-POLICY.md` (and enforce in a URL builder helper) that reset and verification links must always use validated `APP_URL`.
- **Action Type:** Documentation Change + Code Change (Helper)

#### [MEDIUM] AUTH-03 — `auth.genericResetSent` Ambiguity When SMTP Is Disabled or Fails
- **File Path(s):** `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md` (lines 23, 26), `foundation/i18n/en.json` (line 69)
- **Exact Issue:** Line 23 states the server always returns `auth.genericResetSent`, whereas line 26 forbids claiming delivery succeeded when SMTP is disabled/fails. `auth.genericResetSent` currently reads *"If an account matching this email exists and email delivery is configured, reset instructions have been sent."*
- **Why It Matters:** Returning a `200 OK` message implying instructions were sent when `SMTP_ENABLED=false` or SMTP throws an error confuses users and violates strict delivery honesty.
- **Recommended Correction:** Clarify the exact flow: verify `checkSmtpConfiguration()` *before* looking up the account; if SMTP is disabled or transport fails, log internally and return `503` with a distinct `auth.emailServiceUnavailable` message (still preserving non-enumeration because no user lookup occurred).
- **Action Type:** Documentation Change + Code Change (i18n dictionaries)

#### [MEDIUM] AUTH-04 — Account Settings Sensitive-Change Brute-Force Protection & Session Rotation Not Specified
- **File Path(s):** `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md` (lines 40–45)
- **Exact Issue:** Current-password verification is required to change password or email, but the spec does not mandate rate-limiting failed current-password attempts inside Account Settings or rotating the current user's session ID upon password change.
- **Why It Matters:** An attacker with temporary physical/XSS access to an open session could brute-force the current password without hitting login rate limits, or continue using a stale session ID after password rotation.
- **Recommended Correction:** Require per-user rate limiting on password-verification endpoints and mandatory session ID rotation (`user_sessions`) on password or email changes.
- **Action Type:** Documentation Change + Project-Specific Implementation

#### [MEDIUM] AUTH-05 — No Portable Password Hashing Contract Documented for Cross-Runtime Parity
- **File Path(s):** `foundation/security/token-utils.mjs`, `config/security-policy.json` (line 4)
- **Exact Issue:** `config/security-policy.json` mandates `argon2id_or_bcrypt_cost_12_plus`, while `token-utils.mjs` handles opaque tokens and strength checks without documenting a stack-specific implementation contract (e.g., Node `argon2`/`crypto.scrypt` parameters vs PHP `PASSWORD_ARGON2ID`).
- **Why It Matters:** Without explicit algorithm parameters (`scrypt` cost/salt or `Argon2id` memory/iterations if `argon2` native module isn't available on shared hosting), developers may pick weak hashing parameters.
- **Recommended Correction:** Document explicit minimum parameters for Argon2id, bcrypt (cost >= 12), and fallback Node `crypto.scrypt` in `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md`.
- **Action Type:** Documentation Change

#### [LOW] AUTH-06 — `auth-reset-password.html` Hidden `token` Input Has No Extraction Guidance
- **File Path(s):** `foundation/layouts/auth-reset-password.html` (line 34)
- **Exact Issue:** `<input type="hidden" name="token" value="">` is empty in the HTML blueprint; neither `auth-reset-password.html` nor `shell.js` shows server-rendered token injection or `Referrer-Policy: no-referrer` protection on reset pages.
- **Why It Matters:** Reset tokens in query strings can leak in `Referer` headers to external scripts/CDNs if `Referrer-Policy: no-referrer` is not applied to `/reset-password` and `/verify-email` routes.
- **Recommended Correction:** Document applying `Referrer-Policy: no-referrer` (or `POST`/cookie-bound token swap) on reset/verification routes and server-side token validation.
- **Action Type:** Documentation Change + Project-Specific Implementation

#### [PASS] AUTH-07 — Core Authentication Security Principles
- **Verification:** Strong separation of `users`/`user_sessions` from `website_settings`, SHA-256 hashed single-use expiring tokens in `token-utils.mjs`, `ALLOW_PUBLIC_REGISTRATION=false` safe default, and `checkSmtpConfiguration()` refusing fake mail success.

---

## 3. Security Review

Inspected:
- `config/security-policy.json`, `config/rbac.json`, `.env.example`
- `docs/SECURITY-POLICY.md`
- `foundation/security/security-headers.json`, `upload-policy.mjs`, `token-utils.mjs`, `input-sanitizer.mjs`, `rate-limiter.mjs`
- `foundation/forms/validator.mjs`, `foundation/mail/email-templates.mjs`

### Distinction: Implemented Reusable Code vs. Documented Requirements

| Control Area | Reusable Implemented Code (In Workspace) | Documented / Project-Specific Backend Requirement |
| :--- | :--- | :--- |
| Rate Limiting & Brute Force | `rate-limiter.mjs` (`createRateLimiter`, `MemoryRateLimitStore`, 5 tiers) + `rate_limit_buckets` SQL table | Persistent Redis/DB store adapter; Express/Fastify/PHP route middleware; IP extraction with `TRUST_PROXY` |
| Auth & Passwords | `token-utils.mjs` (`generateOpaqueToken`, `hashTokenSha256`, `constantTimeEqualHex`, `validatePasswordStrength`) | Argon2id/bcrypt hashing; login/logout/reset/verify route handlers; HTTP-only session cookie signing |
| RBAC & API Protection | `config/rbac.json` + `roles`/`role_permissions` SQL tables | Server middleware enforcing session + `role_permissions` + privilege-escalation checks |
| XSS / Input / URL Safety | `input-sanitizer.mjs` (`escapeHtml`, `sanitizeSafeUrl`, `normalizeEmail`, `buildWhatsAppLink`) + `validator.mjs` | Server-side rich HTML allowlist sanitizer (e.g., DOMPurify/HTMLPurifier) for CMS blocks |
| CSRF Protection | None in code (`CSRF_SECRET` in `.env.example` only) | Server-side CSRF token generator, validator middleware, and form/AJAX integration |
| Upload Validation | `upload-policy.mjs` (extension, MIME, size, magic-bytes, UUID filename, SHA-256) | Multipart streaming size enforcement, `brandIcon` support, non-executable storage permissions, server image re-encoding |
| Security Headers | `security-headers.json` (static baseline headers map) | Server/Nginx middleware applying headers + per-project `CSP` |
| Error Handling & Security Logs | `security_events` SQL table + `securityEventsLogged` enum in `security-policy.json` | Central logger writing events & global safe-error handler (`APP_DEBUG=false`) |

### Findings

#### [HIGH] SEC-01 — `upload-policy.mjs` Omits `brandIcon` Category & Has Weak `avif` / `docx` / `xlsx` Magic-Byte Checks
- **File Path(s):** `foundation/security/upload-policy.mjs` (lines 15–64, 74), compared with `config/security-policy.json` (lines 78–100)
- **Exact Issue:**
  1. `config/security-policy.json` defines `image`, `brandIcon` (`.png`, `.ico`, `.webp`), and `document`, whereas `upload-policy.mjs` only implements `image` and `document` (`brandIcon` throws `Unsupported upload category`).
  2. `avif` detection (`buffer.subarray(4, 8).toString('ascii') === 'ftyp'`) matches **any** ISOBMFF container (such as `.mp4`, `.mov`, `.m4a`, `.heic`) instead of verifying major/compatible brand `avif`/`avis` at bytes `8..12+`.
  3. `docx`/`xlsx` detection only checks the generic ZIP header (`PK\x03\x04`), which accepts arbitrary `.zip`, `.jar`, `.apk`, or macro-enabled `.docm` renamed to `.docx`.
- **Why It Matters:** Allows MIME/extension spoofing (e.g., disguised ZIP/JAR archives or video files uploaded as AVIF images) and blocks legitimate `.ico` favicon uploads through the shared helper.
- **Recommended Correction:** Add `brandIcon` rules (including ICO header `00 00 01 00`), verify `avif`/`avis` brand signatures inside `ftyp` boxes, and either inspect ZIP central directory filenames (`word/document.xml`, `xl/workbook.xml`) or require server-side OOXML/image re-encoding before publishing uploads.
- **Action Type:** Code Change (`upload-policy.mjs`) + Project-Specific Implementation

#### [HIGH] SEC-02 — Unbounded `MemoryRateLimitStore` Map Can Exhaust Memory Under Distributed Traffic
- **File Path(s):** `foundation/security/rate-limiter.mjs` (lines 16–66)
- **Exact Issue:** `MemoryRateLimitStore` inserts keys into `this.buckets = new Map()` forever without expired-bucket eviction or a maximum map capacity cap.
- **Why It Matters:** An attacker rotating IPs or target emails can grow the in-memory `Map` indefinitely, causing Node.js memory exhaustion (DoS). Additionally, in-memory limiting does not share state across multi-worker Node clusters or PHP CGI processes.
- **Recommended Correction:** Add expired-entry sweeping + LRU/max-size cap to `MemoryRateLimitStore` AND provide a reference SQL `rate_limit_buckets` store interface example alongside an explicit warning against relying on `MemoryRateLimitStore` in multi-worker production.
- **Action Type:** Code Change (`rate-limiter.mjs`)

#### [HIGH] SEC-03 — No Reusable CSRF Helper or Request Body / Trusted-Origin Baseline Config
- **File Path(s):** `foundation/security/`, `config/security-policy.json`, `.env.example`
- **Exact Issue:** `docs/SECURITY-POLICY.md` mandates CSRF protection and request limits, and `.env.example` includes `CSRF_SECRET`, yet `foundation/security/` provides no reusable CSRF token utility (`generateCsrfToken`/`verifyCsrfToken`), and `config/security-policy.json` lacks `cors` / `trustedOrigins` policy rules.
- **Why It Matters:** Each copied project must invent CSRF validation logic independently, risking subtle flaws (non-constant-time comparison, missing session binding, or permissive CORS origins).
- **Recommended Correction:** Add a portable stateless/session-bound HMAC CSRF helper in `foundation/security/csrf.mjs` (using `node:crypto` + `timingSafeEqual`) and add `trustedOrigins` / `cors` guidance to `config/security-policy.json`.
- **Action Type:** Code Change + Configuration Change

#### [MEDIUM] SEC-04 — Potential Email Header Injection (CRLF) in `email-templates.mjs` Subject & Plaintext
- **File Path(s):** `foundation/mail/email-templates.mjs` (lines 125–127)
- **Exact Issue:** `renderTemplate` escapes `siteName` in HTML (`escapeHtml`), but passes raw `siteName` into `subject: `[${siteName}] ${subject}`` and plaintext `text` without stripping `\r`/`\n`/control characters (`stripControlChars`).
- **Why It Matters:** If a project lets admins edit `site_name` via Website Settings and fails to sanitize control characters earlier, `\r\n` inside `siteName` could inject SMTP headers in mail transports that pass raw strings.
- **Recommended Correction:** Run `stripControlChars(siteName)` before assembling `subject` and `text`.
- **Action Type:** Code Change (`email-templates.mjs`)

#### [MEDIUM] SEC-05 — Missing Request-Size Env Vars in `.env.example` & Naming Mismatch with Docs
- **File Path(s):** `.env.example` (lines 58–70), `docs/SECURITY-POLICY.md` (line 42), `config/security-policy.json` (lines 66–70)
- **Exact Issue:** `docs/SECURITY-POLICY.md` references `MAX_MULTIPART_REQUEST_BYTES` in all-caps env style, but `.env.example` omits `MAX_JSON_BODY_BYTES`, `MAX_FORM_BODY_BYTES`, and `MAX_MULTIPART_REQUEST_BYTES` completely (only defining `UPLOAD_MAX_IMAGE_BYTES` and `UPLOAD_MAX_DOCUMENT_BYTES`).
- **Why It Matters:** Creates ambiguity when configuring Express/Nginx/PHP body limits from `.env`.
- **Recommended Correction:** Add `MAX_JSON_BODY_BYTES`, `MAX_FORM_BODY_BYTES`, and `MAX_MULTIPART_REQUEST_BYTES` to `.env.example` matching `config/security-policy.json`.
- **Action Type:** Configuration Change (`.env.example`)

#### [MEDIUM] SEC-06 — Rich-Text HTML Sanitization Contract Missing for CMS Pages & Sections
- **File Path(s):** `foundation/security/input-sanitizer.mjs`, `docs/SECURITY-POLICY.md` (line 33)
- **Exact Issue:** `input-sanitizer.mjs` escapes HTML completely (`escapeHtml`), which protects plain text, while `page_translations.content_json` and `homepage_section_translations.body_json` frequently store formatted rich text where an allowlist sanitizer is required.
- **Why It Matters:** Teams might bypass escaping to render CMS formatting with `innerHTML` / `dangerouslySetInnerHTML` without server-side sanitization.
- **Recommended Correction:** Document a strict structured-blocks (non-HTML JSON blocks) default vs. vetted server-side HTML allowlist sanitizer requirement in `docs/SECURITY-POLICY.md` and `docs/ADMIN-SYSTEM.md`.
- **Action Type:** Documentation Change

#### [PASS] SEC-07 — Zero Exposed Secrets & Strong Cryptographic Primitives
- **Verification:** `.env.example` contains safe placeholders only; `.gitignore` protects `.env*` and `uploads/`; `token-utils.mjs` uses `crypto.randomBytes(32)`, SHA-256 DB token hashing, and `timingSafeEqual`; `input-sanitizer.mjs` enforces safe URL schemes.

---

## 4. Multilingual Review

Inspected:
- `config/languages.json`, `docs/MULTILINGUAL-SYSTEM.md`
- `foundation/i18n/{ar,en,fr,ru,de,es}.json`
- `foundation/i18n/translation-audit.mjs`, `foundation/i18n/i18n-helper.mjs`
- `foundation/layouts/shell.js`, `public-shell.html`, `admin-shell.html`, `auth-*.html`

### Findings

#### [HIGH] I18N-01 — 10 Translation Keys Referenced in Auth Blueprints, `validator.mjs`, and `token-utils.mjs` Are Missing From All 6 Language Dictionaries
- **File Path(s):** `foundation/layouts/auth-forgot-password.html` (lines 39, 42), `foundation/layouts/auth-reset-password.html` (lines 28, 49), `foundation/forms/validator.mjs` (lines 63, 68, 78), `foundation/security/token-utils.mjs` (lines 55–58), `foundation/i18n/{ar,en,fr,ru,de,es}.json`, `foundation/i18n/translation-audit.mjs`
- **Exact Issue:**
  - Auth blueprints reference 3 missing keys: `auth.sendResetLink`, `auth.backToLogin`, `auth.resetTokenNote`.
  - `validator.mjs` and `token-utils.mjs` emit 7 missing keys: `validation.invalidPhone`, `validation.invalidUrl`, `validation.maxLength`, `validation.passwordNeedsUppercase`, `validation.passwordNeedsLowercase`, `validation.passwordNeedsNumber`, `validation.passwordTooCommon`.
  - `translation-audit.mjs` currently verifies parity across the 6 JSON files (96 keys) without cross-checking `data-i18n` keys in `foundation/layouts/*.html` or `.mjs` modules.
- **Why It Matters:** When a project uses `validator.mjs`, `token-utils.mjs`, or the auth HTML blueprints, those 10 strings will fail translation lookup and fall back to raw key strings or hardcoded English.
- **Recommended Correction:** Add all 10 missing keys cleanly to all 6 dictionaries (`ar, en, fr, ru, de, es` with `_meta.verified: false`) and extend `translation-audit.mjs` to scan `foundation/layouts/*.html` `data-i18n` attributes for missing keys.
- **Action Type:** Code Change (JSON Dictionaries & Audit Script)

#### [MEDIUM] I18N-02 — Language Persistence Mismatch Between `shell.js` (`localStorage`) and `config/languages.json` (`site_lang` Cookie) + Fragile Relative Fetch Path
- **File Path(s):** `foundation/layouts/shell.js` (lines 22, 32, 91), `config/languages.json` (line 6)
- **Exact Issue:** `config/languages.json` defines `cookieName: "site_lang"` for SSR/server route persistence, whereas `shell.js` stores preview selection in `localStorage` (`foundation_preview_lang`) and fetches `../i18n/${lang}.json` via a relative path.
- **Why It Matters:** A relative path fails on nested project URLs (`/ar/about`), and client-only `localStorage` is invisible to server-side rendering (causing initial LTR-to-RTL flash on Arabic page loads).
- **Recommended Correction:** Note clearly in `shell.js` that client preview uses `localStorage` for standalone blueprint files, while production projects must read/write the `site_lang` cookie and render `<html lang="..." dir="...">` on the server; support configurable i18n base path.
- **Action Type:** Code Change (`shell.js`) + Project-Specific Implementation

#### [MEDIUM] I18N-03 — No Parameter Interpolation Support in `i18n-helper.mjs` / `shell.js`
- **File Path(s):** `foundation/i18n/i18n-helper.mjs` (lines 44–48), `foundation/forms/validator.mjs` (lines 73, 78)
- **Exact Issue:** `validator.mjs` returns `{ key: 'validation.minLength', params: { min: 10 } }`, whereas `resolveTranslationValue` in `i18n-helper.mjs` only traverses object keys and has no placeholder interpolation (e.g., `{min}`, `{max}`), and the JSON strings (`"Input does not meet the minimum required length."`) do not include placeholders.
- **Why It Matters:** Users receive generic messages without knowing whether minimum length is 8 or 10 characters.
- **Recommended Correction:** Add lightweight `{param}` interpolation to `i18n-helper.mjs` and optional parameterized validation message variants in the 6 JSON dictionaries.
- **Action Type:** Code Change (`i18n-helper.mjs` & JSON Dictionaries)

#### [PASS] I18N-04 — Mandatory Six-Language Parity, RTL/LTR Separation, and Unverified Tracking
- **Verification:** `node foundation/i18n/translation-audit.mjs` passes with 96 keys across `ar` (`rtl`), `en`, `fr`, `ru`, `de`, `es` (`ltr`), `missing=0`, and every dictionary explicitly sets `_meta.verified: false` so unreviewed strings are never falsely flagged as professionally verified.

---

## 5. Admin Dashboard Review

Inspected:
- `docs/ADMIN-SYSTEM.md`, `foundation/layouts/admin-shell.html`, `config/rbac.json`
- `foundation/database/mysql/001_core_schema.sql`, `foundation/database/postgresql/001_core_schema.sql`

### Findings

#### [HIGH] ADM-01 — `admin-shell.html` Sidebar Links Point to 8 Sections Not Present in `<main>`
- **File Path(s):** `foundation/layouts/admin-shell.html` (lines 20–40 vs. lines 73–163)
- **Exact Issue:** The sidebar defines 11 navigation links (`#overview`, `#website-content`, `#pages-management`, `#media-library`, `#translations`, `#website-settings`, `#contact-information`, `#seo-settings`, `#user-management`, `#roles-permissions`, `#account-settings`), while `<main>` only implements sections for `#overview`, `#website-settings`, and `#account-settings`.
- **Why It Matters:** Eight sidebar anchor links lead to nonexistent DOM IDs, leaving Website Content, Pages Management, Media Library, Translations Tracker, Contact Information, SEO Settings, User Management, and Roles & Permissions without visual blueprint panels.
- **Recommended Correction:** Add clean, honest blueprint panels (empty/awaiting-backend state, zero fabricated data) for all remaining 8 sections in `admin-shell.html`, plus mobile/avatar/password/session controls inside `#account-settings`.
- **Action Type:** Code Change (`admin-shell.html`)

#### [MEDIUM] ADM-02 — Missing Canonical JSON Schema for `website_settings` Keys & Multilingual Contact Fields
- **File Path(s):** `foundation/database/*/001_core_schema.sql` (`website_settings`), `docs/ADMIN-SYSTEM.md`
- **Exact Issue:** `website_settings` uses a generic `setting_key` + `value_json` structure, but no schema or canonical key registry specifies the exact keys and shapes expected by public components (e.g., `site_name`, `logo_media_id`, `favicon_media_id`, `header_nav`, `footer_columns`, `social_links`, `copyright_text`, `whatsapp_number`, `mobile_number`, `email_address`, `physical_address`, `working_hours`, `enabled_languages`, `seo_global`, `robots_txt`, `sitemap_enabled`).
- **Why It Matters:** Without a canonical contract, developers may store single-language strings for `site_name`, `physical_address`, `working_hours`, or `copyright_text` instead of 6-language maps `{ ar, en, fr, ru, de, es }`, breaking centralized multilingual consistency.
- **Recommended Correction:** Add `config/website-settings.schema.json` (or default non-client structural keys template) specifying which settings are language-independent (WhatsApp, phone, email, logo ID) vs. 6-language localized objects (site name, address, working hours, copyright, navigation labels, global SEO).
- **Action Type:** Code Change (Config Schema) + Documentation Change

#### [MEDIUM] ADM-03 — `config/rbac.json` Lacks Inquiry Permissions & Explicit Anti-Privilege-Escalation Guard for User/Role Mutation
- **File Path(s):** `config/rbac.json` (lines 5–36, 44–77)
- **Exact Issue:**
  1. `permissionsCatalog` has no `inquiries.view` / `inquiries.manage` keys for reviewing contact or module inquiries.
  2. `admin` has `users.edit` and `users.toggle_active` while `customRolesPolicy` only warns generally against privilege escalation—there is no explicit rule stating that non-`super_admin` users (`admin`) cannot edit, deactivate, or reset passwords for `super_admin` accounts.
- **Why It Matters:** Without an explicit server-enforced rule protecting `super_admin` accounts from `admin` modifications, an `admin` could lock out or alter a `super_admin`.
- **Recommended Correction:** Add `inquiries.view` / `inquiries.manage` to `config/rbac.json` and document an explicit server rule forbidding non-`super_admin` roles from modifying `super_admin` users or assigning roles equal/higher than their own without `roles.manage`.
- **Action Type:** Configuration Change (`rbac.json`) + Documentation Change

#### [PASS] ADM-04 — Honest Anti-Fabrication Overview & Settings Isolation
- **Verification:** `admin-shell.html` shows `—` (`Requires Database Query`) with zero fake stats, and strictly isolates personal `Account Settings` (`account.self.manage`) from centralized business `Website Settings` (`settings.website.edit`, `settings.contact.edit`).

---

## 6. Architecture & Reusability Review

Inspected:
- `README.md`, `foundation/README.md`, `MASTER-INSTRUCTIONS.md`, `AGENTS.md`
- `docs/ADD-ONS-LOG.md`, `docs/CHANGELOG.md`, `docs/DEPLOYMENT-GUIDE.md`
- `templates/*`, `foundation/modules/*`, `.agents/skills/*/SKILL.md`

### Findings

#### [HIGH] ARCH-01 — Documentation Drift: `README.md`, `foundation/README.md`, `ADD-ONS-LOG.md`, and `CHANGELOG.md` Omit Newer Reusable Assets
- **File Path(s):** `README.md` (lines 27–67), `foundation/README.md` (lines 7–16), `docs/ADD-ONS-LOG.md`, `docs/CHANGELOG.md`
- **Exact Issue:** The inventories and tree listings in `README.md` and `foundation/README.md` do not reflect newly added foundation directories and files:
  - `foundation/forms/validator.mjs`
  - `foundation/mail/email-templates.mjs`
  - `foundation/i18n/i18n-helper.mjs`
  - `foundation/security/token-utils.mjs`, `input-sanitizer.mjs`, `rate-limiter.mjs`
  - `foundation/layouts/auth-login.html`, `auth-forgot-password.html`, `auth-reset-password.html`
- **Why It Matters:** Developers reading `README.md` or `foundation/README.md` will miss existing zero-dependency validators, token/sanitizer/rate-limiter helpers, email templates, and auth layouts, risking duplicate implementations.
- **Recommended Correction:** Update `README.md`, `foundation/README.md`, `docs/ADD-ONS-LOG.md`, and `docs/CHANGELOG.md` to inventory all actual files cleanly.
- **Action Type:** Documentation Change

#### [MEDIUM] ARCH-02 — Node.js ESM `.mjs` Helpers Need Clear Portability Contract for PHP/Python Shared Hosting Stacks
- **File Path(s):** `foundation/README.md`, `docs/CORE-FOUNDATION.md`, `docs/DEPLOYMENT-GUIDE.md`
- **Exact Issue:** Eight reusable logic files (`upload-policy.mjs`, `token-utils.mjs`, `rate-limiter.mjs`, `input-sanitizer.mjs`, `validator.mjs`, `email-templates.mjs`, `i18n-helper.mjs`, `seo-meta.mjs`) are implemented in Node.js ESM (two importing `node:crypto` and `node:fs`). Shared hosting environments running PHP (cPanel/DirectAdmin/Plesk without Node.js) cannot import `.mjs` files directly on the backend.
- **Why It Matters:** Could be mistaken as implying Node.js is mandatory on shared hosting, whereas the foundation intentionally stays stack-agnostic until hosting is verified.
- **Recommended Correction:** Explicitly state in `foundation/README.md` and `docs/CORE-FOUNDATION.md` that `.mjs` utilities are **ready-to-use implementations for Node.js backends AND canonical behavioral specifications to mirror in PHP/Python** when a shared host uses PHP/Python.
- **Action Type:** Documentation Change

#### [MEDIUM] ARCH-03 — Deployment Guide Lacks Concrete Shared Hosting `.htaccess` / VPS Nginx Snippets for Upload Isolation & Security Headers
- **File Path(s):** `docs/DEPLOYMENT-GUIDE.md` (lines 32–34, 53–58)
- **Exact Issue:** `docs/DEPLOYMENT-GUIDE.md` mentions `.htaccess` rules (`php_flag engine off`, `Options -ExecCGI`) and Nginx reverse-proxy headers/body caps in prose, without providing copy-safe template snippets (`foundation/security/` or inline templates) showing complete upload execution blocking, `nosniff`, and trusted proxy header resetting (`proxy_set_header X-Forwarded-For $remote_addr`).
- **Why It Matters:** Misconfigured `X-Forwarded-For` appending (instead of overwriting) lets attackers bypass IP rate limits when `TRUST_PROXY=true`, and incomplete `.htaccess` rules on Apache 2.4+ can fail to disable `.phar`/`.phtml`/`.html` execution.
- **Recommended Correction:** Add clean, commented Apache `.htaccess` (uploads directory hardening using `RemoveHandler`/`SetHandler none` + `Options -ExecCGI`) and Nginx reverse-proxy snippets (`proxy_set_header X-Forwarded-For $remote_addr`, `client_max_body_size`, security headers) to `docs/DEPLOYMENT-GUIDE.md`.
- **Action Type:** Documentation Change

#### [LOW] ARCH-04 — Optional Business Module Blueprints Could Standardize Multilingual & Inquiry Schema Conventions
- **File Path(s):** `foundation/modules/*.md`
- **Exact Issue:** The five opt-in module specs (`import-export.md`, `tourism.md`, `real-estate.md`, `industrial-factories.md`, `corporate-services.md`) define entities clearly at a conceptual level without reminding implementers of exact shared FK patterns (`media_items.id`, `is_verified` boolean, `language_code VARCHAR(8)`, unique `(language_code, slug)`).
- **Why It Matters:** Minor convention drift across modules when multiple projects activate different modules.
- **Recommended Correction:** Add a short shared entity conventions block to `foundation/modules/README.md`.
- **Action Type:** Documentation Change

#### [PASS] ARCH-05 — Genuine Cross-Industry & Hosting Reusability Without Bloat
- **Verification:** Zero `node_modules`, zero `package.json`, zero client branding, zero e-commerce assumptions, consistent additive-only & manual-only audit policies across `AGENTS.md`, `MASTER-INSTRUCTIONS.md`, `templates/`, and all 11 valid Antigravity skills in `.agents/skills/`.

---

## 7. Complete Finding Resolution Matrix

All 30 findings from Sections 1–6 are tracked below with exact status and any remaining per-project runtime actions:

| ID | Severity | Status | Applied Foundation Changes | Remaining Project-Specific Action (When Copied) |
| :--- | :---: | :--- | :--- | :--- |
| **DB-01** | HIGH | **RESOLVED** | Added idempotent `role_permissions` seed mappings matching `config/rbac.json` to both `mysql/001_core_schema.sql` and `postgresql/001_core_schema.sql`. | Execute chosen schema on project database. |
| **DB-02** | HIGH | **RESOLVED (Partial Circular FK in MySQL)** | Added `ON DELETE SET NULL` FKs + indexes on post-`users` audit columns in both schemas and `DO $$` circular FK `fk_media_uploaded_by` in PostgreSQL; added `idx_media_uploaded_by` in MySQL (MySQL 8 lacks idempotent `ADD CONSTRAINT IF NOT EXISTS` in plain SQL). | Optional in MySQL: add `fk_media_uploaded_by` once in a post-init migration `002_*.sql` if strict FK on `media_items.uploaded_by` is desired. |
| **DB-03** | HIGH | **RESOLVED** | Added `users.pending_email` and `email_verification_tokens.target_email` + `purpose` to both SQL schemas and documented two-step verification in `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md`. | Wire two-step email-change endpoint in project backend. |
| **DB-04** | MEDIUM | **RESOLVED** | Added `foundation_set_updated_at()` function + `BEFORE UPDATE` triggers across 11 tables in `postgresql/001_core_schema.sql`. | None beyond running schema. |
| **DB-05** | MEDIUM | **RESOLVED** | Added `contact_inquiries` table to both MySQL and PostgreSQL schemas. | Wire `POST /api/public/contact` and Admin inquiry triage routes. |
| **DB-06** | MEDIUM | **RESOLVED** | Updated `users.preferred_language` to `VARCHAR(8)` in both schemas. | None. |
| **DB-07** | MEDIUM | **RESOLVED** | Added session, token expiration, media folder, visibility/order, translation verification, and security-event indexes to both schemas. | None. |
| **DB-08** | LOW | **RESOLVED** | Added PostgreSQL FK indexes (`users`, `page_translations`, `homepage_sections`) and `language_code CHECK` constraints in PostgreSQL; MySQL auto-indexes FKs (`language_code` validated in app/validator). | Enforce allowed language codes in project backend validation. |
| **AUTH-01** | HIGH | **RESOLVED** | Added `auth-verify-email.html`, `auth-register.html`, and expanded `#account-settings` in `admin-shell.html` with mobile, preferred language, avatar upload, password fields, and active sessions table. | Connect forms to live server auth and Account Settings routes. |
| **AUTH-02** | HIGH | **RESOLVED** | Added `buildTrustedAppUrl` in `foundation/security/csrf.mjs` and explicit `APP_URL`-only requirement in `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md` & `docs/SECURITY-POLICY.md`. | Use `buildTrustedAppUrl(process.env.APP_URL, ...)` on reset/verify links. |
| **AUTH-03** | MEDIUM | **RESOLVED** | Updated `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md` to check `checkSmtpConfiguration()` pre-lookup and return `503` (`auth.emailServiceUnavailable`) when unconfigured; refined `auth.genericResetSent` in all 6 JSON files. | Implement pre-lookup SMTP check and `503` handler on forgot-password route. |
| **AUTH-04** | MEDIUM | **RESOLVED** | Added `accountPasswordVerify` rate-limit tier to `config/security-policy.json` & `rate-limiter.mjs`, plus session rotation rule in `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md`. | Apply rate limiter and session rotation on Account Settings password/email change routes. |
| **AUTH-05** | MEDIUM | **RESOLVED** | Documented concrete Argon2id, bcrypt (>=12), and Node `crypto.scrypt` hashing parameters in `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md`. | Install/configure chosen runtime password hasher in project backend. |
| **AUTH-06** | LOW | **RESOLVED** | Added `<meta name="referrer" content="no-referrer">` and server-injection notes to `auth-reset-password.html` & `auth-verify-email.html`; documented HTTP `Referrer-Policy: no-referrer` in `docs/SECURITY-POLICY.md`. | Send `Referrer-Policy: no-referrer` HTTP header on reset/verify routes. |
| **SEC-01** | HIGH | **RESOLVED** | Added `brandIcon` (`.ico` magic bytes), strict `avif`/`avis` ISOBMFF brand check, and clean OOXML ZIP marker/anti-macro verification (`word/`/`xl/`, rejecting `vbaProject.bin`) in `upload-policy.mjs`. | Wire multipart upload handler, store outside webroot, and re-encode images where feasible. |
| **SEC-02** | HIGH | **RESOLVED** | Added expired-entry sweeping + `maxEntries` capacity cap in `MemoryRateLimitStore` (`rate-limiter.mjs`). | Use Redis or DB `rate_limit_buckets` adapter for multi-worker/shared-host production. |
| **SEC-03** | HIGH | **RESOLVED** | Created `foundation/security/csrf.mjs` (`generateCsrfToken`, `verifyCsrfToken`) and added `trustedOrigins` policy to `config/security-policy.json`. | Enforce `verifyCsrfToken` middleware on state-changing routes and configure `CORS_ALLOWED_ORIGINS`. |
| **SEC-04** | MEDIUM | **RESOLVED** | Applied `stripControlChars` to `siteName`, `subject`, and plaintext fields in `foundation/mail/email-templates.mjs`. | None. |
| **SEC-05** | MEDIUM | **RESOLVED** | Added `AUTH_COOKIE_NAME`, `MAX_JSON_BODY_BYTES`, `MAX_FORM_BODY_BYTES`, `MAX_MULTIPART_REQUEST_BYTES`, and `CORS_ALLOWED_ORIGINS` to `.env.example` matching `docs/SECURITY-POLICY.md`. | Enforce body limits in project HTTP server / reverse proxy. |
| **SEC-06** | MEDIUM | **RESOLVED** | Documented structured non-HTML JSON blocks default vs. vetted server-side HTML allowlist sanitizer requirement in `docs/SECURITY-POLICY.md`. | Integrate vetted HTML sanitizer (e.g., DOMPurify/HTMLPurifier) only if rich HTML input is enabled. |
| **I18N-01** | HIGH | **RESOLVED** | Added all missing auth, validation, and account keys across `ar, en, fr, ru, de, es` (116 keys total, `missing=0`, `verified=false`) and upgraded `translation-audit.mjs` to scan HTML `data-i18n` & JS `validation.*` references. | Human-verify translations per client project before flipping `verified` flags. |
| **I18N-02** | MEDIUM | **RESOLVED** | Updated `foundation/layouts/shell.js` to sync `site_lang` cookie (`SameSite=Lax`), support configurable `data-i18n-base`, and highlight active admin links. | Render initial `<html lang dir>` on server from route/cookie. |
| **I18N-03** | MEDIUM | **RESOLVED** | Added `formatTranslation` `{param}` interpolation to `foundation/i18n/i18n-helper.mjs` and `{min}`/`{max}` placeholders across all 6 JSON dictionaries. | Pass error `params` when formatting validation errors in UI/API. |
| **ADM-01** | HIGH | **RESOLVED** | Added all remaining 8 Admin sections (`#website-content`, `#pages-management`, `#media-library`, `#translations`, `#contact-information`, `#seo-settings`, `#user-management`, `#roles-permissions`) and full `#account-settings` controls to `admin-shell.html`. | Connect Admin sections to real DB/RBAC backend APIs per project. |
| **ADM-02** | MEDIUM | **RESOLVED** | Created `config/website-settings.schema.json` specifying localized 6-language vs. language-neutral settings keys; linked from `docs/ADMIN-SYSTEM.md`. | Validate Website Settings writes against this schema in backend. |
| **ADM-03** | MEDIUM | **RESOLVED** | Added `inquiries.view` / `inquiries.manage` and explicit `protectSuperAdminAccounts` policy in `config/rbac.json` and `docs/ADMIN-SYSTEM.md`. | Enforce `super_admin` protection in user-management backend routes. |
| **ARCH-01** | HIGH | **RESOLVED** | Synchronized `README.md`, `foundation/README.md`, `docs/CORE-FOUNDATION.md`, `docs/ADD-ONS-LOG.md`, `docs/CHANGELOG.md`, and `.agents/skills/*`. | None. |
| **ARCH-02** | MEDIUM | **RESOLVED** | Documented `.mjs` cross-stack portability contract (Node import vs. PHP/Python reference spec) in `README.md`, `foundation/README.md`, `docs/CORE-FOUNDATION.md`, and `docs/DEPLOYMENT-GUIDE.md`. | Mirror helpers in PHP/Python if shared host uses PHP/Python. |
| **ARCH-03** | MEDIUM | **RESOLVED** | Added concrete Apache `.htaccess` upload-hardening and Nginx reverse-proxy/security-header snippets to `docs/DEPLOYMENT-GUIDE.md`. | Adapt domain/port and apply during deployment. |
| **ARCH-04** | LOW | **RESOLVED** | Added shared multilingual/FK/trigger schema conventions to `foundation/modules/README.md`. | Apply conventions when activating any opt-in module. |

---

## 8. Post-Remediation Verification Record

Verified after all edits (read-only checks only; no DB migrations, browser automation, or external package installations executed):
1. All **12** JSON files (`5` in `config/*.json`, `6` in `foundation/i18n/*.json`, `1` in `foundation/security/security-headers.json`) parsed cleanly.
2. `node foundation/i18n/translation-audit.mjs` confirmed **116 keys across all 6 languages** (`ar`, `en`, `fr`, `ru`, `de`, `es`) in v1.0.1 (expanded additively to **117 keys** in v1.0.2), including HTML `data-i18n` and JS `validation.*` references, with **`missing=0`** and **`verified=false`**.
3. `node --check` passed on all 12 `.js` / `.mjs` files (the 11 v1.0.1 runtime helpers/scripts plus `foundation/security/security-regression.mjs` added in v1.0.2).
4. Targeted unit and regression assertions (`node foundation/security/security-regression.mjs`) passed across `validateUpload` (`.ico` valid, fake `mp42` / `minor_version` / misaligned AVIF rejected, valid major/compat `avif` accepted, disguised/macro OOXML `.docx` rejected), `MemoryRateLimitStore` (`maxEntries` cap & `accountPasswordVerify`), `csrf.mjs` (32-char secret check, strict `issuedAt`, HMAC verify, `buildTrustedAppUrl` rejecting `//`, `/\`, `\\`, and cross-origin paths), `input-sanitizer.mjs` (`sanitizeSafeUrl` rejecting `//`, `/\`, and `\`), `email-templates.mjs` (CRLF stripping + `checkSmtpConfiguration`), `i18n-helper.mjs`, `validator.mjs`, and `token-utils.mjs` (`constantTimeEqualHex` rejecting `'zzzz'`/`'yyyy'`, `'deadzz'`/`'deadyy'`, `'abc'`/`'abd'`).
5. SQL structural parity check verified exact 16-table match across `mysql/001_core_schema.sql` and `postgresql/001_core_schema.sql`.

*(See `docs/MASTER-FOUNDATION-FINAL-VERIFICATION.md` for the independent post-patch final verification results confirming all checks PASS and **READY TO CLONE**.)*

