# Add-Ons & Foundation Evolution Log

Record every approved reusable capability, optional business module, or skill improvement added to the Master Foundation here.

## Evolution Rules
1. Confirm the feature is genuinely reusable across projects (not client-specific).
2. Decide its home: core `foundation/`, optional `foundation/modules/`, `config/`, or `.agents/skills/`.
3. Preserve backward compatibility across existing foundation blueprints.
4. Update corresponding documentation, skills, and `docs/CHANGELOG.md`.
5. Keep existing project copies untouched unless manually backported by the owner.

---

## Recorded Add-Ons

| Date | Feature / Add-On | Category | Target Files | Backward Compatible | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-11-11 | Initial Master Foundation Core System | Core Foundation | `config/*`, `foundation/*`, `docs/*`, `templates/*`, `.agents/skills/*` | Yes (Baseline v1.0.0) | Stack-neutral foundation with 6 languages, RTL/LTR tokens, MySQL/PostgreSQL schemas, RBAC, security policy, and 5 optional industry module specs. |
| 2026-11-11 | Auth Blueprints, Security/Validation Helpers & Schema Hardening | Core Foundation | `foundation/{forms,mail,security,layouts,database,i18n}`, `config/*`, `docs/*` | Yes (Additive v1.0.1) | Added forms validator, 6-lang email templates, HMAC CSRF + `APP_URL` helper, bounded rate limiter, `brandIcon`/strict magic bytes, `contact_inquiries`, `role_permissions` seed, PG `updated_at` triggers, full 11-panel Admin shell, and auth verify/register blueprints. |
| 2026-11-11 | Security Helper Hardening, Blueprint UX Fixes & Regression Suite | Core Foundation | `foundation/security/*`, `foundation/layouts/{admin-shell,auth-forgot-password}.html`, `foundation/i18n/*.json`, `README.md`, `foundation/README.md`, `docs/*` | Yes (Additive v1.0.2) | Hardened `constantTimeEqualHex` strict hex checks, `buildTrustedAppUrl` origin/backslash guards, `sanitizeSafeUrl` backslash rejection, `verifyCsrfToken` secret/timestamp checks, aligned 4-byte AVIF brand slots, added `#account-save-profile` submit button + post-submit forgot-password alert, corrected doc counts, and added `security-regression.mjs`. |

