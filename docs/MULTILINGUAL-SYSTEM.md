# Six-Language Multilingual System

Every website project built from this Master Foundation must support six mandatory languages:

| Code | Language | Native Name | Direction | Font Stack Token |
| :--- | :--- | :--- | :--- | :--- |
| `ar` | Arabic | العربية | **RTL** (`dir="rtl"`) | `--font-sans-rtl` |
| `en` | English | English | **LTR** (`dir="ltr"`) | `--font-sans-ltr` |
| `fr` | French | Français | **LTR** (`dir="ltr"`) | `--font-sans-ltr` |
| `ru` | Russian | Русский | **LTR** (`dir="ltr"`) | `--font-sans-ltr` |
| `de` | German | Deutsch | **LTR** (`dir="ltr"`) | `--font-sans-ltr` |
| `es` | Spanish | Español | **LTR** (`dir="ltr"`) | `--font-sans-ltr` |

Authoritative configuration: `config/languages.json`.
Starter dictionaries: `foundation/i18n/{ar,en,fr,ru,de,es}.json`.

---

## 1. Layout & Direction Rules

- **Arabic (`ar`)**: Render `<html lang="ar" dir="rtl">`, apply Arabic typography (`--font-sans-rtl`), mirror navigation, drawers, admin sidebar, padding/margin offsets, and directional icons using CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline-start`, `.icon-directional`).
- **LTR Languages (`en`, `fr`, `ru`, `de`, `es`)**: Render `<html lang="<code>" dir="ltr">`, apply Latin/Cyrillic-capable typography (`--font-sans-ltr`).
- Never hardcode physical `left`/`right` spacing or directional assumptions in shared CSS.

---

## 2. Full Coverage & Consistency

Translate all user-facing and admin-facing surfaces:
- Public navigation, headers, and footers
- Homepage sections and custom pages
- Forms, labels, placeholders, and validation errors
- Buttons, alerts, and notifications
- Admin Dashboard UI
- Dynamic content and optional business modules
- SEO metadata (`title`, `description`, Open Graph, `canonical`, `hreflang`)

**No Unintentional Mixed Languages**: When a user views the site in French (`fr`), UI chrome, validation errors, buttons, and SEO tags must all render in French—never falling back silently to mixed Arabic/English strings without tracking.

---

## 3. Language Switching & SEO

- Provide a clear, accessible language selector on both public and admin headers.
- Persist choice (`site_lang` cookie + optional user `preferred_language` in DB).
- Keep the visitor on the **equivalent translated page** when switching languages (resolving `page_id` -> target `language_code` slug).
- Support language-prefixed routes (`/ar/...`, `/en/...`, `/fr/...`, `/ru/...`, `/de/...`, `/es/...`) and translated slugs (`page_translations.slug`).
- Generate per-language SEO tags and 6-way `<link rel="alternate" hreflang="...">` + `x-default` using `foundation/seo/seo-meta.mjs`.

---

## 4. Missing & Unverified Translation Governance

- **Never mark starter or auto-assisted translations as professionally verified.**
- All starter dictionaries in `foundation/i18n/` carry `_meta.verified: false`.
- All DB translation tables (`page_translations`, `homepage_section_translations`, `translation_entries`) include `is_verified BOOLEAN DEFAULT FALSE`.
- Run `node foundation/i18n/translation-audit.mjs` during development to verify 100% key parity across all 6 languages and inspect verification flags.
- The Admin Dashboard must highlight missing keys and unverified entries (`is_verified = false`) so administrators/translators can review and verify them explicitly.

