---
name: website-foundation
description: >-
  Guides project initialization and custom website architecture inside a copied
  Master Foundation folder. Use when starting a new website project from this
  foundation or deciding how to structure business-specific pages, branding, and
  opt-in modules without cloning another industry's design.
---

# Website Foundation Skill

Use this workflow when bootstrapping a new project copy or structuring core public architecture.

## Rules

- Keep work **additive-only**: never delete existing tables, configs, or working modules without explicit user approval.
- Do not force one industry's homepage or layout onto another business (import/export, tourism, real estate, industrial/factories, corporate, and service businesses each require bespoke public layouts).
- Activate optional modules under `foundation/modules/` **only** when required by the project.
- Never trigger full audits or browser test suites automatically.

## Procedure

1. Confirm workspace mode: verify this is a copied project folder, not the untouched Master Foundation.
2. Review or populate `templates/PROJECT-CONFIG.md` and `config/project.config.json` (business type, branding, typography, required pages, enabled modules, hosting type, DB choice, auth toggles).
3. Verify hosting capabilities before finalizing `templates/PROJECT-ARCHITECTURE.md` and `.env` (from `.env.example`).
4. Customize CSS brand variables in `foundation/design-system/tokens.css` while preserving semantic token names and `base.css` RTL/LTR logical styles.
5. Wire centralized `website_settings` (site name, logo, favicon, header/footer, navigation, social links, copyright, contact channels, WhatsApp) so public components never hardcode business contact values.
6. Verify only affected templates/routes after changes.

## References

- `docs/CORE-FOUNDATION.md`
- `templates/NEW-PROJECT-CHECKLIST.md`
- `foundation/modules/README.md`

