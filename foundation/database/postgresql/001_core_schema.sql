-- =============================================================================
-- MASTER FOUNDATION — CORE SCHEMA BLUEPRINT (PostgreSQL 15+)
-- Target Environment: VPS / Dedicated Server Default
-- Policy: Additive-only; uses IF NOT EXISTS; contains NO fake production data.
-- =============================================================================

CREATE OR REPLACE FUNCTION foundation_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_key VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_id, permission_key)
);

-- 2. Media Library
CREATE TABLE IF NOT EXISTS media_items (
  id BIGSERIAL PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL UNIQUE,
  storage_path VARCHAR(512) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  extension VARCHAR(24) NOT NULL,
  size_bytes BIGINT NOT NULL,
  sha256_checksum CHAR(64) NOT NULL,
  folder VARCHAR(120) NOT NULL DEFAULT 'general',
  alt_translations JSONB,
  uploaded_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_folder_created ON media_items(folder, created_at);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media_items(uploaded_by);

-- 3. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  pending_email VARCHAR(190),
  mobile_number VARCHAR(40),
  password_hash VARCHAR(255) NOT NULL,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  avatar_media_id BIGINT REFERENCES media_items(id) ON DELETE SET NULL,
  preferred_language VARCHAR(8) NOT NULL DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_media_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_media_uploaded_by'
  ) THEN
    ALTER TABLE media_items
      ADD CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_sessions (
  id CHAR(64) PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent VARCHAR(512),
  remember_me BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(user_id, revoked_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  requested_ip VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_expires ON password_reset_tokens(expires_at);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_email VARCHAR(190),
  purpose VARCHAR(32) NOT NULL DEFAULT 'registration',
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verify_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verify_expires ON email_verification_tokens(expires_at);

-- 4. Centralized Website Settings & Contact Information (Separate from Account Settings)
CREATE TABLE IF NOT EXISTS website_settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_group VARCHAR(64) NOT NULL,
  value_json JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_settings_group ON website_settings(setting_group);

-- 5. Pages & Multilingual Content (6 Mandatory Languages: ar, en, fr, ru, de, es)
CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  page_key VARCHAR(120) NOT NULL UNIQUE,
  template_type VARCHAR(80) NOT NULL DEFAULT 'standard',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pages_visible_order ON pages(is_visible, sort_order);

CREATE TABLE IF NOT EXISTS page_translations (
  id BIGSERIAL PRIMARY KEY,
  page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  language_code VARCHAR(8) NOT NULL CHECK (language_code IN ('ar', 'en', 'fr', 'ru', 'de', 'es')),
  slug VARCHAR(190) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_json JSONB NOT NULL,
  seo_title VARCHAR(255),
  seo_description VARCHAR(500),
  og_title VARCHAR(255),
  og_description VARCHAR(500),
  og_image_media_id BIGINT REFERENCES media_items(id) ON DELETE SET NULL,
  canonical_url VARCHAR(512),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, language_code),
  UNIQUE (language_code, slug)
);
CREATE INDEX IF NOT EXISTS idx_page_trans_lang_verified ON page_translations(language_code, is_verified);
CREATE INDEX IF NOT EXISTS idx_page_trans_og_media ON page_translations(og_image_media_id);

-- 6. Homepage Sections & Content Management
CREATE TABLE IF NOT EXISTS homepage_sections (
  id BIGSERIAL PRIMARY KEY,
  section_key VARCHAR(120) NOT NULL UNIQUE,
  section_type VARCHAR(80) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  banner_media_id BIGINT REFERENCES media_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sections_visible_order ON homepage_sections(is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_sections_banner_media ON homepage_sections(banner_media_id);

CREATE TABLE IF NOT EXISTS homepage_section_translations (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  language_code VARCHAR(8) NOT NULL CHECK (language_code IN ('ar', 'en', 'fr', 'ru', 'de', 'es')),
  heading VARCHAR(255),
  subheading VARCHAR(500),
  body_json JSONB NOT NULL,
  cta_label VARCHAR(120),
  cta_url VARCHAR(512),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, language_code)
);
CREATE INDEX IF NOT EXISTS idx_section_trans_lang_verified ON homepage_section_translations(language_code, is_verified);

-- 7. Dynamic Translation Overrides & Verification Tracking
CREATE TABLE IF NOT EXISTS translation_entries (
  id BIGSERIAL PRIMARY KEY,
  translation_key VARCHAR(190) NOT NULL,
  language_code VARCHAR(8) NOT NULL CHECK (language_code IN ('ar', 'en', 'fr', 'ru', 'de', 'es')),
  translated_value TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (translation_key, language_code)
);
CREATE INDEX IF NOT EXISTS idx_trans_lang_verified ON translation_entries(language_code, is_verified);

-- 8. Core Contact Inquiries (Shared Public Inquiry Intake)
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  language_code VARCHAR(8) NOT NULL DEFAULT 'en' CHECK (language_code IN ('ar', 'en', 'fr', 'ru', 'de', 'es')),
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  source_ip VARCHAR(45),
  handled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON contact_inquiries(status, created_at);

-- 9. Security Event Logs & Rate Limit Buckets
CREATE TABLE IF NOT EXISTS security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(512),
  details_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sec_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sec_created ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_sec_user_created ON security_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sec_ip_created ON security_events(ip_address, created_at);

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key VARCHAR(190) PRIMARY KEY,
  hit_count INT NOT NULL DEFAULT 0,
  window_reset_at TIMESTAMPTZ NOT NULL,
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_window_reset ON rate_limit_buckets(window_reset_at);

-- Auto-update triggers for updated_at parity with MySQL
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'roles', 'media_items', 'users', 'website_settings', 'pages',
    'page_translations', 'homepage_sections', 'homepage_section_translations',
    'translation_entries', 'contact_inquiries', 'rate_limit_buckets'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION foundation_set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Structural System Roles & RBAC Seed Mapping (No fake user accounts or passwords)
INSERT INTO roles (slug, name, description, is_system) VALUES
  ('super_admin', 'Super Admin', 'Full administrative and security access.', TRUE),
  ('admin', 'Admin', 'Site content, settings, SEO, and standard user administration.', TRUE),
  ('editor', 'Editor', 'Content, pages, media, and translation management.', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN (VALUES
  ('super_admin', '*'),
  ('admin', 'dashboard.overview.view'),
  ('admin', 'content.view'),
  ('admin', 'content.edit'),
  ('admin', 'pages.view'),
  ('admin', 'pages.create'),
  ('admin', 'pages.edit'),
  ('admin', 'pages.publish'),
  ('admin', 'media.view'),
  ('admin', 'media.upload'),
  ('admin', 'media.replace'),
  ('admin', 'settings.website.view'),
  ('admin', 'settings.website.edit'),
  ('admin', 'settings.contact.view'),
  ('admin', 'settings.contact.edit'),
  ('admin', 'seo.view'),
  ('admin', 'seo.edit'),
  ('admin', 'translations.view'),
  ('admin', 'translations.edit'),
  ('admin', 'translations.verify'),
  ('admin', 'inquiries.view'),
  ('admin', 'inquiries.manage'),
  ('admin', 'users.view'),
  ('admin', 'users.create'),
  ('admin', 'users.edit'),
  ('admin', 'users.toggle_active'),
  ('admin', 'roles.view'),
  ('admin', 'security.logs.view'),
  ('admin', 'account.self.manage'),
  ('admin', 'modules.manage'),
  ('editor', 'dashboard.overview.view'),
  ('editor', 'content.view'),
  ('editor', 'content.edit'),
  ('editor', 'pages.view'),
  ('editor', 'pages.create'),
  ('editor', 'pages.edit'),
  ('editor', 'media.view'),
  ('editor', 'media.upload'),
  ('editor', 'media.replace'),
  ('editor', 'seo.view'),
  ('editor', 'seo.edit'),
  ('editor', 'translations.view'),
  ('editor', 'translations.edit'),
  ('editor', 'inquiries.view'),
  ('editor', 'account.self.manage')
) AS p(role_slug, permission_key) ON r.slug = p.role_slug
ON CONFLICT (role_id, permission_key) DO NOTHING;
