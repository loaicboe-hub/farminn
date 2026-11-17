---
name: responsive-design
description: >-
  Guides responsive layout engineering across desktop, laptop, tablet, and
  mobile viewports in both RTL and LTR directions. Use when building or fixing
  headers, mobile menus, admin sidebars, grids, forms, tables, or media layout.
---

# Responsive Design Skill

Use this skill when building or adjusting UI layouts, navigation, forms, tables, or admin components.

## Core Standards

- **Breakpoints**: Mobile (`320px+`), Tablet (`640px+`), Laptop (`960px+` / `1024px+` admin sidebar threshold), Desktop (`1280px+`).
- **No Desktop Shrinking**: Convert desktop navigation into a mobile drawer (`.mobile-drawer`) and collapse the admin sidebar into an off-canvas drawer below `1024px`.
- **Zero Horizontal Overflow**: Enforce `overflow-x: clip` on `body`, `min-inline-size: 0` inside flex/grid panels, fluid media (`max-inline-size: 100%; block-size: auto;`), and `.table-responsive` wrappers on tables.
- **Touch Accessibility**: Maintain minimum `44px` (`--touch-target-min`) interactive height on buttons, links in drawers, selects, and inputs.
- **Logical RTL/LTR CSS**: Always use `inline`/`block` logical CSS properties from `foundation/design-system/base.css` so Arabic RTL mirrors automatically without duplicate stylesheets.

## Audit Policy

- Do **not** launch Playwright or automated full-site responsive crawls unless explicitly requested by the user (`Responsive Audit`).
- Verify only the modified component/page CSS and markup structure during normal tasks.

