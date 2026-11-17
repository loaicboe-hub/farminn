# Database Architecture & Hosting Strategy

Database selection is driven by **verified hosting capabilities** and **actual project requirements**—never by blind default assumptions.

---

## 1. Selection Matrix

| Hosting Environment | Default Database Preference | Verification Required Before Locking |
| :--- | :--- | :--- |
| **Shared Hosting** (cPanel / DirectAdmin / Plesk) | **MySQL 8.0+ or MariaDB 10.6+** | Confirm exact MySQL/MariaDB version, InnoDB + `utf8mb4` + `JSON` support, and supported backend runtime (PHP / Node.js / Python). |
| **VPS / Dedicated Server** | **PostgreSQL 15+** | Confirm managed or self-hosted PostgreSQL availability, backup storage, memory limits, and whether MySQL is preferred by client ops instead. |

### Mandatory Rules
1. **One Primary Database Per Project**: Do not mix MySQL and PostgreSQL in the same application without explicit user approval.
2. **Verify Before Coding**: Never assume every VPS needs PostgreSQL or every shared host supports advanced database features; confirm actual infrastructure first in `templates/PROJECT-CONFIG.md`.
3. **Environment Variables Only**: Store `DB_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_SSL` strictly in `.env` (never committed).
4. **Separated Blueprints**: Keep MySQL and PostgreSQL migration tracks isolated (`foundation/database/mysql/` vs `foundation/database/postgresql/`).
5. **Non-Destructive Additive Migrations**: Add versioned migration scripts (`002_...`, `003_...`). Never auto-run `DROP TABLE`, `DROP COLUMN`, or destructive type rewrites.

---

## 2. Core Blueprint Tables Overview

Both `foundation/database/mysql/001_core_schema.sql` and `foundation/database/postgresql/001_core_schema.sql` define identical logical capabilities:

- **RBAC**: `roles`, `role_permissions` (pre-defining only structural system roles: `super_admin`, `admin`, `editor`; no fake users).
- **Identity & Auth**: `users`, `user_sessions`, `password_reset_tokens`, `email_verification_tokens`.
- **Media**: `media_items` (original name, randomized stored filename, MIME, extension, size, SHA-256 checksum, multilingual alt text).
- **Centralized Website Settings**: `website_settings` (`setting_key`, `setting_group`, JSON payload, public visibility flag).
- **CMS Pages & Homepage**: `pages`, `page_translations`, `homepage_sections`, `homepage_section_translations` (each with `is_verified` translation flag and per-language SEO fields).
- **Translations Registry**: `translation_entries` (`translation_key`, `language_code`, `translated_value`, `is_verified`, verifier metadata).
- **Security & Rate Limiting**: `security_events`, `rate_limit_buckets`.

---

## 3. Optional Module Extensions

When a project activates an optional module (e.g., Real Estate, Tourism, Import/Export, Industrial/Factories, Corporate/Services), append its tables in an additive migration file (`002_module_<name>.sql`) matching the selected single database engine.

---

## 4. Real Database Operations Standard

- Overview dashboard statistics (published pages, media files, active users, missing/unverified translations, module inquiries) must execute real `COUNT` / aggregate queries against the database.
- Never seed fake production metrics, dummy users with hardcoded passwords, or mock inquiry totals.

