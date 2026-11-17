import { escapeHtml } from '../../foundation/security/input-sanitizer.mjs';

function formatNumber(num) {
  if (!num) return '0';
  return Number(num).toLocaleString('en-US');
}

export function renderAdminDashboard({ lang = 'en', user, metrics = {}, farms = [], mgmtRequests = [], partnerships = [], quickBuy = [], quickSell = [], users = [], settings = [] }) {
  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  // Group settings
  const settingsMap = {};
  for (const s of settings) settingsMap[s.setting_key] = s.setting_value;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isRtl ? 'لوحة تحكم إدارة منصة فارمين' : 'FARMINN Admin Dashboard'}</title>
  <link rel="stylesheet" href="/foundation/design-system/tokens.css">
  <link rel="stylesheet" href="/foundation/design-system/base.css">
  <link rel="stylesheet" href="/foundation/design-system/components.css">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    .admin-layout {
      display: flex;
      min-block-size: 100dvh;
    }
    .admin-sidebar {
      inline-size: 270px;
      background: #111d13;
      color: #e5ede5;
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      flex-shrink: 0;
      border-inline-end: 1px solid #1f3322;
    }
    .admin-nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #b0c7b0;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .admin-nav-link:hover,
    .admin-nav-link.active {
      background: var(--color-primary);
      color: #ffffff;
      text-decoration: none;
    }
    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--color-bg);
      min-inline-size: 0;
    }
    .admin-topbar {
      block-size: 64px;
      background: #ffffff;
      border-bottom: 1px solid var(--color-border);
      padding-inline: var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .admin-content {
      padding: var(--space-6);
      flex: 1;
      overflow-y: auto;
    }
    .metric-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      border-top: 4px solid var(--color-primary);
    }
    .tab-section {
      display: none;
    }
    .tab-section.active {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }
  </style>
