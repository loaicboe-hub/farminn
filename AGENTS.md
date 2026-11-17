# AGENTS.md — Master Website Foundation Rules

These instructions apply automatically to this workspace and to every new project copied from this Master Foundation.

---

## Active Project Directives: Farm INN
- **Project Name**: Farm INN
- **Hosting Target**: VPS Hostinger
- **Primary Database**: PostgreSQL 15+ (VPS deployment standard; single-database architecture)
- **Language Scope**: Arabic (`ar`, RTL) and English (`en`, LTR) strictly. All other languages (`fr`, `ru`, `de`, `es`) are disabled per stakeholder directive.
- **Backend Runtime**: Node.js LTS with PostgreSQL client

---

## 1. Identify Workspace Mode First

Before making changes, determine which mode applies:
- **Master Foundation Mode** (editing the reusable starter itself): Keep everything business-agnostic. Never add client-specific branding, client content, fake production data, real credentials, or premature production DB dependencies.
- **Project Copy Mode** (working inside a manually copied folder for a real website): Read `templates/PROJECT-CONFIG.md` (or the project's active config file) and `templates/PROJECT-ARCHITECTURE.md` before building features. Do not carry over unrelated demo data or activate unused business modules.

## 2. Critical Rule: Additive-Only Development

This rule is mandatory across all tasks:
- Never delete existing features without explicit user approval.
- Never remove existing database tables, columns, records, or relationships without explicit user approval.
- Never replace an existing architecture or technology stack without explicit user approval.
- Never overwrite working functionality merely because an alternative style looks preferable.
- Never remove existing integrations or configuration.
- Never run destructive database migrations automatically.
- Preserve backward compatibility whenever possible.
- Before modifying code that may affect existing behavior, inspect the relevant implementation and explain the impact first.
- Integrate new features into the existing system rather than rebuilding unrelated components.

## 3. Honesty & Real Implementation Rule

- Never display fabricated statistics, hardcoded dashboard metrics, or fake production numbers.
- Never create fake authentication, frontend-only login bypasses, or mock account updates.
- Never report that an email was sent if SMTP/email delivery is unconfigured or fails.
- Never mark machine-generated or unreviewed translations as professionally verified.
- Never claim backend, auth, email, or database features are live unless implemented, wired to a real backend/database, and verified.
- If a capability is still unconfigured or unimplemented, state that clearly.

## 4. Mandatory Technical Standards for Every Project

1. **Six Languages Always Supported**: Arabic (`ar`, full RTL), English (`en`, LTR), French (`fr`, LTR), Russian (`ru`, LTR), German (`de`, LTR), and Spanish (`es`, LTR). Keep interfaces language-consistent, persist language selection, preserve equivalent route on switch, support per-language SEO, and flag missing or unverified translations in Admin.
2. **Fully Responsive**: Desktop, laptop, tablet, and mobile. Use CSS logical properties (`inline`, `block`), responsive navigation and admin sidebar, touch-friendly targets, responsive tables/media, and zero unintended horizontal overflow in both RTL and LTR.
3. **Centralized Website Settings vs. Admin Account Settings**:
   - **Website Settings** govern site name, logo, favicon, header/footer, navigation, social links, copyright, contact details (WhatsApp, mobile, email, address, working hours), and language configuration. Public pages must read dynamically from these settings.
   - **Account Settings** belong exclusively to the logged-in administrator (name, email, mobile, avatar, password change with current-password verification, security preferences, terminating other sessions). Never merge Account Settings into Website Settings.
4. **Authentication & RBAC**: Server-side authentication, secure password hashing, single-use expiring non-enumerating password reset tokens, configurable registration (off by default unless required), optional email verification, and server-enforced RBAC (`super_admin`, `admin`, `editor`, plus project-specific roles).
5. **Security & Rate Limiting from Day One**: Backend input validation/sanitization, parameterized queries (SQLi prevention), XSS/CSRF protection, secure cookies/sessions, upload MIME/size/content validation, security headers, safe error messages, security event logging, and rate limiting / brute-force protection.
6. **Database Selection by Real Infrastructure**:
   - Shared Hosting default: MySQL or MariaDB.
   - VPS / Dedicated Server default: PostgreSQL.
   - Verify actual hosting capabilities first. One primary database per project; never mix MySQL and PostgreSQL without explicit approval.
7. **Optional Business Modules**: Only activate modules requested for the specific project (e.g., Import/Export, Tourism, Real Estate, Industrial/Factories, Corporate/Services).

## 5. Smart Development & Token Optimization

- Inspect only files relevant to the active task; never repeatedly scan the entire repository.
- Modify only necessary files; reuse components in `foundation/` and `config/`.
- Avoid unnecessary dependencies, duplicate files, or unrequested documentation rewrites.
- After edits, perform **lightweight verification only on the affected area** (modified component, endpoint, DB query, or syntax check).

## 6. Manual-Only Audits & Testing

- **Never automatically run** full project audits, full security audits, full regression suites, full website scans, performance stress tests, Playwright, browser automation, or User Journey Testing.
- Run audits or User Journey Testing **only when explicitly requested**, and limit work strictly to the requested scope.
- **Security Exception**: If you spot a critical security vulnerability during normal work, immediately alert the user and explain the risk.

## 7. Skills & Documentation Navigation

- Load the matching skill under `.agents/skills/<skill-name>/SKILL.md` only when relevant to the current task.
- Consult `MASTER-INSTRUCTIONS.md`, `docs/`, and `templates/` for architectural rules, schemas, checklists, and deployment procedures.
- Record approved generic improvements to the Master Foundation in `docs/ADD-ONS-LOG.md` and `docs/CHANGELOG.md`.

