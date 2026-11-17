import { db } from '../db/index.mjs';
import { getSessionUser } from '../middleware/auth.mjs';
import { parseJsonBody } from '../middleware/security.mjs';

function isAdmin(user) {
  if (!user) return false;
  return ['super_admin', 'admin', 'editor'].includes(user.role_slug);
}

export async function handleAdminRoutes(req, res, pathname) {
  if (!pathname.startsWith('/api/admin/')) return false;

  const user = await getSessionUser(req);
  if (!user || !isAdmin(user)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Access forbidden: Administrative privileges required' }));
    return true;
  }

  // 1. GET /api/admin/metrics
  if (req.method === 'GET' && pathname === '/api/admin/metrics') {
    const totalFarms = (await db.query('SELECT COUNT(*) as count FROM farms')).rows[0]?.count || 0;
    const pendingFarms = (await db.query("SELECT COUNT(*) as count FROM farms WHERE status = 'pending_review'")).rows[0]?.count || 0;
    const approvedFarms = (await db.query("SELECT COUNT(*) as count FROM farms WHERE status = 'approved'")).rows[0]?.count || 0;
    const totalFeddans = (await db.query('SELECT SUM(area_feddan) as total FROM farms')).rows[0]?.total || 0;

    const mgmtRequests = (await db.query('SELECT COUNT(*) as count FROM farm_management_requests')).rows[0]?.count || 0;
    const proposals = (await db.query('SELECT COUNT(*) as count FROM farm_management_proposals')).rows[0]?.count || 0;

    const partnerships = (await db.query('SELECT COUNT(*) as count FROM partnerships')).rows[0]?.count || 0;
    const applications = (await db.query('SELECT COUNT(*) as count FROM partnership_applications')).rows[0]?.count || 0;

    const quickBuy = (await db.query('SELECT COUNT(*) as count FROM quick_buy_requests')).rows[0]?.count || 0;
    const quickSell = (await db.query('SELECT COUNT(*) as count FROM quick_sell_requests')).rows[0]?.count || 0;

    const suppliers = (await db.query('SELECT COUNT(*) as count FROM suppliers')).rows[0]?.count || 0;
    const hr = (await db.query('SELECT COUNT(*) as count FROM human_resources')).rows[0]?.count || 0;
    const users = (await db.query('SELECT COUNT(*) as count FROM users')).rows[0]?.count || 0;
    const inquiries = (await db.query('SELECT COUNT(*) as count FROM farm_inquiries')).rows[0]?.count || 0;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      metrics: {
        totalFarms: Number(totalFarms),
        pendingFarms: Number(pendingFarms),
        approvedFarms: Number(approvedFarms),
        totalFeddans: Math.round(Number(totalFeddans)),
        mgmtRequests: Number(mgmtRequests),
        proposals: Number(proposals),
        partnerships: Number(partnerships),
        applications: Number(applications),
        quickBuy: Number(quickBuy),
        quickSell: Number(quickSell),
        suppliers: Number(suppliers),
        humanResources: Number(hr),
        users: Number(users),
        inquiries: Number(inquiries)
      }
    }));
    return true;
  }

  // 2. GET /api/admin/farms
  if (req.method === 'GET' && pathname === '/api/admin/farms') {
    const farms = (await db.query(
      `SELECT f.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar, u.full_name as owner_name, u.email as owner_email
       FROM farms f
       JOIN taxonomy_locations l ON f.governorate_id = l.id
       LEFT JOIN users u ON f.user_id = u.id
       ORDER BY f.created_at DESC`
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ farms }));
    return true;
  }

  // 3. PUT /api/admin/farms/:id/status
  if (req.method === 'PUT' && pathname.match(/^\/api\/admin\/farms\/\d+\/status$/)) {
    const farmId = parseInt(pathname.split('/')[4], 10);
    const body = await parseJsonBody(req);
    const status = body.status;
    const isFeatured = body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : undefined;

    if (status) {
      await db.query('UPDATE farms SET status = $1 WHERE id = $2', [status, farmId]);
    }
    if (isFeatured !== undefined) {
      await db.query('UPDATE farms SET is_featured = $1 WHERE id = $2', [isFeatured, farmId]);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Farm status updated' }));
    return true;
  }

  // 4. GET /api/admin/management
  if (req.method === 'GET' && pathname === '/api/admin/management') {
    const requests = (await db.query(
      `SELECT r.*, l.name_en as gov_name_en,
              (SELECT COUNT(*) FROM farm_management_proposals WHERE request_id = r.id) as proposals_count
       FROM farm_management_requests r
       JOIN taxonomy_locations l ON r.governorate_id = l.id
       ORDER BY r.created_at DESC`
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ requests }));
    return true;
  }

  // 5. GET /api/admin/partnerships
  if (req.method === 'GET' && pathname === '/api/admin/partnerships') {
    const partnerships = (await db.query(
      `SELECT p.*, l.name_en as gov_name_en,
              (SELECT COUNT(*) FROM partnership_applications WHERE partnership_id = p.id) as applicants_count
       FROM partnerships p
       JOIN taxonomy_locations l ON p.governorate_id = l.id
       ORDER BY p.created_at DESC`
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ partnerships }));
    return true;
  }

  // 6. GET /api/admin/quick-buy
  if (req.method === 'GET' && pathname === '/api/admin/quick-buy') {
    const requests = (await db.query(
      `SELECT q.*, l.name_en as gov_name_en
       FROM quick_buy_requests q
       LEFT JOIN taxonomy_locations l ON q.governorate_id = l.id
       ORDER BY q.created_at DESC`
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ requests }));
    return true;
  }

  // 7. GET /api/admin/quick-sell
  if (req.method === 'GET' && pathname === '/api/admin/quick-sell') {
    const requests = (await db.query(
      `SELECT q.*, l.name_en as gov_name_en
       FROM quick_sell_requests q
       LEFT JOIN taxonomy_locations l ON q.governorate_id = l.id
       ORDER BY q.created_at DESC`
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ requests }));
    return true;
  }

  // 8. GET /api/admin/users
  if (req.method === 'GET' && pathname === '/api/admin/users') {
    const users = (await db.query(
      `SELECT u.id, u.full_name, u.email, u.mobile_number, u.account_type, u.is_active,
              u.created_at, u.last_login_at, r.slug as role_slug, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ users }));
    return true;
  }

  // 9. GET & PUT /api/admin/settings (Centralized Website Settings)
  if (pathname === '/api/admin/settings') {
    if (req.method === 'GET') {
      const settings = (await db.query('SELECT * FROM website_settings ORDER BY group_name ASC, setting_key ASC')).rows;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ settings }));
      return true;
    }

    if (req.method === 'PUT') {
      const body = await parseJsonBody(req);
      if (body && typeof body === 'object') {
        for (const [key, val] of Object.entries(body)) {
          await db.query(
            "UPDATE website_settings SET setting_value = $1, updated_at = datetime('now') WHERE setting_key = $2",
            [String(val), key]
          );
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Website settings updated successfully' }));
      return true;
    }
  }

  // 10. GET /api/admin/inquiries
  if (req.method === 'GET' && pathname === '/api/admin/inquiries') {
    const inquiries = (await db.query(
      `SELECT i.*, f.title_en as farm_title_en, f.slug as farm_slug
       FROM farm_inquiries i
       JOIN farms f ON i.farm_id = f.id
       ORDER BY i.created_at DESC`
    )).rows;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ inquiries }));
    return true;
  }

  return false;
}

