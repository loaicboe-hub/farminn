import { db } from '../db/index.mjs';
import { getSessionUser } from '../middleware/auth.mjs';
import { parseJsonBody } from '../middleware/security.mjs';
import { stripControlChars } from '../../foundation/security/input-sanitizer.mjs';
import { hashPassword, verifyPassword } from '../utils/auth-crypto.mjs';

export async function handleUserPortalRoutes(req, res, pathname) {
  if (!pathname.startsWith('/api/my/')) return false;

  const user = await getSessionUser(req);
  if (!user) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Authentication required' }));
    return true;
  }

  // 1. GET /api/my/overview
  if (req.method === 'GET' && pathname === '/api/my/overview') {
    const farmsCount = (await db.query('SELECT COUNT(*) as count FROM farms WHERE user_id = $1', [user.id])).rows[0]?.count || 0;
    const mgmtCount = (await db.query('SELECT COUNT(*) as count FROM farm_management_requests WHERE owner_id = $1', [user.id])).rows[0]?.count || 0;
    const proposalsCount = (await db.query('SELECT COUNT(*) as count FROM farm_management_proposals WHERE manager_id = $1', [user.id])).rows[0]?.count || 0;
    const partsCount = (await db.query('SELECT COUNT(*) as count FROM partnerships WHERE user_id = $1', [user.id])).rows[0]?.count || 0;
    const qbCount = (await db.query('SELECT COUNT(*) as count FROM quick_buy_requests WHERE user_id = $1', [user.id])).rows[0]?.count || 0;
    const qsCount = (await db.query('SELECT COUNT(*) as count FROM quick_sell_requests WHERE user_id = $1', [user.id])).rows[0]?.count || 0;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      user,
      stats: {
        farms: Number(farmsCount),
        managementRequests: Number(mgmtCount),
        proposals: Number(proposalsCount),
        partnerships: Number(partsCount),
        quickRequests: Number(qbCount) + Number(qsCount)
      }
    }));
    return true;
  }

  // 2. GET /api/my/farms
  if (req.method === 'GET' && pathname === '/api/my/farms') {
    const farms = (await db.query(
      `SELECT f.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar,
              (SELECT image_url FROM farm_media WHERE farm_id = f.id ORDER BY is_cover DESC LIMIT 1) as cover_image
       FROM farms f
       JOIN taxonomy_locations l ON f.governorate_id = l.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [user.id]
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ farms }));
    return true;
  }

  // 3. POST /api/my/farms
  if (req.method === 'POST' && pathname === '/api/my/farms') {
    const body = await parseJsonBody(req);
    const titleEn = stripControlChars(body.titleEn);
    const titleAr = stripControlChars(body.titleAr || titleEn);
    const purpose = ['sale', 'rent', 'both'].includes(body.purpose) ? body.purpose : 'sale';
    const govId = parseInt(body.governorateId || '1', 10);
    const areaFeddan = parseFloat(body.areaFeddan || '0');
    const price = parseFloat(body.price || '0');
    const waterSource = body.waterSource || 'artesian_well';
    const soilType = body.soilType || 'sandy';
    const descEn = stripControlChars(body.descriptionEn);
    const descAr = stripControlChars(body.descriptionAr || descEn);
    const phone = stripControlChars(body.contactPhone || user.mobile_number);
    const whatsapp = stripControlChars(body.contactWhatsapp || phone);

    if (!titleEn || areaFeddan <= 0 || price <= 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Title, area, and price are required' }));
      return true;
    }

    const slug = titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const ins = await db.query(
      `INSERT INTO farms (
        slug, user_id, purpose, title_en, title_ar, description_en, description_ar,
        governorate_id, area_feddan, price, price_per_feddan, water_source, soil_type,
        contact_name, contact_phone, contact_whatsapp, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, 'pending_review'
      )`,
      [
        slug, user.id, purpose, titleEn, titleAr, descEn, descAr,
        govId, areaFeddan, price, Math.round(price / areaFeddan), waterSource, soilType,
        user.full_name, phone, whatsapp
      ]
    );

    const farmId = ins.lastInsertRowid;
    // Add default cover image if provided
    if (body.imageUrl) {
      await db.query(
        'INSERT INTO farm_media (farm_id, image_url, sort_order, is_cover) VALUES ($1, $2, 1, 1)',
        [farmId, body.imageUrl]
      );
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Farm listing submitted and is under administrative review.',
      slug
    }));
    return true;
  }

  // 4. GET /api/my/management
  if (req.method === 'GET' && pathname === '/api/my/management') {
    const requests = (await db.query(
      `SELECT r.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar
       FROM farm_management_requests r
       JOIN taxonomy_locations l ON r.governorate_id = l.id
       WHERE r.owner_id = $1
       ORDER BY r.created_at DESC`,
      [user.id]
    )).rows;

    // Fetch proposals for each request
    for (const reqItem of requests) {
      reqItem.proposals = (await db.query(
        'SELECT * FROM farm_management_proposals WHERE request_id = $1 ORDER BY created_at DESC',
        [reqItem.id]
      )).rows;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ requests }));
    return true;
  }

  // 5. GET /api/my/proposals (for managers)
  if (req.method === 'GET' && pathname === '/api/my/proposals') {
    const proposals = (await db.query(
      `SELECT p.*, r.title_en as request_title_en, r.title_ar as request_title_ar,
              r.crops_activity, r.area_feddan, l.name_en as gov_name_en
       FROM farm_management_proposals p
       JOIN farm_management_requests r ON p.request_id = r.id
       JOIN taxonomy_locations l ON r.governorate_id = l.id
       WHERE p.manager_id = $1
       ORDER BY p.created_at DESC`,
      [user.id]
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ proposals }));
    return true;
  }

  // 6. GET /api/my/requests (quick buy / sell)
  if (req.method === 'GET' && pathname === '/api/my/requests') {
    const quickBuy = (await db.query('SELECT * FROM quick_buy_requests WHERE user_id = $1 ORDER BY created_at DESC', [user.id])).rows;
    const quickSell = (await db.query('SELECT * FROM quick_sell_requests WHERE user_id = $1 ORDER BY created_at DESC', [user.id])).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ quickBuy, quickSell }));
    return true;
  }

  // 7. PUT /api/my/profile
  if (req.method === 'PUT' && pathname === '/api/my/profile') {
    const body = await parseJsonBody(req);
    const fullName = stripControlChars(body.fullName || user.full_name);
    const mobile = stripControlChars(body.mobile || user.mobile_number);
    const currentPass = body.currentPassword;
    const newPass = body.newPassword;

    if (newPass) {
      if (!currentPass) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Current password is required to set a new password' }));
        return true;
      }
      const uRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [user.id]);
      if (!verifyPassword(currentPass, uRes.rows[0].password_hash)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Current password is incorrect' }));
        return true;
      }
      const newHash = hashPassword(newPass);
      await db.query('UPDATE users SET full_name = $1, mobile_number = $2, password_hash = $3 WHERE id = $4', [fullName, mobile, newHash, user.id]);
    } else {
      await db.query('UPDATE users SET full_name = $1, mobile_number = $2 WHERE id = $3', [fullName, mobile, user.id]);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Profile updated successfully' }));
    return true;
  }

  return false;
}

