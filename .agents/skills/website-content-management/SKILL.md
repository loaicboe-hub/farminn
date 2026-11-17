---
name: website-content-management
description: >-
  Guides CRUD management for homepage sections, custom pages, media uploads,
  centralized contact info, and per-language SEO settings. Use when implementing
  or modifying CMS content editors, page builders, media library handlers, or
  centralized site/contact settings.
---

# Website Content Management Skill

Use this workflow when working on public content editing, pages, media library, centralized contact fields, or SEO metadata.

## Rules

- Preserve existing `pages`, `page_translations`, `homepage_sections`, `media_items`, and `website_settings` records (additive-only).
- Never accept unvalidated uploads: validate extension, MIME type, size limit, and magic-byte signature on the server (`foundation/security/upload-policy.mjs` / `config/security-policy.json`).
- Keep centralized contact details (WhatsApp, mobile, email, address, working hours) inside `website_settings` so updating them in Admin updates all public `wa.me`, `tel:`, `mailto:`, header, and footer references automatically.
- Track translation verification (`is_verified = false` until human-reviewed) on every edited page or section translation.

## Implementation Steps

1. **Homepage & Pages**: Store structured section/page content per language (`ar, en, fr, ru, de, es`), visibility flag, translated slug, and per-language SEO fields (`seo_title`, `seo_description`, `og_*`, `canonical_url`).
2. **Media Library**: Rename stored files to randomized UUIDs, compute SHA-256 checksums, store outside executable webroots, and require `alt_translations` support.
3. **SEO Output**: Generate canonical tags, Open Graph metadata, 6-way `hreflang` links (`foundation/seo/seo-meta.mjs`), dynamic `sitemap.xml`, and `robots.txt`.
4. **Sanitization**: Sanitize any rich HTML fields server-side against an explicit tag/attribute allowlist before persistence or output.

## Verification

- Test creating/updating one content record and confirming public output reflects the database change cleanly.
- Test upload rejection for an invalid MIME/extension/oversized payload when modifying media routes.

