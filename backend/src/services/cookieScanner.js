const puppeteer = require('puppeteer');
const { URL } = require('url');

/**
 * Cookie Scanner Service
 * Scans a website for cookies and categorizes them
 */

const COOKIE_CATEGORIES = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  FUNCTIONAL: 'functional',
  PREFERENCES: 'preferences',
  UNCLASSIFIED: 'unclassified'
};

// Known cookie patterns for categorization
const COOKIE_PATTERNS = {
  analytics: [
    '_ga', '_gid', '_gat', '__utma', '__utmb', '__utmc', '__utmz', '__utmt',
    '_hjid', '_hjIncludedInSample', 'mp_', 'mixpanel', 'amplitude',
    'ajs_', 'segment', 'optimizelyEndUserId', '_fbp', '_fbc'
  ],
  marketing: [
    'IDE', 'test_cookie', 'DSID', 'id', 'NID', 'ANID', 'fr', 'tr',
    'ads', 'doubleclick', 'adsense', 'adwords', 'conversion',
    '_gcl_', 'gclid', 'dclid', 'fbclid', 'mc', 'msclkid'
  ],
  functional: [
    'wordpress', 'wp-', 'PHPSESSID', 'JSESSIONID', 'ASP.NET_SessionId',
    'cf_', 'cloudflare', '__cfduid', 'intercom', 'drift', 'crisp'
  ],
  preferences: [
    'lang', 'language', 'locale', 'timezone', 'currency', 'theme',
    'color', 'font', 'layout', 'consent', 'cookie_consent'
  ]
};

/**
 * Categorize a cookie based on its name and domain
 * @param {string} name - Cookie name
 * @param {string} domain - Cookie domain
 * @returns {string} Category
 */
function categorizeCookie(name, domain) {
  const lowerName = name.toLowerCase();
  const lowerDomain = domain.toLowerCase();

  // Check for analytics patterns
  for (const pattern of COOKIE_PATTERNS.analytics) {
    if (lowerName.includes(pattern.toLowerCase())) {
      return COOKIE_CATEGORIES.ANALYTICS;
    }
  }

  // Check for marketing patterns
  for (const pattern of COOKIE_PATTERNS.marketing) {
    if (lowerName.includes(pattern.toLowerCase()) ||
        lowerDomain.includes(pattern.toLowerCase())) {
      return COOKIE_CATEGORIES.MARKETING;
    }
  }

  // Check for functional patterns
  for (const pattern of COOKIE_PATTERNS.functional) {
    if (lowerName.includes(pattern.toLowerCase())) {
      return COOKIE_CATEGORIES.FUNCTIONAL;
    }
  }

  // Check for preferences patterns
  for (const pattern of COOKIE_PATTERNS.preferences) {
    if (lowerName.includes(pattern.toLowerCase())) {
      return COOKIE_CATEGORIES.PREFERENCES;
    }
  }

  // Check if cookie is from same domain (likely necessary)
  try {
    const siteUrl = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
    const cookieDomain = domain.startsWith('.') ? domain.substring(1) : domain;

    if (siteUrl.hostname === cookieDomain || siteUrl.hostname.endsWith(cookieDomain)) {
      return COOKIE_CATEGORIES.NECESSARY;
    }
  } catch (error) {
    // If URL parsing fails, continue
  }

  return COOKIE_CATEGORIES.UNCLASSIFIED;
}

/**
 * Scan a website for cookies
 * @param {string} siteUrl - The URL to scan
 * @param {object} options - Scan options
 * @returns {Promise<object>} Scan results
 */
