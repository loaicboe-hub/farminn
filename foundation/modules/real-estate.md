# Optional Module: Real Estate

Activate only for real estate brokerages, developers, and property showcase platforms.

## Core Entities (Additive Tables When Activated)

- `property_categories` + `property_category_translations`: Residential, commercial, land, industrial, etc.
- `property_locations` + `property_location_translations`: Cities, districts, coordinates (when geospatial or map display is needed).
- `agents`: Linked or standalone agent profiles (name, phone, WhatsApp override if authorized, photo media, role).
- `properties` + `property_translations`: Listing code, transaction type (`sale` | `rent` | `investment`), area, bedrooms/specifications JSON, gallery media, status (`available`, `reserved`, `sold_or_leased`), multilingual SEO.
- `property_inquiries`: Property reference, inquirer contact details, preferred viewing date, status.

## Admin Capabilities

- Manage property listings, categories, locations, specifications, and agent assignments.
- Enforce role permissions (e.g., Editor manages listings; Admin/Super Admin manages agents & visibility).
- Track property inquiries via protected backend endpoints with rate-limited public submission.

