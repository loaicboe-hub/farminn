# Core Foundation Architecture

This document defines the universal technical capabilities included in the Master Foundation and how each copied project builds upon them independently.

---

## 1. Core Purpose

The Master Foundation is a **reusable, business-neutral starter system** intended to be copied manually whenever a new website project begins. It is explicitly **not** an e-commerce platform and **not** a rigid single-industry template.

Supported industries include (without forcing shared visual layouts):
- Import and export companies
- Tourism and travel agencies
- Real estate brokerages and platforms
- Factories and industrial companies
- Corporate headquarters and professional service firms
- Custom future business domains

**Reuse technical capabilities, never copy-paste the same business layout across unrelated industries.**

---

## 2. Three-Layer Separation Model

To keep the Master Foundation honest, portable, and free of premature lock-in, capabilities are separated into three explicit categories:

### Layer 1: Implemented Reusable Assets (`config/` & `foundation/`)
- **Design System**: `foundation/design-system/tokens.css`, `base.css`, `components.css` providing semantic CSS tokens, logical RTL/LTR styles, responsive grids, accessible forms, buttons, cards, tables, alerts, tabs, pagination, modals, toasts, public header/drawer, footer, auth cards, and admin shell styles.
- **UI Layout Blueprints**: `foundation/layouts/public-shell.html`, `admin-shell.html` (all 11 core sidebar modules), `auth-login.html`, `auth-forgot-password.html`, `auth-reset-password.html`, `auth-verify-email.html`, `auth-register.html`, and `shell.js` with zero fabricated statistics or fake authentication.
- **Six-Language Starters & Forms**: `config/languages.json`, `foundation/i18n/{ar,en,fr,ru,de,es}.json`, `i18n-helper.mjs`, `translation-audit.mjs`, and `foundation/forms/validator.mjs`.
- **Database Schema Blueprints**: Separated `foundation/database/mysql/001_core_schema.sql` and `foundation/database/postgresql/001_core_schema.sql` including `role_permissions` seed mappings and `contact_inquiries`.
- **Security, Mail & RBAC Baselines**: `config/rbac.json`, `config/website-settings.schema.json`, `config/security-policy.json`, `foundation/security/` (`security-headers.json`, `upload-policy.mjs`, `token-utils.mjs`, `input-sanitizer.mjs`, `rate-limiter.mjs`, `csrf.mjs`), `foundation/mail/email-templates.mjs`, and `.env.example`.
- **SEO Templates**: `foundation/seo/robots.txt.template`, `sitemap.xml.template`, and `seo-meta.mjs`.

*(Note on Runtime Portability: The zero-dependency `.mjs` helpers can be imported directly in Node.js backends and serve as reference specifications to implement identically in PHP or Python when shared hosting uses those runtimes.)*

### Layer 2: Governance, Templates & Skills (`AGENTS.md`, `MASTER-INSTRUCTIONS.md`, `docs/`, `templates/`, `.agents/skills/`)
- Architectural guardrails (additive-only development, manual-only audits, token efficiency).
- Intake worksheets (`templates/PROJECT-CONFIG.md`, `PROJECT-ARCHITECTURE.md`, `NEW-PROJECT-CHECKLIST.md`).
- Modular Antigravity skills loaded on demand.

### Layer 3: Project-Specific Implementation (Built Inside Each Project Copy)
Once hosting capabilities and project requirements are verified in the copied folder, the project implements live server-side endpoints and database persistence for:
- Database connection and versioned additive migrations.
- Real authentication, session cookies, password hashing, password recovery, email verification, and SMTP delivery.
- Backend RBAC enforcement, rate limiting, CSRF protection, and authenticated file upload handling.
- Live Admin Dashboard CRUD modules (Overview DB queries, Website Content, Pages, Media, Website Settings, Contact Info, SEO, Users, Roles, Account Settings, Translation Management).
- Client-specific branding, custom homepage/page layouts, and opted-in business modules (`foundation/modules/`).

---

## 3. Local Master Folder Workflow

1. Maintain one clean local Master Foundation directory.
2. Manually copy the entire directory to start a new project and rename the copy.
3. Never work on client deliverables inside the Master Foundation itself.
4. Keep each copied project completely independent (no automatic upstream synchronization or GitHub dependency).
5. When a generic technical improvement is built and verified, backport it deliberately to the Master Foundation and log it in `docs/ADD-ONS-LOG.md` and `docs/CHANGELOG.md`.

