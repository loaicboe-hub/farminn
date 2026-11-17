-- =============================================================================
-- FARMINN — AGRICULTURAL MARKETPLACE & FARM MANAGEMENT SCHEMA (PostgreSQL 15+)
-- Additive Migration 002: Builds on foundation/database/postgresql/001_core_schema.sql
-- Platform: VPS Hostinger with PostgreSQL 15+
-- =============================================================================

-- 1. Taxonomy: Locations (Governorates & Key Agricultural Zones of Egypt)
CREATE TABLE IF NOT EXISTS taxonomy_locations (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name_en VARCHAR(120) NOT NULL,
  name_ar VARCHAR(120) NOT NULL,
  region VARCHAR(64) DEFAULT 'Egypt',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tax_loc_slug ON taxonomy_locations(slug);
CREATE INDEX IF NOT EXISTS idx_tax_loc_active ON taxonomy_locations(is_active, sort_order);

-- 2. Taxonomy: Categories (Farm Types, Supplier Sectors, HR Specialties)
CREATE TABLE IF NOT EXISTS taxonomy_categories (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name_en VARCHAR(120) NOT NULL,
  name_ar VARCHAR(120) NOT NULL,
  category_type VARCHAR(64) NOT NULL, -- 'farm_type', 'supplier_sector', 'hr_specialty', 'partnership_type'
  icon_name VARCHAR(64),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tax_cat_type ON taxonomy_categories(category_type, is_active, sort_order);

-- 3. Farms Marketplace Listings
CREATE TABLE IF NOT EXISTS farms (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(190) NOT NULL UNIQUE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  purpose VARCHAR(32) NOT NULL DEFAULT 'sale' CHECK (purpose IN ('sale', 'rent', 'both')),
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  governorate_id BIGINT REFERENCES taxonomy_locations(id) ON DELETE RESTRICT,
  city_en VARCHAR(120),
  city_ar VARCHAR(120),
  location_details_en TEXT,
  location_details_ar TEXT,
  area_feddan NUMERIC(10, 2) NOT NULL DEFAULT 0,
  area_qirat INT NOT NULL DEFAULT 0,
  price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  price_per_feddan NUMERIC(14, 2) DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'EGP',
  water_source VARCHAR(64) DEFAULT 'artesian_well',
  water_details_en TEXT,
  water_details_ar TEXT,
  irrigation_system VARCHAR(64) DEFAULT 'drip',
  electricity_source VARCHAR(64) DEFAULT 'grid',
  soil_type VARCHAR(64) DEFAULT 'sandy',
  legal_status VARCHAR(64) DEFAULT 'registered',
  facilities JSONB DEFAULT '[]'::jsonb,
  crops JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'sold_or_leased', 'suspended')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INT NOT NULL DEFAULT 0,
  contact_name VARCHAR(160),
  contact_phone VARCHAR(40),
  contact_whatsapp VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_farms_slug ON farms(slug);
CREATE INDEX IF NOT EXISTS idx_farms_purpose ON farms(purpose);
CREATE INDEX IF NOT EXISTS idx_farms_status ON farms(status);
CREATE INDEX IF NOT EXISTS idx_farms_gov ON farms(governorate_id);
CREATE INDEX IF NOT EXISTS idx_farms_area ON farms(area_feddan);
CREATE INDEX IF NOT EXISTS idx_farms_price ON farms(price);
CREATE INDEX IF NOT EXISTS idx_farms_featured ON farms(is_featured);

-- 4. Farm Media
CREATE TABLE IF NOT EXISTS farm_media (
  id BIGSERIAL PRIMARY KEY,
  farm_id BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  media_item_id BIGINT REFERENCES media_items(id) ON DELETE SET NULL,
  image_url VARCHAR(512) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  caption_en VARCHAR(255),
  caption_ar VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_farm_media_farm ON farm_media(farm_id, sort_order);

-- 5. Farm Verified Documents
CREATE TABLE IF NOT EXISTS farm_documents (
  id BIGSERIAL PRIMARY KEY,
  farm_id BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  document_type VARCHAR(64) NOT NULL DEFAULT 'legal_deed',
  document_url VARCHAR(512),
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_farm_docs_farm ON farm_documents(farm_id);

-- 6. Farm Inquiries & Viewing Requests
CREATE TABLE IF NOT EXISTS farm_inquiries (
  id BIGSERIAL PRIMARY KEY,
  farm_id BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(190),
  message TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled_viewing', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_farm_inq_farm ON farm_inquiries(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_inq_status ON farm_inquiries(status);

-- 7. Farm Management Requests
CREATE TABLE IF NOT EXISTS farm_management_requests (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  governorate_id BIGINT REFERENCES taxonomy_locations(id) ON DELETE RESTRICT,
  area_feddan NUMERIC(10, 2) NOT NULL DEFAULT 0,
  crops_activity VARCHAR(255),
  required_services JSONB DEFAULT '[]'::jsonb,
  budget_range VARCHAR(120),
  details TEXT,
  contact_name VARCHAR(160) NOT NULL,
  contact_phone VARCHAR(40) NOT NULL,
  contact_whatsapp VARCHAR(40),
  status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'contracted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mgmt_req_gov ON farm_management_requests(governorate_id);
CREATE INDEX IF NOT EXISTS idx_mgmt_req_status ON farm_management_requests(status);

-- 8. Farm Management Proposals
CREATE TABLE IF NOT EXISTS farm_management_proposals (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES farm_management_requests(id) ON DELETE CASCADE,
  manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  manager_name VARCHAR(160) NOT NULL,
  manager_phone VARCHAR(40) NOT NULL,
  proposed_fee NUMERIC(14, 2) NOT NULL DEFAULT 0,
  fee_type VARCHAR(64) NOT NULL DEFAULT 'fixed_monthly', -- 'fixed_monthly', 'profit_share', 'hybrid'
  duration_months INT DEFAULT 12,
  proposal_details TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mgmt_prop_req ON farm_management_proposals(request_id);

-- 9. Farm Partnerships & Investment
CREATE TABLE IF NOT EXISTS partnerships (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  governorate_id BIGINT REFERENCES taxonomy_locations(id) ON DELETE RESTRICT,
  area_feddan NUMERIC(10, 2) NOT NULL DEFAULT 0,
  required_capital NUMERIC(14, 2) NOT NULL DEFAULT 0,
  partnership_type VARCHAR(64) NOT NULL DEFAULT 'capital_investor', -- 'capital_investor', 'operating_partner', 'land_owner'
  equity_share_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  objectives_en TEXT,
  objectives_ar TEXT,
  conditions_en TEXT,
  conditions_ar TEXT,
  contact_name VARCHAR(160) NOT NULL,
  contact_phone VARCHAR(40) NOT NULL,
  contact_whatsapp VARCHAR(40),
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'funded', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partnerships_gov ON partnerships(governorate_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);

-- 10. Partnership Applications
CREATE TABLE IF NOT EXISTS partnership_applications (
  id BIGSERIAL PRIMARY KEY,
  partnership_id BIGINT NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
  applicant_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  applicant_name VARCHAR(160) NOT NULL,
  applicant_phone VARCHAR(40) NOT NULL,
  offered_capital NUMERIC(14, 2) DEFAULT 0,
  proposal_message TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_part_app_part ON partnership_applications(partnership_id);

-- 11. Quick Buy Requests (Buyers With Budget & Asset Trade)
CREATE TABLE IF NOT EXISTS quick_buy_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  whatsapp VARCHAR(40),
  governorate_id BIGINT REFERENCES taxonomy_locations(id) ON DELETE SET NULL,
  min_area_feddan NUMERIC(10, 2) DEFAULT 0,
  max_area_feddan NUMERIC(10, 2) DEFAULT 0,
  available_cash NUMERIC(14, 2) NOT NULL DEFAULT 0,
  exchange_asset_type VARCHAR(64) DEFAULT 'none', -- 'none', 'real_estate', 'vehicle', 'machinery'
  exchange_asset_description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'matched', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quick_buy_status ON quick_buy_requests(status);

-- 12. Quick Sell Requests (Owners Assisted Fast Sale & Exchange)
CREATE TABLE IF NOT EXISTS quick_sell_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  whatsapp VARCHAR(40),
  farm_name VARCHAR(255) NOT NULL,
  governorate_id BIGINT REFERENCES taxonomy_locations(id) ON DELETE SET NULL,
  area_feddan NUMERIC(10, 2) NOT NULL DEFAULT 0,
  asking_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  accepts_installments BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_exchange BOOLEAN NOT NULL DEFAULT FALSE,
  exchange_preferences TEXT,
  farm_details TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'evaluating', 'listed', 'declined')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quick_sell_status ON quick_sell_requests(status);

-- 13. Agricultural Suppliers Directory
CREATE TABLE IF NOT EXISTS suppliers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  company_name_en VARCHAR(255) NOT NULL,
  company_name_ar VARCHAR(255) NOT NULL,
  logo_url VARCHAR(512),
  category_slug VARCHAR(64) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  governorate_id BIGINT REFERENCES taxonomy_locations(id) ON DELETE SET NULL,
  phone VARCHAR(40) NOT NULL,
  whatsapp VARCHAR(40),
  email VARCHAR(190),
  website_url VARCHAR(255),
  products_services JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_slug ON suppliers(slug);
CREATE INDEX IF NOT EXISTS idx_suppliers_cat ON suppliers(category_slug);

-- 14. Human Resources & Agricultural Experts
CREATE TABLE IF NOT EXISTS human_resources (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  full_name_en VARCHAR(160) NOT NULL,
  full_name_ar VARCHAR(160) NOT NULL,
  title_en VARCHAR(160) NOT NULL,
  title_ar VARCHAR(160) NOT NULL,
  category_slug VARCHAR(64) NOT NULL, -- 'engineer', 'manager', 'irrigation', 'specialist', 'veterinarian', 'technician'
  experience_years INT NOT NULL DEFAULT 1,
  governorate_id BIGINT REFERENCES taxonomy_locations(id) ON DELETE SET NULL,
  bio_en TEXT,
  bio_ar TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  avatar_url VARCHAR(512),
  phone VARCHAR(40) NOT NULL,
  whatsapp VARCHAR(40),
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hr_slug ON human_resources(slug);
CREATE INDEX IF NOT EXISTS idx_hr_cat ON human_resources(category_slug);
CREATE INDEX IF NOT EXISTS idx_hr_years ON human_resources(experience_years);

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER trg_farms_updated
  BEFORE UPDATE ON farms
  FOR EACH ROW EXECUTE FUNCTION foundation_set_updated_at();

CREATE OR REPLACE TRIGGER trg_mgmt_req_updated
  BEFORE UPDATE ON farm_management_requests
  FOR EACH ROW EXECUTE FUNCTION foundation_set_updated_at();

-- -----------------------------------------------------------------------------
-- INITIAL TAXONOMY SEED DATA (Egypt Agricultural Geography & Sectors)
-- -----------------------------------------------------------------------------

INSERT INTO taxonomy_locations (slug, name_en, name_ar, region, sort_order) VALUES
  ('giza', 'Giza (Cairo-Alex Desert Rd)', 'الجيزة (طريق مصر إسكندرية الصحراوي)', 'Cairo & Environs', 1),
  ('beheira', 'Beheira (Wadi El-Natrun)', 'البحيرة (وادي النطرون)', 'Delta & West', 2),
  ('matrouh', 'Matrouh (El-Dabaa & Alamein)', 'مطروح (الضبعة والعلمين)', 'North Coast & West', 3),
  ('ismailia', 'Ismailia (Cairo-Ismailia Desert)', 'الإسماعيلية (طريق الإسماعيلية الصحراوي)', 'Suez Canal', 4),
  ('sharkia', 'Sharkia (Salhiya & Belbeis)', 'الشرقية (الصالحية وبلبيس)', 'East Delta', 5),
  ('fayoum', 'Fayoum (Tamiya & Western Desert)', 'الفيوم (طامية والصحراء الغربية)', 'Upper Egypt Entrance', 6),
  ('minya', 'Minya (Western Minya Project)', 'المنيا (مشروع غرب المنيا)', 'Upper Egypt', 7),
  ('new-valley', 'New Valley (East Oweinat & Farafra)', 'الوادي الجديد (شرق العوينات والفرافرة)', 'South West Desert', 8),
  ('alexandria', 'Alexandria (King Maryout & Borg El Arab)', 'الإسكندرية (كينج مريوط وبرج العرب)', 'Coast', 9),
  ('beni-suef', 'Beni Suef (Eastern & Western Deserts)', 'بني سويف', 'Upper Egypt', 10),
  ('asyut', 'Asyut', 'أسيوط', 'Upper Egypt', 11),
  ('qena-luxor', 'Qena & Luxor', 'قنا والأقصر', 'Upper Egypt', 12),
  ('aswan', 'Aswan (Toshka)', 'أسوان (توشكى)', 'Upper Egypt', 13)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO taxonomy_categories (slug, name_en, name_ar, category_type, sort_order) VALUES
  -- Farm types
  ('orchard-fruit', 'Orchard & Fruit Farm (Citrus, Dates, Olives)', 'مزرعة بساتين وفاكهة (موالح، تمور، زيتون)', 'farm_type', 1),
  ('crop-field', 'Open Field & Strategic Crops (Wheat, Alfalfa, Corn)', 'محاصيل حقلية واستراتيجية (قمح، برسيم، ذرة)', 'farm_type', 2),
  ('livestock-dairy', 'Livestock & Dairy Farm', 'إنتاج حيواني ومزارع ألبان وتسمين', 'farm_type', 3),
  ('poultry', 'Poultry Farm & Broilers', 'مزارع دواجن وبداري تسمين', 'farm_type', 4),
  ('greenhouse-veg', 'Protected Greenhouses & Vegetables', 'صوب زراعية وخضروات تصديرية', 'farm_type', 5),
  ('fish-farming', 'Aquaculture & Fish Farm', 'استزراع سمكي', 'farm_type', 6),
  ('integrated', 'Integrated Agro-Industrial Farm', 'مزرعة متكاملة (زراعي، حيواني، تصنيع)', 'farm_type', 7),
  -- Supplier categories
  ('irrigation', 'Modern Irrigation & Wells Drilling', 'شبكات الري الحديث وحفر الآبار', 'supplier_sector', 1),
  ('solar-energy', 'Solar Pumping & Clean Energy', 'طاقة شمسية ومضخات غاطسة', 'supplier_sector', 2),
  ('fertilizers', 'Fertilizers, Nutrients & Pesticides', 'أسمدة ومخصبات ومبيدات معتمدة', 'supplier_sector', 3),
  ('machinery', 'Tractors, Harvesters & Agricultural Equipment', 'جرارات ومعدات حصاد وميكنة زراعية', 'supplier_sector', 4),
  ('seeds-seedlings', 'Certified Seeds & Certified Seedlings', 'تقاوي وشتلات نخيل وأشجار معتمدة', 'supplier_sector', 5),
  ('greenhouses', 'Greenhouse Construction & Agritech', 'إنشاء وتجهيز الصوب الزراعية الحديثة', 'supplier_sector', 6),
  -- HR Specialties
  ('agronomist', 'Agricultural Engineer (Crop Specialist)', 'مهندس زراعي (محاصيل ووقاية)', 'hr_specialty', 1),
  ('farm-manager', 'General Farm Operations Manager', 'مدير عام تشغيل مزارع', 'hr_specialty', 2),
  ('irrigation-engineer', 'Irrigation & Pumping Engineer', 'مهندس شبكات ري وطلمبات', 'hr_specialty', 3),
  ('veterinarian', 'Livestock & Veterinary Doctor', 'طبيب بيطري مزارع وإنتاج حيواني', 'hr_specialty', 4),
  ('skilled-technician', 'Agricultural Machinery & Solar Technician', 'فني صيانة معدات وطاقة شمسية', 'hr_specialty', 5)
ON CONFLICT (slug) DO NOTHING;

