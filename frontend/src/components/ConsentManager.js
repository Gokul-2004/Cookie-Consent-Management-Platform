'use client'

import { useEffect, useState } from 'react'
import * as Klaro from 'klaro/dist/klaro-no-css'
import 'klaro/dist/klaro.css'
import {
  sendConsentToBackend,
  buildChoicesFromConsent,
  getUserId,
  storeConsentLocally,
  queueFailedConsent,
  processConsentQueue,
} from '../utils/consentApi'
import { getSiteId } from '../utils/getSiteId'
import { adminConfigToKlaro, applyCustomStyles } from '../utils/configMapper'

export default function ConsentManager() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeKlaro = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      let siteId
      try {
        siteId = getSiteId()
      } catch (error) {
        const errorMsg = `Failed to determine siteId: ${error.message}`
        console.error('[CMP]', errorMsg)
        setError(errorMsg)
        setLoading(false)
        return
      }

      if (!siteId) {
        const errorMsg = 'Could not determine siteId'
        console.warn('[CMP]', errorMsg)
        setError(errorMsg)
        setLoading(false)
        return
      }

      try {
        console.log(`[CMP] Fetching consent config for site: ${siteId}`)

        processConsentQueue(apiUrl).catch(err =>
          console.error('[CMP] Error processing consent queue:', err)
        )

        const response = await fetch(`${apiUrl}/config/${siteId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`)
        }

        const data = await response.json()
        console.log('[CMP] Consent config loaded:', data)

        const hasAdminConfig = data.config &&
          Object.keys(data.config).length > 0 &&
          (data.config.bannerText || data.config.categories || data.config.styles)

        let klaroConfig

        if (hasAdminConfig) {
          console.log('[CMP] Using admin configuration')
          klaroConfig = adminConfigToKlaro(data)
        } else {
          console.log('[CMP] Using default configuration')
          klaroConfig = {
            elementID: 'klaro',
            storageMethod: 'cookie',
            cookieName: 'klaro',
            cookieExpiresAfterDays: 365,
            privacyPolicy: '/privacy',
            default: false,
            mustConsent: false,
            acceptAll: true,
            hideDeclineAll: false,
            hideLearnMore: false,
            noticeAsModal: false,
            translations: {
              en: {
                consentModal: {
                  title: 'Cookie Consent',
                  description: 'We use cookies.',
                },
                consentNotice: {
                  description: 'We use cookies.',
                  learnMore: 'Learn more',
                },
                ok: 'Accept All',
                decline: 'Decline All',
              },
            },
            services: [
              {
                name: 'necessary',
                title: 'Necessary',
                description: 'Essential cookies',
                required: true,
                default: true,
              },
            ],
          }
        }

        klaroConfig.callback = async (consent, service) => {
          try {
            const choices = buildChoicesFromConsent(consent, klaroConfig.services)
            const userId = getUserId()
            storeConsentLocally(siteId, choices)
            const result = await sendConsentToBackend(apiUrl, siteId, userId, choices)
            if (result.success) {
              console.log('[CMP] ✅ Consent recorded')
            } else {
              queueFailedConsent({ siteId, userId, choices })
            }
          } catch (error) {
            console.error('[CMP] Error:', error)
          }
        }

        window.klaroConfig = klaroConfig
        Klaro.setup(klaroConfig)

        // Apply custom styles AFTER Klaro is initialized
        if (hasAdminConfig && data.config.styles) {
          console.log('[CMP] Applying custom styles after Klaro initialization')
          // Give Klaro time to render, then apply styles
          setTimeout(() => {
            applyCustomStyles(data.config.styles)
          }, 100)
        }

        setLoading(false)

      } catch (error) {
        console.error('[CMP] Error:', error)
        setError(error.message)
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      initializeKlaro()
    }
  }, [])

  if (process.env.NODE_ENV === 'development' && error) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#ff4444',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 9999,
      }}>
        <strong>Error:</strong>
        <p style={{ margin: '10px 0 0 0' }}>{error}</p>
      </div>
    )
  }

  return null
}
