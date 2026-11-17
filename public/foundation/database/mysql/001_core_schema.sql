-- =============================================================================
-- MASTER FOUNDATION — CORE SCHEMA BLUEPRINT (MySQL 8.0+ / MariaDB 10.6+)
-- Target Environment: Shared Hosting Default
-- Policy: Additive-only; uses IF NOT EXISTS; contains NO fake production data.
-- =============================================================================

SET NAMES utf8mb4;

-- 1. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_permission (role_id, permission_key),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Media Library (Referenced by users, settings, pages)
CREATE TABLE IF NOT EXISTS media_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL UNIQUE,
  storage_path VARCHAR(512) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  extension VARCHAR(24) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  sha256_checksum CHAR(64) NOT NULL,
  folder VARCHAR(120) NOT NULL DEFAULT 'general',
  alt_translations JSON NULL,
  uploaded_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_media_folder_created (folder, created_at),
  INDEX idx_media_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  pending_email VARCHAR(190) NULL,
  mobile_number VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  avatar_media_id BIGINT UNSIGNED NULL,
  preferred_language VARCHAR(8) NOT NULL DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMP NULL DEFAULT NULL,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_active (is_active),
  INDEX idx_users_role (role_id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_media_id) REFERENCES media_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  id CHAR(64) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  remember_me BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL DEFAULT NULL,
  last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_active (user_id, revoked_at, expires_at),
  INDEX idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  requested_ip VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_user (user_id),
  INDEX idx_reset_expires (expires_at),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  target_email VARCHAR(190) NULL,
  purpose VARCHAR(32) NOT NULL DEFAULT 'registration',
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_verify_user (user_id),
  INDEX idx_verify_expires (expires_at),
  CONSTRAINT fk_verify_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Centralized Website Settings & Contact Information (Separate from Account Settings)
CREATE TABLE IF NOT EXISTS website_settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_group VARCHAR(64) NOT NULL,
  value_json JSON NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_group (setting_group),
  CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Pages & Multilingual Content (6 Mandatory Languages: ar, en, fr, ru, de, es)
CREATE TABLE IF NOT EXISTS pages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page_key VARCHAR(120) NOT NULL UNIQUE,
  template_type VARCHAR(80) NOT NULL DEFAULT 'standard',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pages_visible_order (is_visible, sort_order),
  CONSTRAINT fk_pages_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_pages_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_translations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page_id BIGINT UNSIGNED NOT NULL,
  language_code VARCHAR(8) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_json JSON NOT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(500) NULL,
  og_title VARCHAR(255) NULL,
  og_description VARCHAR(500) NULL,
  og_image_media_id BIGINT UNSIGNED NULL,
  canonical_url VARCHAR(512) NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_page_lang (page_id, language_code),
  UNIQUE KEY uq_slug_lang (language_code, slug),
  INDEX idx_page_trans_lang_verified (language_code, is_verified),
  CONSTRAINT fk_page_trans_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  CONSTRAINT fk_page_trans_og_media FOREIGN KEY (og_image_media_id) REFERENCES media_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_page_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Homepage Sections & Content Management
