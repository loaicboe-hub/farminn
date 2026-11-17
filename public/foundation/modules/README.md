# Optional Business Modules

These specifications define reusable data entities, admin capabilities, and public workflows for common non-e-commerce business sectors.

## Usage Rules

1. **Strictly Opt-In**: Activate only the module(s) requested in `templates/PROJECT-CONFIG.md`.
2. **No Forced UI**: Never display unused module tabs in Admin or force one business sector's homepage onto another business.
3. **Six-Language Ready**: Every module's entity fields (titles, descriptions, slugs, specifications, SEO metadata) must support all 6 mandatory languages (`ar`, `en`, `fr`, `ru`, `de`, `es`) with `is_verified` tracking.
4. **Security & Real DB**: Every public inquiry form and admin CRUD action must use real database storage, server-side RBAC, validation, CSRF protection, and rate limiting.

## Shared Schema Conventions for Activated Modules

When generating additive migration `002_module_<name>.sql` for an enabled module, follow core schema patterns:
- Multilingual child tables: `(entity_id, language_code VARCHAR(8), ..., is_verified BOOLEAN NOT NULL DEFAULT FALSE)` with `UNIQUE (entity_id, language_code)` and `UNIQUE (language_code, slug)` where URL-routable.
- Media attachments: reference `media_items(id)` with `ON DELETE SET NULL`.
- Inquiry tables: include `language_code VARCHAR(8)`, `status VARCHAR(32)`, `source_ip VARCHAR(45)`, `handled_by` (`ON DELETE SET NULL`), and `created_at` / `updated_at` timestamps.
- PostgreSQL modules: attach the `foundation_set_updated_at()` `BEFORE UPDATE` trigger to every module table with `updated_at`.

