/**
 * CMP Embed SDK v1.0.0
 *
 * This script provides a lightweight, embeddable consent management platform
 * that can be integrated into any website.
 *
 * INTEGRATION INSTRUCTIONS:
 * ========================
 *
 * 1. Add this script tag to your website's <head> section:
 *
 *    <script async src="https://your-cmp-domain.com/embed/embed.js?siteId=YOUR_SITE_ID"></script>
 *
 * 2. Mark scripts that require consent with data attributes:
 *
 *    <script type="text/plain"
 *            data-type="application/javascript"
 *            data-name="analytics"
 *            data-cookiecategory="analytics"
 *            src="https://example.com/analytics.js"></script>
 *
 * 3. The CMP will:
 *    - Load before other scripts
 *    - Show consent banner on first visit
 *    - Block scripts until user gives consent
 *    - Automatically enable scripts after consent
 *    - Remember user's choices
 *
 * SUPPORTED ATTRIBUTES:
 * ====================
 * - data-cookiecategory: Category name (e.g., "analytics", "marketing", "functional")
 * - data-type: Original script type (usually "application/javascript")
 * - data-name: Service name for Klaro
 * - type="text/plain": Prevents script from executing
 *
 * EXAMPLE:
 * ========
 * <!-- Google Analytics (Blocked until consent) -->
 * <script type="text/plain"
 *         data-type="application/javascript"
 *         data-name="google-analytics"
 *         data-cookiecategory="analytics">
 *   // Your GA code here
 * </script>
 *
 * <!-- Facebook Pixel (Blocked until consent) -->
 * <script type="text/plain"
 *         data-type="application/javascript"
 *         data-name="facebook-pixel"
 *         data-cookiecategory="marketing"
 *         src="https://connect.facebook.net/en_US/fbevents.js"></script>
 */

