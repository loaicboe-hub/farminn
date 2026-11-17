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
    { key: 'farms', href: `/${lang}/farms`, label: isRtl ? 'المزارع' : 'Farms', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>' },
    { key: 'management', href: `/${lang}/management`, label: isRtl ? 'إدارة المزارع' : 'Farm Management', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>' },
    { key: 'partnerships', href: `/${lang}/partnerships`, label: isRtl ? 'الشراكات والاستثمار' : 'Joint Ventures & Capital', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>' },
    { key: 'quick-buy', href: `/${lang}/quick-buy`, label: isRtl ? 'شراء سريع' : 'Quick Buy', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>' },
    { key: 'quick-sell', href: `/${lang}/quick-sell`, label: isRtl ? 'بيع سريع' : 'Quick Sell', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>' },
    { key: 'suppliers', href: `/${lang}/suppliers`, label: isRtl ? 'الموردين' : 'Suppliers', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>' },
    { key: 'human-resources', href: `/${lang}/human-resources`, label: isRtl ? 'الكوادر الزراعية' : 'Human Resources', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>' }
  ];

  const userActionHtml = user
    ? `
      <div class="user-menu-pill" style="display: flex; align-items: center; gap: 4px;">
        <a href="/${lang}/my" class="btn btn--sm btn--primary header-btn" title="${isRtl ? 'حسابي' : 'My Account'}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span class="user-btn-label">${isRtl ? 'حسابي' : 'Account'}</span>
        </a>
        ${['super_admin', 'admin', 'editor'].includes(user.role_slug) ? `
          <a href="/admin" class="btn btn--sm btn--secondary header-btn desktop-only" style="margin-inline-start: 4px;">
            ${isRtl ? 'الإدارة' : 'Admin'}
          </a>
        ` : ''}
        <button type="button" class="btn btn--sm btn--ghost header-btn desktop-only" id="logout-btn" style="margin-inline-start: 4px;" title="${isRtl ? 'تسجيل الخروج' : 'Sign Out'}">
          ${isRtl ? 'خروج' : 'Logout'}
        </button>
      </div>
    `
    : `
      <a href="/${lang}/sign-in" class="btn btn--sm btn--primary header-btn" title="${isRtl ? 'تسجيل الدخول' : 'Sign In'}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        <span class="user-btn-label">${isRtl ? 'دخول' : 'Sign In'}</span>
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
    /* FARMINN Agricultural Polish & Header System */
    :root {
      --header-height: 72px;
    }
    .farminn-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--color-border);
      height: var(--header-height);
      display: flex;
      align-items: center;
    }
    .farminn-header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      width: 100%;
      flex-wrap: nowrap;
      gap: 12px;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
      min-width: 0;
    }
    .brand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: var(--color-primary);
      color: #fff;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .brand-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--color-secondary);
      letter-spacing: -0.02em;
      display: block;
      line-height: 1.1;
      white-space: nowrap;
    }
    .brand-sub {
      font-size: 0.72rem;
      color: var(--color-text-muted);
      font-weight: 600;
      display: block;
      margin-top: 2px;
      white-space: nowrap;
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
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      flex-wrap: nowrap;
    }
    .header-btn {
      height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding-inline: 12px;
      font-weight: 700;
      border-radius: var(--radius-md);
      white-space: nowrap;
      text-decoration: none;
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
      white-space: nowrap;
      height: 38px;
    }
    .lang-switcher-btn:hover {
      background: var(--color-primary-soft);
      border-color: var(--color-primary);
      text-decoration: none;
    }
    .mobile-menu-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--color-surface-alt);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-secondary);
      cursor: pointer;
      padding: 0;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .mobile-menu-toggle:hover {
      background: var(--color-primary-soft);
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    /* Mobile Drawer Styles */
    .mobile-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 1050;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.25s ease, visibility 0.25s ease;
    }
    .mobile-drawer-backdrop.is-open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
    .mobile-drawer {
      position: fixed;
      top: 0;
      bottom: 0;
      inset-inline-start: 0;
      width: min(340px, 86vw);
      background: #ffffff;
      z-index: 1060;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.35);
      transform: translateX(-100%);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      overflow-y: auto;
      overscroll-behavior: contain;
      pointer-events: none;
      visibility: hidden;
    }
    [dir="rtl"] .mobile-drawer {
      transform: translateX(100%);
    }
    .mobile-drawer.is-open,
    [dir="rtl"] .mobile-drawer.is-open {
      transform: translateX(0) !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }
    .mobile-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface-alt);
    }
    .mobile-drawer-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid var(--color-border);
      color: var(--color-text);
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
    }
    .mobile-drawer-nav {
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      text-decoration: none;
      color: var(--color-text);
      font-weight: 700;
      font-size: 0.95rem;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .mobile-nav-item:hover,
    .mobile-nav-item[aria-current="page"] {
      background: var(--color-primary-soft);
      color: var(--color-primary);
      text-decoration: none;
    }
    .mobile-nav-item svg {
      color: var(--color-primary);
      flex-shrink: 0;
    }
    .mobile-drawer-footer {
      padding: 16px 20px;
      border-top: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Responsive Breakpoints */
    @media (max-width: 900px) {
      .farminn-nav-list { display: none !important; }
      .mobile-menu-toggle { display: inline-flex !important; }
      .desktop-only { display: none !important; }
    }
    @media (max-width: 640px) {
      :root {
        --header-height: 62px;
      }
      .brand-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
      }
      .brand-icon svg {
        width: 20px;
        height: 20px;
      }
      .brand-title {
        font-size: 1.15rem;
      }
      .brand-sub {
        display: none;
      }
      .header-actions {
        gap: 6px;
      }
      .header-btn {
        height: 34px;
        padding-inline: 10px;
        font-size: 0.8rem;
      }
      .lang-switcher-btn {
        height: 34px;
        padding: 4px 10px;
        font-size: 0.8rem;
      }
      .mobile-menu-toggle {
        width: 36px;
        height: 36px;
      }
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
    /* Agricultural Hero Banner & Responsive Filter Box */
    .hero-banner-section {
      position: relative;
      background-color: #132a13;
      background-image: linear-gradient(180deg, rgba(15, 33, 15, 0.74) 0%, rgba(20, 48, 35, 0.86) 100%), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80');
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      color: #ffffff;
      padding-block: clamp(2.5rem, 5vw, 4.5rem) clamp(3rem, 6vw, 5.5rem);
      overflow: hidden;
    }
    .catalog-hero-banner {
      position: relative;
      background-color: #132a13;
      background-image: linear-gradient(180deg, rgba(15, 33, 15, 0.76) 0%, rgba(20, 48, 35, 0.88) 100%), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80');
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      color: #ffffff;
      padding-block: clamp(2.2rem, 5vw, 3.8rem) clamp(2.5rem, 6vw, 4.2rem);
      overflow: hidden;
    }
    .hero-search-box {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(8px);
      border-radius: var(--radius-lg);
      padding: clamp(14px, 3vw, 22px);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.6);
      color: var(--color-text);
    }
    .hero-search-box label {
      color: #1f2937;
      font-weight: 700;
      font-size: 0.88rem;
      margin-bottom: 5px;
      display: block;
    }
    .hero-search-box .form-control {
      background: #ffffff;
      border: 1.5px solid #d1d5db;
      color: #111827;
      font-size: 0.95rem;
      height: 44px;
      border-radius: 8px;
      padding-inline: 12px;
      box-sizing: border-box;
      width: 100%;
    }
    .hero-search-box .form-control:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.15);
      outline: none;
    }

    /* Mobile & Responsive Layouts for Hero Filter */
    @media (max-width: 767px) {
      .hero-banner-section, .catalog-hero-banner {
        padding-block: 2rem 2.2rem;
        background-position: center top;
      }
      .hero-search-box {
        padding: 14px;
        border-radius: 12px;
      }
      .hero-filter-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
      }
      .hero-filter-actions {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        margin-top: 4px;
      }
      .hero-filter-actions .btn {
        width: 100% !important;
        height: 44px !important;
        font-size: 1rem !important;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .hero-filter-grid {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px !important;
        align-items: flex-end !important;
      }
      .hero-filter-actions {
        grid-column: span 2;
        display: flex;
        gap: 10px;
      }
      .hero-filter-actions .btn {
        flex: 1;
        height: 44px;
      }
    }
    @media (min-width: 1024px) {
      .hero-filter-grid {
        display: grid !important;
        grid-template-columns: 1.4fr 1fr 1fr 0.9fr 1.2fr !important;
        gap: 12px !important;
        align-items: flex-end !important;
      }
      .hero-filter-actions {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }
      .hero-filter-actions .btn {
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
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
  </style>
</head>
<body>
  <!-- Header -->
  <header class="farminn-header">
    <div class="container" style="height: 100%;">
      <div class="farminn-header-inner">
        <!-- Brand Logo -->
        <a href="/${lang}" class="brand-link" title="${escapeHtml(brandName)}">
          <span class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
            </svg>
          </span>
          <div>
            <span class="brand-title">${escapeHtml(brandName)}</span>
            <span class="brand-sub">${isRtl ? 'سوق وإدارة المزارع' : 'Farms Marketplace & Management'}</span>
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

        <!-- Right Controls: Language, Account, and Mobile Menu Toggle -->
        <div class="header-actions">
          <a href="/${otherLang}" class="lang-switcher-btn" data-target-lang="${otherLang}" title="${isRtl ? 'Switch to English' : 'التحويل للعربية'}">
            ${otherLangLabel}
          </a>
          ${userActionHtml}
          <button type="button" class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="${isRtl ? 'فتح القائمة' : 'Open Navigation Menu'}" aria-expanded="false" aria-controls="mobile-nav-drawer" onclick="window.toggleMobileNavDrawer(event)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Navigation Drawer Overlay -->
  <div class="mobile-drawer-backdrop" id="mobile-drawer-backdrop" onclick="window.closeMobileNavDrawer(event)"></div>
  <aside class="mobile-drawer" id="mobile-nav-drawer" aria-hidden="true" role="dialog" aria-label="${isRtl ? 'قائمة المنصة' : 'Navigation Menu'}">
    <!-- Drawer Header -->
    <div class="mobile-drawer-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: var(--color-primary); color: #fff; border-radius: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
          </svg>
        </span>
        <strong style="font-size: 1.2rem; color: var(--color-secondary); font-weight: 800;">
          ${escapeHtml(brandName)}
        </strong>
      </div>
      <button type="button" class="mobile-drawer-close" id="mobile-drawer-close" aria-label="${isRtl ? 'إغلاق القائمة' : 'Close Menu'}" onclick="window.closeMobileNavDrawer(event)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Quick User & Language Bar inside Drawer -->
    <div style="padding: 12px 16px; background: #ffffff; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; gap: 8px;">
      <a href="/${otherLang}" class="lang-switcher-btn" data-target-lang="${otherLang}" style="flex: 1; justify-content: center; height: 38px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        ${otherLangLabel}
      </a>
      ${user ? `
        <a href="/${lang}/my" class="btn btn--sm btn--primary header-btn" style="flex: 1; justify-content: center; height: 38px;">
          ${isRtl ? 'حسابي' : 'Account'}
        </a>
      ` : `
        <a href="/${lang}/sign-in" class="btn btn--sm btn--primary header-btn" style="flex: 1; justify-content: center; height: 38px;">
          ${isRtl ? 'تسجيل الدخول' : 'Sign In'}
        </a>
      `}
    </div>

    <!-- Navigation Items -->
    <nav class="mobile-drawer-nav">
      ${navItems.map(item => `
        <a href="${item.href}" class="mobile-nav-item" ${activeNav === item.key ? 'aria-current="page"' : ''}>
          ${item.icon || ''}
          <span>${escapeHtml(item.label)}</span>
        </a>
      `).join('')}
    </nav>

    <!-- Drawer Footer -->
    <div class="mobile-drawer-footer">
      <a href="https://wa.me/${cleanWhatsapp}" target="_blank" rel="noopener" class="whatsapp-btn btn btn--sm" style="width: 100%; height: 42px; border-radius: 8px; font-size: 0.95rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
        ${isRtl ? 'واتساب المنصة' : 'WhatsApp Us'}: <span dir="ltr" class="phone-number" style="direction: ltr !important; unicode-bidi: isolate !important; display: inline-block;">&lrm;${whatsapp}</span>
      </a>
      ${user ? `
        <button type="button" class="btn btn--sm btn--ghost" id="drawer-logout-btn" style="width: 100%; color: #dc2626; border: 1px solid #fecaca; margin-top: 4px;">
          ${isRtl ? 'تسجيل الخروج' : 'Log Out'}
        </button>
      ` : ''}
    </div>
  </aside>

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
            <a href="https://wa.me/${cleanWhatsapp}" target="_blank" rel="noopener" class="whatsapp-btn btn btn--sm" style="border-radius: 6px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
              <span dir="ltr" class="phone-number" style="direction: ltr !important; unicode-bidi: isolate !important; display: inline-block;">&lrm;${whatsapp}</span>
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
            <strong>${isRtl ? 'الهاتف:' : 'Phone:'}</strong> <span dir="ltr" class="phone-number" style="direction: ltr !important; unicode-bidi: isolate !important; display: inline-block;">&lrm;${escapeHtml(phone)}</span>
          </p>
          <p style="font-size: 0.82rem; color: #8ba98b; margin: 0;">
            ${isRtl ? (settings.working_hours_ar || 'الأحد – الخميس 9:00 ص – 6:00 م') : (settings.working_hours_en || 'Sun – Thu 9:00 AM – 6:00 PM')}
          </p>
        </div>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-4); display: flex; justify-content: center; align-items: center; font-size: 0.85rem; color: #8ba98b; text-align: center;">
        <span>&copy; ${new Date().getFullYear()} ${escapeHtml(brandName)}. ${isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</span>
      </div>
    </div>
  </footer>

  <!-- Script for Language Switch, Logout, and Mobile Menu Drawer -->
  <script>
    // Language Switcher preserving path across all buttons (header + drawer)
    document.querySelectorAll('.lang-switcher-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const targetLang = this.getAttribute('data-target-lang');
        const currentPath = window.location.pathname;
        let newPath = '/' + targetLang;
        if (currentPath.startsWith('/en')) {
          newPath = currentPath.replace(/^\/en/, '/' + targetLang);
        } else if (currentPath.startsWith('/ar')) {
          newPath = currentPath.replace(/^\/ar/, '/' + targetLang);
        }
        document.cookie = 'site_lang=' + targetLang + '; path=/; max-age=31536000';
        window.location.href = newPath + window.location.search;
      });
    });

    // Mobile Drawer Open / Close Logic (Global & Event-Bound)
    window.openMobileNavDrawer = function() {
      const drawer = document.getElementById('mobile-nav-drawer');
      const backdrop = document.getElementById('mobile-drawer-backdrop');
      const toggle = document.getElementById('mobile-menu-toggle');
      if (drawer) {
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
      }
      if (backdrop) {
        backdrop.classList.add('is-open');
      }
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
      }
      document.body.style.overflow = 'hidden';
    };

    window.closeMobileNavDrawer = function(e) {
      if (e) {
        e.stopPropagation();
      }
      const drawer = document.getElementById('mobile-nav-drawer');
      const backdrop = document.getElementById('mobile-drawer-backdrop');
      const toggle = document.getElementById('mobile-menu-toggle');
      if (drawer) {
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
      }
      if (backdrop) {
        backdrop.classList.remove('is-open');
      }
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    };

    window.toggleMobileNavDrawer = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const drawer = document.getElementById('mobile-nav-drawer');
      if (drawer && drawer.classList.contains('is-open')) {
        window.closeMobileNavDrawer();
      } else {
        window.openMobileNavDrawer();
      }
    };

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        window.closeMobileNavDrawer();
      }
    });

    // Close drawer when clicking any link inside it
    document.getElementById('mobile-nav-drawer')?.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        window.closeMobileNavDrawer();
      });
    });

    // Logout Buttons (header and drawer)
    ['logout-btn', 'drawer-logout-btn'].forEach(function(id) {
      document.getElementById(id)?.addEventListener('click', async function() {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          window.location.href = '/${lang}';
        } catch (e) {
          window.location.reload();
        }
      });
    });
  </script>
</body>
</html>`;
}

