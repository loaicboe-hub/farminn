# Changelog — Master Foundation

All notable changes to the Master Foundation are documented in this file.

---

## [1.0.2] — 2026-11-11

### Fixed & Verified (Post-Final-Verification Patch)
- **Security Helper Hardening (`foundation/security/`)**:
  - `token-utils.mjs`: Tightened `constantTimeEqualHex` to require even-length non-empty strictly valid hex strings (`/^[0-9a-f]+$/i`) matching decoded byte length (`buf.length * 2 === hex.length`), eliminating silent `Buffer.from(..., 'hex')` truncation bypasses.
  - `csrf.mjs`: Enforced protocol-relative (`//`), backslash (`\`), and scheme rejection plus strict `target.origin === base.origin` assertion in `buildTrustedAppUrl`; added 32-char secret check and strict `/^\d+$/` `issuedAt` check in `verifyCsrfToken`.
  - `input-sanitizer.mjs`: Blocked backslashes (`\`) and normalized relative-origin overrides (`/\\evil.com`) in `sanitizeSafeUrl`.
  - `upload-policy.mjs`: Updated `isAvifIsobmff` to inspect 4-byte aligned ISO BMFF major and compatible brand slots (skipping `minor_version` bytes `12..15`) and added case-insensitive `vbaproject.bin` scanning in `isCleanOoxmlZip`.
  - Added zero-dependency regression suite `foundation/security/security-regression.mjs`.
- **Auth & Admin Blueprints + i18n (`foundation/layouts/`, `foundation/i18n/`)**:
  - Added `<button type="submit" id="account-save-profile">` (`common.save`) in `admin-shell.html` `#account-settings` plus IDs for action controls.
  - Added `auth.forgotPasswordHint` across all 6 dictionaries (117 keys total, `missing=0`, `_meta.verified=false`) and moved `auth.genericResetSent` into a hidden post-submission `[data-reset-confirmation]` alert in `auth-forgot-password.html`.
- **Documentation Accuracy**: Synchronized JSON file counts (12 JSON files), `docs/` file counts (13 files), `README.md`, `foundation/README.md`, `docs/ADD-ONS-LOG.md`, `docs/MASTER-FOUNDATION-QUALITY-REVIEW.md`, and `docs/MASTER-FOUNDATION-FINAL-VERIFICATION.md`.

## [1.0.1] — 2026-11-11

### Added & Hardened
- **Database Schemas (`mysql/` & `postgresql/`)**: Seeded `role_permissions` from `config/rbac.json`; added audit FKs (`ON DELETE SET NULL`), `users.pending_email` & `email_verification_tokens.target_email` + `purpose`, `contact_inquiries` table, `VARCHAR(8)` `preferred_language`, operational/cleanup indexes, PostgreSQL FK indexes + language `CHECK` constraints, and PostgreSQL `foundation_set_updated_at()` `BEFORE UPDATE` triggers.
- **Security & Config**: Added `foundation/security/csrf.mjs` (HMAC CSRF + `buildTrustedAppUrl`), `token-utils.mjs`, `input-sanitizer.mjs`, `rate-limiter.mjs` (bounded TTL eviction + `accountPasswordVerify` tier), `brandIcon`/strict AVIF & OOXML checks in `upload-policy.mjs`, `config/website-settings.schema.json`, `inquiries.*` + `super_admin` protection in `config/rbac.json`, and body limit vars in `.env.example`.
- **Auth, Admin & Forms/Mail**: Added `foundation/forms/validator.mjs`, `foundation/mail/email-templates.mjs` (with CRLF control-char stripping & `checkSmtpConfiguration()`), `auth-login.html`, `auth-forgot-password.html`, `auth-reset-password.html`, `auth-verify-email.html`, `auth-register.html`, and completed all 11 Admin sections + Account Settings controls in `admin-shell.html`.
- **Multilingual**: Added `foundation/i18n/i18n-helper.mjs` (`formatTranslation`), added missing auth/validation/account keys across all 6 JSON dictionaries (`verified: false`), updated `shell.js` (`site_lang` cookie sync), and extended `translation-audit.mjs` to validate HTML/JS key references.
- **Docs & Skills**: Completed quality review report (`docs/MASTER-FOUNDATION-QUALITY-REVIEW.md`), added `.htaccess`/Nginx snippets to `docs/DEPLOYMENT-GUIDE.md`, and synchronized `README.md`, `foundation/README.md`, `docs/`, and `.agents/skills/`.

## [1.0.0] — 2026-11-11

### Added
- Root governance and configuration: `AGENTS.md`, `MASTER-INSTRUCTIONS.md`, `README.md`, `.env.example`, `.gitignore`.
- Structured configuration baselines in `config/`: `languages.json` (6 mandatory languages), `rbac.json` (`super_admin`, `admin`, `editor`), `security-policy.json`, and `project.config.example.json`.
- Reusable foundation assets in `foundation/`:
  - `design-system/`: `tokens.css`, `base.css`, `components.css` (responsive, mobile-first, CSS logical properties for RTL/LTR).
  - `layouts/`: `public-shell.html`, `admin-shell.html`, `shell.js` (zero fabricated metrics, zero fake auth).
  - `i18n/`: baseline unverified dictionaries (`ar`, `en`, `fr`, `ru`, `de`, `es`) + zero-dependency `translation-audit.mjs`.
  - `database/`: separated non-destructive starter schemas for `mysql/001_core_schema.sql` and `postgresql/001_core_schema.sql`.
  - `security/`: `security-headers.json`, `upload-policy.mjs` (magic-byte + MIME + extension validation).
  - `seo/`: `robots.txt.template`, `sitemap.xml.template`, `seo-meta.mjs` (canonical, OG, 6-language `hreflang`).
  - `modules/`: opt-in specifications for `import-export`, `tourism`, `real-estate`, `industrial-factories`, and `corporate-services`.
- Complete documentation suite (`docs/`) covering all 11 required manuals.
- Project intake and initialization templates (`templates/`): `PROJECT-CONFIG.md`, `PROJECT-ARCHITECTURE.md`, `NEW-PROJECT-CHECKLIST.md`.
- Eleven modular Antigravity skills under `.agents/skills/`.

