# Master Foundation — Universal Website Development System

A reusable, security-first, multilingual website development foundation designed to stay permanently on your local machine and be copied manually whenever starting a new website project.

This is **not** a client-specific website and **not** an online store template. It provides the shared technical architecture, design tokens, six-language baseline, database schemas, security baselines, operational documentation, templates, and Antigravity skills needed to build tailored websites for diverse businesses—including import/export, tourism, real estate, industrial/factories, corporate, and professional service firms.

---

## Local Master Folder Workflow

1. Keep this `MASTER FOUNDATION` folder unchanged as your clean canonical source.
2. Copy the complete folder manually when starting a new project.
3. Rename the copied folder for the client/project (e.g., `acme-logistics-web`).
4. Open the copied folder in Antigravity.
5. Complete `templates/PROJECT-CONFIG.md` and `templates/PROJECT-ARCHITECTURE.md`, and follow `templates/NEW-PROJECT-CHECKLIST.md`.
6. Customize branding, design, pages, backend stack, and optional business modules independently for that project.
7. Only promote generic, reusable improvements back to the Master Foundation manually after verification, recording them in `docs/ADD-ONS-LOG.md` and `docs/CHANGELOG.md`.

GitHub is optional for backup or version control; the workflow does not depend on GitHub synchronization.

---

## What Is Included vs. Configured Per Project

To remain strictly honest and stack-neutral until hosting and architecture are chosen, the foundation separates assets into three categories:

### 1. Implemented Reusable Assets (`config/` and `foundation/`)
- **Design System (`foundation/design-system/`)**: CSS design tokens (`tokens.css`), logical-property responsive & RTL/LTR base styles (`base.css`), and reusable UI primitives (`components.css`, including drawers, tabs, pagination, modals, toasts, and auth cards).
- **Responsive Shell Blueprints (`foundation/layouts/`)**: Semantic, accessible public layout, full 11-section admin dashboard shell (`public-shell.html`, `admin-shell.html`, `shell.js`), and auth screen blueprints (`auth-login.html`, `auth-forgot-password.html`, `auth-reset-password.html`, `auth-verify-email.html`, `auth-register.html`) with zero fabricated stats or fake auth.
- **Six-Language Baseline (`config/languages.json`, `foundation/i18n/`)**: Complete starter dictionaries (`ar`, `en`, `fr`, `ru`, `de`, `es`) flagged as `verified: false`, routing/interpolation helper (`i18n-helper.mjs`), and `translation-audit.mjs` auditing JSON parity plus HTML/JS key references.
- **Forms & Transactional Email (`foundation/forms/`, `foundation/mail/`)**: Shared schema validator (`validator.mjs`) emitting localized error keys, plus 6-language email templates & SMTP verification guard (`email-templates.mjs`).
- **Database Blueprint Schemas (`foundation/database/`)**: Separated, non-destructive starter SQL schemas for `mysql/` (Shared Hosting default) and `postgresql/` (VPS/Dedicated default), including `role_permissions` seed mappings and `contact_inquiries`.
- **Security & Config Baselines (`config/`, `foundation/security/`, `.env.example`)**: RBAC matrix (`rbac.json`), centralized Website Settings schema (`website-settings.schema.json`), security policy (`security-policy.json`), security headers (`security-headers.json`), strict upload validator (`upload-policy.mjs`), token/password policy helper (`token-utils.mjs`), bounded rate limiter (`rate-limiter.mjs`), CSRF/APP_URL helper (`csrf.mjs`), sanitizer (`input-sanitizer.mjs`), and security regression tests (`security-regression.mjs`).
- **SEO Templates (`foundation/seo/`)**: `robots.txt.template`, `sitemap.xml.template`, and `seo-meta.mjs` for canonical, Open Graph, and 6-language `hreflang` metadata.

> **Cross-Stack Portability Note:** The `.mjs` modules in `foundation/` are zero-dependency Node.js ES modules ready to import directly in Node.js projects, and serve as canonical behavioral specifications to mirror in PHP or Python on Shared Hosting environments without Node.js.

### 2. Reusable Documentation, Templates & Skills
- **Root Guidance**: `AGENTS.md`, `MASTER-INSTRUCTIONS.md`.
- **Architecture & Policy Docs (`docs/`)**: 11 core foundation manuals and logs covering core architecture, additive-only rules, database strategy, security/rate limiting, admin system, authentication/account management, 6-language system, responsive design, deployment, add-ons log, and changelog, plus quality-review and final-verification reports (13 files total).
- **Project Setup Templates (`templates/`)**: `PROJECT-CONFIG.md`, `PROJECT-ARCHITECTURE.md`, and `NEW-PROJECT-CHECKLIST.md`.
- **Antigravity Skills (`.agents/skills/`)**: 11 domain-specific skills loaded on demand.

### 3. Project-Specific Backend Implementation & Configuration
Each copied project must select its backend runtime and database matching real hosting capabilities, then implement live server-side routes for:
- Database connection, migrations, and CRUD persistence.
- Email/password authentication, password hashing, session/cookie handling, single-use password reset, optional registration, and optional email verification.
- SMTP / email provider integration (via `.env`).
- Rate limiting, brute-force lockouts, CSRF, and authenticated file upload storage/scanning.
- Admin dashboard API endpoints (Overview real DB metrics, Content, Pages, Media, Website Settings, Contact Info, SEO, Users, Roles, Account Settings).
- Any project-specific optional business modules (`foundation/modules/`).

---

## Folder Structure

```text
.
├── AGENTS.md                     # Always-on Antigravity workspace rules
├── MASTER-INSTRUCTIONS.md        # Complete operational handbook
├── README.md                     # Overview and quick start
├── .env.example                  # Environment variables template (no secrets)
├── .gitignore                    # Standard ignore rules
├── .agents/
│   └── skills/                   # 11 modular Antigravity skills
├── config/                       # Reusable JSON schemas & policy configs (5 JSON files)
├── docs/                         # 11 core manuals/logs + 2 review/verification reports (13 files)
├── foundation/                   # Reusable CSS, layouts, i18n, SQL, security, SEO, module specs
└── templates/                    # New-project intake, architecture, and checklist templates
```

---

## Quick Verification Scripts (Optional, Lightweight)

If Node.js is installed on your machine, you can inspect translation key parity across all 6 languages and run the security helper regression tests with zero external dependencies:

```bash
node foundation/i18n/translation-audit.mjs
node foundation/security/security-regression.mjs
```

No `npm install`, database server, or external package installation is required to store or copy this Master Foundation.

