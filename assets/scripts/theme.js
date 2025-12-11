(function() {
  const THEME_KEY = 'site-theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const root = document.documentElement;

  const labels = {
    es: { dark: 'Modo oscuro', light: 'Modo claro' },
    en: { dark: 'Dark mode', light: 'Light mode' }
  };

  function getStoredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return prefersDark ? 'dark' : 'light';
  }

  let currentTheme = getStoredTheme();

  function syncToggleCopy() {
    const lang = window.SiteI18n?.getLanguage?.() || 'es';
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const icon = btn.querySelector('.theme-toggle__icon');
      const label = btn.querySelector('.theme-toggle__label');
      if (icon) icon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
      if (label) label.textContent = labels[lang]?.[currentTheme] || labels.es[currentTheme];
      btn.setAttribute('aria-label', currentTheme === 'dark' ? (lang === 'en' ? 'Dark mode' : 'Modo oscuro') : (lang === 'en' ? 'Light mode' : 'Modo claro'));
      btn.setAttribute('title', btn.getAttribute('aria-label'));
    });
  }

  function applyTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    currentTheme = nextTheme;
    root.setAttribute('data-theme', nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    syncToggleCopy();
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'));
    });
  });

  document.addEventListener('language:change', syncToggleCopy);
})();