(function() {
  'use strict';

  // Namespace for CMP SDK
  window.CMPConsent = window.CMPConsent || {};

  const CMP = {
    version: '1.0.0',
    config: null,
    siteId: null,
    userId: null,
    apiUrl: null,
    klaroLoaded: false,
    initialized: false,
    debug: false,

    /**
     * Log debug messages
     */
    log: function(...args) {
      if (this.debug || new URLSearchParams(window.location.search).get('cmp-debug') === 'true') {
        console.log('[CMP SDK]', ...args);
      }
    },

    /**
     * Log errors (always shown)
     */
    error: function(...args) {
      console.error('[CMP SDK]', ...args);
    },

    /**
     * Initialize the CMP SDK
     */
    init: function() {
      try {
        this.log('Initializing CMP SDK v' + this.version);

        // Get siteId from script tag
        this.siteId = this.extractSiteId();
        if (!this.siteId) {
          this.error('No siteId provided. Add ?siteId=YOUR_SITE_ID to the embed script URL.');
          return;
        }

        this.log('Site ID:', this.siteId);

        // Determine API URL
        this.apiUrl = this.getApiUrl();
        this.log('API URL:', this.apiUrl);

        // Get or generate user ID
        this.userId = this.getUserId();
        this.log('User ID:', this.userId);

        // Load configuration and initialize
        this.loadConfig()
          .then(() => this.loadKlaro())
          .then(() => this.initializeKlaro())
          .then(() => this.setupScriptBlocking())
          .then(() => {
            this.initialized = true;
            this.log('CMP SDK initialized successfully');
          })
          .catch(error => {
            this.error('Failed to initialize CMP:', error);
          });

      } catch (error) {
        this.error('Critical error during initialization:', error);
      }
    },

    /**
     * Extract siteId from script tag query parameter
     */
    extractSiteId: function() {
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('embed.js')) {
          const url = new URL(src);
          return url.searchParams.get('siteId');
        }
      }
      return null;
    },

    /**
     * Determine API URL based on current environment
     */
    getApiUrl: function() {
      // Check for custom API URL in script tag
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('embed.js')) {
          const url = new URL(src);
          const customApiUrl = url.searchParams.get('apiUrl');
          if (customApiUrl) {
            return customApiUrl;
          }
        }
      }

      // Default API URL (adjust for production)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
      }

      // Production URL (update this to your production API)
      return 'https://api.your-cmp-domain.com';
    },

    /**
     * Get or generate a unique user ID
     */
    getUserId: function() {
      const COOKIE_NAME = 'cmp_uid';

      // Try to get from cookie
      let userId = this.getCookie(COOKIE_NAME);

      if (!userId) {
        // Generate new UUID v4
        userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });

        // Store in cookie (1 year)
        this.setCookie(COOKIE_NAME, userId, 365);
      }

      return userId;
    },

    /**
     * Load configuration from backend API
     */
    loadConfig: function() {
      return fetch(this.apiUrl + '/config/' + this.siteId)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load config: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          this.config = data.config || {};
          this.log('Configuration loaded:', this.config);
          return this.config;
        });
    },

    /**
     * Load Klaro library dynamically
     */
    loadKlaro: function() {
      if (this.klaroLoaded || window.klaro) {
        this.klaroLoaded = true;
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        // Load Klaro CSS
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro.min.css';
        document.head.appendChild(css);

        // Load Klaro JS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.min.js';
        script.async = false;

        script.onload = () => {
          this.klaroLoaded = true;
          this.log('Klaro library loaded');
          resolve();
        };

        script.onerror = () => {
          this.error('Failed to load Klaro library');
          reject(new Error('Failed to load Klaro'));
        };

        document.head.appendChild(script);
      });
    },

    /**
     * Convert admin config to Klaro format
     */
    convertConfigToKlaro: function() {
      const adminConfig = this.config;
      const languages = adminConfig.languages || ['en'];
      const defaultLang = languages[0];

      // Convert categories to Klaro services
      const services = [];
      if (adminConfig.categories) {
        Object.keys(adminConfig.categories).forEach(key => {
          const category = adminConfig.categories[key];
          services.push({
            name: key,
            title: category.name || key,
            description: category.description || '',
            purposes: [key],
            required: category.required || false,
            default: category.enabled || category.default || false,
            cookies: category.cookies || []
          });
        });
      }

      // Build translations
      const translations = {};
      languages.forEach(lang => {
        const text = adminConfig.bannerText?.[lang] || adminConfig.bannerText?.[defaultLang] || {};
        translations[lang] = {
          consentModal: {
            title: text.title || 'Cookie Consent',
            description: text.description || 'We use cookies to enhance your experience.'
          },
          consentNotice: {
            changeDescription: 'There were changes since your last visit.',
            description: text.description || 'We use cookies to enhance your experience.',
            learnMore: text.learnMore || 'Learn more'
          },
          ok: text.acceptAll || 'Accept All',
          save: text.saveSettings || 'Save Settings',
          decline: text.declineAll || 'Decline All',
          close: 'Close',
          acceptAll: text.acceptAll || 'Accept All',
          acceptSelected: text.saveSettings || 'Save Settings'
        };
      });

      return {
        elementID: 'klaro',
        storageMethod: 'cookie',
        cookieName: 'klaro',
        cookieExpiresAfterDays: 365,
        privacyPolicy: '/privacy',
        default: false,
        mustConsent: adminConfig.styles?.blockPageInteraction || false,
        acceptAll: true,
        hideDeclineAll: false,
        hideLearnMore: false,
        noticeAsModal: adminConfig.styles?.layout === 'modal',
        lang: defaultLang,
        languages: languages,
        translations: translations,
        services: services.length > 0 ? services : [
          {
            name: 'necessary',
            title: 'Necessary',
            description: 'Essential cookies',
            required: true,
            default: true
          }
        ]
      };
    },

    /**
     * Initialize Klaro with fetched configuration
     */
    initializeKlaro: function() {
      const klaroConfig = this.convertConfigToKlaro();

      // Add consent callback
      const self = this;
      klaroConfig.callback = function(consent, service) {
        self.log('Consent changed:', consent);
        self.sendConsent(consent, klaroConfig.services);
      };

      // Store config globally for Klaro
      window.klaroConfig = klaroConfig;

      // Initialize Klaro
      if (window.klaro && window.klaro.setup) {
        window.klaro.setup(klaroConfig);
        this.log('Klaro initialized');

        // Apply custom styles if provided
        if (this.config.styles) {
          this.applyCustomStyles(this.config.styles);
        }
      } else {
        throw new Error('Klaro library not available');
      }

      return Promise.resolve();
    },

    /**
     * Apply custom styles from configuration
     */
    applyCustomStyles: function(styles) {
      const styleElement = document.createElement('style');
      styleElement.id = 'cmp-custom-styles';

      styleElement.textContent = `
        .klaro .cookie-notice,
        .klaro .cookie-modal {
          background-color: ${styles.backgroundColor || '#1f2937'} !important;
          color: ${styles.textColor || '#ffffff'} !important;
          border-radius: ${styles.borderRadius || '8px'} !important;
        }

        .klaro .cn-buttons button.cm-btn-success,
        .klaro .cm-btn-success {
          background-color: ${styles.primaryColor || '#10b981'} !important;
          color: ${styles.textColor || '#ffffff'} !important;
        }

        .klaro .cn-buttons button.cm-btn-info {
          background-color: ${styles.secondaryColor || '#065f46'} !important;
          color: ${styles.textColor || '#ffffff'} !important;
        }
      `;

      document.head.appendChild(styleElement);
      this.log('Custom styles applied');
    },

    /**
     * Setup script blocking for third-party scripts
     */
    setupScriptBlocking: function() {
      // Find all scripts marked for blocking
      const blockedScripts = document.querySelectorAll('script[type="text/plain"][data-cookiecategory]');

      this.log('Found ' + blockedScripts.length + ' scripts to manage');

      // Klaro will handle script execution based on consent
      // No additional action needed - Klaro automatically manages scripts
      // with data-name and data-cookiecategory attributes

      return Promise.resolve();
    },

    /**
     * Send consent to backend
     */
    sendConsent: function(consent, services) {
      try {
        // Build choices object
        const choices = {};
        services.forEach(service => {
          choices[service.name] = consent[service.name] || false;
        });

        this.log('Sending consent to backend:', choices);

        // Send to backend with retry logic
        this.sendConsentWithRetry({
          siteId: this.siteId,
          userId: this.userId,
          choices: choices
        });

      } catch (error) {
        this.error('Error sending consent:', error);
      }
    },

    /**
     * Send consent to backend with retry
     */
    sendConsentWithRetry: function(data, retries = 3) {
      fetch(this.apiUrl + '/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          this.log('Consent recorded successfully');
        } else if (retries > 0) {
          setTimeout(() => {
            this.sendConsentWithRetry(data, retries - 1);
          }, 2000);
        }
      })
      .catch(error => {
        this.error('Failed to send consent:', error);
        if (retries > 0) {
          setTimeout(() => {
            this.sendConsentWithRetry(data, retries - 1);
          }, 2000);
        }
      });
    },

    /**
     * Cookie utility functions
     */
    getCookie: function(name) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    setCookie: function(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
    }
  };

  // Expose CMP SDK to window
  window.CMPConsent = CMP;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      CMP.init();
    });
  } else {
    CMP.init();
  }

})();
