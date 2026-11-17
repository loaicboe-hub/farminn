# MASTER-INSTRUCTIONS — Universal Website Development System

This document defines the governing rules, workflow, and technical standards for using and extending this Master Foundation.

---

## Active Project Profile: Farm INN
- **Project Name**: Farm INN
- **Target Hosting Environment**: VPS Hostinger (Ubuntu Linux, Node.js runtime, Nginx reverse proxy, systemd/PM2 process manager)
- **Primary Database Engine**: PostgreSQL 15+ (Single primary database; migration track: `foundation/database/postgresql/`)
- **Enabled Languages**: Arabic (`ar` — RTL) and English (`en` — LTR) strictly. (Other languages disabled by stakeholder decision)

---

## 1. Purpose & Scope

This repository is a **reusable technical foundation**, not a finished website and not an e-commerce template.

Supported business domains (customized per copied project):
- Import and export companies
- Tourism and travel companies
- Real estate companies and platforms
- Factories and industrial businesses
- Corporate websites
- Professional and service firms
- Future custom business domains

**Core Principle**: Build the foundation once, copy it manually for each new project, and tailor each copy independently without forcing identical homepages, visual identities, or unnecessary modules across businesses.

---

## 2. Additive-Only Development Policy (Mandatory)

All work in the Master Foundation and every copied project must follow additive-only engineering:

1. **No Unapproved Deletions**: Never delete existing features, routes, database tables, columns, records, relationships, integrations, or configurations without explicit user approval.
2. **No Unapproved Stack Replacements**: Never replace an established framework, backend language, or database engine unless explicitly instructed.
3. **No Destructive Auto-Migrations**: Never execute `DROP`, `TRUNCATE`, destructive column alterations, or data-wiping migrations automatically.
4. **Preserve Working Behavior**: Do not rewrite working components simply for stylistic preference.
5. **Impact Analysis First**: Before modifying shared logic or schemas, inspect existing dependencies and report potential impacts.
6. **Clean Integration**: Extend existing patterns and registries when adding features.

---

## 3. Honesty, Real Data & Verification Rules

- **Real Database Integration Only**: All production statistics, pages, users, media, settings, and business records must come from real database operations once the project backend is built.
- **No Fabricated Numbers**: Never display sample or hardcoded dashboard counts as production data.
- **No Fake Auth**: Never simulate login, password changes, role checks, or email delivery in frontend state.
- **No Fake Email Success**: Never report password reset or verification emails as sent if SMTP/email transport is unconfigured or fails.
- **Unverified Translations Marked Explicitly**: Starter or machine-assisted translations must remain flagged as unverified until reviewed by a human translator.
- **Clear Status Boundaries**: Always distinguish between:
  1. Implemented reusable foundation assets.
  2. Reusable documentation, instructions, and templates.
  3. Project-specific backend/database capabilities that require implementation and environment configuration.

---

## 4. Mandatory Foundation Capabilities Per Project

Every new website project built from this foundation must implement:

1. **Unique Business Identity & Responsive UI** (`docs/CORE-FOUNDATION.md`, `docs/RESPONSIVE-DESIGN.md`):
   - Distinct branding, logo, palette, typography, and page layouts tailored to the client's industry.
   - Mobile, tablet, laptop, and desktop support with no horizontal overflow and touch-friendly controls.
2. **Six-Language Multilingual System** (`docs/MULTILINGUAL-SYSTEM.md`):
   - Mandatory support for Arabic (`ar`, full RTL), English (`en`, LTR), French (`fr`, LTR), Russian (`ru`, LTR), German (`de`, LTR), and Spanish (`es`, LTR).
   - Full UI, form, validation, error, notification, dynamic content, admin UI, and SEO translation support.
   - Persistent language selector keeping users on equivalent pages/translated URLs and tracking missing/unverified translations in Admin.
