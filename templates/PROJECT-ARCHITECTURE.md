# Project Architecture Decision Record — Farm INN

Fill out this template after verifying the client's hosting capabilities and project requirements in `templates/PROJECT-CONFIG.md`. Do not start backend implementation or create database migrations until this document is finalized.

---

## 1. Hosting & Runtime Stack

- **Hosting Environment**: VPS Hostinger (Ubuntu Linux, root SSH, Nginx reverse proxy, PM2/systemd process management)
- **Selected Backend Stack**: Node.js LTS (Express / Fastify native REST API + static serving)
- **Selected Frontend Approach**: Semantic HTML5 with Foundation Design System (`tokens.css`, `base.css`, `components.css`), responsive layouts, RTL/LTR support, and reactive DOM client scripts
- **Reason for Choice**: Native match for Hostinger VPS; zero-overhead execution; leverages existing foundation `.mjs` security and validation libraries directly.

---

## 2. Database Architecture

- **Primary Database Engine**: PostgreSQL 15+
- **Single-Database Rule Confirmed?**: Yes — PostgreSQL is the sole primary database engine.
- **Base Schema Source**: `foundation/database/postgresql/001_core_schema.sql`
- **Migration Tooling**: Raw versioned SQL migrations executed via Node.js runner with migration tracking table.
- **Non-Destructive Migration Policy**: All schema updates must be additive; never drop tables/columns/records without explicit written approval.

---

## 3. Core Subsystem Mapping

Document how each mandatory foundation capability maps onto the chosen stack:

| Capability | Implementation Location in Project | Notes / Dependencies |
| :--- | :--- | :--- |
| Design Tokens & RTL/LTR CSS | `foundation/design-system/*` (extended per brand) | Customize CSS variables only; keep logical properties |
| Six-Language i18n (`ar,en,fr,ru,de,es`) | `foundation/i18n/*` + DB `translation_entries` | Track `is_verified` and missing keys in Admin |
| Authentication & Sessions | `<!-- e.g., src/auth/ -->` | Argon2id/Bcrypt, HTTP-only cookies, DB `user_sessions` |
| RBAC Enforcement | `<!-- e.g., src/middleware/rbac -->` | Reads `config/rbac.json` + DB `roles`/`permissions` |
| Rate Limiting & Brute-Force Guard | `<!-- e.g., src/middleware/rate-limit -->` | Redis or DB-backed limiter using `config/security-policy.json` |
| Admin Dashboard | `<!-- e.g., src/admin/ -->` | Separate **Website Settings** vs **Account Settings** |
| Media Uploads & Storage | `<!-- e.g., src/media/ -->` | Extension + MIME + magic-byte checks; safe storage path |
| SMTP / Email Delivery | `<!-- e.g., src/mail/ -->` | Configured solely via `.env`; fail loudly if unconfigured |
| SEO & Sitemap/Robots | `<!-- e.g., src/seo/ -->` | Dynamic per-language meta, canonical, `hreflang`, sitemap |
| Optional Business Modules | `<!-- List active module folders or "None" -->` | Strictly opt-in |

---

## 4. API & Route Boundaries

- **Public Routes**: `<!-- /, /[lang]/..., /api/public/contact, /sitemap.xml, /robots.txt -->`
- **Auth Routes**: `<!-- /login, /forgot-password, /reset-password, /verify-email, /api/auth/* -->`
- **Admin Routes** (Protected by Auth + RBAC + Rate Limit + CSRF): `<!-- /admin/*, /api/admin/* -->`

---

## 5. Impact & Compatibility Check (Additive-Only Log)

When extending this architecture later, record impacted modules before coding:
- `<!-- Date | Change Summary | Affected Tables/Endpoints | Backward Compatibility Plan -->`

