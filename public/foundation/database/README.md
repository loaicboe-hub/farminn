# Database Schema Blueprints

This directory contains separated, stack-neutral starter schemas for the two primary database strategies:

- `mysql/001_core_schema.sql` — Default blueprint for **Shared Hosting** (MySQL 8.0+ / MariaDB 10.6+).
- `postgresql/001_core_schema.sql` — Default blueprint for **VPS / Dedicated Servers** (PostgreSQL 15+).

## Important Rules

1. **Blueprint Only**: Nothing in this folder is connected or executed automatically.
2. **Verify Hosting First**: Confirm which database engine and version the target hosting environment actually supports before selecting a schema.
3. **One Primary Database Per Project**: Choose either `mysql` OR `postgresql` for a copied project. Never mix both engines without explicit user approval.
4. **Additive-Only Migrations**: When extending a live project, create numbered additive migrations (`002_...`, `003_...`). Never run destructive `DROP` or data-wiping statements automatically.
5. **No Fake Production Data**: These blueprints define schema structure (plus non-destructive system role definitions). Never seed fake business records, fake statistics, or hardcoded default admin passwords.