3. **Universal Admin Dashboard** (`docs/ADMIN-SYSTEM.md`):
   - Sidebar sections: Overview, Website Content, Pages Management, Media Library, Website Settings, Contact Information, SEO Settings, User Management, Roles & Permissions, Account Settings, and Translation Status.
   - Centralized Website Settings updating public site headers, footers, navigation, social links, copyright, and contact channels (including WhatsApp links).
4. **Real Authentication, RBAC & Account Settings** (`docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md`):
   - Server-side email/password login, remember-me option, secure logout, role-based access control (`super_admin`, `admin`, `editor`, custom roles).
   - Configurable registration (disabled unless project needs public/member registration) and optional email verification.
   - Non-enumerating Forgot Password flow with hashed, single-use, expiring reset tokens delivered via configured SMTP/email provider.
   - Dedicated **Account Settings** section inside Admin (separate from Website Settings) allowing the authenticated user to manage name, email, mobile, profile image, password (verifying current password), security settings, and revoking other active sessions.
5. **Security & Rate Limiting** (`docs/SECURITY-POLICY.md`):
   - Functional server-side rate limiting, login brute-force protection, SQLi/XSS/CSRF defenses, secure cookies/sessions, secure file upload validation, security headers, safe error responses, request size limits, and security event logging.
6. **Appropriate Database Architecture** (`docs/DATABASE-STRATEGY.md`):
   - Verify actual hosting capabilities first.
   - Shared Hosting default: MySQL or MariaDB.
   - VPS / Dedicated Server default: PostgreSQL.
   - One primary database per project; separate migration tracks; environment-variable credentials only.

---

## 5. Optional Business Modules

Keep `foundation/modules/` specs opt-in:
- Import & Export
- Tourism & Travel
- Real Estate
- Industrial & Factories
- Corporate & Professional Services

Activate **only** modules needed by the active project. Never pre-populate unused business tables or admin menu clutter.

---

## 6. Starting a New Project (Step-by-Step)

1. Copy the entire `MASTER FOUNDATION` folder manually to a new project directory.
2. Open the copied folder in Antigravity.
3. Fill out `templates/PROJECT-CONFIG.md` (and update `config/project.config.json` from `config/project.config.example.json`).
4. Verify actual hosting environment and database support, then document the target stack in `templates/PROJECT-ARCHITECTURE.md`.
5. Initialize `.env` from `.env.example` with environment-specific secrets (never commit `.env`).
6. Select the matching database schema (`foundation/database/mysql/` or `foundation/database/postgresql/`), adapt it to your chosen backend/ORM/migration runner, and implement core backend + auth + security before building custom business pages.
7. Track progress using `templates/NEW-PROJECT-CHECKLIST.md`.

---

## 7. Smart Development & Manual-Only Audits

- **Token & Effort Efficiency**: Inspect only files required for the current change. Reuse `foundation/` and `config/` primitives. Verify only the modified component, route, query, or syntax.
- **Manual-Only Audits**: Never automatically launch full security audits, full website audits, full regression suites, database audits, performance audits, Playwright, or User Journey Testing.
- **Supported Manual Audit Scopes** (run strictly when explicitly requested):
  - `Full Security Audit`
  - `Full Website Audit`
  - `Database Audit`
  - `UI/UX Audit`
  - `Responsive Audit`
  - `User Journey Test`
  - `Deployment Audit`
  - `Performance Audit`
- **Critical Vulnerability Exception**: If a critical security flaw is noticed during regular development, immediately alert the user with impact and remediation steps.

---

## 8. Evolving the Master Foundation

When you create a verified, reusable improvement in a project and want it in future projects:
1. Keep client projects independent; do not alter existing project copies automatically.
2. Decide if the addition belongs in `foundation/`, `config/`, `docs/`, `templates/`, or `.agents/skills/`.
3. Apply the change cleanly in the Master Foundation without breaking backward compatibility.
4. Log the addition in `docs/ADD-ONS-LOG.md` and record the version/entry in `docs/CHANGELOG.md`.
5. Update affected docs and skills to match the actual implementation.

