---
name: admin-dashboard
description: >-
  Guides implementation and extension of the universal Admin Dashboard,
  sidebar modules, real-DB overview metrics, centralized Website Settings,
  user/role management, and RBAC enforcement. Use when building or modifying
  admin panels, dashboard widgets, or administrative settings.
---

# Admin Dashboard Skill

Use this workflow when building or extending any Admin Dashboard section.

## Non-Negotiable Constraints

- **Additive-Only**: Extend existing sidebar sections and endpoints without removing working admin routes or tables.
- **Real Metrics Only**: Overview statistics (`published_pages`, `media_items`, `active_users`, `unverified_translations`, module inquiries) must execute real database queries. Never render fabricated or hardcoded production metrics.
- **Strict Settings Separation**: Keep **Website Settings** (`website_settings`, following `config/website-settings.schema.json`) completely separate from the logged-in user's personal **Account Settings** (`users` / `user_sessions`).
- **Server-Side RBAC**: Enforce permissions from `config/rbac.json` and `role_permissions` on every backend admin API route—never rely on hiding frontend sidebar links alone, and block non-`super_admin` accounts from modifying `super_admin` users.
- **Responsive & Bilingual/6-Lang**: Support mobile/tablet drawer sidebar (`foundation/design-system/components.css`) and all 6 languages (`ar` RTL, `en/fr/ru/de/es` LTR).

## Core Sidebar Scope

1. Overview
2. Website Content
3. Pages Management
4. Media Library
5. Website Settings & Contact Information
6. SEO Settings
7. Translations (missing & unverified tracker)
8. User Management & Roles/Permissions
9. Account Settings (personal)
10. Opt-in project business module sections only

## Verification

- Verify modified admin endpoint enforces auth + RBAC permission + CSRF.
- Confirm UI changes adapt across desktop and narrow mobile viewports without overflow.

