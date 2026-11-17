import { escapeHtml } from '../../foundation/security/input-sanitizer.mjs';

export function renderShell({ lang = 'en', title = 'FARMINN', activeNav = '', user = null, settings = {}, content = '' }) {
  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const otherLang = isRtl ? 'en' : 'ar';
  const otherLangLabel = isRtl ? 'English' : 'العربية';

  const brandName = isRtl ? (settings.site_name_ar || 'فارم إن') : (settings.site_name || 'FARMINN');
  const tagline = isRtl
    ? (settings.site_tagline_ar || 'المنصة الزراعية المتكاملة لسوق وإدارة المزارع')
    : (settings.site_tagline_en || 'Egypt Premier Agricultural Marketplace & Farm Management Platform');

  const phone = settings.contact_phone || '+201004491026';
  const whatsapp = settings.whatsapp_number || '+201004491026';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const email = settings.contact_email || 'info@farminn.com';
  const address = isRtl ? (settings.address_ar || 'طريق مصر إسكندرية الصحراوي، مصر') : (settings.address_en || 'Cairo-Alexandria Desert Road, Egypt');

  const navItems = [
    { key: 'farms', href: `/${lang}/farms`, label: isRtl ? 'المزارع' : 'Farms' },
    { key: 'management', href: `/${lang}/management`, label: isRtl ? 'إدارة المزارع' : 'Management' },
    { key: 'partnerships', href: `/${lang}/partnerships`, label: isRtl ? 'الشراكات والاستثمار' : 'Partnerships' },
    { key: 'quick-buy', href: `/${lang}/quick-buy`, label: isRtl ? 'شراء سريع' : 'Quick Buy' },
    { key: 'quick-sell', href: `/${lang}/quick-sell`, label: isRtl ? 'بيع سريع' : 'Quick Sell' },
    { key: 'suppliers', href: `/${lang}/suppliers`, label: isRtl ? 'الموردين' : 'Suppliers' },
    { key: 'human-resources', href: `/${lang}/human-resources`, label: isRtl ? 'الكوادر الزراعية' : 'Human Resources' }
  ];

  const userActionHtml = user
    ? `
      <div class="user-menu-pill">
        <a href="/${lang}/my" class="btn btn--sm btn--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          ${isRtl ? 'حسابي' : 'My Account'}
        </a>
        ${['super_admin', 'admin', 'editor'].includes(user.role_slug) ? `
          <a href="/admin" class="btn btn--sm btn--secondary" style="margin-inline-start: 6px;">
            ${isRtl ? 'لوحة الإدارة' : 'Admin'}
          </a>
        ` : ''}
        <button type="button" class="btn btn--sm btn--ghost" id="logout-btn" style="margin-inline-start: 6px;" title="${isRtl ? 'تسجيل الخروج' : 'Sign Out'}">
          ${isRtl ? 'خروج' : 'Logout'}
        </button>
      </div>
    `
    : `
      <a href="/${lang}/sign-in" class="btn btn--sm btn--primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        ${isRtl ? 'تسجيل الدخول' : 'Sign In'}
      </a>
    `;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} · ${escapeHtml(brandName)}</title>
  <meta name="description" content="${escapeHtml(tagline)}">
  
  <!-- Design System -->
  <link rel="stylesheet" href="/foundation/design-system/tokens.css">
  <link rel="stylesheet" href="/foundation/design-system/base.css">
  <link rel="stylesheet" href="/foundation/design-system/components.css">
  
  <!-- Web Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    /* FARMINN Agricultural Polish */
    :root {
      --header-height: 72px;
    }
    .farminn-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--color-border);
      block-size: var(--header-height);
    }
    .farminn-nav-list {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .farminn-nav-link {
      font-weight: 600;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      transition: color 0.15s ease;
      white-space: nowrap;
      text-decoration: none;
      padding: 0.5rem 0.25rem;
    }
    .farminn-nav-link:hover,
    .farminn-nav-link[aria-current="page"] {
      color: var(--color-primary);
      text-decoration: none;
    }
    .farminn-nav-link[aria-current="page"] {
      border-bottom: 2px solid var(--color-primary);
    }
    .lang-switcher-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-primary);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 6px 14px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .lang-switcher-btn:hover {
      background: var(--color-primary-soft);
      border-color: var(--color-primary);
      text-decoration: none;
    }
    .farminn-footer {
      background: #132a13;
      color: #e2ede2;
      padding-block: var(--space-12) var(--space-6);
      border-top: 4px solid var(--color-accent);
      margin-block-start: var(--space-16);
    }
    .farminn-footer a {
      color: #b7d5b7;
      text-decoration: none;
    }
    .farminn-footer a:hover {
      color: #ffffff;
      text-decoration: underline;
    }
    .hero-search-box {
      background: #ffffff;
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      box-shadow: 0 20px 40px -15px rgba(27, 67, 50, 0.15);
      border: 1px solid var(--color-border);
    }
    .farm-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
    }
    .farm-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 32px -8px rgba(27, 67, 50, 0.12);
      border-color: var(--color-border-strong);
    }
    .farm-card__image-wrap {
      position: relative;
      aspect-ratio: 16 / 10;
      background: #e7ece7;
      overflow: hidden;
    }
    .farm-card__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .farm-card:hover .farm-card__image {
      transform: scale(1.03);
    }
    .farm-card__badge-purpose {
      position: absolute;
      top: 12px;
      inset-inline-start: 12px;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .purpose--sale { background: #1b4332; color: #ffffff; }
    .purpose--rent { background: #d97706; color: #ffffff; }
    .purpose--both { background: #0369a1; color: #ffffff; }
    .spec-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      background: var(--color-surface-alt);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }
    .whatsapp-btn {
      background: #25d366;
      color: #ffffff;
      font-weight: 700;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .whatsapp-btn:hover {
      background: #1ebe5d;
      color: #ffffff;
      text-decoration: none;
    }
    @media (max-width: 900px) {
      .farminn-nav-list { display: none; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="farminn-header">
    <div class="container cluster" style="justify-content: space-between; height: 100%;">
      <!-- Brand Logo -->
      <a href="/${lang}" class="cluster" style="text-decoration: none; gap: 10px;">
        <span style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: var(--color-primary); color: #fff; border-radius: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
          </svg>
        </span>
        <div>
          <span style="font-size: 1.45rem; font-weight: 800; color: var(--color-secondary); letter-spacing: -0.02em; display: block; line-height: 1;">
            ${escapeHtml(brandName)}
          </span>
          <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600; display: block; margin-top: 2px;">
            ${isRtl ? 'سوق وإدارة المزارع' : 'Farms Marketplace & Management'}
          </span>
        </div>
      </a>

      <!-- Desktop Navigation -->
      <nav aria-label="Main Navigation">
        <ul class="farminn-nav-list">
          ${navItems.map(item => `
            <li>
              <a href="${item.href}" class="farminn-nav-link" ${activeNav === item.key ? 'aria-current="page"' : ''}>
                ${escapeHtml(item.label)}
              </a>
            </li>
          `).join('')}
        </ul>
      </nav>

      <!-- Right Controls: Language & Account -->
      <div class="cluster" style="gap: 12px;">
        <a href="javascript:void(0)" class="lang-switcher-btn" id="lang-switch-btn" data-target-lang="${otherLang}">
          ${otherLangLabel}
        </a>
        ${userActionHtml}
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main id="main-content">
    ${content}
  </main>

  <!-- Footer -->
  <footer class="farminn-footer">
    <div class="container stack" style="gap: var(--space-8);">
      <div class="grid grid--cols-4" style="gap: var(--space-6);">
        <!-- Column 1: Brand -->
        <div class="stack" style="gap: var(--space-3);">
          <strong style="font-size: 1.5rem; color: #ffffff;">${escapeHtml(brandName)}</strong>
          <p style="font-size: 0.9rem; line-height: 1.6; color: #c0d8c0;">
            ${escapeHtml(tagline)}
          </p>
          <div class="cluster" style="gap: 10px; margin-top: 4px;">
            <a href="https://wa.me/${cleanWhatsapp}" target="_blank" rel="noopener" class="whatsapp-btn btn btn--sm" style="border-radius: 6px; padding: 6px 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
              ${whatsapp}
            </a>
          </div>
        </div>

        <!-- Column 2: Marketplace Modules -->
        <div class="stack" style="gap: var(--space-2);">
          <strong style="color: #ffffff; font-size: 1rem; border-bottom: 2px solid var(--color-accent); padding-bottom: 6px; display: inline-block;">
            ${isRtl ? 'أقسام المنصة' : 'Platform Modules'}
          </strong>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem;">
            <li><a href="/${lang}/farms?listing=sale">${isRtl ? 'مزارع للبيع' : 'Farms for Sale'}</a></li>
            <li><a href="/${lang}/farms?listing=rent">${isRtl ? 'مزارع للإيجار' : 'Farms for Rent'}</a></li>
            <li><a href="/${lang}/management">${isRtl ? 'سوق إدارة وتشغيل المزارع' : 'Farm Management'}</a></li>
            <li><a href="/${lang}/partnerships">${isRtl ? 'فرص الشراكة والاستثمار' : 'Joint Ventures & Investment'}</a></li>
            <li><a href="/${lang}/quick-buy">${isRtl ? 'شراء سريع مع أصول' : 'Quick Buy with Assets'}</a></li>
            <li><a href="/${lang}/quick-sell">${isRtl ? 'بيع سريع مع تسهيلات' : 'Quick Sell Assisted'}</a></li>
          </ul>
        </div>

        <!-- Column 3: Agricultural Directory -->
        <div class="stack" style="gap: var(--space-2);">
          <strong style="color: #ffffff; font-size: 1rem; border-bottom: 2px solid var(--color-accent); padding-bottom: 6px; display: inline-block;">
            ${isRtl ? 'الخدمات والدليل' : 'Directories'}
          </strong>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem;">
            <li><a href="/${lang}/suppliers">${isRtl ? 'دليل شركات الموردين' : 'Suppliers Directory'}</a></li>
            <li><a href="/${lang}/human-resources">${isRtl ? 'الكوادر والمهندسين الزراعيين' : 'Agronomists & Experts'}</a></li>
            <li><a href="/${lang}/about">${isRtl ? 'عن منصة فارم إن' : 'About FARMINN'}</a></li>
            <li><a href="/${lang}/contact">${isRtl ? 'اتصل بنا والمعاينة' : 'Contact & Inspection'}</a></li>
            <li><a href="/${lang}/terms">${isRtl ? 'الشروط والأحكام والخصوصية' : 'Terms & Privacy'}</a></li>
          </ul>
        </div>

        <!-- Column 4: Contact & Office -->
        <div class="stack" style="gap: var(--space-2);">
          <strong style="color: #ffffff; font-size: 1rem; border-bottom: 2px solid var(--color-accent); padding-bottom: 6px; display: inline-block;">
            ${isRtl ? 'بيانات التواصل' : 'Headquarters'}
          </strong>
          <p style="font-size: 0.88rem; color: #c0d8c0; line-height: 1.6; margin: 0;">
            <strong>${isRtl ? 'العنوان:' : 'Address:'}</strong><br>
            ${escapeHtml(address)}
          </p>
          <p style="font-size: 0.88rem; color: #c0d8c0; line-height: 1.6; margin: 0;">
            <strong>${isRtl ? 'البريد:' : 'Email:'}</strong> ${escapeHtml(email)}<br>
            <strong>${isRtl ? 'الهاتف:' : 'Phone:'}</strong> ${escapeHtml(phone)}
          </p>
          <p style="font-size: 0.82rem; color: #8ba98b; margin: 0;">
            ${isRtl ? (settings.working_hours_ar || 'الأحد – الخميس 9:00 ص – 6:00 م') : (settings.working_hours_en || 'Sun – Thu 9:00 AM – 6:00 PM')}
          </p>
        </div>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-4); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #8ba98b;">
        <span>&copy; ${new Date().getFullYear()} ${escapeHtml(brandName)}. ${isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</span>
        <span>${isRtl ? 'المنصة تدعم اللغتين: العربية والإنجليزية' : 'Supported Languages: Arabic & English'}</span>
      </div>
    </div>
  </footer>

  <!-- Script for Language Switch & Logout -->
  <script>
    // Language Switcher preserving path
    document.getElementById('lang-switch-btn')?.addEventListener('click', function() {
      const targetLang = this.getAttribute('data-target-lang');
      const currentPath = window.location.pathname;
      let newPath = currentPath;
      if (currentPath.startsWith('/en')) {
        newPath = currentPath.replace(/^\\/en/, '/' + targetLang);
      } else if (currentPath.startsWith('/ar')) {
        newPath = currentPath.replace(/^\\/ar/, '/' + targetLang);
      } else {
        newPath = '/' + targetLang;
      }
      document.cookie = 'site_lang=' + targetLang + '; path=/; max-age=31536000';
      window.location.href = newPath + window.location.search;
    });

    // Logout Button
    document.getElementById('logout-btn')?.addEventListener('click', async function() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/${lang}';
      } catch (e) {
        window.location.reload();
      }
    });
  </script>
</body>
</html>`;
}

