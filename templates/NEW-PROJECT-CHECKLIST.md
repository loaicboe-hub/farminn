# New Project Initialization Checklist

Use this checklist whenever a new website project is created by copying the Master Foundation folder.

---

## Phase 1 — Setup & Configuration (Completed)

- [x] Copied the entire Master Foundation folder manually and renamed it for FARMINN.
- [x] Completed `templates/PROJECT-CONFIG.md` with business type, branding, pages, modules, hosting (Hostinger VPS), and auth rules.
- [x] Created `config/project.config.json` with FARMINN agricultural marketplace configuration.
- [x] Verified actual hosting environment capabilities (Hostinger VPS, Node.js 22+, PostgreSQL 15+, Nginx, PM2).
- [x] Completed `templates/PROJECT-ARCHITECTURE.md` with stack, DB engine, and migration strategy.
- [x] Created `.env` with strong random `SESSION_SECRET`, `CSRF_SECRET`, and development DB connection.

## Phase 2 — Database & Security Foundation (Completed)

- [x] Selected PostgreSQL 15+ (`foundation/database/postgresql/001_core_schema.sql`).
- [x] Authored and executed additive marketplace schema (`foundation/database/postgresql/002_farminn_marketplace.sql`).
- [x] Implemented server-side password hashing (PBKDF2 SHA-512 with 100,000 iterations & constant-time compare).
- [x] Implemented server-side session management (`user_sessions`) and HTTP-only secure cookies.
- [x] Implemented RBAC middleware (`super_admin`, `admin`, `editor`, `farm_owner`, `farm_manager`, `buyer`, `supplier`) enforced on protected API endpoints.
- [x] Implemented rate limiting on login, password reset, public forms, and API endpoints (`config/security-policy.json`).
- [x] Implemented CSRF protection, security headers, request body size caps, and safe error handling.
- [x] Created initial Super Admin bootstrap mechanism safely (`admin@farminn.com` / `FarminnAdmin2026!`).

## Phase 3 — Authentication, Account Settings & Marketplace APIs (Completed)

- [x] Login with email/password, validation, error handling, optional remember-me, and secure logout.
- [x] Public registration enabled for agricultural buyers, farm owners, managers, and suppliers.
- [x] Forgot Password flow with single-use expiring hashed token and non-enumerating responses.
- [x] User personal portal (`/api/my/*`) for personal listings, management requests, proposals, and profile settings.
- [x] Dedicated Admin Account Settings connected to DB.

## Phase 4 — Admin Dashboard & Centralized Settings (Completed)

- [x] Admin Overview connected strictly to real DB queries (zero fabricated statistics).
- [x] Farms Management (moderation, approve/reject/suspend, feature toggle).
- [x] Farm Management requests & proposals review.
- [x] Partnerships & Investment applications review.
- [x] Quick Buy & Quick Sell request moderation.
- [x] Centralized **Website Settings** (site name, tagline, WhatsApp, phone, email, address, working hours) dynamically powering all public pages and reflected immediately.
- [x] User Accounts & Roles management.

## Phase 5 — Multilingual System & Responsive UI (Completed)

- [x] Arabic (`ar` — RTL) and English (`en` — LTR) supported with strict language separation.
- [x] Translation audit passed with 0 missing keys across all 248 platform dictionary keys.
- [x] Custom agricultural visual design built using `tokens.css` (forest green `#1b4332`, amber `#d97706`).
- [x] Responsive layout across Desktop, Laptop, Tablet, and Mobile with zero horizontal overflow in RTL & LTR.

## Phase 6 — Hostinger VPS Deployment Package (Completed)

- [x] Nginx reverse proxy configuration (`deploy/nginx-farminn.conf`).
- [x] systemd unit file (`deploy/farminn.service`).
- [x] PM2 cluster ecosystem (`deploy/ecosystem.config.cjs`).
- [x] Automated provisioning script (`deploy/deploy-hostinger.sh`).
- [ ] Database and media backup procedures documented and tested.
- [ ] Run any explicit user-requested audits (e.g., Security Audit, Responsive Audit, User Journey Test) **only after user approval**.

