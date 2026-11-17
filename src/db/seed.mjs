import { db } from './index.mjs';
import { hashPassword } from '../utils/auth-crypto.mjs';

export async function seedDatabase() {
  console.log('[FARMINN Seed] Seeding initial roles, admin user, settings and taxonomy...');

  // 1. Roles
  const roles = [
    { slug: 'super_admin', name: 'Super Administrator', description: 'Full access to platform administration and database operations', is_system: 1 },
    { slug: 'admin', name: 'Platform Administrator', description: 'Manages listings, inquiries, users, and marketplace operations', is_system: 1 },
    { slug: 'editor', name: 'Content Editor', description: 'Manages website content, pages, and translations', is_system: 1 },
    { slug: 'farm_owner', name: 'Farm Owner', description: 'Can list farms, request management, and review proposals', is_system: 0 },
    { slug: 'farm_manager', name: 'Farm Manager / Agronomist', description: 'Can create professional profile and submit management proposals', is_system: 0 },
    { slug: 'buyer', name: 'Buyer / Investor', description: 'Can submit quick buy requests and partnership applications', is_system: 0 },
    { slug: 'supplier', name: 'Agricultural Supplier', description: 'Can manage supplier company profile and catalog', is_system: 0 }
  ];

  for (const r of roles) {
    const existing = await db.query('SELECT id FROM roles WHERE slug = $1', [r.slug]);
    if (existing.rowCount === 0) {
      await db.query(
        'INSERT INTO roles (slug, name, description, is_system) VALUES ($1, $2, $3, $4)',
        [r.slug, r.name, r.description, r.is_system]
      );
    }
  }

  // Get super_admin role id
  const superAdminRole = (await db.query("SELECT id FROM roles WHERE slug = 'super_admin'")).rows[0];
  const ownerRole = (await db.query("SELECT id FROM roles WHERE slug = 'farm_owner'")).rows[0];
  const managerRole = (await db.query("SELECT id FROM roles WHERE slug = 'farm_manager'")).rows[0];

  // 2. Super Admin User
  const adminEmail = 'admin@farminn.com';
  const existingAdmin = await db.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  let adminUserId = null;

  if (existingAdmin.rowCount === 0) {
    const adminPassHash = hashPassword('FarminnAdmin2026!');
    const insertAdmin = await db.query(
      `INSERT INTO users (full_name, email, mobile_number, password_hash, role_id, account_type, preferred_language, is_active, email_verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1, datetime('now'))`,
      ['FARMINN Administrator', adminEmail, '+201002345678', adminPassHash, superAdminRole.id, 'super_admin', 'en']
    );
    adminUserId = insertAdmin.lastInsertRowid || 1;
    console.log(`[FARMINN Seed] Created default super admin user: ${adminEmail} (Password: FarminnAdmin2026!)`);
  } else {
    adminUserId = existingAdmin.rows[0].id;
  }

  // 3. Sample Demo Accounts (Owner and Manager)
  const ownerEmail = 'owner@farminn.com';
  const existingOwner = await db.query('SELECT id FROM users WHERE email = $1', [ownerEmail]);
  let ownerUserId = null;
  if (existingOwner.rowCount === 0) {
    const userPass = hashPassword('FarminnUser2026!');
    const ins = await db.query(
      `INSERT INTO users (full_name, email, mobile_number, password_hash, role_id, account_type, preferred_language, is_active, email_verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1, datetime('now'))`,
      ['Hajj Mansour El-Gebali', ownerEmail, '+201115554321', userPass, ownerRole?.id || 1, 'farm_owner', 'ar']
    );
    ownerUserId = ins.lastInsertRowid || 2;
  } else {
    ownerUserId = existingOwner.rows[0].id;
  }

  // 4. Centralized Website Settings
  const settings = [
    { key: 'site_name', value: 'FARMINN', group: 'identity' },
    { key: 'site_name_ar', value: 'فارمين', group: 'identity' },
    { key: 'site_tagline_en', value: 'Egypt Premier Agricultural Marketplace & Farm Management Platform', group: 'identity' },
    { key: 'site_tagline_ar', value: 'المنصة الرائدة في مصر لسوق وإدارة واستثمار المزارع', group: 'identity' },
    { key: 'contact_email', value: 'info@farminn.com', group: 'contact' },
    { key: 'contact_phone', value: '+20 100 234 5678', group: 'contact' },
    { key: 'whatsapp_number', value: '+20 100 234 5678', group: 'contact' },
    { key: 'address_en', value: 'KM 58 Cairo-Alexandria Desert Road, Giza, Egypt', group: 'contact' },
    { key: 'address_ar', value: 'الكيلو 58 طريق مصر إسكندرية الصحراوي، الجيزة، مصر', group: 'contact' },
    { key: 'working_hours_en', value: 'Sunday – Thursday: 9:00 AM – 6:00 PM', group: 'contact' },
    { key: 'working_hours_ar', value: 'الأحد – الخميس: 9:00 صباحاً – 6:00 مساءً', group: 'contact' },
    { key: 'facebook_url', value: 'https://facebook.com/farminn.eg', group: 'social' },
    { key: 'linkedin_url', value: 'https://linkedin.com/company/farminn-eg', group: 'social' }
  ];

  for (const s of settings) {
    const existing = await db.query('SELECT id FROM website_settings WHERE setting_key = $1', [s.key]);
    if (existing.rowCount === 0) {
      await db.query(
        'INSERT INTO website_settings (setting_key, setting_value, group_name, is_public) VALUES ($1, $2, $3, 1)',
        [s.key, s.value, s.group]
      );
    }
  }

  // 5. Taxonomy Locations (Governorates of Egypt)
  const locations = [
    { slug: 'beheira-natrun', name_en: 'Beheira (Wadi El-Natrun)', name_ar: 'البحيرة (وادي النطرون)', region: 'West Delta', sort: 1 },
    { slug: 'cairo-alex-desert', name_en: 'Cairo-Alex Desert Road (KM 40 - 84)', name_ar: 'طريق مصر إسكندرية الصحراوي', region: 'Cairo/Giza', sort: 2 },
    { slug: 'ismailia-desert', name_en: 'Ismailia (Cairo-Ismailia Road)', name_ar: 'الإسماعيلية (طريق الإسماعيلية الصحراوي)', region: 'Canal Zone', sort: 3 },
    { slug: 'west-minya', name_en: 'West Minya Project', name_ar: 'غرب المنيا (مشروع الريف المصري)', region: 'Upper Egypt', sort: 4 },
    { slug: 'new-valley-farafra', name_en: 'New Valley (Farafra & Oweinat)', name_ar: 'الوادي الجديد (الفرافرة وشرق العوينات)', region: 'Western Desert', sort: 5 },
    { slug: 'matrouh-alamein', name_en: 'Matrouh (Dabaa & Alamein)', name_ar: 'مطروح (الضبعة ومحور العلمين)', region: 'North Coast', sort: 6 },
    { slug: 'sharkia-salhiya', name_en: 'Sharkia (Salhiya El-Gedida)', name_ar: 'الشرقية (الصالحية الجديدة وبلبيس)', region: 'East Delta', sort: 7 },
    { slug: 'fayoum-desert', name_en: 'Fayoum (Tamiya & Western Road)', name_ar: 'الفيوم (طامية وامتداد طريق أسيوط الغربي)', region: 'Upper Egypt', sort: 8 }
  ];

  for (const loc of locations) {
    const ex = await db.query('SELECT id FROM taxonomy_locations WHERE slug = $1', [loc.slug]);
    if (ex.rowCount === 0) {
      await db.query(
        'INSERT INTO taxonomy_locations (slug, name_en, name_ar, region, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [loc.slug, loc.name_en, loc.name_ar, loc.region, loc.sort]
      );
    }
  }

  // 6. Taxonomy Categories
  const categories = [
    { slug: 'orchard-fruit', name_en: 'Fruit & Orchard (Citrus, Dates, Olives)', name_ar: 'بساتين وفاكهة (موالح، تمور، زيتون)', type: 'farm_type', sort: 1 },
    { slug: 'field-crops', name_en: 'Strategic Field Crops (Wheat, Alfalfa, Corn)', name_ar: 'محاصيل حقلية واستراتيجية (قمح، برسيم، ذرة)', type: 'farm_type', sort: 2 },
    { slug: 'greenhouse', name_en: 'Protected Greenhouses & Export Vegetables', name_ar: 'صوب زراعية وخضروات تصديرية', type: 'farm_type', sort: 3 },
    { slug: 'livestock', name_en: 'Livestock & Dairy Farm', name_ar: 'إنتاج حيواني ومزارع ألبان وتسمين', type: 'farm_type', sort: 4 },
    { slug: 'integrated', name_en: 'Integrated Agro-Industrial Farm', name_ar: 'مزرعة متكاملة إنتاجية وتصنيعية', type: 'farm_type', sort: 5 },
    // Suppliers
    { slug: 'irrigation', name_en: 'Modern Irrigation & Wells Drilling', name_ar: 'شبكات الري الحديث وحفر الآبار', type: 'supplier_sector', sort: 1 },
    { slug: 'solar-energy', name_en: 'Solar Pumping & Clean Energy', name_ar: 'طاقة شمسية ومضخات غاطسة', type: 'supplier_sector', sort: 2 },
    { slug: 'fertilizers', name_en: 'Fertilizers & Crop Nutrition', name_ar: 'أسمدة ومخصبات ومبيدات معتمدة', type: 'supplier_sector', sort: 3 },
    { slug: 'machinery', name_en: 'Tractors & Farm Machinery', name_ar: 'جرارات ومعدات حصاد وميكنة زراعية', type: 'supplier_sector', sort: 4 },
    // HR
    { slug: 'agronomist', name_en: 'Agricultural Engineer', name_ar: 'مهندس زراعي (محاصيل ووقاية)', type: 'hr_specialty', sort: 1 },
    { slug: 'farm-manager', name_en: 'Farm Operations Manager', name_ar: 'مدير عام تشغيل مزارع', type: 'hr_specialty', sort: 2 },
    { slug: 'irrigation-engineer', name_en: 'Irrigation & Pumping Engineer', name_ar: 'مهندس شبكات ري وطاقة شمسية', type: 'hr_specialty', sort: 3 },
    { slug: 'veterinarian', name_en: 'Livestock & Cattle Veterinarian', name_ar: 'طبيب بيطري مزارع وثروة حيوانية', type: 'hr_specialty', sort: 4 }
  ];

  for (const cat of categories) {
    const ex = await db.query('SELECT id FROM taxonomy_categories WHERE slug = $1', [cat.slug]);
    if (ex.rowCount === 0) {
      await db.query(
        'INSERT INTO taxonomy_categories (slug, name_en, name_ar, category_type, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [cat.slug, cat.name_en, cat.name_ar, cat.type, cat.sort]
      );
    }
  }

  // Get location ids
  const locNatrun = (await db.query("SELECT id FROM taxonomy_locations WHERE slug = 'beheira-natrun'")).rows[0]?.id || 1;
  const locDesert = (await db.query("SELECT id FROM taxonomy_locations WHERE slug = 'cairo-alex-desert'")).rows[0]?.id || 2;
  const locIsmailia = (await db.query("SELECT id FROM taxonomy_locations WHERE slug = 'ismailia-desert'")).rows[0]?.id || 3;
  const locMinya = (await db.query("SELECT id FROM taxonomy_locations WHERE slug = 'west-minya'")).rows[0]?.id || 4;
  const locFarafra = (await db.query("SELECT id FROM taxonomy_locations WHERE slug = 'new-valley-farafra'")).rows[0]?.id || 5;

  // 7. Seed Real Egyptian Farm Listings
  const farmsCount = (await db.query('SELECT COUNT(*) as count FROM farms')).rows[0]?.count;
  if (Number(farmsCount) === 0) {
    console.log('[FARMINN Seed] Seeding realistic Egyptian farm listings...');

    const sampleFarms = [
      {
        slug: 'wadi-el-natrun-50-feddan-olives-dates',
        purpose: 'sale',
        title_en: '50 Feddan Productive Olive & Medjool Date Farm in Wadi El-Natrun',
        title_ar: 'مزرعة منتجة 50 فدان زيتون ونخيل مجدول بوادي النطرون',
        description_en: 'Fully operational productive farm equipped with 2 licensed deep artesian wells (salinity 450 PPM), 60 HP solar pumping station, automated Netafim drip network, luxurious owner villa, worker quarters, and direct paved road frontage. Clean title deed registered with the State Real Estate Authority.',
        description_ar: 'مزرعة نموذجية منتجة بالكامل ومثمرة، تحتوي على 2 بئر مياه ارتوازي مرخص (ملوحة 450 جزء في المليون)، محطة طاقة شمسية قدرة 60 حصان، شبكة ري تنقيط حديثة نيتافيم، فيلا سكنية فاخرة للمالك واستراحة عمال ومخازن، واجهة مباشرة على طريق أسفلتي ممهد. عقد ملكية خالص ومسجل بالشهر العقاري.',
        governorate_id: locNatrun,
        city_en: 'Wadi El-Natrun',
        city_ar: 'وادي النطرون',
        location_details_en: 'KM 115 Cairo-Alexandria Desert Road, 8 km into Wadi El-Natrun agricultural belt',
        location_details_ar: 'الكيلو 115 طريق مصر إسكندرية الصحراوي، 8 كم داخل الحزام الزراعي لوادي النطرون',
        area_feddan: 50.0,
        area_qirat: 0,
        price: 22500000.0,
        price_per_feddan: 450000.0,
        water_source: 'artesian_well',
        water_details_en: '2 licensed wells (450 PPM salinity) with 1,200 m3/day capacity',
        water_details_ar: '2 بئر ارتوازي مرخص بملوحة عذبة 450 PPM وطاقة ضخ 1200 م3 يومياً',
        irrigation_system: 'drip',
        electricity_source: 'solar',
        soil_type: 'sandy_loam',
        legal_status: 'registered',
        facilities: ['owner_villa', 'worker_housing', 'machinery_storage', 'solar_power_station', 'security_gate'],
        crops: ['Kalamata & Picual Olives', 'Medjool Date Palms', 'Export Citrus'],
        status: 'approved',
        is_featured: 1,
        contact_name: 'Eng. Hisham El-Gammal',
        contact_phone: '+201004567891',
        contact_whatsapp: '+201004567891',
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        slug: 'cairo-alex-desert-25-feddan-citrus-villa',
        purpose: 'sale',
        title_en: '25 Feddan Prime Citrus Farm & Countryside Estate at KM 64',
        title_ar: 'مزرعة موالح راقية 25 فدان مع فيلا سكنية بالكيلو 64 صحراوي',
        description_en: 'Prime location only 45 minutes from Sheikh Zayed City. Planted with premium Valencia export oranges, mandarin, and mangoes. Features dual water access (Nile canal share + backup well), 200 KVA electrical transformer, infinity swimming pool, tennis court, and landscaped private villa.',
        description_ar: 'موقع استراتيجي يبعد 45 دقيقة فقط عن مدينة الشيخ زايد. مزروعة بالكامل برتقال فالنسيا تصديري ويوسفي ومانجو كيت. تتميز بمصدرين للري (حصة مياه نيلية بحاري + بئر ارتوازي احتياطي)، محول كهرباء خاص 200 ك.ف.أ، فيلا خاصة راقية بحمام سباحة وحديقة لاندسكيب.',
        governorate_id: locDesert,
        city_en: 'Desert Road KM 64',
        city_ar: 'طريق مصر إسكندرية الصحراوي ك 64',
        location_details_en: 'Direct access from Cairo-Alexandria Desert Road, Giza',
        location_details_ar: 'مدخل مباشر من طريق مصر إسكندرية الصحراوي، الجيزة',
        area_feddan: 25.0,
        area_qirat: 0,
        price: 35000000.0,
        price_per_feddan: 1400000.0,
        water_source: 'nile_and_well',
        water_details_en: 'Permanent Nile irrigation canal share plus high-yield backup well',
        water_details_ar: 'حصة ري بحاري نيلية دائمة بالإضافة إلى بئر ارتوازي عذب احتياطي',
        irrigation_system: 'drip',
        electricity_source: 'grid',
        soil_type: 'silty_sand',
        legal_status: 'registered',
        facilities: ['luxury_villa', 'swimming_pool', 'worker_housing', 'electrical_transformer_200kva', 'asphalt_access'],
        crops: ['Valencia Oranges', 'Keitt Mangoes', 'Fremont Mandarins'],
        status: 'approved',
        is_featured: 1,
        contact_name: 'Advisor Sherif Kamel',
        contact_phone: '+201223344556',
        contact_whatsapp: '+201223344556',
        images: [
          'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        slug: 'west-minya-120-feddan-strategic-crops-rent',
        purpose: 'rent',
        title_en: '120 Feddan Pivot-Irrigated Wheat & Alfalfa Land in West Minya',
        title_ar: 'أرض 120 فدان ري محوري (بيفوت) لزراعة القمح والبرسيم بغرب المنيا',
        description_en: 'High-production agricultural land ready for immediate seasonal or long-term lease. Equipped with 2 Valley center pivot systems (60 Feddan each), 2 high-capacity artesian wells, 300 KVA electricity connection, laser-leveled sandy loam soil ideal for wheat, sugar beets, and alfalfa silage.',
        description_ar: 'أرض زراعية عالية الإنتاجية جاهزة للزراعة والتعاقد السنوي أو طويل الأجل. مجهزة بجهازي ري محوري فالي (60 فدان لكل جهاز)، 2 بئر ارتوازي تدفق عالي، كهرباء حكومية محول 300 ك.ف.أ، أرض مسواة بالليزر ممتازة لزراعة القمح وبنجر السكر والبرسيم الحجازي.',
        governorate_id: locMinya,
        city_en: 'West Minya Reclamation Zone',
        city_ar: 'مشروع غرب المنيا',
        location_details_en: 'Plot 14, Western Minya Agriculture Corridor, Minya',
        location_details_ar: 'القطعة 14، محور غرب المنيا الزراعي، المنيا',
        area_feddan: 120.0,
        area_qirat: 0,
        price: 1800000.0, // annual rent
        price_per_feddan: 15000.0,
        water_source: 'artesian_well',
        water_details_en: '2 high-volume deep wells (650 PPM) running 24/7',
        water_details_ar: '2 بئر ارتوازي عميق ملوحة 650 PPM مع تدفق مستمر 24 ساعة',
        irrigation_system: 'pivot',
        electricity_source: 'grid',
        soil_type: 'sandy_loam',
        legal_status: 'primary_contract',
        facilities: ['center_pivot_irrigation', 'control_room', 'engineer_resthouse', 'feed_storage_hangar'],
        crops: ['Wheat', 'Sugar Beets', 'Alfalfa Silage', 'Barley'],
        status: 'approved',
        is_featured: 1,
        contact_name: 'Hajj Mahmoud El-Miniawy',
        contact_phone: '+201149876543',
        contact_whatsapp: '+201149876543',
        images: [
          'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        slug: 'ismailia-30-feddan-export-mango-citrus',
        purpose: 'sale',
        title_en: '30 Feddan Export Mango & Valencia Orange Farm in Ismailia',
        title_ar: 'مزرعة مانجو تصديري وبرتقال 30 فدان بالإسماعيلية',
        description_en: 'Renowned sweet soil of Ismailia with permanent sweet Nile canal water rights. Planted with high-demand mango varieties (Naomi, Yasmina, Keitt) and Navel oranges. Modern drip irrigation, fenced with Casuarina windbreaks, and complete worker accommodation.',
        description_ar: 'أرض الإسماعيلية الخصبة المشهورة مع حصة ري نيلية دائمة من ترعة الإسماعيلية. مزروعة بأفضل أصناف المانجو التصديرية (نعومي، ياسمينة، كيت) وبرتقال بسرة. شبكة ري تنقيط حديثة، مصدات رياح من أشجار الكازورينا وسكن كامل للعاملين.',
        governorate_id: locIsmailia,
        city_en: 'Ismailia Desert Road',
        city_ar: 'طريق الإسماعيلية الصحراوي',
        location_details_en: 'Near Sarabium, 15 minutes from Ismailia City',
        location_details_ar: 'بالقرب من سرابيوم، 15 دقيقة من مدينة الإسماعيلية',
        area_feddan: 30.0,
        area_qirat: 0,
        price: 27000000.0,
        price_per_feddan: 900000.0,
        water_source: 'nile_canal',
        water_details_en: 'Direct pressurized Nile canal delivery with zero salinity',
        water_details_ar: 'مياه نيلية عذبة مباشرة بدون أي نسبة ملوحة مع حوض تخزين ومضخات',
        irrigation_system: 'drip',
        electricity_source: 'grid',
        soil_type: 'silty_loam',
        legal_status: 'registered',
        facilities: ['worker_housing', 'harvest_sorting_shed', 'fertilizer_injection_station', 'casuarina_fence'],
        crops: ['Naomi Mangoes', 'Keitt Mangoes', 'Navel Oranges'],
        status: 'approved',
        is_featured: 0,
        contact_name: 'Captain Youssef Fahmy',
        contact_phone: '+201019871234',
        contact_whatsapp: '+201019871234',
        images: [
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        slug: 'farafra-100-feddan-organic-alfalfa-dates',
        purpose: 'both',
        title_en: '100 Feddan Organic Medjool Dates & Alfalfa Estate in Farafra Oasis',
        title_ar: '100 فدان نخيل مجدول وبرسيم حجازي عضوي بواحة الفرافرة',
        description_en: 'Deep aquifer artesian water with self-flowing flow rate, completely organic virgin soil certified for export. 3,000 planted tissue-culture Medjool palm trees (5th year) intercropped with premium organic alfalfa. Available for full buyout or lease-to-own terms.',
        description_ar: 'مياه جوفية عذبة متدفقة ذاتياً من الخزان النوبي العميق (200 PPM)، تربة بكر لم تستخدم أي كيماويات ومؤهلة لشهادات الزراعة الحيوية. تحتوي على 3000 نخلة مجدول نسيجي (عمر 5 سنوات) مع زراعة بينية برسيم حجازي للتصدير. متاحة للبيع الكلي أو الإيجار طويل الأجل.',
        governorate_id: locFarafra,
        city_en: 'Farafra Oasis',
        city_ar: 'واحة الفرافرة',
        location_details_en: 'Sahl Baraka agricultural zone, Farafra, New Valley',
        location_details_ar: 'منطقة سهل بركة، الفرافرة، محافظة الوادي الجديد',
        area_feddan: 100.0,
        area_qirat: 0,
        price: 32000000.0,
        price_per_feddan: 320000.0,
        water_source: 'artesian_well',
        water_details_en: 'Self-flowing deep Nubian aquifer well (220 PPM) with continuous gravity flow',
        water_details_ar: 'بئر خزان نوبي عميق متدفق ذاتياً بملوحة 220 PPM فقط',
        irrigation_system: 'drip',
        electricity_source: 'solar',
        soil_type: 'virgin_sandy_loam',
        legal_status: 'registered',
        facilities: ['palm_nursery', 'solar_power_100hp', 'agricultural_engineer_villa', 'tractor_hangar'],
        crops: ['Medjool Dates', 'Organic Alfalfa', 'Barhi Dates'],
        status: 'approved',
        is_featured: 1,
        contact_name: 'Dr. Taha El-Nouby',
        contact_phone: '+201551234567',
        contact_whatsapp: '+201551234567',
        images: [
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ];

    for (const f of sampleFarms) {
      const insFarm = await db.query(
        `INSERT INTO farms (
          slug, user_id, purpose, title_en, title_ar, description_en, description_ar,
          governorate_id, city_en, city_ar, location_details_en, location_details_ar,
          area_feddan, area_qirat, price, price_per_feddan, currency,
          water_source, water_details_en, water_details_ar, irrigation_system, electricity_source,
          soil_type, legal_status, facilities, crops, status, is_featured,
          contact_name, contact_phone, contact_whatsapp
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, 'EGP',
          $17, $18, $19, $20, $21,
          $22, $23, $24, $25, 'approved', $26,
          $27, $28, $29
        )`,
        [
          f.slug, ownerUserId, f.purpose, f.title_en, f.title_ar, f.description_en, f.description_ar,
          f.governorate_id, f.city_en, f.city_ar, f.location_details_en, f.location_details_ar,
          f.area_feddan, f.area_qirat, f.price, f.price_per_feddan,
          f.water_source, f.water_details_en, f.water_details_ar, f.irrigation_system, f.electricity_source,
          f.soil_type, f.legal_status, f.facilities, f.crops, f.is_featured,
          f.contact_name, f.contact_phone, f.contact_whatsapp
        ]
      );

      const farmId = insFarm.lastInsertRowid || (await db.query('SELECT id FROM farms WHERE slug = $1', [f.slug])).rows[0].id;

      // Add media items
      let s = 1;
      for (const img of f.images) {
        await db.query(
          'INSERT INTO farm_media (farm_id, image_url, sort_order, is_cover) VALUES ($1, $2, $3, $4)',
          [farmId, img, s, s === 1 ? 1 : 0]
        );
        s++;
      }

      // Add sample verified document
      await db.query(
        'INSERT INTO farm_documents (farm_id, title_en, title_ar, document_type, document_url, is_verified) VALUES ($1, $2, $3, $4, $5, 1)',
        [farmId, 'Official Notarized Real Estate Deed', 'عقد الملكية المشهر والمسجل', 'legal_deed', '/docs/samples/verified_deed_sample.pdf']
      );
    }
    console.log('[FARMINN Seed] Seeded 5 high-value realistic Egyptian farms.');
  }

  // 8. Seed Farm Management Requests
  const mgmtCount = (await db.query('SELECT COUNT(*) as count FROM farm_management_requests')).rows[0]?.count;
  if (Number(mgmtCount) === 0) {
    const req1 = await db.query(
      `INSERT INTO farm_management_requests (
        owner_id, title_en, title_ar, governorate_id, area_feddan, crops_activity,
        required_services, budget_range, details, contact_name, contact_phone, contact_whatsapp, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'open'
      )`,
      [
        ownerUserId,
        'Full Management & Operations for 45 Feddan Citrus & Mango Farm',
        'طلب إدارة وتشغيل متكامل لمزرعة موالح ومانجو 45 فدان بطريق الإسماعيلية',
        locIsmailia,
        45.0,
        'Valencia Orange, Keitt Mango, Pomegranate',
        ['crop_nutrition_and_spray_programs', 'irrigation_scheduling', 'labor_supervision', 'export_harvest_handling'],
        'EGP 25,000 - 35,000 / month + 10% Profit Share',
        'Owner resides abroad. Seeking an experienced agricultural engineer or management team to take full charge of production, pest control, and harvest contracts.',
        'Hajj Mansour El-Gebali',
        '+201115554321',
        '+201115554321'
      ]
    );

    const reqId = req1.lastInsertRowid || 1;
    // Add sample proposal from manager
    await db.query(
      `INSERT INTO farm_management_proposals (
        request_id, manager_id, manager_name, manager_phone, proposed_fee, fee_type, duration_months, proposal_details, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
      [
        reqId,
        adminUserId,
        'Eng. Tarek Mansour (Agronomist Consultant)',
        '+201099887766',
        28000.0,
        'fixed_monthly_plus_percentage',
        12,
        '15 years specialized experience managing export citrus and mango groves in Ismailia and Belbeis. Proposal includes weekly agronomy visits, digital soil/leaf testing, dedicated resident supervisor, and GlobalG.A.P. export certification compliance.'
      ]
    );
  }

  // 9. Seed Partnerships & Investment Opportunities
  const partCount = (await db.query('SELECT COUNT(*) as count FROM partnerships')).rows[0]?.count;
  if (Number(partCount) === 0) {
    await db.query(
      `INSERT INTO partnerships (
        user_id, title_en, title_ar, governorate_id, area_feddan, required_capital,
        partnership_type, equity_share_percent, objectives_en, objectives_ar, conditions_en, conditions_ar,
        contact_name, contact_phone, contact_whatsapp, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'active'
      )`,
      [
        ownerUserId,
        'Capital Partner Needed for 40 Feddan Medjool Date Palm Expansion',
        'مطلوب شريك ممول للتوسع في زراعة 40 فدان نخيل مجدول نسيجي بوادي النطرون',
        locNatrun,
        40.0,
        6000000.0,
        'capital_investor',
        40.0,
        'The land is fully owned, drilled with sweet water wells and solar power. We seek capital partner to purchase 2,600 tissue-culture Medjool palm offsets and installation of automated fertigation lines.',
        'الأرض مملوكة بالكامل ومجهزة بآبار مياه عذبة ومحطة طاقة شمسية. مطلوب شريك ممول لشراء 2600 فسيلة نسيجية مجدول وتمديد شبكات التسميد الآلي مع عقد شراكة رسمي موثق بالشهر العقاري.',
        'Expected ROI starting year 4. Official partnership contract notarized with judicial security deposit.',
        'العائد المتوقع يبدأ من العام الرابع بمعدل تصديري مرتفع. توثيق رسمي للشراكة وحصص الأرباح بالشهر العقاري.',
        'Hajj Mansour El-Gebali',
        '+201115554321',
        '+201115554321'
      ]
    );
  }

  // 10. Seed Agricultural Suppliers
  const suppCount = (await db.query('SELECT COUNT(*) as count FROM suppliers')).rows[0]?.count;
  if (Number(suppCount) === 0) {
    const suppliers = [
      {
        slug: 'delta-modern-irrigation',
        name_en: 'Al-Delta Modern Irrigation Systems',
        name_ar: 'الدلتا لشبكات وتجهيزات الري الحديث',
        category: 'irrigation',
        desc_en: 'Official distributor of high-durability drip tubing, Netafim valves, screen filters, and deep-well submersible pumps in Egypt.',
        desc_ar: 'وكيل وموزع معتمد لخراطيم الري بالتنقيط عالية التحمل، محابس وفلاتر نيتافيم، وطلمبات الآبار الارتوازية الغاطسة في مصر.',
        phone: '+201020304050',
        whatsapp: '+201020304050',
        email: 'sales@deltareyy.com',
        products: ['Netafim Drip Lines', 'Fertilizer Venturi Pumps', 'Deep Well Turbines', 'Centrifugal Gravel Filters'],
        logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'
      },
      {
        slug: 'sunagro-solar-pumping',
        name_en: 'SunAgro Solar Energy & Well Pumping',
        name_ar: 'صن أجرو للطاقة الشمسية ومحطات طلمبات الآبار',
        category: 'solar-energy',
        desc_en: 'Turnkey solar pumping systems from 15 HP to 150 HP for agricultural wells in Wadi El-Natrun, Minya, and Farafra with 25-year panel warranty.',
        desc_ar: 'محطات طاقة شمسية متكاملة لتشغيل طلمبات الآبار من 15 إلى 150 حصان في وادي النطرون والمنيا والفرافرة مع ضمان 25 سنة على الألواح.',
        phone: '+201090807060',
        whatsapp: '+201090807060',
        email: 'info@sunagro-eg.com',
        products: ['Tier-1 Monocrystalline Solar Panels', 'Fuji / INVT Solar Inverters', 'Galvanized Mounting Structures'],
        logo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=300&q=80'
      },
      {
        slug: 'nile-agritech-seedlings',
        name_en: 'Nile Tissue Culture Date Palms & Seedlings',
        name_ar: 'معامل النيل لشتلات النخيل النسيجي والأشجار المعتمدة',
        category: 'fertilizers',
        desc_en: 'Certified tissue-culture date palm offsets (Medjool, Barhi, Siwi) with virus-free ministry certifications and planting support.',
        desc_ar: 'فسائل وشتلات نخيل نسيجي معتمدة (مجدول، برحي، سيوي) خالية من الفيروسات بشهادات فحص من وزارة الزراعة مع الدعم الفني.',
        phone: '+201122334455',
        whatsapp: '+201122334455',
        email: 'orders@nilepalms.com',
        products: ['Medjool Palm Offsets', 'Kalamata Olive Trees', 'Citrus Rootstocks'],
        logo: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&q=80'
      }
    ];

    for (const sup of suppliers) {
      await db.query(
        `INSERT INTO suppliers (
          slug, company_name_en, company_name_ar, category_slug, description_en, description_ar,
          governorate_id, phone, whatsapp, email, products_services, is_verified, status, logo_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1, 'active', $12
        )`,
        [
          sup.slug, sup.name_en, sup.name_ar, sup.category, sup.desc_en, sup.desc_ar,
          locDesert, sup.phone, sup.whatsapp, sup.email, sup.products, sup.logo
        ]
      );
    }
  }

  // 11. Seed Human Resources
  const hrCount = (await db.query('SELECT COUNT(*) as count FROM human_resources')).rows[0]?.count;
  if (Number(hrCount) === 0) {
    const specialists = [
      {
        slug: 'eng-tarek-mansour',
        name_en: 'Eng. Tarek Mansour',
        name_ar: 'م. طارق منصور',
        title_en: 'Senior Agronomist & Citrus Export Consultant',
        title_ar: 'استشاري محاصيل حقلية وتصدير موالح ومانجو',
        category: 'agronomist',
        years: 15,
        bio_en: 'Bachelor of Agricultural Science from Cairo University. 15 years leading production on major export citrus and mango projects along the Desert Road and Salhiya.',
        bio_ar: 'بكالوريوس علوم زراعية جامعة القاهرة. خبرة 15 عاماً في إدارة مزارع تصدير الموالح والمانجو بكبرى المشاريع الزراعية بالطريق الصحراوي والصالحية.',
        skills: ['Pest Management (IPM)', 'GlobalG.A.P. Certification', 'Irrigation Water Chemistry', 'Export Harvesting'],
        phone: '+201099887766',
        whatsapp: '+201099887766',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
      },
      {
        slug: 'eng-ahmed-el-sayed',
        name_en: 'Eng. Ahmed El-Sayed',
        name_ar: 'م. أحمد السيد',
        title_en: 'General Farm Operations & Land Reclamation Manager',
        title_ar: 'مدير عام تشغيل مزارع واستصلاح أراضٍ صحراوية',
        category: 'farm-manager',
        years: 12,
        bio_en: 'Extensive track record managing multi-hundred feddan properties in Wadi El-Natrun and West Minya. Expert in team management, budgeting, and solar well installations.',
        bio_ar: 'سجل حافل في إدارة مشاريع بمئات الأفدنة بوادي النطرون وغرب المنيا. خبير في إدارة فرق العمل والموازنات التقديرية وتشغيل محطات الطاقة الشمسية.',
        skills: ['Turnkey Farm Setup', 'Farm Budgeting & Cost Control', 'Machinery Fleet Maintenance', 'Center Pivot Systems'],
        phone: '+201011223344',
        whatsapp: '+201011223344',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
      },
      {
        slug: 'dr-yasser-radwan',
        name_en: 'Dr. Yasser Radwan',
        name_ar: 'د. ياسر رضوان',
        title_en: 'Veterinary Doctor & Cattle/Sheep Herd Health Consultant',
        title_ar: 'طبيب بيطري استشاري ثروة حيوانية ومزارع تسمين وألبان',
        category: 'veterinarian',
        years: 14,
        bio_en: 'Doctorate in Veterinary Medicine. Specialized in preventive vaccination protocols, genetic selection, and nutritional feed formulation for commercial dairy and fattening feedlots.',
        bio_ar: 'دكتوراه في الطب البيطري. متخصص في برامج التحصين الوقائي، تحسين السلالات، وتركيب العلائق الغذائية لمزارع التسمين وإنتاج الألبان الكبرى.',
        skills: ['Feedlot Ration Formulation', 'Herd Herd Vaccination Protocols', 'Artificial Insemination', 'Biosecurity Protocols'],
        phone: '+201155667788',
        whatsapp: '+201155667788',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
      }
    ];

    for (const spec of specialists) {
      await db.query(
        `INSERT INTO human_resources (
          slug, full_name_en, full_name_ar, title_en, title_ar, category_slug, experience_years,
          governorate_id, bio_en, bio_ar, skills, avatar_url, phone, whatsapp, is_verified, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 1, 'active'
        )`,
        [
          spec.slug, spec.name_en, spec.name_ar, spec.title_en, spec.title_ar, spec.category, spec.years,
          locDesert, spec.bio_en, spec.bio_ar, spec.skills, spec.avatar, spec.phone, spec.whatsapp
        ]
      );
    }
  }

  console.log('[FARMINN Seed] Seed completed successfully.');
}

