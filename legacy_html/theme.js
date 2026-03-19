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
    
    showBackendModal(`Unable to connect to backend API from this device.${failedUrlText ? '\n\n' + failedUrlText : ''}${errorText ? '\n' + errorText : ''}`, defaultValue, (input) => {
      if (!input) return;
      const saved = setBackendApiBase(input);
      if (saved) {
        window.location.reload();
      }
    });
  }

  function promptForBackendOnNetlifyLoad() {
    if (window.__APP_NETLIFY_PROMPT_CHECKED) return;
    window.__APP_NETLIFY_PROMPT_CHECKED = true;

    if (!isRemoteDeployment()) return;

    const saved = normalizeBaseUrl(localStorage.getItem(BACKEND_API_STORAGE_KEY));
    if (saved) return;

    showBackendModal('This app is deployed on Netlify but needs your laptop backend to load books.\n\nEnter your backend URL (example: http://192.168.1.10:3000 or http://YOUR-LAPTOP-IP:3000):', 'http://', (input) => {
      if (!input) return;
      const saved_url = setBackendApiBase(input);
      if (saved_url) {
        window.location.reload();
      }
    });
  }

  function showBackendModal(message, defaultValue, onSubmit) {
    if (document.getElementById('backend-modal-overlay')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'backend-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: linear-gradient(135deg, #0b72b9 0%, #095d97 100%);
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      color: white;
      animation: slideUp 0.3s ease-out;
    `;

    const title = document.createElement('h2');
    title.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 22px;
      font-weight: 600;
      color: white;
    `;
    title.textContent = 'Backend Configuration';

    const messageEl = document.createElement('p');
    messageEl.style.cssText = `
      margin: 0 0 24px 0;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.95);
      white-space: pre-wrap;
      word-break: break-word;
    `;
    messageEl.textContent = message;

    const inputLabel = document.createElement('label');
    inputLabel.style.cssText = `
      display: block;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    inputLabel.textContent = 'Backend URL';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    input.style.cssText = `
      width: 100%;
      padding: 12px 14px;
      margin-bottom: 20px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 14px;
      box-sizing: border-box;
      font-family: monospace;
      transition: all 0.2s;
    `;
    input.placeholder = 'http://192.168.1.10:3000';

    input.addEventListener('focus', function() {
      this.style.background = 'rgba(255, 255, 255, 0.15)';
      this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    });

    input.addEventListener('blur', function() {
      this.style.background = 'rgba(255, 255, 255, 0.1)';
      this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 24px;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
      padding: 12px 24px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    cancelBtn.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    cancelBtn.addEventListener('mouseleave', function() {
      this.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    cancelBtn.addEventListener('click', function() {
      overlay.remove();
    });

    const okBtn = document.createElement('button');
    okBtn.textContent = 'Connect';
    okBtn.style.cssText = `
      padding: 12px 24px;
      border: none;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    okBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
    });
    okBtn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
    okBtn.addEventListener('click', function() {
      onSubmit(input.value);
      overlay.remove();
    });

    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        okBtn.click();
      }
    });

    buttonsContainer.appendChild(cancelBtn);
    buttonsContainer.appendChild(okBtn);

    modal.appendChild(title);
    modal.appendChild(messageEl);
    modal.appendChild(inputLabel);
    modal.appendChild(input);
    modal.appendChild(buttonsContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @media (max-width: 640px) {
        #backend-modal-overlay {
          padding: 12px !important;
        }
        #backend-modal-overlay > div {
          padding: 24px !important;
        }
        #backend-modal-overlay h2 {
          font-size: 18px !important;
        }
        #backend-modal-overlay p {
          font-size: 13px !important;
        }
        #backend-modal-overlay input {
          font-size: 13px !important;
          padding: 10px 12px !important;
        }
        #backend-modal-overlay button {
          font-size: 13px !important;
          padding: 10px 16px !important;
        }
      }
    `;
    document.head.appendChild(style);

    input.focus();
    input.select();
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