---
name: multilingual-six-languages
description: >-
  Enforces mandatory six-language localization (Arabic RTL plus English,
  French, Russian, German, and Spanish LTR), translated routing, SEO hreflang,
  and missing/unverified translation tracking. Use when adding UI text, routes,
  forms, emails, CMS fields, or language-switching behavior.
---

# Multilingual Six-Languages Skill

Every website built from this foundation must support:
- `ar` (Arabic — **RTL**)
- `en`, `fr`, `ru`, `de`, `es` (English, French, Russian, German, Spanish — **LTR**)

Reference configuration: `config/languages.json` and `docs/MULTILINGUAL-SYSTEM.md`.

## Rules

- **No Mixed Languages**: Ensure navigation, buttons, forms, validation errors, notifications, emails, admin UI, dynamic records, and SEO metadata render consistently in the active language.
- **True RTL Support**: Set `<html lang="ar" dir="rtl">` for Arabic and `dir="ltr"` for the other 5 languages. Use CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline-start`) instead of physical left/right offsets.
- **Preserve Route on Switch**: Switching languages should keep the visitor on the equivalent translated page (`/en/about` -> `/ar/about` or translated slug) and persist selection in cookie/user profile.
- **Honest Verification Flag**: Never mark starter or machine-generated translations as professionally verified (`is_verified` / `_meta.verified` must remain `false` until reviewed). Make missing and unverified keys visible in Admin.

## Quick Audit Command (Lightweight)

Run key-parity check across `foundation/i18n/*.json`:
```bash
node foundation/i18n/translation-audit.mjs
```

## Verification

- Confirm any newly added UI or CMS key exists in all 6 language dictionaries or DB translation tables, and verify RTL/LTR layout on affected views only.

