import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './src/config.mjs';
import { db } from './src/db/index.mjs';
import { runMigrations } from './src/db/migrate.mjs';
import { setSecurityHeaders, parseCookies, setCookie } from './src/middleware/security.mjs';
import { getSessionUser } from './src/middleware/auth.mjs';

import { handleAuthRoutes } from './src/routes/auth.mjs';
import { handleMarketplaceRoutes } from './src/routes/marketplace.mjs';
import { handleUserPortalRoutes } from './src/routes/user-portal.mjs';
import { handleAdminRoutes } from './src/routes/admin.mjs';

import { renderShell } from './src/views/layout.mjs';
import {
  renderHomePage,
  renderFarmsPage,
  renderFarmDetailPage,
  renderManagementPage,
  renderPartnershipsPage,
  renderQuickBuyPage,
  renderQuickSellPage,
  renderSuppliersPage,
  renderHumanResourcesPage,
  renderAboutPage,
  renderContactPage,
  renderTermsPage,
  renderSignInPage,
  renderUserDashboardPage
} from './src/views/pages.mjs';
import { renderAdminDashboard } from './src/views/admin-view.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=UTF-8'
};

async function getSettingsMap() {
  const rows = (await db.query('SELECT setting_key, setting_value FROM website_settings WHERE is_public = 1')).rows;
  const map = {};
  for (const r of rows) map[r.setting_key] = r.setting_value;
  return map;
}

