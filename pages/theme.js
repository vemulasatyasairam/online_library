(function () {
  const THEME_STORAGE_KEY = 'appTheme';
  const RESPONSIVE_STYLE_ID = 'app-global-responsive-style';

  function normalizeBaseUrl(value) {
    if (!value || typeof value !== 'string') return '';
    return value.trim().replace(/\/+$/, '');
  }

  function getBackendOrigin() {
    const explicitBase = normalizeBaseUrl(window.BACKEND_API_BASE || localStorage.getItem('backend_api_base'));
    if (explicitBase) {
      return explicitBase.replace(/\/api$/i, '');
    }

    const host = window.location.hostname || 'localhost';
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:3000`;
    }

    return `${protocol}//${host}:3000`;
  }

  function getApiBase() {
    return `${getBackendOrigin()}/api`;
  }

  function rewriteApiUrl(url) {
    if (typeof url !== 'string' || !url) return url;

    const backendOrigin = getBackendOrigin();
    const apiBase = `${backendOrigin}/api`;

    if (url.startsWith('http://localhost:3000')) {
      return `${backendOrigin}${url.slice('http://localhost:3000'.length)}`;
    }

    if (url.startsWith('http://127.0.0.1:3000')) {
      return `${backendOrigin}${url.slice('http://127.0.0.1:3000'.length)}`;
    }

    if (url.startsWith('/api/')) {
      return `${apiBase}${url.slice('/api'.length)}`;
    }

    if (url.startsWith('/uploads/') || url.startsWith('/books/')) {
      return `${backendOrigin}${url}`;
    }

    return url;
  }

  function installFetchRewrite() {
    if (window.__APP_FETCH_REWRITE_INSTALLED || typeof window.fetch !== 'function') {
      return;
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      if (typeof input === 'string') {
        return originalFetch(rewriteApiUrl(input), init);
      }

      if (input && typeof Request !== 'undefined' && input instanceof Request) {
        const rewritten = rewriteApiUrl(input.url);
        if (rewritten !== input.url) {
          return originalFetch(new Request(rewritten, input), init);
        }
      }

      return originalFetch(input, init);
    };

    window.__APP_FETCH_REWRITE_INSTALLED = true;
  }

  function ensureViewportMeta() {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    const desiredContent = 'width=device-width, initial-scale=1, viewport-fit=cover';
    if (viewportMeta.getAttribute('content') !== desiredContent) {
      viewportMeta.setAttribute('content', desiredContent);
    }
  }

  function injectResponsiveStyles() {
    if (!document.head || document.getElementById(RESPONSIVE_STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = RESPONSIVE_STYLE_ID;
    style.textContent = `
      img, video, canvas, iframe {
        max-width: 100%;
        height: auto;
      }

      @media (max-width: 992px) {
        html,
        body {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch;
          touch-action: manipulation;
        }

        body {
          width: 100% !important;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .layout,
        .header-inner,
        .main,
        .container,
        .content {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .topbar,
        .site-header,
        .header-inner,
        .nav,
        nav {
          display: flex !important;
          flex-wrap: wrap;
          gap: 10px;
        }

        .search-wrap,
        .search-container {
          width: 100%;
          margin-left: 0;
        }

        .search-wrap input,
        .search-container input,
        input[type="search"] {
          width: 100% !important;
          max-width: 100%;
          box-sizing: border-box;
        }

        .book-grid,
        .cards,
        .grid {
          justify-content: center;
          margin: 0;
          gap: 12px;
        }

        .book-card,
        .card {
          width: clamp(140px, 46vw, 220px);
          margin: 0;
        }

        table {
          display: block;
          width: 100%;
          overflow-x: auto;
        }
      }

      @media (max-width: 640px) {
        html,
        body {
          font-size: 14px;
        }

        .topbar,
        .site-header {
          padding: 10px 12px;
        }

        .topbar img.logo,
        .logo {
          width: 40px !important;
          height: 40px !important;
        }

        .topbar h1,
        .site-title {
          font-size: 16px !important;
        }

        .layout,
        .container,
        .content,
        .main {
          padding-left: 10px !important;
          padding-right: 10px !important;
          margin-left: auto;
          margin-right: auto;
          gap: 12px;
        }

        .book-card,
        .card {
          width: min(100%, 260px);
        }

        .book-actions,
        .actions,
        .profile-actions {
          flex-direction: column;
        }

        button,
        .btn,
        a.btn,
        input,
        select,
        textarea {
          min-height: 40px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function safeParse(value) {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return value;
    }
  }

  function getCurrentUserEmail() {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return '';

    const parsed = safeParse(raw);
    if (parsed && typeof parsed === 'object' && parsed.email) {
      return String(parsed.email).trim();
    }

    if (typeof parsed === 'string') {
      return parsed.trim();
    }

    return '';
  }

  function clearThemeOverrides() {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('theme-light', 'theme-dark');

    if (document.body) {
      document.body.classList.remove('theme-light', 'theme-dark');
    }
  }

  function getTheme() {
    return 'light';
  }

  function applyTheme() {
    clearThemeOverrides();
    return 'light';
  }

  function setTheme(_theme, userEmail) {
    const email = (userEmail || getCurrentUserEmail() || '').trim();
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    if (email) {
      localStorage.removeItem(`theme_${email}`);
    }
    clearThemeOverrides();
    return 'light';
  }

  localStorage.setItem(THEME_STORAGE_KEY, 'light');
  applyTheme();
  ensureViewportMeta();
  injectResponsiveStyles();
  installFetchRewrite();

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme();
    ensureViewportMeta();
    injectResponsiveStyles();
    installFetchRewrite();
  });

  window.AppTheme = {
    getTheme: getTheme,
    setTheme: setTheme,
    applyTheme: applyTheme,
    getCurrentUserEmail: getCurrentUserEmail
  };

  window.AppConfig = window.AppConfig || {};
  window.AppConfig.getBackendOrigin = getBackendOrigin;
  window.AppConfig.getApiBase = getApiBase;
  window.AppConfig.rewriteApiUrl = rewriteApiUrl;
})();