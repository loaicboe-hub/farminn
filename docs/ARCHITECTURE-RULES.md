# Architecture & Additive-Only Development Rules

This document governs every code, database, configuration, and structural change in both the Master Foundation and every copied project.

---

## 1. Additive-Only Engineering Policy (Mandatory)

Never perform destructive modifications without explicit written approval from the user:

- **Features**: Never remove existing features, pages, admin sections, or public routes.
- **Database**: Never drop tables, columns, indexes, constraints, or records automatically. Never execute destructive schema migrations on live data.
- **Technology Stack**: Never replace an established backend language, framework, ORM, or database engine without explicit approval.
- **Integrations & Config**: Never delete working environment variables, SMTP setups, storage drivers, or third-party integrations.
- **Working Code**: Never overwrite tested, working components simply because a different coding style looks cleaner.
- **Impact Analysis First**: Before changing shared contracts (`config/rbac.json`, `tokens.css`, core schemas, auth middleware), inspect dependent files and clearly explain potential impact to the user.
- **Backward Compatibility**: Extend schemas, API payloads, and configuration keys additively (optional new fields, new migration files `002_...`, new permission keys) rather than breaking existing callers.

---

## 2. Clean Modularity & Business Isolation

- **No Cross-Client Contamination**: Never carry branding, media, contact info, credentials, or domain modules from one client into the Master Foundation or another project.
- **Opt-In Business Modules**: Only activate modules from `foundation/modules/` that match `templates/PROJECT-CONFIG.md`. Keep unused modules absent from project schemas and admin menus.
- **Centralized Settings Separation**: Keep public business configuration (`website_settings`) strictly separated from personal user credentials/profile (`account_settings` / `users`).

---

## 3. Honesty & Anti-Mocking Standard

- **Real Database Integration Only**: Every production metric, page, user record, and setting must come from real database queries.
- **No Fabricated Stats**: Never display placeholder counts (`1,240 visitors`, `99% uptime`) as live data.
- **No Frontend-Only Auth**: Never fake login success, password updates, or role permissions in client JavaScript.
- **No Simulated Emails**: Never display "Email sent" if `SMTP_ENABLED=false` or SMTP transport returns an error.

---

## 4. Smart Development & Token Efficiency

- Read only files relevant to the current task; avoid scanning the entire codebase repeatedly.
- Reuse `foundation/` CSS tokens, i18n helpers, upload validators, SEO helpers, and `config/` baselines rather than generating duplicate utilities.
- Limit verification after a small edit to the directly affected component, route, database operation, or syntax check.

---

## 5. Manual-Only Audits & Testing

Full audits and automated end-to-end journeys must **never** launch automatically:
- Prohibited unless explicitly requested: Full Security Audits, Full Website Audits, Full Regression Tests, Full DB Audits, Performance Stress Tests, Playwright / Browser Automation, and User Journey Testing.
- When explicitly requested, execute **only** the requested audit scope (`Full Security Audit`, `Database Audit`, `Responsive Audit`, `User Journey Test`, etc.) using safe non-production test data.
- **Critical Vulnerability Exception**: If a severe security flaw (e.g., exposed secret, broken auth check, SQL injection, arbitrary upload execution) is noticed during normal coding, stop and immediately alert the user.

