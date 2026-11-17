# Responsive Design Standard — All Devices

Every public page and Admin Dashboard view built from this foundation must be authentically responsive across:
- **Mobile phones** (`320px`–`639px`)
- **Tablets** (`640px`–`959px`)
- **Laptops** (`960px`–`1279px`)
- **Desktops** (`1280px+`)

Base implementation: `foundation/design-system/tokens.css`, `base.css`, `components.css`.

---

## 1. Layout & Overflow Discipline

- **Mobile-First CSS**: Base styles target narrow screens; `@media (min-width: ...)` expands grids to 2, 3, and 4 columns progressively.
- **No Horizontal Overflow**: Apply `overflow-x: clip` on `body`, fluid `max-inline-size: 100%` on images/media, `min-inline-size: 0` on flex/grid children (such as `.admin-main`), and `.table-responsive` wrappers on wide data tables.
- **Do Not Simply Shrink Desktop**: Reflow multi-column navigation into an accessible mobile drawer (`.mobile-drawer`) and collapse the admin sidebar below `1024px` into an off-canvas drawer (`.admin-sidebar`).

---

## 2. Typography, Touch & Media

- **Fluid Typography**: Use `clamp()` variables (`--text-xl` through `--text-4xl`) so headings scale smoothly across viewports.
- **Touch Targets**: Keep interactive controls (`.btn`, `.form-control`, `.lang-select`, `.admin-nav-link`) at minimum `44px` (`--touch-target-min: 2.75rem`) block height on touch viewports.
- **Responsive Media**: Use `max-inline-size: 100%; block-size: auto;` and appropriately sized responsive image assets (`srcset` / modern WebP/AVIF formats) to protect mobile bandwidth.

---

## 3. Dual RTL / LTR Verification

- Every drawer, sidebar, alert border (`border-inline-start-width`), spacing helper, and directional icon uses CSS logical properties so Arabic (`dir="rtl"`) and all 5 LTR languages behave symmetrically on mobile, tablet, laptop, and desktop.
- Note: Browser-based Responsive Audits must only be run when explicitly requested by the user.

