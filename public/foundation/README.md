# Reusable Foundation Assets

This directory contains stack-neutral, reusable components and blueprints designed to be consumed directly or adapted into the chosen framework when starting a project copy.

> **Portability Note:** All `.mjs` files use zero-dependency standard Node.js ES modules. Node.js projects can import them directly; PHP or Python shared-hosting projects should mirror their exact validation, token, rate-limit, and sanitization contracts in the chosen server runtime.

## Inventory & Implementation Status

| Subfolder | Contents | Status | Notes |
| :--- | :--- | :--- | :--- |
| `design-system/` | `tokens.css`, `base.css`, `components.css` | **Implemented (CSS)** | Ready to import; customize brand variables per project. |
| `layouts/` | `public-shell.html`, `admin-shell.html`, `auth-login.html`, `auth-forgot-password.html`, `auth-reset-password.html`, `auth-verify-email.html`, `auth-register.html`, `shell.js` | **Blueprint UI Shells** | Responsive RTL/LTR HTML/CSS/JS shells covering public, all 11 admin sections, and auth screens; zero fake stats or fake auth. |
| `i18n/` | `ar/en/fr/ru/de/es.json`, `i18n-helper.mjs`, `translation-audit.mjs` | **Implemented Baseline** | Core UI/auth/validation keys for all 6 languages (`verified: false` until reviewed) + routing/interpolation helper + audit script. |
| `forms/` | `validator.mjs` | **Implemented Helper** | Schema-driven input validator returning localized `validation.*` keys. |
| `mail/` | `email-templates.mjs` | **Implemented Helper** | 6-language reset/verification email templates + strict `checkSmtpConfiguration()` guard. |
| `database/` | `mysql/001_core_schema.sql`, `postgresql/001_core_schema.sql` | **Schema Blueprints** | Separated core schemas with RBAC seeds, triggers (PG), indexes, and `contact_inquiries`. |
| `security/` | `security-headers.json`, `upload-policy.mjs`, `token-utils.mjs`, `input-sanitizer.mjs`, `rate-limiter.mjs`, `csrf.mjs`, `security-regression.mjs` | **Baseline Policy & Helpers** | Headers, strict image/brandIcon/document validation, token hashing/strength, XSS/URL sanitizer, bounded rate limiter, HMAC CSRF + `APP_URL` builder, and regression tests. |
| `seo/` | `robots.txt.template`, `sitemap.xml.template`, `seo-meta.mjs` | **Templates & Helper** | SEO metadata, canonical, Open Graph, and 6-language `hreflang` generator helper. |
| `modules/` | Opt-in business module specifications | **Specification Blueprints** | Activate only modules required by the specific project. |