async function scanWebsite(siteUrl, options = {}) {
  const {
    timeout = 30000,
    waitForNetworkIdle = true,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  } = options;

  let browser;

  try {
    // Validate URL
    const url = new URL(siteUrl);

    console.log(`[CookieScanner] Starting scan for: ${siteUrl}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(userAgent);

    // Enable request interception to track cookies
    await page.setRequestInterception(true);

    const requests = [];
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        resourceType: request.resourceType()
      });
      request.continue();
    });

    // Navigate to the page
    console.log(`[CookieScanner] Navigating to ${siteUrl}...`);

    await page.goto(siteUrl, {
      timeout,
      waitUntil: waitForNetworkIdle ? 'networkidle2' : 'domcontentloaded'
    });

    // Wait a bit for cookies to be set
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get all cookies
    const cookies = await page.cookies();

    console.log(`[CookieScanner] Found ${cookies.length} cookies`);

    // Categorize cookies
    const categorizedCookies = cookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 50) + (cookie.value.length > 50 ? '...' : ''), // Truncate value
      domain: cookie.domain,
      path: cookie.path,
      expires: cookie.expires,
      size: cookie.value.length,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      category: categorizeCookie(cookie.name, cookie.domain)
    }));

    // Group cookies by category
    const cookiesByCategory = categorizedCookies.reduce((acc, cookie) => {
      const category = cookie.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(cookie);
      return acc;
    }, {});

    // Calculate statistics
    const stats = {
      total: cookies.length,
      byCategory: Object.keys(cookiesByCategory).reduce((acc, category) => {
        acc[category] = cookiesByCategory[category].length;
        return acc;
      }, {}),
      firstParty: cookies.filter(c => {
        const cookieDomain = c.domain.startsWith('.') ? c.domain.substring(1) : c.domain;
        return url.hostname === cookieDomain || url.hostname.endsWith(cookieDomain);
      }).length,
      thirdParty: cookies.filter(c => {
        const cookieDomain = c.domain.startsWith('.') ? c.domain.substring(1) : c.domain;
        return !(url.hostname === cookieDomain || url.hostname.endsWith(cookieDomain));
      }).length
    };

    console.log(`[CookieScanner] Scan complete. Categories:`, stats.byCategory);

    return {
      success: true,
      siteUrl,
      scannedAt: new Date().toISOString(),
      cookies: categorizedCookies,
      cookiesByCategory,
      stats,
      requestCount: requests.length
    };

  } catch (error) {
    console.error('[CookieScanner] Error during scan:', error);

    return {
      success: false,
      siteUrl,
      error: error.message,
      scannedAt: new Date().toISOString(),
      cookies: [],
      cookiesByCategory: {},
      stats: {
        total: 0,
        byCategory: {},
        firstParty: 0,
        thirdParty: 0
      }
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate category suggestions based on scan results
 * @param {object} scanResults - Results from scanWebsite
 * @returns {array} Suggested categories for CMP configuration
 */
function generateCategorySuggestions(scanResults) {
  if (!scanResults.success || !scanResults.cookiesByCategory) {
    return [];
  }

  const suggestions = [];

  // Always suggest necessary
  const necessaryCookies = scanResults.cookiesByCategory[COOKIE_CATEGORIES.NECESSARY] || [];
  suggestions.push({
    key: 'necessary',
    name: 'Necessary',
    description: 'Essential cookies required for the website to function properly.',
    required: true,
    enabled: true,
    cookieCount: necessaryCookies.length,
    cookies: necessaryCookies.map(c => c.name)
  });

  // Suggest analytics if found
  if (scanResults.cookiesByCategory[COOKIE_CATEGORIES.ANALYTICS]?.length > 0) {
    const analyticsCookies = scanResults.cookiesByCategory[COOKIE_CATEGORIES.ANALYTICS];
    suggestions.push({
      key: 'analytics',
      name: 'Analytics',
      description: 'Cookies used to analyze site usage and improve user experience.',
      required: false,
      enabled: false,
      cookieCount: analyticsCookies.length,
      cookies: analyticsCookies.map(c => c.name)
    });
  }

  // Suggest marketing if found
  if (scanResults.cookiesByCategory[COOKIE_CATEGORIES.MARKETING]?.length > 0) {
    const marketingCookies = scanResults.cookiesByCategory[COOKIE_CATEGORIES.MARKETING];
    suggestions.push({
      key: 'marketing',
      name: 'Marketing',
      description: 'Cookies used for advertising and marketing purposes.',
      required: false,
      enabled: false,
      cookieCount: marketingCookies.length,
      cookies: marketingCookies.map(c => c.name)
    });
  }

  // Suggest functional if found
  if (scanResults.cookiesByCategory[COOKIE_CATEGORIES.FUNCTIONAL]?.length > 0) {
    const functionalCookies = scanResults.cookiesByCategory[COOKIE_CATEGORIES.FUNCTIONAL];
    suggestions.push({
      key: 'functional',
      name: 'Functional',
      description: 'Cookies that enable enhanced functionality and personalization.',
      required: false,
      enabled: false,
      cookieCount: functionalCookies.length,
      cookies: functionalCookies.map(c => c.name)
    });
  }

  // Suggest preferences if found
  if (scanResults.cookiesByCategory[COOKIE_CATEGORIES.PREFERENCES]?.length > 0) {
    const preferencesCookies = scanResults.cookiesByCategory[COOKIE_CATEGORIES.PREFERENCES];
    suggestions.push({
      key: 'preferences',
      name: 'Preferences',
      description: 'Cookies that remember your preferences and settings.',
      required: false,
      enabled: false,
      cookieCount: preferencesCookies.length,
      cookies: preferencesCookies.map(c => c.name)
    });
  }

  return suggestions;
}

module.exports = {
  scanWebsite,
  generateCategorySuggestions,
  COOKIE_CATEGORIES
};
