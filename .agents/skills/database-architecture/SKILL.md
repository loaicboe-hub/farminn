---
name: database-architecture
description: >-
  Guides database engine selection, schema design, additive migrations, and
  real database integration based on verified hosting capabilities. Use when
  selecting MySQL/MariaDB vs PostgreSQL, creating migrations, or extending data models.
---

# Database Architecture Skill

Use this workflow before creating schemas, migrations, or database queries in a project.

## Mandatory Rules

1. **Verify Hosting Capabilities First**: Confirm what the client's actual hosting supports before choosing the database engine.
   - Shared Hosting default: **MySQL 8.0+ / MariaDB 10.6+** (`foundation/database/mysql/001_core_schema.sql`).
   - VPS / Dedicated default: **PostgreSQL 15+** (`foundation/database/postgresql/001_core_schema.sql`).
2. **One Primary Database**: Never mix MySQL and PostgreSQL in one project without explicit user approval.
3. **Additive-Only Migrations**: Never drop tables, columns, indexes, or records automatically. Create sequential additive migration files (`002_...`, `003_...`).
4. **No Fake Data & No Hardcoded Creds**: Store DB credentials strictly in `.env`. Never seed fabricated metrics or hardcoded admin passwords.
5. **Parameterized Queries Only**: Never interpolate user input directly into SQL strings.

## Procedure

1. Read `templates/PROJECT-CONFIG.md` and `templates/PROJECT-ARCHITECTURE.md` to confirm hosting and DB engine.
2. Use the matching SQL schema track (`mysql/` OR `postgresql/`) as the starting blueprint.
3. Add optional business module tables (`foundation/modules/*.md`) only for modules explicitly enabled in project configuration.
4. Explain potential schema impact to the user before altering existing tables or foreign keys.
5. Verify only the affected migration or query after editing.

