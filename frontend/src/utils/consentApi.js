/**
 * Consent API Helper Functions
 * Handles sending consent data to backend with retry logic and error handling
 */

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

/**
 * Send consent choices to backend API
 * @param {string} apiUrl - Backend API URL
 * @param {string} siteId - Site UUID
 * @param {string|null} userId - User ID (null for anonymous)
 * @param {object} choices - Consent choices object
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<object>} Response from backend
 */
export async function sendConsentToBackend(apiUrl, siteId, userId, choices, retryCount = 0) {
  try {
    console.log(`[Consent API] Sending consent (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, {
      siteId,
      userId,
      choices,
    })

    const response = await fetch(`${apiUrl}/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteId,
        userId,
        choices,
      }),
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('[Consent API] ✓ Consent recorded successfully:', result)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error(`[Consent API] ✗ Error (attempt ${retryCount + 1}):`, error.message)

    // Retry logic
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount) // Exponential backoff
      console.log(`[Consent API] Retrying in ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))
      return sendConsentToBackend(apiUrl, siteId, userId, choices, retryCount + 1)
    }

    console.error('[Consent API] ✗ Max retries reached. Consent not saved to backend.')

    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Build choices object from Klaro consent
 * @param {object} consent - Klaro consent object
 * @param {array} services - Array of service configurations
 * @returns {object} Choices object with all service states
 */
export function buildChoicesFromConsent(consent, services) {
  const choices = {}

  // Add accepted services
  if (consent && consent.services) {
    consent.services.forEach(serviceName => {
      choices[serviceName] = true
    })
  }

  // Add declined services (explicitly set to false)
  services.forEach(service => {
    if (!choices[service.name] && !service.required) {
      choices[service.name] = false
    }
  })

  // Required services are always true
  services.forEach(service => {
    if (service.required) {
      choices[service.name] = true
    }
  })

  return choices
}

/**
 * Get user ID from localStorage or generate anonymous ID
 * @returns {string|null} User ID or null for anonymous
 */
export function getUserId() {
  // Try to get existing user ID
  let userId = localStorage.getItem('userId')

  // If no user ID exists, you can optionally generate a session ID
  // For now, return null for anonymous users
  if (!userId) {
    // Option 1: Return null (anonymous)
    return null

    // Option 2: Generate a session-based ID (commented out)
    // userId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // localStorage.setItem('userId', userId)
    // return userId
  }

  return userId
}

/**
 * Store consent locally as backup
 * @param {string} siteId - Site UUID
 * @param {object} choices - Consent choices
 */
export function storeConsentLocally(siteId, choices) {
  try {
    const consentData = {
      siteId,
      choices,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('consent_backup', JSON.stringify(consentData))
    console.log('[Consent API] Stored consent backup locally')
  } catch (error) {
    console.error('[Consent API] Failed to store local backup:', error)
  }
}

/**
 * Get locally stored consent
 * @returns {object|null} Stored consent data or null
 */
export function getLocalConsent() {
  try {
    const stored = localStorage.getItem('consent_backup')
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('[Consent API] Failed to retrieve local backup:', error)
    return null
  }
}

/**
 * Queue failed consent submissions for retry
 * @param {object} consentData - Consent data to queue
 */
export function queueFailedConsent(consentData) {
  try {
    const queue = JSON.parse(localStorage.getItem('consent_queue') || '[]')
    queue.push({
      ...consentData,
      queuedAt: new Date().toISOString(),
    })
    localStorage.setItem('consent_queue', JSON.stringify(queue))
    console.log('[Consent API] Queued failed consent for later retry')
  } catch (error) {
    console.error('[Consent API] Failed to queue consent:', error)
  }
}

/**
 * Process queued consent submissions
 * @param {string} apiUrl - Backend API URL
 */
export async function processConsentQueue(apiUrl) {
  try {
    const queue = JSON.parse(localStorage.getItem('consent_queue') || '[]')

    if (queue.length === 0) {
      return
    }

    console.log(`[Consent API] Processing ${queue.length} queued consent(s)...`)

    const successfulIndices = []

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]
      const result = await sendConsentToBackend(
        apiUrl,
        item.siteId,
        item.userId,
        item.choices,
        0
      )

      if (result.success) {
        successfulIndices.push(i)
      }
    }

    // Remove successfully sent items from queue
    const remainingQueue = queue.filter((_, index) => !successfulIndices.includes(index))
    localStorage.setItem('consent_queue', JSON.stringify(remainingQueue))

    console.log(`[Consent API] Processed queue: ${successfulIndices.length} successful, ${remainingQueue.length} remaining`)
  } catch (error) {
    console.error('[Consent API] Error processing queue:', error)
  }
}
