/**
 * Dynamic Site ID Detection
 * Determines siteId from URL parameter, hostname mapping, or fallback
 */

/**
 * Hostname to Site ID mapping
 * Add your domain-to-siteId mappings here
 */
const HOSTNAME_TO_SITE_ID = {
  'demo.mycmp.com': '223e4567-e89b-12d3-a456-426614174111',
  'localhost:3000': '223e4567-e89b-12d3-a456-426614174111',
  'localhost': '223e4567-e89b-12d3-a456-426614174111',
  // Add more mappings as needed
  // 'client1.mycmp.com': 'uuid-for-client1',
  // 'client2.mycmp.com': 'uuid-for-client2',
}

/**
 * Get siteId from URL parameter
 * Example: ?siteId=223e4567-e89b-12d3-a456-426614174111
 * @returns {string|null} Site ID or null
 */
function getSiteIdFromUrl() {
  if (typeof window === 'undefined') return null

  try {
    const params = new URLSearchParams(window.location.search)
    const siteId = params.get('siteId')

    if (siteId) {
      console.log('[getSiteId] Found siteId in URL parameter:', siteId)
      return siteId
    }
  } catch (error) {
    console.error('[getSiteId] Error parsing URL parameters:', error)
  }

  return null
}

/**
 * Get siteId from hostname mapping
 * @returns {string|null} Site ID or null
 */
function getSiteIdFromHostname() {
  if (typeof window === 'undefined') return null

  try {
    const hostname = window.location.hostname
    const hostnameWithPort = window.location.host // includes port

    // Try exact match with port first
    if (HOSTNAME_TO_SITE_ID[hostnameWithPort]) {
      console.log('[getSiteId] Matched hostname with port:', hostnameWithPort)
      return HOSTNAME_TO_SITE_ID[hostnameWithPort]
    }

    // Try hostname without port
    if (HOSTNAME_TO_SITE_ID[hostname]) {
      console.log('[getSiteId] Matched hostname:', hostname)
      return HOSTNAME_TO_SITE_ID[hostname]
    }

    // Try wildcard subdomain matching (e.g., *.mycmp.com)
    const domainParts = hostname.split('.')
    if (domainParts.length >= 2) {
      const rootDomain = domainParts.slice(-2).join('.') // e.g., mycmp.com
      const wildcardKey = `*.${rootDomain}`

      if (HOSTNAME_TO_SITE_ID[wildcardKey]) {
        console.log('[getSiteId] Matched wildcard domain:', wildcardKey)
        return HOSTNAME_TO_SITE_ID[wildcardKey]
      }
    }

    console.warn('[getSiteId] No hostname mapping found for:', hostname)
  } catch (error) {
    console.error('[getSiteId] Error getting hostname:', error)
  }

  return null
}

/**
 * Get siteId from environment variable (fallback)
 * @returns {string|null} Site ID or null
 */
function getSiteIdFromEnv() {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID

  if (siteId) {
    console.log('[getSiteId] Using fallback from environment variable')
    return siteId
  }

  return null
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Get dynamic siteId from multiple sources
 * Priority:
 * 1. URL parameter (?siteId=...)
 * 2. Hostname mapping (HOSTNAME_TO_SITE_ID)
 * 3. Environment variable (NEXT_PUBLIC_SITE_ID)
 *
 * @returns {string|null} Site ID or null if not found
 * @throws {Error} If siteId is invalid UUID format
 */
export function getSiteId() {
  console.log('[getSiteId] Starting dynamic siteId detection...')

  // Priority 1: URL parameter
  let siteId = getSiteIdFromUrl()

  // Priority 2: Hostname mapping
  if (!siteId) {
    siteId = getSiteIdFromHostname()
  }

  // Priority 3: Environment variable fallback
  if (!siteId) {
    siteId = getSiteIdFromEnv()
  }

  // Validate result
  if (!siteId) {
    console.error('[getSiteId] ❌ Could not determine siteId from any source')
    console.error('[getSiteId] Tried:')
    console.error('  1. URL parameter (?siteId=...)')
    console.error('  2. Hostname mapping')
    console.error('  3. Environment variable (NEXT_PUBLIC_SITE_ID)')
    return null
  }

  // Validate UUID format
  if (!isValidUUID(siteId)) {
    console.error('[getSiteId] ❌ Invalid siteId format (not a valid UUID):', siteId)
    throw new Error(`Invalid siteId format: ${siteId}`)
  }

  console.log('[getSiteId] ✓ Successfully determined siteId:', siteId)
  return siteId
}

/**
 * Add or update hostname mapping programmatically
 * Useful for multi-tenant apps that fetch mappings from API
 * @param {string} hostname - Hostname to map
 * @param {string} siteId - Site UUID
 */
export function addHostnameMapping(hostname, siteId) {
  if (!isValidUUID(siteId)) {
    throw new Error(`Invalid siteId format: ${siteId}`)
  }

  HOSTNAME_TO_SITE_ID[hostname] = siteId
  console.log(`[getSiteId] Added hostname mapping: ${hostname} → ${siteId}`)
}

/**
 * Get all hostname mappings (for debugging)
 * @returns {object} All hostname mappings
 */
export function getHostnameMappings() {
  return { ...HOSTNAME_TO_SITE_ID }
}
