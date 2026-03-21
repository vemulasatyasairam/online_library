(function () {
  const THEME_STORAGE_KEY = 'appTheme';
  const RESPONSIVE_STYLE_ID = 'app-global-responsive-style';
  const BACKEND_API_STORAGE_KEY = 'backend_api_base';

  function setBackendApiBase(value) {
    const normalized = normalizeBaseUrl(value);
    const withProtocol = normalized && !/^https?:\/\//i.test(normalized)
      ? `http://${normalized}`
      : normalized;
    if (isValidBackendUrl(withProtocol)) {
      localStorage.setItem(BACKEND_API_STORAGE_KEY, withProtocol);
      return withProtocol;
    }

    localStorage.removeItem(BACKEND_API_STORAGE_KEY);
    return '';
  }

  function hydrateBackendApiBaseFromQuery() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const fromQuery = params.get('apiBase') || params.get('api') || '';
      const normalized = normalizeBaseUrl(fromQuery);
      if (/^https?:\/\//i.test(normalized)) {
        localStorage.setItem(BACKEND_API_STORAGE_KEY, normalized);
      }
    } catch (_error) {
      // Ignore query parsing issues.
    }
  }

  function normalizeBaseUrl(value) {
    if (!value || typeof value !== 'string') return '';
    return value.trim().replace(/\/+$/, '');
  }

  function isValidBackendUrl(value) {
    if (!value || typeof value !== 'string') return false;
    if (!/^https?:\/\//i.test(value)) return false;
    try {
      const parsed = new URL(value);
      // Reject malformed values like "http://http:" that caused popup loops.
      if (!parsed.hostname || parsed.hostname.toLowerCase() === 'http') return false;
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_error) {
      return false;
    }
  }

  function isHttpsPage() {
    return window.location.protocol === 'https:';
  }

  function isRemoteDeployment() {
    const host = window.location.hostname || 'localhost';
    return host !== 'localhost' && host !== '127.0.0.1';
  }

  function getBackendOrigin() {
    const explicitBase = normalizeBaseUrl(window.BACKEND_API_BASE || localStorage.getItem(BACKEND_API_STORAGE_KEY));
    if (isValidBackendUrl(explicitBase)) {
      return explicitBase.replace(/\/api$/i, '');
    }
    if (explicitBase) {
      localStorage.removeItem(BACKEND_API_STORAGE_KEY);
    }

    const host = window.location.hostname || 'localhost';
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:3000`;
    }

    // On deployed hosts we should not assume :3000 exists on the same domain.
    // Return empty and let /api (proxy) or explicit backend URL handle routing.
    return '';
  }

  function getApiBase() {
    const origin = getBackendOrigin();
    return origin ? `${origin}/api` : '/api';
  }

  function looksLikeApiRequest(url) {
    if (typeof url !== 'string' || !url) return false;
    return url.indexOf('/api/') !== -1 || url.indexOf(':3000') !== -1;
  }

  function promptForBackendApiBase(failedUrl, error) {
    if (isRemoteDeployment()) return;
    if (window.__APP_API_PROMPT_SHOWN) return;
    window.__APP_API_PROMPT_SHOWN = true;

    const host = window.location.hostname || 'localhost';
    const suggested = isRemoteDeployment()
      ? 'https://your-backend-domain.com'
      : (host ? `${window.location.protocol === 'https:' ? 'https' : 'http'}://${host}:3000` : 'http://localhost:3000');
    const current = normalizeBaseUrl(localStorage.getItem(BACKEND_API_STORAGE_KEY));
    const defaultValue = current || suggested;
    const errorText = error && error.message ? `\nReason: ${error.message}` : '';
    const failedUrlText = failedUrl ? `\nFailed URL: ${failedUrl}` : '';
    const input = window.prompt(
      `Unable to connect to backend API from this device.${failedUrlText}${errorText}\n\nEnter your laptop/backend URL (example: http://192.168.1.10:3000).\nIf using mobile, do not use localhost; use your laptop IP.`,
      defaultValue
    );

    if (!input) {
      return;
    }

    if (isHttpsPage() && /^http:\/\//i.test(input)) {
      window.alert('This site is HTTPS, so backend must also be HTTPS to work on mobile browsers. Please enter an https:// backend URL.');
      return;
    }

    const saved = setBackendApiBase(input);
    if (saved) {
      window.location.reload();
    }
  }

  function promptForBackendOnNetlifyLoad() {
    if (window.__APP_NETLIFY_PROMPT_CHECKED) return;
    window.__APP_NETLIFY_PROMPT_CHECKED = true;

    if (!isRemoteDeployment()) return;

    const saved = normalizeBaseUrl(localStorage.getItem(BACKEND_API_STORAGE_KEY));
    if (saved) return;

    // Do not block first load with prompts on deployed/mobile; prompt only after actual API failure.
    return;
  }

  function rewriteApiUrl(url) {
    if (typeof url !== 'string' || !url) return url;

    const backendOrigin = getBackendOrigin();
    const apiBase = backendOrigin ? `${backendOrigin}/api` : '/api';

    if (url.startsWith('http://localhost:3000')) {
      return `${backendOrigin}${url.slice('http://localhost:3000'.length)}`;
    }

    if (url.startsWith('http://127.0.0.1:3000')) {
      return `${backendOrigin}${url.slice('http://127.0.0.1:3000'.length)}`;
    }

    if (url.startsWith('/api/')) {
      return `${apiBase}${url.slice('/api'.length)}`;
    }

    if (backendOrigin && (url.startsWith('/uploads/') || url.startsWith('/books/'))) {
      return `${backendOrigin}${url}`;
    }

    if (url.startsWith('file://') && url.includes(':3000/')) {
      const cutIndex = url.indexOf(':3000/');
      return `${backendOrigin}${url.slice(cutIndex + ':3000'.length)}`;
    }

    if (url.includes('//:3000/')) {
      const cutIndex = url.indexOf(':3000/');
      return `${backendOrigin}${url.slice(cutIndex + ':3000'.length)}`;
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
        const rewrittenUrl = rewriteApiUrl(input);
        return originalFetch(rewrittenUrl, init).catch(function (error) {
          if (looksLikeApiRequest(rewrittenUrl)) {
            promptForBackendApiBase(rewrittenUrl, error);
          }
          throw error;
        });
      }

      if (input && typeof Request !== 'undefined' && input instanceof Request) {
        const rewritten = rewriteApiUrl(input.url);
        if (rewritten !== input.url) {
          return originalFetch(new Request(rewritten, input), init).catch(function (error) {
            if (looksLikeApiRequest(rewritten)) {
              promptForBackendApiBase(rewritten, error);
            }
            throw error;
          });
        }
      }

      return originalFetch(input, init).catch(function (error) {
        if (input && typeof input === 'string' && looksLikeApiRequest(input)) {
          promptForBackendApiBase(input, error);
        }
        throw error;
      });
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
          height: auto !important;
          min-height: 100% !important;
          max-height: none !important;
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

        main,
        section,
        .hero,
        .hero-inner,
        .book-grid,
        .list {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
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
  hydrateBackendApiBaseFromQuery();
  promptForBackendOnNetlifyLoad();
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
  window.AppConfig.setApiBase = setBackendApiBase;
  window.AppConfig.rewriteApiUrl = rewriteApiUrl;
})();