</head>
<body>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div style="padding-bottom: var(--space-4); border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: var(--space-2);">
        <strong style="font-size: 1.3rem; color: #fff; display: block;">FARMINN</strong>
        <span style="font-size: 0.75rem; color: #8ba98b; font-weight: 600;">
          ${isRtl ? 'لوحة الإدارة المركزية' : 'Central Admin System'}
        </span>
      </div>

      <span style="font-size: 0.72rem; color: #6d886d; font-weight: 700; text-transform: uppercase; padding: 4px 10px;">
        ${isRtl ? 'الرئيسية والإحصاءات' : 'Core & Stats'}
      </span>
      <a class="admin-nav-link active" data-tab="overview">
        📊 ${isRtl ? 'الإحصاءات والعمليات' : 'Overview & Real DB Stats'}
      </a>

      <span style="font-size: 0.72rem; color: #6d886d; font-weight: 700; text-transform: uppercase; padding: 4px 10px; margin-top: 8px;">
        ${isRtl ? 'إدارة أقسام المنصة' : 'Marketplace Modules'}
      </span>
      <a class="admin-nav-link" data-tab="farms">
        🌾 ${isRtl ? 'المزارع المعروضة' : 'Farm Listings'}
        ${metrics.pendingFarms > 0 ? `<span class="badge badge--warning" style="margin-inline-start: auto; font-size: 0.7rem;">${metrics.pendingFarms}</span>` : ''}
      </a>
      <a class="admin-nav-link" data-tab="management">
        📋 ${isRtl ? 'طلبات وعروض الإدارة' : 'Farm Management'}
      </a>
      <a class="admin-nav-link" data-tab="partnerships">
        🤝 ${isRtl ? 'فرص الشراكة والاستثمار' : 'Partnerships'}
      </a>
      <a class="admin-nav-link" data-tab="quick-requests">
        ⚡ ${isRtl ? 'طلبات الشراء والبيع السريع' : 'Quick Buy / Sell'}
      </a>
      <a class="admin-nav-link" data-tab="users">
        👥 ${isRtl ? 'المستخدمين والحسابات' : 'User Accounts & Roles'}
      </a>

      <span style="font-size: 0.72rem; color: #6d886d; font-weight: 700; text-transform: uppercase; padding: 4px 10px; margin-top: 8px;">
        ${isRtl ? 'الإعدادات العامة' : 'Configuration'}
      </span>
      <a class="admin-nav-link" data-tab="website-settings">
        ⚙️ ${isRtl ? 'إعدادات الموقع المركزية' : 'Website Settings'}
      </a>

      <div style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-3);">
        <a href="/${lang}" class="admin-nav-link" style="color: #c4d7c4;">
          🌐 ${isRtl ? 'العودة للموقع العام' : 'Public Website'}
        </a>
      </div>
    </aside>

    <!-- Main -->
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="cluster" style="gap: 12px;">
          <strong id="section-title" style="font-size: 1.15rem; color: var(--color-secondary);">
            ${isRtl ? 'نظرة عامة وإحصاءات حقيقية' : 'Platform Overview & Database Metrics'}
          </strong>
          <span class="badge badge--success" style="font-size: 0.75rem;">
            ● ${isRtl ? 'قاعدة بيانات متصلة' : 'Live DB Connected'}
          </span>
        </div>

        <div class="cluster" style="gap: 12px;">
          <span style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-secondary);">
            ${escapeHtml(user.full_name)} (${user.role_name || user.role_slug})
          </span>
          <button type="button" class="btn btn--sm btn--ghost" id="admin-logout-btn">
            ${isRtl ? 'خروج' : 'Logout'}
          </button>
        </div>
      </header>

      <div class="admin-content">
        <!-- 1. TAB: OVERVIEW (Real DB Metrics) -->
        <section id="tab-overview" class="tab-section active">
          <div class="grid grid--cols-4" style="gap: var(--space-4);">
            <div class="metric-card">
              <div style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">
                ${isRtl ? 'إجمالي المزارع المسجلة' : 'Total Farms'}
              </div>
              <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary); margin-top: 4px;">
                ${formatNumber(metrics.totalFarms)}
              </div>
              <div style="font-size: 0.75rem; color: #15803d; margin-top: 4px;">
                ✔ ${metrics.approvedFarms} ${isRtl ? 'معتمدة ومنشورة' : 'Approved & Published'}
              </div>
            </div>

            <div class="metric-card" style="border-top-color: var(--color-accent);">
              <div style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">
                ${isRtl ? 'مزارع بانتظار المراجعة' : 'Pending Review'}
              </div>
              <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); margin-top: 4px;">
                ${formatNumber(metrics.pendingFarms)}
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">
                ${isRtl ? 'تتطلب فحص الأوراق والموافقة' : 'Requires review & approval'}
              </div>
            </div>

            <div class="metric-card" style="border-top-color: #0369a1;">
              <div style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">
                ${isRtl ? 'إجمالي الأفدنة بالمنصة' : 'Total Feddans'}
              </div>
              <div style="font-size: 2.2rem; font-weight: 800; color: #0369a1; margin-top: 4px;">
                ${formatNumber(metrics.totalFeddans)}
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">
                ${isRtl ? 'خاضعة للإشراف والإدارة' : 'Under management/sale'}
              </div>
            </div>

            <div class="metric-card" style="border-top-color: #7c3aed;">
              <div style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">
                ${isRtl ? 'حسابات المستخدمين' : 'Registered Users'}
              </div>
              <div style="font-size: 2.2rem; font-weight: 800; color: #7c3aed; margin-top: 4px;">
                ${formatNumber(metrics.users)}
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">
                ${isRtl ? 'ملاك، مشترين، ومديرون' : 'Owners, buyers & managers'}
              </div>
            </div>
          </div>

          <!-- Secondary Metrics -->
          <div class="grid grid--cols-4" style="gap: var(--space-4);">
            <div class="card" style="padding: var(--space-4); text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-secondary);">${metrics.mgmtRequests || 0}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">${isRtl ? 'طلبات إدارة مزارع' : 'Mgmt Requests'}</div>
            </div>
            <div class="card" style="padding: var(--space-4); text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-secondary);">${metrics.proposals || 0}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">${isRtl ? 'عروض تشغيل مقدمة' : 'Manager Proposals'}</div>
            </div>
            <div class="card" style="padding: var(--space-4); text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-secondary);">${metrics.partnerships || 0}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">${isRtl ? 'فرص استثمار وشراكة' : 'Partnership Deals'}</div>
            </div>
            <div class="card" style="padding: var(--space-4); text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-secondary);">${(metrics.quickBuy || 0) + (metrics.quickSell || 0)}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">${isRtl ? 'طلبات بيع/شراء سريع' : 'Quick Requests'}</div>
            </div>
          </div>
        </section>

        <!-- 2. TAB: FARMS MANAGEMENT -->
        <section id="tab-farms" class="tab-section">
          <div class="card stack" style="padding: var(--space-6); gap: var(--space-4); background: #ffffff;">
            <div class="cluster" style="justify-content: space-between;">
              <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0;">
                ${isRtl ? 'إدارة واعتماد المزارع' : 'Farm Listings Moderation'}
              </h2>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>${isRtl ? 'المزرعة' : 'Farm'}</th>
                  <th>${isRtl ? 'المحافظة' : 'Governorate'}</th>
                  <th>${isRtl ? 'المساحة' : 'Area'}</th>
                  <th>${isRtl ? 'السعر' : 'Price'}</th>
                  <th>${isRtl ? 'الحالة' : 'Status'}</th>
                  <th>${isRtl ? 'مميزة' : 'Featured'}</th>
                  <th>${isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                ${farms.map(f => `
                  <tr>
                    <td>
                      <strong>${escapeHtml(isRtl ? (f.title_ar || f.title_en) : f.title_en)}</strong>
                      <div style="font-size: 0.75rem; color: var(--color-text-muted);">
                        ${f.purpose.toUpperCase()} · ${f.owner_name || 'Admin'}
                      </div>
                    </td>
                    <td>${escapeHtml(f.gov_name_en)}</td>
                    <td>${f.area_feddan} feddan</td>
                    <td>${formatNumber(f.price)} EGP</td>
                    <td>
                      <span class="badge ${f.status === 'approved' ? 'badge--success' : f.status === 'pending_review' ? 'badge--warning' : 'badge--danger'}">
                        ${f.status}
                      </span>
                    </td>
                    <td>${f.is_featured ? '★ Yes' : 'No'}</td>
                    <td>
                      <div class="cluster" style="gap: 4px;">
                        ${f.status !== 'approved' ? `
                          <button type="button" class="btn btn--sm btn--primary change-farm-status-btn" data-id="${f.id}" data-status="approved">
                            ${isRtl ? 'اعتماد' : 'Approve'}
                          </button>
                        ` : `
                          <button type="button" class="btn btn--sm btn--outline change-farm-status-btn" data-id="${f.id}" data-status="suspended">
                            ${isRtl ? 'إيقاف' : 'Suspend'}
                          </button>
                        `}
                        <button type="button" class="btn btn--sm btn--ghost toggle-featured-btn" data-id="${f.id}" data-featured="${f.is_featured ? '0' : '1'}">
                          ${f.is_featured ? (isRtl ? 'إلغاء التمييز' : 'Unfeature') : (isRtl ? 'تمييز ★' : 'Feature')}
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <!-- 3. TAB: MANAGEMENT REQUESTS -->
        <section id="tab-management" class="tab-section">
          <div class="card stack" style="padding: var(--space-6); gap: var(--space-4); background: #ffffff;">
            <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0;">
              ${isRtl ? 'طلبات إدارة المزارع المقدمة' : 'Farm Management Requests & Proposals'}
            </h2>
            <table class="table">
              <thead>
                <tr>
                  <th>${isRtl ? 'العنوان' : 'Title'}</th>
                  <th>${isRtl ? 'المحافظة' : 'Location'}</th>
                  <th>${isRtl ? 'المساحة' : 'Area'}</th>
                  <th>${isRtl ? 'المسؤول' : 'Contact'}</th>
                  <th>${isRtl ? 'العروض' : 'Proposals'}</th>
                  <th>${isRtl ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                ${mgmtRequests.map(r => `
                  <tr>
                    <td><strong>${escapeHtml(r.title_en)}</strong></td>
                    <td>${escapeHtml(r.gov_name_en)}</td>
                    <td>${r.area_feddan} Feddan</td>
                    <td>${escapeHtml(r.contact_name)} (${r.contact_phone})</td>
                    <td><span class="badge badge--info">${r.proposals_count}</span></td>
                    <td><span class="badge badge--success">${r.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <!-- 4. TAB: PARTNERSHIPS -->
        <section id="tab-partnerships" class="tab-section">
          <div class="card stack" style="padding: var(--space-6); gap: var(--space-4); background: #ffffff;">
            <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0;">
              ${isRtl ? 'فرص الشراكة والاستثمار الزراعي' : 'Partnership Opportunities'}
            </h2>
            <table class="table">
              <thead>
                <tr>
                  <th>${isRtl ? 'المشروع' : 'Title'}</th>
                  <th>${isRtl ? 'رأس المال المطلوب' : 'Capital'}</th>
                  <th>${isRtl ? 'الحصة' : 'Equity'}</th>
                  <th>${isRtl ? 'المسؤول' : 'Contact'}</th>
                  <th>${isRtl ? 'المتقدمين' : 'Applicants'}</th>
                  <th>${isRtl ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                ${partnerships.map(p => `
                  <tr>
                    <td><strong>${escapeHtml(p.title_en)}</strong></td>
                    <td>${formatNumber(p.required_capital)} EGP</td>
                    <td>${p.equity_share_percent}%</td>
                    <td>${escapeHtml(p.contact_name)}</td>
                    <td><span class="badge badge--info">${p.applicants_count}</span></td>
                    <td><span class="badge badge--success">${p.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <!-- 5. TAB: QUICK REQUESTS -->
        <section id="tab-quick-requests" class="tab-section">
          <div class="grid grid--cols-2" style="gap: var(--space-6);">
            <div class="card stack" style="padding: var(--space-5); gap: var(--space-4); background: #ffffff;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0;">${isRtl ? 'طلبات الشراء السريع (كاش ومبادلة)' : 'Quick Buy Requests'}</h3>
              <table class="table" style="font-size: 0.85rem;">
                <thead>
                  <tr>
                    <th>${isRtl ? 'المشتري' : 'Buyer'}</th>
                    <th>${isRtl ? 'السيولة' : 'Cash'}</th>
                    <th>${isRtl ? 'المبادلة' : 'Trade Asset'}</th>
                    <th>${isRtl ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${quickBuy.map(q => `
                    <tr>
                      <td><strong>${escapeHtml(q.full_name)}</strong><br>${escapeHtml(q.phone)}</td>
                      <td>${formatNumber(q.available_cash)} EGP</td>
                      <td>${escapeHtml(q.exchange_asset_type)}</td>
                      <td><span class="badge badge--info">${q.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="card stack" style="padding: var(--space-5); gap: var(--space-4); background: #ffffff;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0;">${isRtl ? 'طلبات البيع السريع (تسهيلات وتقسيط)' : 'Quick Sell Requests'}</h3>
              <table class="table" style="font-size: 0.85rem;">
                <thead>
                  <tr>
                    <th>${isRtl ? 'المزرعة' : 'Farm'}</th>
                    <th>${isRtl ? 'المالك' : 'Owner'}</th>
                    <th>${isRtl ? 'السعر' : 'Asking Price'}</th>
                    <th>${isRtl ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${quickSell.map(q => `
                    <tr>
                      <td><strong>${escapeHtml(q.farm_name)}</strong><br>${q.area_feddan} feddan</td>
                      <td>${escapeHtml(q.full_name)}<br>${escapeHtml(q.phone)}</td>
                      <td>${formatNumber(q.asking_price)} EGP</td>
                      <td><span class="badge badge--warning">${q.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 6. TAB: USER ACCOUNTS -->
        <section id="tab-users" class="tab-section">
          <div class="card stack" style="padding: var(--space-6); gap: var(--space-4); background: #ffffff;">
            <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0;">
              ${isRtl ? 'إدارة المستخدمين والأدوار' : 'User Accounts & Roles'}
            </h2>
            <table class="table">
              <thead>
                <tr>
                  <th>${isRtl ? 'المستخدم' : 'User'}</th>
                  <th>${isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th>${isRtl ? 'الهاتف' : 'Mobile'}</th>
                  <th>${isRtl ? 'نوع الحساب' : 'Account Type'}</th>
                  <th>${isRtl ? 'الدور' : 'Role'}</th>
                  <th>${isRtl ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td><strong>${escapeHtml(u.full_name)}</strong></td>
                    <td>${escapeHtml(u.email)}</td>
                    <td>${escapeHtml(u.mobile_number || '—')}</td>
                    <td><span class="badge badge--info">${u.account_type}</span></td>
                    <td><strong>${escapeHtml(u.role_name || u.role_slug)}</strong></td>
                    <td><span class="badge badge--success">${u.is_active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <!-- 7. TAB: CENTRALIZED WEBSITE SETTINGS -->
        <section id="tab-website-settings" class="tab-section">
          <div class="card stack" style="padding: var(--space-8); gap: var(--space-5); background: #ffffff; max-inline-size: 800px;">
            <div>
              <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--color-secondary); margin: 0 0 4px;">
                ${isRtl ? 'إعدادات المنصة المركزية' : 'Centralized Website Settings'}
              </h2>
              <p style="color: var(--color-text-muted); margin: 0; font-size: 0.9rem;">
                ${isRtl ? 'التعديلات المحفوظة هنا تُحدَّث في قاعدة البيانات وتظهر فوراً على الواجهة العامة للموقع.' : 'All changes saved here persist directly to the PostgreSQL database and immediately govern the public headers, footers, and contact details.'}
              </p>
            </div>

            <form id="website-settings-form" class="stack" style="gap: var(--space-4);">
              <div class="grid grid--cols-2" style="gap: var(--space-4);">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'اسم المنصة (إنجليزي)' : 'Platform Name (English)'}</label>
                  <input type="text" name="site_name" value="${escapeHtml(settingsMap.site_name || 'FARMINN')}" class="form-control">
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'اسم المنصة (عربي)' : 'Platform Name (Arabic)'}</label>
                  <input type="text" name="site_name_ar" value="${escapeHtml(settingsMap.site_name_ar || 'فارمين')}" class="form-control">
                </div>
              </div>

              <div class="grid grid--cols-2" style="gap: var(--space-4);">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'الشعار النصي (إنجليزي)' : 'Tagline (English)'}</label>
                  <input type="text" name="site_tagline_en" value="${escapeHtml(settingsMap.site_tagline_en || '')}" class="form-control">
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'الشعار النصي (عربي)' : 'Tagline (Arabic)'}</label>
                  <input type="text" name="site_tagline_ar" value="${escapeHtml(settingsMap.site_tagline_ar || '')}" class="form-control">
                </div>
              </div>

              <div class="grid grid--cols-2" style="gap: var(--space-4);">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'رقم الواتساب الرسمي' : 'Official WhatsApp Number'}</label>
                  <input type="text" name="whatsapp_number" value="${escapeHtml(settingsMap.whatsapp_number || '+20 100 234 5678')}" class="form-control">
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'هاتف الاتصال' : 'Public Phone Number'}</label>
                  <input type="text" name="contact_phone" value="${escapeHtml(settingsMap.contact_phone || '+20 100 234 5678')}" class="form-control">
                </div>
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label">${isRtl ? 'البريد الإلكتروني الرسمي' : 'Official Contact Email'}</label>
                <input type="email" name="contact_email" value="${escapeHtml(settingsMap.contact_email || 'info@farminn.com')}" class="form-control">
              </div>

              <div class="grid grid--cols-2" style="gap: var(--space-4);">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'العنوان الميداني (إنجليزي)' : 'Office Address (English)'}</label>
                  <input type="text" name="address_en" value="${escapeHtml(settingsMap.address_en || '')}" class="form-control">
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'العنوان الميداني (عربي)' : 'Office Address (Arabic)'}</label>
                  <input type="text" name="address_ar" value="${escapeHtml(settingsMap.address_ar || '')}" class="form-control">
                </div>
              </div>

              <div class="grid grid--cols-2" style="gap: var(--space-4);">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'مواعيد العمل (إنجليزي)' : 'Working Hours (English)'}</label>
                  <input type="text" name="working_hours_en" value="${escapeHtml(settingsMap.working_hours_en || '')}" class="form-control">
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">${isRtl ? 'مواعيد العمل (عربي)' : 'Working Hours (Arabic)'}</label>
                  <input type="text" name="working_hours_ar" value="${escapeHtml(settingsMap.working_hours_ar || '')}" class="form-control">
                </div>
              </div>

              <button type="submit" class="btn btn--primary" style="height: 46px; font-weight: 700; margin-top: 8px;">
                ${isRtl ? 'حفظ إعدادات الموقع' : 'Save Website Settings'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  </div>

  <script>
    // Tab switching
    const navLinks = document.querySelectorAll('.admin-nav-link[data-tab]');
    const tabSections = document.querySelectorAll('.tab-section');
    const sectionTitle = document.getElementById('section-title');

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        tabSections.forEach(s => s.classList.remove('active'));

        link.classList.add('active');
        const tabId = link.getAttribute('data-tab');
        document.getElementById('tab-' + tabId)?.classList.add('active');
        sectionTitle.innerText = link.innerText.trim();
      });
    });

    // Farm status update
    document.querySelectorAll('.change-farm-status-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        const status = this.getAttribute('data-status');
        try {
          const res = await fetch('/api/admin/farms/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          if (res.ok) window.location.reload();
        } catch (e) {
          alert('Error: ' + e.message);
        }
      });
    });

    // Toggle featured
    document.querySelectorAll('.toggle-featured-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        const isFeatured = this.getAttribute('data-featured') === '1';
        try {
          const res = await fetch('/api/admin/farms/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFeatured })
          });
          if (res.ok) window.location.reload();
        } catch (e) {
          alert('Error: ' + e.message);
        }
      });
    });

    // Save Website Settings
    document.getElementById('website-settings-form')?.addEventListener('submit', async function(e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(this).entries());
      try {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const resData = await res.json();
        if (res.ok) {
          alert('${isRtl ? 'تم حفظ إعدادات الموقع وتحديثها بنجاح' : 'Website settings updated successfully'}');
          window.location.reload();
        } else {
          alert(resData.error || 'Failed to update settings');
        }
      } catch (err) {
        alert(err.message);
      }
    });

    // Admin Logout
    document.getElementById('admin-logout-btn')?.addEventListener('click', async function() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/${lang}';
    });
  </script>
</body>
</html>`;
}

