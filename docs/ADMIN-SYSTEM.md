# Universal Admin Dashboard System

The Admin Dashboard provides a clean, responsive, role-protected control center reusable across all business types while adapting optional modules to the active project.

Reference layout blueprint: `foundation/layouts/admin-shell.html` + `foundation/design-system/components.css`.

---

## 1. Required Core Sidebar Sections

1. **Overview**:
   - Real-time database counts (published pages, media items, active users, missing/unverified translations, active module inquiries).
   - Recent security/account activity from `security_events`.
   - Important system alerts (e.g., missing translations, SMTP unconfigured notice).
   - Quick actions filtered by the user's RBAC permissions.
   - **Rule**: Never display fabricated statistics or hardcoded production numbers.
2. **Website Content**:
   - Manage homepage sections (`homepage_sections` + `homepage_section_translations`), headings, descriptions, banners, and CTAs across all 6 languages.
3. **Pages Management**:
   - Create/edit core and custom pages (`pages` + `page_translations`), toggle page visibility, manage translated slugs, per-page SEO, and translation verification flags.
4. **Media Library**:
   - Upload, preview, organize by folder, replace/update assets (`media_items`), and edit localized `alt` text. Enforces upload security rules on the backend.
5. **Website Settings** *(Centralized Site Configuration)*:
   - Website name, logo, favicon, header configuration, footer configuration, navigation menus, social media links, copyright notice, homepage settings, and enabled language settings.
   - Follow the canonical JSON contract in `config/website-settings.schema.json` so localized strings (`site_name`, `copyright_text`, `physical_address`, `working_hours`, menu labels) store 6-language maps `{ ar, en, fr, ru, de, es }` while channels (`whatsapp_number`, `mobile_number`, `email_address`) remain normalized single values.
6. **Contact Information** *(Centralized Public Contact Management)*:
   - WhatsApp number, mobile phone number, email address, physical address, working hours, visibility/placement controls, and incoming public inquiry review (`contact_inquiries`, guarded by `inquiries.view` / `inquiries.manage`).
   - **Centralized Binding Rule**: Changing WhatsApp, email, or phone here immediately propagates to every public header, footer, contact block, and `wa.me` link reading from `website_settings`.
7. **SEO Settings**:
   - Global & per-language titles, meta descriptions, Open Graph metadata, social sharing images, canonical URL base, `robots.txt` directives, and dynamic XML sitemap toggles.
8. **Translations (6 Languages)**:
   - Track translation completeness and `is_verified` status across Arabic (`ar`), English (`en`), French (`fr`), Russian (`ru`), German (`de`), and Spanish (`es`). Missing or unverified strings are surfaced clearly for review.
9. **User Management**:
   - View users, create authorized accounts, edit profile details, activate/deactivate accounts (`is_active`), assign roles, and review recent login/security events.
   - Server RBAC must prevent non-`super_admin` administrators from modifying, deactivating, or resetting credentials of `super_admin` accounts.
10. **Roles & Permissions**:
    - Manage `super_admin`, `admin`, `editor`, and optional project-specific roles backed by `config/rbac.json` and `role_permissions` in the database.
11. **Account Settings** *(Personal Account — Strictly Separate from Website Settings)*:
    - Dedicated tab/section for the currently authenticated user's personal profile, email, mobile, avatar, password change, and active session management.

---

## 2. Optional Module Sidebar Group

Only render module navigation entries (e.g., Commodities & Inquiries, Tours & Destinations, Properties, Factories, Portfolio/Services) when enabled in the project's configuration.

---

## 3. Responsive Admin Requirements

- Desktop (`>= 1024px`): Persistent sidebar + fluid main workspace.
- Tablet & Mobile (`< 1024px`): Collapsible off-canvas drawer sidebar with backdrop, accessible toggle button, responsive scrollable tables (`.table-responsive`), and 44px minimum touch targets.
- Full RTL support when admin language is switched to Arabic (`ar`), and LTR for `en`, `fr`, `ru`, `de`, `es`.

