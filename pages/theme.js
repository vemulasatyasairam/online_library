(function () {
  const THEME_STORAGE_KEY = 'appTheme';
  const RESPONSIVE_STYLE_ID = 'app-global-responsive-style';

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

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme();
    ensureViewportMeta();
    injectResponsiveStyles();
  });

  window.AppTheme = {
    getTheme: getTheme,
    setTheme: setTheme,
    applyTheme: applyTheme,
    getCurrentUserEmail: getCurrentUserEmail
  };
})();