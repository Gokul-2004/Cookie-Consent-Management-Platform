/**
 * Maps admin panel configuration to Klaro format
 */

/**
 * Convert admin categories to Klaro services format
 * @param {object} categories - Categories from admin config
 * @returns {array} Klaro services array
 */
export function mapCategoriesToServices(categories) {
  if (!categories || typeof categories !== 'object') {
    return []
  }

  return Object.entries(categories).map(([key, category]) => ({
    name: key,
    title: category.name || key,
    description: category.description || '',
    purposes: [key], // Use category key as purpose
    required: category.required || false,
    default: category.default || category.enabled || false,
  }))
}

/**
 * Convert admin bannerText to Klaro translations
 * @param {object} bannerText - Banner text from admin config
 * @param {array} languages - Supported languages
 * @returns {object} Klaro translations object
 */
export function mapBannerTextToTranslations(bannerText, languages) {
  if (!bannerText || typeof bannerText !== 'object') {
    return {}
  }

  const translations = {}

  languages.forEach((lang) => {
    const text = bannerText[lang] || bannerText[languages[0]] || {}

    translations[lang] = {
      consentModal: {
        title: text.title || 'Cookie Consent',
        description: text.description || 'We use cookies to enhance your browsing experience.',
      },
      consentNotice: {
        changeDescription: 'There were changes since your last visit, please update your consent.',
        description: text.description || 'We use cookies to enhance your browsing experience.',
        learnMore: text.learnMore || 'Learn more',
      },
      purposeItem: {
        service: 'Service',
        services: 'Services',
      },
      ok: text.acceptAll || 'Accept All',
      save: text.saveSettings || 'Save Settings',
      decline: text.declineAll || 'Decline All',
      close: text.closeButton || 'Close',
      acceptAll: text.acceptAll || 'Accept All',
      acceptSelected: text.saveSettings || 'Save Settings',
      service: {
        disableAll: {
          title: 'Toggle all services',
          description: 'Use this switch to enable/disable all services.',
        },
        optOut: {
          title: '(opt-out)',
          description: 'This service is loaded by default (but you can opt out)',
        },
        required: {
          title: '(always required)',
          description: 'This service is always required',
        },
        purposes: 'Purposes',
        purpose: 'Purpose',
      },
      poweredBy: 'Powered by Klaro',
    }
  })

  return translations
}

/**
 * Map admin styles to Klaro CSS styling
 * @param {object} styles - Styles from admin config
 * @returns {object} CSS variables object
 */
export function mapStylesToCSS(styles) {
  if (!styles || typeof styles !== 'object') {
    return {}
  }

  return {
    '--primary-color': styles.primaryColor || '#3b82f6',
    '--secondary-color': styles.secondaryColor || '#1f2937',
    '--text-color': styles.textColor || '#ffffff',
    '--background-color': styles.backgroundColor || '#1f2937',
    '--border-radius': styles.borderRadius || '8px',
  }
}

/**
 * Determine if banner should be displayed as modal
 * @param {object} styles - Styles from admin config
 * @returns {boolean}
 */
export function shouldDisplayAsModal(styles) {
  if (!styles || !styles.layout) {
    return false
  }

  return styles.layout === 'modal'
}

/**
 * Get banner position class
 * @param {object} styles - Styles from admin config
 * @returns {string}
 */
export function getBannerPosition(styles) {
  if (!styles || !styles.position) {
    return 'bottom'
  }

  return styles.position // 'top', 'bottom', or 'center'
}

/**
 * Convert complete admin config to Klaro configuration
 * @param {object} adminConfig - Configuration from admin panel
 * @returns {object} Klaro configuration
 */
export function adminConfigToKlaro(adminConfig) {
  const config = adminConfig.config || adminConfig

  const languages = config.languages || ['en']
  const defaultLanguage = languages[0]

  return {
    // Element ID for Klaro modal
    elementID: 'klaro',

    // Storage settings
    storageMethod: 'cookie',
    cookieName: 'klaro',
    cookieExpiresAfterDays: 365,

    // Privacy policy
    privacyPolicy: '/privacy',

    // Default consent state
    default: false,
    mustConsent: config.styles?.blockPageInteraction || false,
    acceptAll: true,
    hideDeclineAll: false,
    hideLearnMore: false,

    // Display settings
    noticeAsModal: shouldDisplayAsModal(config.styles),

    // Language settings
    lang: defaultLanguage,
    languages: languages,

    // Translations from admin config
    translations: mapBannerTextToTranslations(config.bannerText, languages),

    // Services from categories
    services: mapCategoriesToServices(config.categories),

    // Styling
    styling: {
      theme: ['light'], // You can make this configurable
    },
  }
}

