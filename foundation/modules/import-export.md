# Optional Module: Import & Export

Activate only for import, export, trading, or commodity sourcing companies.

## Core Entities (Additive Tables When Activated)

- `trade_commodities` + `trade_commodity_translations`: Products/commodities, HS codes (optional), packaging specs, origin/destination markets, technical spec sheets (via `media_items`), visibility, multilingual SEO.
- `trade_markets` + `trade_market_translations`: Target export/import regions, shipping ports, compliance notes.
- `trade_inquiries`: Direction (`export` | `import`), commodity reference, quantity/unit, incoterms interest, company name, contact details, status (`new`, `reviewing`, `quoted`, `closed`), IP rate-limit metadata.

## Admin Capabilities

- Manage commodities, specifications, and downloadable PDF spec sheets.
- Manage export/import markets and destination pages.
- Review and update incoming export/import inquiries (backed by real DB records; never fake counts).

