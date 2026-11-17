/**
 * Master Foundation — UI Shell Behavior Blueprint
 * Handles responsive drawers, RTL/LTR direction switching, active admin nav highlighting,
 * and loading starter i18n dictionaries for static blueprint preview.
 * Production note: Persist `site_lang` cookie on the server so SSR renders the right `dir`
 * immediately without RTL/LTR layout shift. Never simulate auth or DB writes in JS.
 */

const RTL_LANGUAGES = new Set(['ar']);
const SUPPORTED_LANGUAGES = ['ar', 'en', 'fr', 'ru', 'de', 'es'];

function resolveNestedKey(obj, dottedKey) {
  return dottedKey.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function readCookie(name) {
  const prefix = `${name}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

async function applyLanguage(langCode) {
  const lang = SUPPORTED_LANGUAGES.includes(langCode) ? langCode : 'en';
  const dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';

  document.documentElement.lang = lang;
  document.documentElement.dir = dir;

  try {
    document.cookie = `site_lang=${encodeURIComponent(lang)}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('foundation_preview_lang', lang);
  } catch {
    // Ignore storage/cookie unavailability on restricted origins
  }

  document.querySelectorAll('[data-lang-switcher]').forEach((select) => {
    if (select.value !== lang) select.value = lang;
  });

  const i18nBase = document.documentElement.dataset.i18nBase || '../i18n';

  try {
    const response = await fetch(`${i18nBase}/${lang}.json`);
    if (!response.ok) return;
    const dictionary = await response.json();

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translated = resolveNestedKey(dictionary, key);
      if (typeof translated === 'string' && translated.length > 0) {
        el.textContent = translated;
      }
    });
  } catch {
    // When opened directly via file:// without a local HTTP server, fetch may be blocked by browser CORS.
  }
}

function initDrawer(openSelector, closeSelector, panelSelector, backdropSelector) {
  const panel = document.querySelector(panelSelector);
  const backdrop = document.querySelector(backdropSelector);
  const openBtn = document.querySelector(openSelector);
  const closeBtn = document.querySelector(closeSelector);

  if (!panel || !openBtn) return;

  const setOpen = (isOpen) => {
    panel.dataset.open = isOpen ? 'true' : 'false';
    if (panel.hasAttribute('hidden') && isOpen) panel.removeAttribute('hidden');
    if (backdrop) {
      if (isOpen) backdrop.removeAttribute('hidden');
      else backdrop.setAttribute('hidden', '');
    }
    openBtn.setAttribute('aria-expanded', String(isOpen));
  };

  openBtn.addEventListener('click', () => setOpen(true));
  closeBtn?.addEventListener('click', () => setOpen(false));
  backdrop?.addEventListener('click', () => setOpen(false));
}

function initAdminNavHighlight() {
  const navLinks = document.querySelectorAll('.admin-nav-link');
  if (navLinks.length === 0) return;

  const updateCurrent = () => {
    const currentHash = window.location.hash || '#overview';
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === currentHash) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  window.addEventListener('hashchange', updateCurrent);
  updateCurrent();
}

function initBlueprintForms() {
  document.querySelectorAll('[data-blueprint-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Blueprint UI only: connect this form to a real server endpoint with CSRF protection, validation, and rate limiting.');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDrawer('[data-mobile-menu-open]', '[data-mobile-menu-close]', '#mobile-nav-drawer', '[data-drawer-backdrop]');
  initDrawer('[data-admin-sidebar-open]', '[data-admin-sidebar-close]', '#admin-sidebar', '[data-admin-backdrop]');
  initAdminNavHighlight();
  initBlueprintForms();

  document.querySelectorAll('[data-lang-switcher]').forEach((select) => {
    select.addEventListener('change', (e) => applyLanguage(e.target.value));
  });

  let initialLang = 'en';
  try {
    const cookieLang = readCookie('site_lang');
    const saved = cookieLang || localStorage.getItem('foundation_preview_lang');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) initialLang = saved;
  } catch {
    // Ignore storage unavailability
  }
  applyLanguage(initialLang);
});
