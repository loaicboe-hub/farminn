import { db } from '../db/index.mjs';
import { getSessionUser } from '../middleware/auth.mjs';
import { rateLimitMiddleware, parseJsonBody } from '../middleware/security.mjs';
import { stripControlChars, normalizeEmail } from '../../foundation/security/input-sanitizer.mjs';

export async function handleMarketplaceRoutes(req, res, pathname, queryParams) {
  // 1. GET /api/taxonomy
  if (req.method === 'GET' && pathname === '/api/taxonomy') {
    const locations = (await db.query('SELECT id, slug, name_en, name_ar, region FROM taxonomy_locations WHERE is_active = 1 ORDER BY sort_order ASC')).rows;
    const categories = (await db.query('SELECT id, slug, name_en, name_ar, category_type FROM taxonomy_categories WHERE is_active = 1 ORDER BY sort_order ASC')).rows;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ locations, categories }));
    return true;
  }

  // 2. GET /api/settings
  if (req.method === 'GET' && pathname === '/api/settings') {
    const settings = (await db.query('SELECT setting_key, setting_value, group_name FROM website_settings WHERE is_public = 1')).rows;
    const map = {};
    for (const s of settings) map[s.setting_key] = s.setting_value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(map));
    return true;
  }

  // 3. GET /api/farms
  if (req.method === 'GET' && pathname === '/api/farms') {
    const purpose = queryParams.get('purpose') || queryParams.get('listing');
    const govSlug = queryParams.get('gov') || queryParams.get('governorate');
    const minArea = parseFloat(queryParams.get('minArea') || queryParams.get('sizeMin') || '0');
    const maxArea = parseFloat(queryParams.get('maxArea') || queryParams.get('sizeMax') || '0');
    const minPrice = parseFloat(queryParams.get('minPrice') || queryParams.get('priceMin') || '0');
    const maxPrice = parseFloat(queryParams.get('maxPrice') || queryParams.get('priceMax') || '0');
    const q = queryParams.get('q')?.trim() || '';
    const sort = queryParams.get('sort') || 'newest';

    let sql = `
      SELECT f.id, f.slug, f.purpose, f.title_en, f.title_ar, f.description_en, f.description_ar,
             f.city_en, f.city_ar, f.area_feddan, f.area_qirat, f.price, f.price_per_feddan, f.currency,
             f.water_source, f.irrigation_system, f.electricity_source, f.soil_type, f.legal_status,
             f.crops, f.facilities, f.is_featured, f.view_count, f.created_at,
             l.slug as gov_slug, l.name_en as gov_name_en, l.name_ar as gov_name_ar,
             (SELECT image_url FROM farm_media WHERE farm_id = f.id ORDER BY is_cover DESC, sort_order ASC LIMIT 1) as cover_image
      FROM farms f
      JOIN taxonomy_locations l ON f.governorate_id = l.id
      WHERE f.status = 'approved'
    `;
    const params = [];
    let pIdx = 1;

    if (purpose && purpose !== 'all') {
      sql += ` AND (f.purpose = $${pIdx} OR f.purpose = 'both')`;
      params.push(purpose);
      pIdx++;
    }

    if (govSlug && govSlug !== 'all') {
      sql += ` AND l.slug = $${pIdx}`;
      params.push(govSlug);
      pIdx++;
    }

    if (minArea > 0) {
      sql += ` AND f.area_feddan >= $${pIdx}`;
      params.push(minArea);
      pIdx++;
    }

    if (maxArea > 0) {
      sql += ` AND f.area_feddan <= $${pIdx}`;
      params.push(maxArea);
      pIdx++;
    }

    if (minPrice > 0) {
      sql += ` AND f.price >= $${pIdx}`;
      params.push(minPrice);
      pIdx++;
    }

    if (maxPrice > 0) {
      sql += ` AND f.price <= $${pIdx}`;
      params.push(maxPrice);
      pIdx++;
    }

    if (q) {
      sql += ` AND (f.title_en LIKE $${pIdx} OR f.title_ar LIKE $${pIdx} OR f.description_en LIKE $${pIdx} OR f.description_ar LIKE $${pIdx})`;
      params.push(`%${q}%`);
      pIdx++;
    }

    if (sort === 'price_asc') {
      sql += ' ORDER BY f.price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY f.price DESC';
    } else if (sort === 'area_asc') {
      sql += ' ORDER BY f.area_feddan ASC';
    } else if (sort === 'area_desc') {
      sql += ' ORDER BY f.area_feddan DESC';
    } else {
      sql += ' ORDER BY f.is_featured DESC, f.created_at DESC';
    }

    const resFarms = await db.query(sql, params);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      total: resFarms.rowCount,
      farms: resFarms.rows
    }));
    return true;
  }

  // 4. GET /api/farms/:slug
  if (req.method === 'GET' && pathname.startsWith('/api/farms/')) {
    const slug = pathname.replace('/api/farms/', '');
    if (!slug || slug.includes('/')) return false;

    const farmRes = await db.query(
      `SELECT f.*, l.slug as gov_slug, l.name_en as gov_name_en, l.name_ar as gov_name_ar
       FROM farms f
       JOIN taxonomy_locations l ON f.governorate_id = l.id
       WHERE f.slug = $1 AND (f.status = 'approved' OR f.status = 'sold_or_leased')`,
      [slug]
    );

    if (farmRes.rowCount === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Farm listing not found' }));
      return true;
    }

    const farm = farmRes.rows[0];

    // Increment view count
    db.query('UPDATE farms SET view_count = view_count + 1 WHERE id = $1', [farm.id]).catch(() => {});

    // Fetch media and documents
    const media = (await db.query('SELECT image_url, sort_order, is_cover, caption_en, caption_ar FROM farm_media WHERE farm_id = $1 ORDER BY is_cover DESC, sort_order ASC', [farm.id])).rows;
    const documents = (await db.query('SELECT title_en, title_ar, document_type, document_url, is_verified FROM farm_documents WHERE farm_id = $1', [farm.id])).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      farm,
      media,
      documents
    }));
    return true;
  }

  // 5. POST /api/farms/:slug/inquire
  if (req.method === 'POST' && pathname.match(/^\/api\/farms\/[^/]+\/inquire$/)) {
    const allowed = await rateLimitMiddleware(req, res, 'publicForms');
    if (!allowed) return true;

    const slug = pathname.split('/')[3];
    const farmRes = await db.query('SELECT id, title_en, title_ar FROM farms WHERE slug = $1', [slug]);
    if (farmRes.rowCount === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Farm not found' }));
      return true;
    }

    const body = await parseJsonBody(req);
    const user = await getSessionUser(req);
    const name = stripControlChars(body.name || user?.full_name);
    const phone = stripControlChars(body.phone || user?.mobile_number);
    const email = normalizeEmail(body.email || user?.email);
    const message = stripControlChars(body.message);

    if (!name || !phone) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Name and phone number are required' }));
      return true;
    }

    await db.query(
      `INSERT INTO farm_inquiries (farm_id, user_id, name, phone, email, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'new')`,
      [farmRes.rows[0].id, user?.id || null, name, phone, email, message]
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Your inquiry has been received. Our agricultural advisor will contact you.' }));
    return true;
  }

  // 6. GET /api/management & POST /api/management/requests
  if (pathname === '/api/management') {
    if (req.method === 'GET') {
      const requests = (await db.query(
        `SELECT r.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar,
                (SELECT COUNT(*) FROM farm_management_proposals WHERE request_id = r.id) as proposals_count
         FROM farm_management_requests r
         JOIN taxonomy_locations l ON r.governorate_id = l.id
         WHERE r.status = 'open'
         ORDER BY r.created_at DESC`
      )).rows;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ requests }));
      return true;
    }

    if (req.method === 'POST') {
      const allowed = await rateLimitMiddleware(req, res, 'publicForms');
      if (!allowed) return true;

      const user = await getSessionUser(req);
      const body = await parseJsonBody(req);
      const titleEn = stripControlChars(body.titleEn || body.title);
      const titleAr = stripControlChars(body.titleAr || body.title);
      const govId = parseInt(body.governorateId || '1', 10);
      const area = parseFloat(body.areaFeddan || '0');
      const crops = stripControlChars(body.crops);
      const services = Array.isArray(body.services) ? body.services : [];
      const budget = stripControlChars(body.budget);
      const details = stripControlChars(body.details);
      const contactName = stripControlChars(body.contactName || user?.full_name);
      const contactPhone = stripControlChars(body.contactPhone || user?.mobile_number);
      const whatsapp = stripControlChars(body.whatsapp || contactPhone);

      if (!titleEn || !contactName || !contactPhone || area <= 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title, contact details, and valid farm area are required.' }));
        return true;
      }

      const ins = await db.query(
        `INSERT INTO farm_management_requests (
          owner_id, title_en, title_ar, governorate_id, area_feddan, crops_activity,
          required_services, budget_range, details, contact_name, contact_phone, contact_whatsapp, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'open'
        )`,
        [
          user?.id || null, titleEn, titleAr, govId, area, crops,
          services, budget, details, contactName, contactPhone, whatsapp
        ]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: ins.lastInsertRowid }));
      return true;
    }
  }

  // 7. POST /api/management/requests/:id/proposals
  if (req.method === 'POST' && pathname.match(/^\/api\/management\/requests\/\d+\/proposals$/)) {
    const allowed = await rateLimitMiddleware(req, res, 'publicForms');
    if (!allowed) return true;

    const requestId = parseInt(pathname.split('/')[4], 10);
    const user = await getSessionUser(req);
    const body = await parseJsonBody(req);

    const name = stripControlChars(body.managerName || user?.full_name);
    const phone = stripControlChars(body.managerPhone || user?.mobile_number);
    const fee = parseFloat(body.proposedFee || '0');
    const feeType = body.feeType || 'fixed_monthly';
    const duration = parseInt(body.durationMonths || '12', 10);
    const details = stripControlChars(body.details);

    if (!name || !phone || !details) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Manager name, phone, and proposal details are required' }));
      return true;
    }

    await db.query(
      `INSERT INTO farm_management_proposals (
        request_id, manager_id, manager_name, manager_phone, proposed_fee, fee_type, duration_months, proposal_details, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
      [requestId, user?.id || null, name, phone, fee, feeType, duration, details]
    );

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Proposal submitted successfully.' }));
    return true;
  }

  // 8. GET & POST /api/partnerships
  if (pathname === '/api/partnerships') {
    if (req.method === 'GET') {
      const parts = (await db.query(
        `SELECT p.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar,
                (SELECT COUNT(*) FROM partnership_applications WHERE partnership_id = p.id) as applicants_count
         FROM partnerships p
         JOIN taxonomy_locations l ON p.governorate_id = l.id
         WHERE p.status = 'active'
         ORDER BY p.created_at DESC`
      )).rows;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ partnerships: parts }));
      return true;
    }

    if (req.method === 'POST') {
      const allowed = await rateLimitMiddleware(req, res, 'publicForms');
      if (!allowed) return true;

      const user = await getSessionUser(req);
      const body = await parseJsonBody(req);
      const titleEn = stripControlChars(body.titleEn || body.title);
      const titleAr = stripControlChars(body.titleAr || body.title);
      const govId = parseInt(body.governorateId || '1', 10);
      const area = parseFloat(body.areaFeddan || '0');
      const capital = parseFloat(body.requiredCapital || '0');
      const type = body.partnershipType || 'capital_investor';
      const share = parseFloat(body.equityShare || '0');
      const objectives = stripControlChars(body.objectives);
      const conditions = stripControlChars(body.conditions);
      const contactName = stripControlChars(body.contactName || user?.full_name);
      const contactPhone = stripControlChars(body.contactPhone || user?.mobile_number);
      const whatsapp = stripControlChars(body.whatsapp || contactPhone);

      if (!titleEn || !contactName || !contactPhone || capital <= 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title, required capital, and contact details are required.' }));
        return true;
      }

      const ins = await db.query(
        `INSERT INTO partnerships (
          user_id, title_en, title_ar, governorate_id, area_feddan, required_capital,
          partnership_type, equity_share_percent, objectives_en, objectives_ar, conditions_en, conditions_ar,
          contact_name, contact_phone, contact_whatsapp, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'active'
        )`,
        [
          user?.id || null, titleEn, titleAr, govId, area, capital,
          type, share, objectives, objectives, conditions, conditions,
          contactName, contactPhone, whatsapp
        ]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: ins.lastInsertRowid }));
      return true;
    }
  }

  // 9. POST /api/partnerships/:id/apply
  if (req.method === 'POST' && pathname.match(/^\/api\/partnerships\/\d+\/apply$/)) {
    const allowed = await rateLimitMiddleware(req, res, 'publicForms');
    if (!allowed) return true;

    const partId = parseInt(pathname.split('/')[3], 10);
    const user = await getSessionUser(req);
    const body = await parseJsonBody(req);

    const name = stripControlChars(body.applicantName || user?.full_name);
    const phone = stripControlChars(body.applicantPhone || user?.mobile_number);
    const capital = parseFloat(body.offeredCapital || '0');
    const msg = stripControlChars(body.message);

    if (!name || !phone || !msg) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Name, phone number, and proposal message are required' }));
      return true;
    }

    await db.query(
      `INSERT INTO partnership_applications (
        partnership_id, applicant_id, applicant_name, applicant_phone, offered_capital, proposal_message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
      [partId, user?.id || null, name, phone, capital, msg]
    );

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Application submitted successfully.' }));
    return true;
  }

  // 10. POST /api/quick-buy
  if (req.method === 'POST' && pathname === '/api/quick-buy') {
    const allowed = await rateLimitMiddleware(req, res, 'publicForms');
    if (!allowed) return true;

    const user = await getSessionUser(req);
    const body = await parseJsonBody(req);
    const fullName = stripControlChars(body.fullName || user?.full_name);
    const phone = stripControlChars(body.mobile || body.phone || user?.mobile_number);
    const whatsapp = stripControlChars(body.whatsapp || phone);
    const cash = parseFloat(body.cashAmount || body.availableCash || '0');
    const assetType = body.exchangeAssetType || body.assetType || 'none';
    const assetDesc = stripControlChars(body.exchangeAssetDescription || body.assetDescription);
    const govId = body.governorateId ? parseInt(body.governorateId, 10) : null;
    const minArea = parseFloat(body.minArea || '0');
    const maxArea = parseFloat(body.maxArea || '0');

    if (!fullName || !phone || cash <= 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Full name, mobile number, and available cash amount are required.' }));
      return true;
    }

    await db.query(
      `INSERT INTO quick_buy_requests (
        user_id, full_name, phone, whatsapp, governorate_id, min_area_feddan, max_area_feddan,
        available_cash, exchange_asset_type, exchange_asset_description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'new')`,
      [user?.id || null, fullName, phone, whatsapp, govId, minArea, maxArea, cash, assetType, assetDesc]
    );

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Quick buy request submitted successfully.' }));
    return true;
  }

  // 11. POST /api/quick-sell
  if (req.method === 'POST' && pathname === '/api/quick-sell') {
    const allowed = await rateLimitMiddleware(req, res, 'publicForms');
    if (!allowed) return true;

    const user = await getSessionUser(req);
    const body = await parseJsonBody(req);
    const fullName = stripControlChars(body.fullName || user?.full_name);
    const phone = stripControlChars(body.mobile || body.phone || user?.mobile_number);
    const whatsapp = stripControlChars(body.whatsapp || phone);
    const farmName = stripControlChars(body.farmName);
    const askingPrice = parseFloat(body.askingPrice || '0');
    const area = parseFloat(body.areaFeddan || '0');
    const installments = Boolean(body.installments);
    const exchange = Boolean(body.exchange);
    const exchangePref = stripControlChars(body.exchangePreferences);
    const farmDetails = stripControlChars(body.farmDetails);
    const govId = body.governorateId ? parseInt(body.governorateId, 10) : null;

    if (!fullName || !phone || !farmName) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Full name, mobile number, and farm reference name are required.' }));
      return true;
    }

    await db.query(
      `INSERT INTO quick_sell_requests (
        user_id, full_name, phone, whatsapp, farm_name, governorate_id, area_feddan, asking_price,
        accepts_installments, accepts_exchange, exchange_preferences, farm_details, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'new')`,
      [
        user?.id || null, fullName, phone, whatsapp, farmName, govId, area, askingPrice,
        installments ? 1 : 0, exchange ? 1 : 0, exchangePref, farmDetails
      ]
    );

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Quick sell request received. Our team will contact you shortly.' }));
    return true;
  }

  // 12. GET /api/suppliers & POST /api/suppliers/:id/inquire
  if (req.method === 'GET' && pathname === '/api/suppliers') {
    const category = queryParams.get('category');
    const q = queryParams.get('q')?.trim() || '';

    let sql = "SELECT * FROM suppliers WHERE status = 'active'";
    const params = [];
    let pIdx = 1;

    if (category && category !== 'all') {
      sql += ` AND category_slug = $${pIdx}`;
      params.push(category);
      pIdx++;
    }
    if (q) {
      sql += ` AND (company_name_en LIKE $${pIdx} OR company_name_ar LIKE $${pIdx} OR description_en LIKE $${pIdx} OR description_ar LIKE $${pIdx})`;
      params.push(`%${q}%`);
      pIdx++;
    }
    sql += ' ORDER BY is_verified DESC, created_at DESC';

    const suppliers = (await db.query(sql, params)).rows;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ suppliers }));
    return true;
  }

  // 13. GET /api/human-resources
  if (req.method === 'GET' && pathname === '/api/human-resources') {
    const category = queryParams.get('category');
    const minYears = parseInt(queryParams.get('minYears') || '0', 10);
    const q = queryParams.get('q')?.trim() || '';

    let sql = "SELECT * FROM human_resources WHERE status = 'active'";
    const params = [];
    let pIdx = 1;

    if (category && category !== 'all') {
      sql += ` AND category_slug = $${pIdx}`;
      params.push(category);
      pIdx++;
    }
    if (minYears > 0) {
      sql += ` AND experience_years >= $${pIdx}`;
      params.push(minYears);
      pIdx++;
    }
    if (q) {
      sql += ` AND (full_name_en LIKE $${pIdx} OR full_name_ar LIKE $${pIdx} OR title_en LIKE $${pIdx} OR title_ar LIKE $${pIdx})`;
      params.push(`%${q}%`);
      pIdx++;
    }
    sql += ' ORDER BY is_verified DESC, experience_years DESC';

    const hr = (await db.query(sql, params)).rows;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ specialists: hr }));
    return true;
  }

  return false;
}