export async function app(req, res) {
  setSecurityHeaders(res);

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const queryParams = parsedUrl.searchParams;

  // 1. Static Asset Serving
  if (
    pathname.startsWith('/foundation/design-system/') ||
    pathname.startsWith('/foundation/layouts/') ||
    pathname.startsWith('/storage/uploads/') ||
    pathname.startsWith('/docs/')
  ) {
    const safePath = path.normalize(path.join(__dirname, pathname)).replace(/^(\.\.[\/\\])+/, '');
    if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400'
      });
      const fileData = fs.readFileSync(safePath);
      res.end(fileData);
      return;
    }
  }

  try {
    // 2. REST API Routers
    if (pathname.startsWith('/api/auth/')) {
      const handled = await handleAuthRoutes(req, res, pathname);
      if (handled) return;
    }

    if (pathname.startsWith('/api/my/')) {
      const handled = await handleUserPortalRoutes(req, res, pathname);
      if (handled) return;
    }

    if (pathname.startsWith('/api/admin/')) {
      const handled = await handleAdminRoutes(req, res, pathname);
      if (handled) return;
    }

    if (pathname.startsWith('/api/')) {
      const handled = await handleMarketplaceRoutes(req, res, pathname, queryParams);
      if (handled) return;
    }

    // 3. Root Language Redirection
    if (pathname === '/') {
      const cookies = parseCookies(req);
      const userLang = cookies.site_lang || (req.headers['accept-language']?.includes('ar') ? 'ar' : 'en');
      const targetLang = ['ar', 'en'].includes(userLang) ? userLang : 'en';
      res.writeHead(302, { Location: `/${targetLang}` });
      res.end();
      return;
    }

    // 4. Admin Dashboard Route (/admin)
    if (pathname === '/admin' || pathname === '/admin/') {
      const user = await getSessionUser(req);
      if (!user || !['super_admin', 'admin', 'editor'].includes(user.role_slug)) {
        res.writeHead(302, { Location: '/en/sign-in?redirect=/admin' });
        res.end();
        return;
      }

      const cookies = parseCookies(req);
      const adminLang = cookies.site_lang === 'ar' ? 'ar' : 'en';

      // Fetch real DB data for admin
      const totalFarms = (await db.query('SELECT COUNT(*) as count FROM farms')).rows[0]?.count || 0;
      const pendingFarms = (await db.query("SELECT COUNT(*) as count FROM farms WHERE status = 'pending_review'")).rows[0]?.count || 0;
      const approvedFarms = (await db.query("SELECT COUNT(*) as count FROM farms WHERE status = 'approved'")).rows[0]?.count || 0;
      const totalFeddans = (await db.query('SELECT SUM(area_feddan) as total FROM farms')).rows[0]?.total || 0;
      const mgmtRequestsCount = (await db.query('SELECT COUNT(*) as count FROM farm_management_requests')).rows[0]?.count || 0;
      const proposalsCount = (await db.query('SELECT COUNT(*) as count FROM farm_management_proposals')).rows[0]?.count || 0;
      const partnershipsCount = (await db.query('SELECT COUNT(*) as count FROM partnerships')).rows[0]?.count || 0;
      const quickBuyCount = (await db.query('SELECT COUNT(*) as count FROM quick_buy_requests')).rows[0]?.count || 0;
      const quickSellCount = (await db.query('SELECT COUNT(*) as count FROM quick_sell_requests')).rows[0]?.count || 0;
      const usersCount = (await db.query('SELECT COUNT(*) as count FROM users')).rows[0]?.count || 0;

      const farms = (await db.query(
        `SELECT f.*, l.name_en as gov_name_en, u.full_name as owner_name
         FROM farms f
         JOIN taxonomy_locations l ON f.governorate_id = l.id
         LEFT JOIN users u ON f.user_id = u.id
         ORDER BY f.created_at DESC`
      )).rows;

      const mgmt = (await db.query(
        `SELECT r.*, l.name_en as gov_name_en,
                (SELECT COUNT(*) FROM farm_management_proposals WHERE request_id = r.id) as proposals_count
         FROM farm_management_requests r
         JOIN taxonomy_locations l ON r.governorate_id = l.id
         ORDER BY r.created_at DESC`
      )).rows;

      const parts = (await db.query(
        `SELECT p.*, l.name_en as gov_name_en,
                (SELECT COUNT(*) FROM partnership_applications WHERE partnership_id = p.id) as applicants_count
         FROM partnerships p
         JOIN taxonomy_locations l ON p.governorate_id = l.id
         ORDER BY p.created_at DESC`
      )).rows;

      const qb = (await db.query('SELECT * FROM quick_buy_requests ORDER BY created_at DESC')).rows;
      const qs = (await db.query('SELECT * FROM quick_sell_requests ORDER BY created_at DESC')).rows;
      const allUsers = (await db.query(
        `SELECT u.*, r.slug as role_slug, r.name as role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         ORDER BY u.created_at DESC`
      )).rows;
      const allSettings = (await db.query('SELECT * FROM website_settings ORDER BY group_name, setting_key')).rows;

      const adminHtml = renderAdminDashboard({
        lang: adminLang,
        user,
        metrics: {
          totalFarms: Number(totalFarms),
          pendingFarms: Number(pendingFarms),
          approvedFarms: Number(approvedFarms),
          totalFeddans: Math.round(Number(totalFeddans)),
          mgmtRequests: Number(mgmtRequestsCount),
          proposals: Number(proposalsCount),
          partnerships: Number(partnershipsCount),
          quickBuy: Number(quickBuyCount),
          quickSell: Number(quickSellCount),
          users: Number(usersCount)
        },
        farms,
        mgmtRequests: mgmt,
        partnerships: parts,
        quickBuy: qb,
        quickSell: qs,
        users: allUsers,
        settings: allSettings
      });

      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(adminHtml);
      return;
    }

    // 5. Bilingual Public Website Router (/:lang/...)
    const langMatch = pathname.match(/^\/(ar|en)(\/.*)?$/);
    if (langMatch) {
      const lang = langMatch[1];
      const subpath = langMatch[2] || '';
      const user = await getSessionUser(req);
      const settings = await getSettingsMap();

      // Home (/:lang or /:lang/)
      if (subpath === '' || subpath === '/') {
        const locations = (await db.query('SELECT id, slug, name_en, name_ar FROM taxonomy_locations WHERE is_active = 1 ORDER BY sort_order')).rows;
        const categories = (await db.query('SELECT id, slug, name_en, name_ar FROM taxonomy_categories WHERE is_active = 1 ORDER BY sort_order')).rows;
        const farms = (await db.query(
          `SELECT f.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar,
                  (SELECT image_url FROM farm_media WHERE farm_id = f.id ORDER BY is_cover DESC LIMIT 1) as cover_image
           FROM farms f
           JOIN taxonomy_locations l ON f.governorate_id = l.id
           WHERE f.status = 'approved'
           ORDER BY f.is_featured DESC, f.created_at DESC LIMIT 6`
        )).rows;
        const suppliers = (await db.query("SELECT * FROM suppliers WHERE status = 'active' LIMIT 3")).rows;
        const hr = (await db.query("SELECT * FROM human_resources WHERE status = 'active' LIMIT 3")).rows;

        const bodyHtml = renderHomePage({ lang, farms, locations, categories, suppliers, hr, settings });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'سوق وإدارة المزارع' : 'Agricultural Marketplace', activeNav: 'home', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Farms Catalog (/:lang/farms)
      if (subpath === '/farms') {
        const locations = (await db.query('SELECT id, slug, name_en, name_ar FROM taxonomy_locations WHERE is_active = 1 ORDER BY sort_order')).rows;
        const purpose = queryParams.get('purpose') || queryParams.get('listing');
        const gov = queryParams.get('gov');
        const minArea = parseFloat(queryParams.get('minArea') || '0');
        const q = queryParams.get('q')?.trim() || '';

        let sql = `
          SELECT f.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar,
                 (SELECT image_url FROM farm_media WHERE farm_id = f.id ORDER BY is_cover DESC LIMIT 1) as cover_image
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
        if (gov && gov !== 'all') {
          sql += ` AND l.slug = $${pIdx}`;
          params.push(gov);
          pIdx++;
        }
        if (minArea > 0) {
          sql += ` AND f.area_feddan >= $${pIdx}`;
          params.push(minArea);
          pIdx++;
        }
        if (q) {
          sql += ` AND (f.title_en LIKE $${pIdx} OR f.title_ar LIKE $${pIdx} OR f.description_en LIKE $${pIdx} OR f.description_ar LIKE $${pIdx} OR f.crops LIKE $${pIdx} OR f.city_en LIKE $${pIdx} OR f.city_ar LIKE $${pIdx})`;
          params.push(`%${q}%`);
          pIdx++;
        }
        sql += ' ORDER BY f.is_featured DESC, f.created_at DESC';

        const farms = (await db.query(sql, params)).rows;
        const bodyHtml = renderFarmsPage({ lang, farms, total: farms.length, locations, filters: { purpose, gov, minArea, q } });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'المزارع المعروضة' : 'Farm Listings', activeNav: 'farms', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Single Farm Details (/:lang/farms/:slug)
      if (subpath.startsWith('/farms/')) {
        const slug = subpath.replace('/farms/', '');
        const farmRes = await db.query(
          `SELECT f.*, l.slug as gov_slug, l.name_en as gov_name_en, l.name_ar as gov_name_ar
           FROM farms f
           JOIN taxonomy_locations l ON f.governorate_id = l.id
           WHERE f.slug = $1`,
          [slug]
        );

        if (farmRes.rowCount === 0) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(renderShell({ lang, title: 'Not Found', user, settings, content: '<div class="container" style="padding-block: 4rem;"><h1>Listing Not Found</h1></div>' }));
          return;
        }

        const farm = farmRes.rows[0];
        const media = (await db.query('SELECT * FROM farm_media WHERE farm_id = $1 ORDER BY is_cover DESC, sort_order ASC', [farm.id])).rows;
        const documents = (await db.query('SELECT * FROM farm_documents WHERE farm_id = $1', [farm.id])).rows;

        const bodyHtml = renderFarmDetailPage({ lang, farm, media, documents });
        const title = lang === 'ar' ? (farm.title_ar || farm.title_en) : farm.title_en;
        const pageHtml = renderShell({ lang, title, activeNav: 'farms', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Farm Management (/:lang/management)
      if (subpath === '/management') {
        const locations = (await db.query('SELECT id, slug, name_en, name_ar FROM taxonomy_locations WHERE is_active = 1 ORDER BY sort_order')).rows;
        const requests = (await db.query(
          `SELECT r.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar,
                  (SELECT COUNT(*) FROM farm_management_proposals WHERE request_id = r.id) as proposals_count
           FROM farm_management_requests r
           JOIN taxonomy_locations l ON r.governorate_id = l.id
           WHERE r.status = 'open'
           ORDER BY r.created_at DESC`
        )).rows;

        const bodyHtml = renderManagementPage({ lang, requests, locations });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'إدارة المزارع' : 'Farm Management', activeNav: 'management', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Partnerships & Investment (/:lang/partnerships)
      if (subpath === '/partnerships') {
        const locations = (await db.query('SELECT id, slug, name_en, name_ar FROM taxonomy_locations WHERE is_active = 1 ORDER BY sort_order')).rows;
        const partnerships = (await db.query(
          `SELECT p.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar,
                  (SELECT COUNT(*) FROM partnership_applications WHERE partnership_id = p.id) as applicants_count
           FROM partnerships p
           JOIN taxonomy_locations l ON p.governorate_id = l.id
           WHERE p.status = 'active'
           ORDER BY p.created_at DESC`
        )).rows;

        const bodyHtml = renderPartnershipsPage({ lang, partnerships, locations });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'فرص الشراكة والاستثمار' : 'Partnerships & Investment', activeNav: 'partnerships', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Quick Buy (/:lang/quick-buy)
      if (subpath === '/quick-buy') {
        const locations = (await db.query('SELECT id, slug, name_en, name_ar FROM taxonomy_locations WHERE is_active = 1 ORDER BY sort_order')).rows;
        const bodyHtml = renderQuickBuyPage({ lang, locations });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'شراء سريع مع أصول' : 'Quick Buy with Assets', activeNav: 'quick-buy', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Quick Sell (/:lang/quick-sell)
      if (subpath === '/quick-sell') {
        const locations = (await db.query('SELECT id, slug, name_en, name_ar FROM taxonomy_locations WHERE is_active = 1 ORDER BY sort_order')).rows;
        const bodyHtml = renderQuickSellPage({ lang, locations });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'بيع سريع بمساعدة الإدارة' : 'Quick Sell Assisted', activeNav: 'quick-sell', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Suppliers Directory (/:lang/suppliers)
      if (subpath === '/suppliers') {
        const suppliers = (await db.query("SELECT * FROM suppliers WHERE status = 'active' ORDER BY is_verified DESC, created_at DESC")).rows;
        const categories = (await db.query("SELECT * FROM taxonomy_categories WHERE category_type = 'supplier_sector' ORDER BY sort_order")).rows;
        const bodyHtml = renderSuppliersPage({ lang, suppliers, categories });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'دليل الموردين الزراعيين' : 'Suppliers Directory', activeNav: 'suppliers', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Human Resources (/:lang/human-resources)
      if (subpath === '/human-resources') {
        const specialists = (await db.query("SELECT * FROM human_resources WHERE status = 'active' ORDER BY is_verified DESC, experience_years DESC")).rows;
        const categories = (await db.query("SELECT * FROM taxonomy_categories WHERE category_type = 'hr_specialty' ORDER BY sort_order")).rows;
        const bodyHtml = renderHumanResourcesPage({ lang, specialists, categories });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'الكوادر والخبراء الزراعيين' : 'Human Resources', activeNav: 'human-resources', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // About Us (/:lang/about)
      if (subpath === '/about') {
        const bodyHtml = renderAboutPage({ lang });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'عن المنصة' : 'About Us', activeNav: 'about', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Contact Us (/:lang/contact)
      if (subpath === '/contact') {
        const bodyHtml = renderContactPage({ lang, settings });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'اتصل بنا' : 'Contact Us', activeNav: 'contact', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Terms & Privacy (/:lang/terms)
      if (subpath === '/terms') {
        const bodyHtml = renderTermsPage({ lang });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Privacy', activeNav: 'terms', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Sign In & Register (/:lang/sign-in)
      if (subpath === '/sign-in') {
        if (user) {
          res.writeHead(302, { Location: `/${lang}/my` });
          res.end();
          return;
        }
        const bodyHtml = renderSignInPage({ lang });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'تسجيل الدخول' : 'Sign In', activeNav: 'signIn', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }

      // Personal Dashboard (/:lang/my)
      if (subpath === '/my') {
        if (!user) {
          res.writeHead(302, { Location: `/${lang}/sign-in?redirect=/${lang}/my` });
          res.end();
          return;
        }

        const farmsCount = (await db.query('SELECT COUNT(*) as count FROM farms WHERE user_id = $1', [user.id])).rows[0]?.count || 0;
        const mgmtCount = (await db.query('SELECT COUNT(*) as count FROM farm_management_requests WHERE owner_id = $1', [user.id])).rows[0]?.count || 0;
        const proposalsCount = (await db.query('SELECT COUNT(*) as count FROM farm_management_proposals WHERE manager_id = $1', [user.id])).rows[0]?.count || 0;
        const quickRequestsCount = (await db.query('SELECT COUNT(*) as count FROM quick_buy_requests WHERE user_id = $1', [user.id])).rows[0]?.count || 0;

        const myFarms = (await db.query(
          `SELECT f.*, l.name_en as gov_name_en, l.name_ar as gov_name_ar
           FROM farms f
           JOIN taxonomy_locations l ON f.governorate_id = l.id
           WHERE f.user_id = $1
           ORDER BY f.created_at DESC`,
          [user.id]
        )).rows;

        const bodyHtml = renderUserDashboardPage({
          lang,
          user,
          data: {
            stats: {
              farms: Number(farmsCount),
              managementRequests: Number(mgmtCount),
              proposals: Number(proposalsCount),
              quickRequests: Number(quickRequestsCount)
            },
            farms: myFarms
          }
        });
        const pageHtml = renderShell({ lang, title: lang === 'ar' ? 'لوحة التحكم الشخصية' : 'My Account', activeNav: 'myDashboard', user, settings, content: bodyHtml });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(pageHtml);
        return;
      }
    }

    // 404 Fallback
    res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end(renderShell({ lang: 'en', title: 'Page Not Found', content: '<div class="container" style="padding-block: 5rem; text-align: center;"><h1>404 — Page Not Found</h1><p><a href="/en">Return to Home</a></p></div>' }));

  } catch (err) {
    console.error('[Server Error]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
}

export const server = http.createServer(app);

// Startup function
export async function startServer() {
  await runMigrations();

  return new Promise((resolve) => {
    server.listen(config.port, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🌾 FARMINN Platform running at: http://localhost:${config.port}`);
      console.log(`   Arabic interface:   http://localhost:${config.port}/ar`);
      console.log(`   English interface:  http://localhost:${config.port}/en`);
      console.log(`   Admin Dashboard:    http://localhost:${config.port}/admin`);
      console.log(`   Database Driver:    ${db.driver ? db.driver.toUpperCase() : 'UNKNOWN'}`);
      console.log(`======================================================\n`);
      resolve(server);
    });
  });
}

// Only start listening when not in a serverless function environment AND executed directly as main script
const isMainScript = Boolean(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url));
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (isMainScript && !isServerless) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