CREATE TABLE IF NOT EXISTS homepage_sections (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(120) NOT NULL UNIQUE,
  section_type VARCHAR(80) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  banner_media_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sections_visible_order (is_visible, sort_order),
  CONSTRAINT fk_section_media FOREIGN KEY (banner_media_id) REFERENCES media_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS homepage_section_translations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id BIGINT UNSIGNED NOT NULL,
  language_code VARCHAR(8) NOT NULL,
  heading VARCHAR(255) NULL,
  subheading VARCHAR(500) NULL,
  body_json JSON NOT NULL,
  cta_label VARCHAR(120) NULL,
  cta_url VARCHAR(512) NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_section_lang (section_id, language_code),
  INDEX idx_section_trans_lang_verified (language_code, is_verified),
  CONSTRAINT fk_section_trans_section FOREIGN KEY (section_id) REFERENCES homepage_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Dynamic Translation Overrides & Verification Tracking
CREATE TABLE IF NOT EXISTS translation_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  translation_key VARCHAR(190) NOT NULL,
  language_code VARCHAR(8) NOT NULL,
  translated_value TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by BIGINT UNSIGNED NULL,
  verified_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trans_key_lang (translation_key, language_code),
  INDEX idx_trans_lang_verified (language_code, is_verified),
  CONSTRAINT fk_trans_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Core Contact Inquiries (Shared Public Inquiry Intake)
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  language_code VARCHAR(8) NOT NULL DEFAULT 'en',
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  source_ip VARCHAR(45) NULL,
  handled_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_inquiries_status_created (status, created_at),
  CONSTRAINT fk_inquiries_handled_by FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Security Event Logs & Rate Limit Buckets
CREATE TABLE IF NOT EXISTS security_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  user_id BIGINT UNSIGNED NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  details_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sec_event_type (event_type),
  INDEX idx_sec_created (created_at),
  INDEX idx_sec_user_created (user_id, created_at),
  INDEX idx_sec_ip_created (ip_address, created_at),
  CONSTRAINT fk_sec_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key VARCHAR(190) PRIMARY KEY,
  hit_count INT UNSIGNED NOT NULL DEFAULT 0,
  window_reset_at TIMESTAMP NOT NULL,
  blocked_until TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rate_window_reset (window_reset_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Structural System Roles & RBAC Seed Mapping (No fake user accounts or passwords)
INSERT IGNORE INTO roles (slug, name, description, is_system) VALUES
  ('super_admin', 'Super Admin', 'Full administrative and security access.', TRUE),
  ('admin', 'Admin', 'Site content, settings, SEO, and standard user administration.', TRUE),
  ('editor', 'Editor', 'Content, pages, media, and translation management.', TRUE);

INSERT IGNORE INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN (
  SELECT 'super_admin' AS role_slug, '*' AS permission_key
  UNION ALL SELECT 'admin', 'dashboard.overview.view'
  UNION ALL SELECT 'admin', 'content.view'
  UNION ALL SELECT 'admin', 'content.edit'
  UNION ALL SELECT 'admin', 'pages.view'
  UNION ALL SELECT 'admin', 'pages.create'
  UNION ALL SELECT 'admin', 'pages.edit'
  UNION ALL SELECT 'admin', 'pages.publish'
  UNION ALL SELECT 'admin', 'media.view'
  UNION ALL SELECT 'admin', 'media.upload'
  UNION ALL SELECT 'admin', 'media.replace'
  UNION ALL SELECT 'admin', 'settings.website.view'
  UNION ALL SELECT 'admin', 'settings.website.edit'
  UNION ALL SELECT 'admin', 'settings.contact.view'
  UNION ALL SELECT 'admin', 'settings.contact.edit'
  UNION ALL SELECT 'admin', 'seo.view'
  UNION ALL SELECT 'admin', 'seo.edit'
  UNION ALL SELECT 'admin', 'translations.view'
  UNION ALL SELECT 'admin', 'translations.edit'
  UNION ALL SELECT 'admin', 'translations.verify'
  UNION ALL SELECT 'admin', 'inquiries.view'
  UNION ALL SELECT 'admin', 'inquiries.manage'
  UNION ALL SELECT 'admin', 'users.view'
  UNION ALL SELECT 'admin', 'users.create'
  UNION ALL SELECT 'admin', 'users.edit'
  UNION ALL SELECT 'admin', 'users.toggle_active'
  UNION ALL SELECT 'admin', 'roles.view'
  UNION ALL SELECT 'admin', 'security.logs.view'
  UNION ALL SELECT 'admin', 'account.self.manage'
  UNION ALL SELECT 'admin', 'modules.manage'
  UNION ALL SELECT 'editor', 'dashboard.overview.view'
  UNION ALL SELECT 'editor', 'content.view'
  UNION ALL SELECT 'editor', 'content.edit'
  UNION ALL SELECT 'editor', 'pages.view'
  UNION ALL SELECT 'editor', 'pages.create'
  UNION ALL SELECT 'editor', 'pages.edit'
  UNION ALL SELECT 'editor', 'media.view'
  UNION ALL SELECT 'editor', 'media.upload'
  UNION ALL SELECT 'editor', 'media.replace'
  UNION ALL SELECT 'editor', 'seo.view'
  UNION ALL SELECT 'editor', 'seo.edit'
  UNION ALL SELECT 'editor', 'translations.view'
  UNION ALL SELECT 'editor', 'translations.edit'
  UNION ALL SELECT 'editor', 'inquiries.view'
  UNION ALL SELECT 'editor', 'account.self.manage'
) p ON r.slug = p.role_slug;
