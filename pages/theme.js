(function () {
  const THEME_STORAGE_KEY = 'appTheme';
  const RESPONSIVE_STYLE_ID = 'app-global-responsive-style';
  const BACKEND_API_STORAGE_KEY = 'backend_api_base';

  function setBackendApiBase(value) {
    const normalized = normalizeBaseUrl(value);
    if (/^https?:\/\//i.test(normalized)) {
      localStorage.setItem(BACKEND_API_STORAGE_KEY, normalized);
      return normalized;
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

  function isRemoteDeployment() {
    const host = window.location.hostname || 'localhost';
    return host !== 'localhost' && host !== '127.0.0.1';
  }

  function getBackendOrigin() {
    const explicitBase = normalizeBaseUrl(window.BACKEND_API_BASE || localStorage.getItem(BACKEND_API_STORAGE_KEY));
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

  function looksLikeApiRequest(url) {
    if (typeof url !== 'string' || !url) return false;
    return url.indexOf('/api/') !== -1 || url.indexOf(':3000') !== -1;
  }

  function showCustomModal(title, message, defaultValue, onSubmit) {
    if (document.getElementById('app-custom-modal')) {
      return;
    }

    const modalId = 'app-custom-modal';
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.innerHTML = `
      <div id="app-modal-backdrop" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        overflow-y: auto;
      ">
        <div id="app-modal-content" style="
          background: linear-gradient(135deg, #1a2f4a 0%, #0f1a2e 100%);
          border-radius: 16px;
          padding: 28px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
        ">
          <h2 style="
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
          ">${title}</h2>
          
          <p style="
            margin: 0 0 16px 0;
            font-size: 14px;
            color: #b0c4de;
            line-height: 1.5;
            font-family: system-ui, -apple-system, sans-serif;
          ">${message}</p>
          
          <input id="app-modal-input" type="text" placeholder="Enter URL" value="${defaultValue || ''}" style="
            width: 100%;
            padding: 12px 14px;
            border: 2px solid rgba(100, 200, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            font-size: 14px;
            font-family: system-ui, -apple-system, sans-serif;
            box-sizing: border-box;
            margin-bottom: 20px;
          "/>
          
          <div style="
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          ">
            <button id="app-modal-ok" style="
              flex: 1;
              min-width: 100px;
              padding: 12px 20px;
              background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
              color: #ffffff;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              font-family: system-ui, -apple-system, sans-serif;
              transition: transform 0.2s, box-shadow 0.2s;
            ">OK</button>
            
            <button id="app-modal-cancel" style="
              flex: 1;
              min-width: 100px;
              padding: 12px 20px;
              background: rgba(100, 180, 220, 0.2);
              color: #64b5f6;
              border: 1px solid rgba(100, 180, 220, 0.4);
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              font-family: system-ui, -apple-system, sans-serif;
              transition: transform 0.2s, box-shadow 0.2s;
            ">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = document.getElementById('app-modal-input');
    const okBtn = document.getElementById('app-modal-ok');
    const cancelBtn = document.getElementById('app-modal-cancel');
    const backdrop = document.getElementById('app-modal-backdrop');
    
    function close(value) {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
      onSubmit(value);
    }
    
    okBtn.addEventListener('click', () => close(input.value));
    cancelBtn.addEventListener('click', () => close(null));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(null);
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') close(input.value);
    });
    
    setTimeout(() => input.focus(), 100);
  }

  function promptForBackendApiBase(failedUrl, error) {
    if (window.__APP_API_PROMPT_SHOWN) return;
    window.__APP_API_PROMPT_SHOWN = true;

    const host = window.location.hostname || 'localhost';
    const suggested = host && host !== 'localhost' && host !== '127.0.0.1'
      ? `http://${host}:3000`
      : 'http://localhost:3000';
    const current = normalizeBaseUrl(localStorage.getItem(BACKEND_API_STORAGE_KEY));
    const defaultValue = current || suggested;
    
    const errorText = error && error.message ? `Reason: ${error.message}` : '';
    const failedUrlText = failedUrl ? `Failed URL: ${failedUrl}` : '';
    
    let message = 'Unable to connect to backend API from this device.\n\n';
    if (failedUrlText) message += failedUrlText + '\n';
    if (errorText) message += errorText + '\n\n';
    message += 'Enter your laptop/backend URL (example: http://192.168.1.10:3000 or http://YOUR-LAPTOP-IP:3000):';

    showCustomModal(
      `${window.location.hostname || 'student-online-library.netlify.app'} says`,
      message,
      defaultValue,
      function(input) {
        if (!input) return;
        const saved = setBackendApiBase(input);
        if (saved) {
          window.location.reload();
        }
      }
    );
  }

  function promptForBackendOnNetlifyLoad() {
    if (window.__APP_NETLIFY_PROMPT_CHECKED) return;
    window.__APP_NETLIFY_PROMPT_CHECKED = true;

    if (!isRemoteDeployment()) return;

    const saved = normalizeBaseUrl(localStorage.getItem(BACKEND_API_STORAGE_KEY));
    if (saved) return;

    showCustomModal(
      `${window.location.hostname || 'student-online-library.netlify.app'} says`,
      'This app is deployed on Netlify but needs your laptop backend to load books.\n\nEnter your backend URL (example: http://192.168.1.10:3000 or http://YOUR-LAPTOP-IP:3000):',
      'http://',
      function(input) {
        if (!input) return;
        const saved_url = setBackendApiBase(input);
        if (saved_url) {
          window.location.reload();
        }
      }
    );
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