/**
 * Apply custom CSS from admin styles
 * @param {object} styles - Styles from admin config
 */
export function applyCustomStyles(styles) {
  if (!styles || typeof styles !== 'object') {
    console.warn('[ConfigMapper] No styles provided to applyCustomStyles')
    return
  }

  console.log('[ConfigMapper] Applying custom styles:', styles)

  const cssVars = mapStylesToCSS(styles)

  // Apply CSS variables to Klaro elements
  const styleElement = document.createElement('style')
  styleElement.id = 'klaro-custom-styles'

  // Remove existing custom styles
  const existing = document.getElementById('klaro-custom-styles')
  if (existing) {
    existing.remove()
  }

  // Ultra-aggressive styling to override Klaro defaults
  styleElement.textContent = `
    /* Main banner container - highest specificity */
    div.klaro div.cookie-notice,
    div.klaro div.cookie-notice.cookie-notice-visible {
      background-color: ${styles.backgroundColor || '#1f2937'} !important;
      background: ${styles.backgroundColor || '#1f2937'} !important;
      color: ${styles.textColor || '#ffffff'} !important;
      border-radius: ${styles.borderRadius || '8px'} !important;
    }

    /* Banner body */
    div.klaro .cookie-notice .cn-body {
      background-color: ${styles.backgroundColor || '#1f2937'} !important;
    }

    /* Accept All button - multiple selectors for maximum coverage */
    div.klaro .cookie-notice button.cm-btn.cm-btn-success,
    div.klaro .cn-buttons button.cm-btn-success,
    div.klaro button[class*="cm-btn-success"],
    .klaro .cookie-notice .cn-ok {
      background-color: ${styles.primaryColor || '#10b981'} !important;
      background: ${styles.primaryColor || '#10b981'} !important;
      color: ${styles.textColor || '#ffffff'} !important;
      border-color: ${styles.primaryColor || '#10b981'} !important;
      border: none !important;
    }

    div.klaro .cookie-notice button.cm-btn.cm-btn-success:hover {
      background-color: ${styles.secondaryColor || '#065f46'} !important;
      background: ${styles.secondaryColor || '#065f46'} !important;
      opacity: 0.9 !important;
    }

    /* Decline All and secondary buttons */
    div.klaro .cookie-notice button.cm-btn.cm-btn-info,
    div.klaro .cookie-notice button.cm-btn.cm-btn-danger,
    div.klaro .cn-buttons button.cm-btn-info,
    div.klaro button[class*="cm-btn-info"],
    div.klaro button[class*="cm-btn-danger"],
    .klaro .cookie-notice .cn-decline {
      background-color: ${styles.secondaryColor || '#065f46'} !important;
      background: ${styles.secondaryColor || '#065f46'} !important;
      color: ${styles.textColor || '#ffffff'} !important;
      border: 1px solid ${styles.primaryColor || '#10b981'} !important;
    }

    div.klaro .cookie-notice button.cm-btn.cm-btn-info:hover,
    div.klaro .cookie-notice button.cm-btn.cm-btn-danger:hover {
      background-color: ${styles.primaryColor || '#10b981'} !important;
      background: ${styles.primaryColor || '#10b981'} !important;
      opacity: 0.8 !important;
    }

    /* Learn More link and all links */
    div.klaro .cookie-notice a,
    div.klaro .cookie-notice .cn-learn-more,
    div.klaro .cm-link {
      color: ${styles.primaryColor || '#10b981'} !important;
    }

    /* All text in banner */
    div.klaro .cookie-notice,
    div.klaro .cookie-notice *:not(button) {
      color: ${styles.textColor || '#ffffff'} !important;
    }

    /* Modal styles if modal is used */
    div.klaro .cm-modal .cm-body {
      background-color: ${styles.backgroundColor || '#1f2937'} !important;
      color: ${styles.textColor || '#ffffff'} !important;
    }

    /* Switch/toggle colors in settings */
    div.klaro .cm-switch input:checked + .cm-slider {
      background-color: ${styles.primaryColor || '#10b981'} !important;
    }

    /* Position-specific styling */
    ${styles.position === 'bottom' ? `
      div.klaro .cookie-notice {
        bottom: 20px !important;
        top: auto !important;
      }
    ` : ''}

    ${styles.position === 'top' ? `
      div.klaro .cookie-notice {
        top: 20px !important;
        bottom: auto !important;
      }
    ` : ''}
  `

  document.head.appendChild(styleElement)
  console.log('[ConfigMapper] Custom styles injected into DOM')
}
