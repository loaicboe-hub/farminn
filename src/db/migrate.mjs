import { db } from './index.mjs';
import { hashPassword } from '../utils/auth-crypto.mjs';

export async function runMigrations() {
  await db.init();
  console.log('[FARMINN Migration] Running database migrations...');

  if (db.driver === 'pg') {
    // In PostgreSQL, execute full standard SQL files
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { config } = await import('../config.mjs');
    
    const sql1 = fs.readFileSync(path.join(config.rootDir, 'foundation/database/postgresql/001_core_schema.sql'), 'utf8');
    const sql2 = fs.readFileSync(path.join(config.rootDir, 'foundation/database/postgresql/002_farminn_marketplace.sql'), 'utf8');
    
    await db.exec(sql1);
    await db.exec(sql2);
    console.log('[FARMINN Migration] Applied 001_core_schema.sql and 002_farminn_marketplace.sql to PostgreSQL successfully.');
  } else {
    // In SQLite dev mode, create standard compatible schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        is_system INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_key TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(role_id, permission_key)
      );

      CREATE TABLE IF NOT EXISTS media_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_name TEXT NOT NULL,
        stored_filename TEXT NOT NULL UNIQUE,
        storage_path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        extension TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        sha256_checksum TEXT NOT NULL,
        folder TEXT NOT NULL DEFAULT 'general',
        alt_translations TEXT,
        uploaded_by INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        pending_email TEXT,
        mobile_number TEXT,
        password_hash TEXT NOT NULL,
        role_id INTEGER NOT NULL REFERENCES roles(id),
        account_type TEXT NOT NULL DEFAULT 'buyer',
        avatar_media_id INTEGER REFERENCES media_items(id),
        preferred_language TEXT NOT NULL DEFAULT 'en',
        is_active INTEGER NOT NULL DEFAULT 1,
        email_verified_at TEXT,
        last_login_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        ip_address TEXT,
        user_agent TEXT,
        remember_me INTEGER NOT NULL DEFAULT 0,
        expires_at TEXT NOT NULL,
        revoked_at TEXT,
        last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used_at TEXT,
        ip_address TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS website_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        group_name TEXT NOT NULL DEFAULT 'general',
        is_public INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS taxonomy_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name_en TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        region TEXT DEFAULT 'Egypt',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS taxonomy_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name_en TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        category_type TEXT NOT NULL,
        icon_name TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS farms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        purpose TEXT NOT NULL DEFAULT 'sale',
        title_en TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        description_en TEXT,
        description_ar TEXT,
        governorate_id INTEGER REFERENCES taxonomy_locations(id),
        city_en TEXT,
        city_ar TEXT,
        location_details_en TEXT,
        location_details_ar TEXT,
        area_feddan REAL NOT NULL DEFAULT 0,
        area_qirat INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL DEFAULT 0,
        price_per_feddan REAL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'EGP',
        water_source TEXT DEFAULT 'artesian_well',
        water_details_en TEXT,
        water_details_ar TEXT,
        irrigation_system TEXT DEFAULT 'drip',
        electricity_source TEXT DEFAULT 'grid',
        soil_type TEXT DEFAULT 'sandy',
        legal_status TEXT DEFAULT 'registered',
        facilities TEXT DEFAULT '[]',
        crops TEXT DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'approved',
        is_featured INTEGER NOT NULL DEFAULT 0,
        view_count INTEGER NOT NULL DEFAULT 0,
        contact_name TEXT,
        contact_phone TEXT,
        contact_whatsapp TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS farm_media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        media_item_id INTEGER REFERENCES media_items(id) ON DELETE SET NULL,
        image_url TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_cover INTEGER NOT NULL DEFAULT 0,
        caption_en TEXT,
        caption_ar TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS farm_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        title_en TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        document_type TEXT NOT NULL DEFAULT 'legal_deed',
        document_url TEXT,
        is_verified INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS farm_inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS farm_management_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title_en TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        governorate_id INTEGER REFERENCES taxonomy_locations(id),
        area_feddan REAL NOT NULL DEFAULT 0,
        crops_activity TEXT,
        required_services TEXT DEFAULT '[]',
        budget_range TEXT,
        details TEXT,
        contact_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_whatsapp TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS farm_management_proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL REFERENCES farm_management_requests(id) ON DELETE CASCADE,
        manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        manager_name TEXT NOT NULL,
        manager_phone TEXT NOT NULL,
        proposed_fee REAL NOT NULL DEFAULT 0,
        fee_type TEXT NOT NULL DEFAULT 'fixed_monthly',
        duration_months INTEGER DEFAULT 12,
        proposal_details TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS partnerships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title_en TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        governorate_id INTEGER REFERENCES taxonomy_locations(id),
        area_feddan REAL NOT NULL DEFAULT 0,
        required_capital REAL NOT NULL DEFAULT 0,
        partnership_type TEXT NOT NULL DEFAULT 'capital_investor',
        equity_share_percent REAL NOT NULL DEFAULT 0,
        objectives_en TEXT,
        objectives_ar TEXT,
        conditions_en TEXT,
        conditions_ar TEXT,
        contact_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_whatsapp TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS partnership_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partnership_id INTEGER NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
        applicant_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        applicant_name TEXT NOT NULL,
        applicant_phone TEXT NOT NULL,
        offered_capital REAL DEFAULT 0,
        proposal_message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS quick_buy_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        whatsapp TEXT,
        governorate_id INTEGER REFERENCES taxonomy_locations(id),
        min_area_feddan REAL DEFAULT 0,
        max_area_feddan REAL DEFAULT 0,
        available_cash REAL NOT NULL DEFAULT 0,
        exchange_asset_type TEXT DEFAULT 'none',
        exchange_asset_description TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        admin_notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS quick_sell_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        whatsapp TEXT,
        farm_name TEXT NOT NULL,
        governorate_id INTEGER REFERENCES taxonomy_locations(id),
        area_feddan REAL NOT NULL DEFAULT 0,
        asking_price REAL NOT NULL DEFAULT 0,
        accepts_installments INTEGER NOT NULL DEFAULT 0,
        accepts_exchange INTEGER NOT NULL DEFAULT 0,
        exchange_preferences TEXT,
        farm_details TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        admin_notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        slug TEXT NOT NULL UNIQUE,
        company_name_en TEXT NOT NULL,
        company_name_ar TEXT NOT NULL,
        logo_url TEXT,
        category_slug TEXT NOT NULL,
        description_en TEXT,
        description_ar TEXT,
        governorate_id INTEGER REFERENCES taxonomy_locations(id),
        phone TEXT NOT NULL,
        whatsapp TEXT,
        email TEXT,
        website_url TEXT,
        products_services TEXT DEFAULT '[]',
        is_verified INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS human_resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        slug TEXT NOT NULL UNIQUE,
        full_name_en TEXT NOT NULL,
        full_name_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        category_slug TEXT NOT NULL,
        experience_years INTEGER NOT NULL DEFAULT 1,
        governorate_id INTEGER REFERENCES taxonomy_locations(id),
        bio_en TEXT,
        bio_ar TEXT,
        skills TEXT DEFAULT '[]',
        avatar_url TEXT,
        phone TEXT NOT NULL,
        whatsapp TEXT,
        is_verified INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    console.log('[FARMINN Migration] SQLite development schema initialized successfully.');
  }

  // Run seed
  const { seedDatabase } = await import('./seed.mjs');
  await seedDatabase();
}

