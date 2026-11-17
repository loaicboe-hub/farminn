# Project Configuration Worksheet

Complete this document immediately after copying the Master Foundation folder for a new website project. Mirror structured values into `config/project.config.json` (never store secrets or passwords here; put secrets only in `.env`).

---

## 1. Business & Project Identity

- **Project Name**: Farm INN
- **Project Folder / Slug**: farm-inn
- **Business Type**: tourism / hospitality / countryside farm inn (custom)
- **Primary Objective / Audience**: High-end countryside inn, farm stay, agritourism & eco-hospitality with accommodations, activities, and dining.
- **Is E-Commerce?**: `No` (This foundation is not an online store template)

---

## 2. Branding & Visual Identity

- **Logo File(s)**: `<!-- Light/dark/SVG/PNG paths or "Pending client asset" -->`
- **Favicon File(s)**: `<!-- Path or "Pending" -->`
- **Color Palette**:
  - Primary Color: `<!-- #HEX -->`
  - Secondary Color: `<!-- #HEX -->`
  - Accent Color: `<!-- #HEX -->`
  - Surface / Background: `<!-- #HEX -->`
  - Text Primary / Muted: `<!-- #HEX / #HEX -->`
- **Typography**:
  - Latin Font Family (EN/FR/RU/DE/ES): `<!-- e.g., Inter / Plus Jakarta Sans -->`
  - Arabic Font Family (AR): `<!-- e.g., Cairo / IBM Plex Sans Arabic -->`
- **Design Direction**: `<!-- e.g., Industrial engineering precision, calm architectural real estate, warm hospitality tourism -->`

---

## 3. Website Structure & Pages

- **Core Pages**:
  - [ ] Home (Custom industry-appropriate section flow — do not clone another industry's homepage)
  - [ ] About Us
  - [ ] Contact Us
  - [ ] Privacy Policy
  - [ ] Terms of Use
- **Business-Specific / Custom Pages**:
  - `<!-- List custom pages required by the client -->`

---

## 4. Optional Business Modules (Strictly Opt-In)

Select **only** modules required for this project:
- [ ] None (Core corporate/informational pages only)
- [ ] Import & Export (`foundation/modules/import-export.md`)
- [ ] Tourism & Travel (`foundation/modules/tourism.md`)
- [ ] Real Estate (`foundation/modules/real-estate.md`)
- [ ] Industrial & Factories (`foundation/modules/industrial-factories.md`)
- [ ] Corporate & Services (`foundation/modules/corporate-services.md`)
- [ ] Custom Project Module: `<!-- Describe if needed -->`

---

## 5. Multilingual Configuration (Stakeholder Constrained)

Language scope explicitly constrained by stakeholder directive to two languages:
- [x] Arabic (`ar` — RTL)
- [x] English (`en` — LTR)
- [ ] French (`fr` — LTR) - Disabled per stakeholder requirement
- [ ] Russian (`ru` — LTR) - Disabled per stakeholder requirement
- [ ] German (`de` — LTR) - Disabled per stakeholder requirement
- [ ] Spanish (`es` — LTR) - Disabled per stakeholder requirement
- **Default Language**: `en` (or `ar` per client preference)
- **Translated URL Slugs Needed?**: Yes
- **Professional Translation Provider / Review Owner**: Client verified translations

---

## 6. Hosting & Database Selection (Verified & Confirmed)

- **Hosting Type**: VPS (Hostinger VPS)
- **Verified Hosting Capabilities**:
  - Runtime(s) supported: Node.js (v20+ / v22+ LTS), Nginx reverse proxy, systemd / PM2 process management
  - Database engine(s) supported: PostgreSQL 15+ (Confirmed single primary database)
  - SSH / Process Manager / Reverse Proxy available?: Yes (Full root SSH, Nginx, PM2/systemd)
- **Selected Primary Database**: PostgreSQL 15+ (`foundation/database/postgresql/`)
- **Backup Strategy**: Automated pg_dump daily cron with encrypted offsite archive

---

## 7. Authentication & Email Configuration

- **Admin Login**: Mandatory (Server-side DB-backed)
- **Public User Registration**: `<!-- Disabled (Default) | Enabled (Specify role & approval rules) -->`
- **Email Verification Required?**: `<!-- Yes / No -->`
- **Forgot Password Flow**: Mandatory (Single-use expiring hashed token)
- **Email / SMTP Provider**: `<!-- Host/Provider name; credentials stored strictly in .env -->`
- **Initial Admin Roles Needed**:
  - [x] Super Admin
  - [x] Admin
  - [x] Editor
  - [ ] Custom Project Role(s): `<!-- Specify -->`

---

## 8. Centralized Contact Defaults & Integrations

*(Live public values must be editable in Admin Dashboard -> Website Settings / Contact Information once deployed.)*

- **Official Email**: `<!-- Placeholder / client email -->`
- **Mobile Phone**: `<!-- Placeholder / client phone -->`
- **WhatsApp Number**: `<!-- E.164 format without spaces for wa.me links -->`
- **Physical Address**: `<!-- Office / factory / headquarters address -->`
- **Working Hours**: `<!-- Days & hours -->`
- **External Integrations** (optional): `<!-- Maps, Analytics, Captcha/Anti-spam, Object Storage -->`

---

## 9. Deployment Target

- **Primary Domain(s)**: `<!-- e.g., https://example.com -->`
- **SSL Certificate Plan**: `<!-- Let's Encrypt / Hosting SSL -->`
- **Deployment Guide Used**: `<!-- Shared Hosting OR VPS -->`

