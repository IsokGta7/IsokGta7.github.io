(function() {
  const supported = ['es', 'en'];
  const doc = document.documentElement;

  function storedLang() {
    const saved = localStorage.getItem('lang');
    if (supported.includes(saved)) return saved;
    return 'es';
  }

  let current = storedLang();

  function applyLanguage(lang) {
    const nextLang = supported.includes(lang) ? lang : 'es';
    current = nextLang;
    doc.lang = nextLang;

    document.querySelectorAll('[data-i18n-en]').forEach(el => {
      if (!el.dataset.i18nEs) el.dataset.i18nEs = (el.dataset.i18nOriginal || el.innerHTML).trim();
      const text = nextLang === 'en' ? el.dataset.i18nEn : el.dataset.i18nEs;
      if (text) el.innerHTML = text;
    });

    document.querySelectorAll('[data-i18n-placeholder-en]').forEach(el => {
      if (!el.dataset.i18nPlaceholderEs) el.dataset.i18nPlaceholderEs = el.dataset.i18nPlaceholderOriginal || el.placeholder;
      const text = nextLang === 'en' ? el.dataset.i18nPlaceholderEn : el.dataset.i18nPlaceholderEs;
      if (text) el.placeholder = text;
    });

    document.querySelectorAll('[data-i18n-aria-en]').forEach(el => {
      const currentLabel = el.getAttribute('aria-label') || '';
      if (!el.dataset.i18nAriaEs) el.dataset.i18nAriaEs = el.dataset.i18nAriaOriginal || currentLabel;
      const text = nextLang === 'en' ? el.dataset.i18nAriaEn : el.dataset.i18nAriaEs;
      if (text) el.setAttribute('aria-label', text);
    });

    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      btn.textContent = nextLang === 'en' ? 'ES' : 'EN';
    });

    localStorage.setItem('lang', nextLang);
    document.dispatchEvent(new CustomEvent('language:change', { detail: { lang: nextLang } }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      btn.addEventListener('click', () => applyLanguage(current === 'en' ? 'es' : 'en'));
    });

    applyLanguage(current);
  });

  window.SiteI18n = {
    getLanguage: () => current,
    translate: (map) => map?.[current] ?? map?.es ?? map?.en ?? '',
    setLanguage: applyLanguage
  };
})();
