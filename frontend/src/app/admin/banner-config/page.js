'use client'

import { useState, useEffect } from 'react'
import { getSiteId } from '../../../utils/getSiteId'
import BannerTextForm from '../../../components/admin/BannerTextForm'
import StyleConfigForm from '../../../components/admin/StyleConfigForm'
import CategoryConfigForm from '../../../components/admin/CategoryConfigForm'
import LanguageManager from '../../../components/admin/LanguageManager'

export default function BannerConfigPage() {
  const [siteId, setSiteId] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('Configuration saved successfully!')
  const [validationErrors, setValidationErrors] = useState({})

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Load site configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Get dynamic site ID
        const id = getSiteId()
        if (!id) {
          throw new Error('Could not determine siteId')
        }
        setSiteId(id)

        // Fetch existing configuration
        console.log('[Admin] Fetching config for site:', id)
        const response = await fetch(`${apiUrl}/config/${id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`)
        }

        const data = await response.json()
        console.log('[Admin] Config loaded:', data)

        // Initialize config with defaults if empty
        const initialConfig = {
          bannerText: data.config?.bannerText || {
            en: {
              title: 'Cookie Consent',
              description: 'We use cookies to enhance your browsing experience.',
              acceptAll: 'Accept All',
              declineAll: 'Decline All',
              saveSettings: 'Save Settings',
              learnMore: 'Learn More',
            },
          },
          styles: data.config?.styles || {
            primaryColor: '#3b82f6',
            secondaryColor: '#1f2937',
            textColor: '#ffffff',
            backgroundColor: '#1f2937',
            position: 'bottom',
            layout: 'banner',
            borderRadius: '8px',
          },
          categories: data.config?.categories || {
            necessary: {
              name: 'Necessary',
              description: 'Essential cookies required for the website to function',
              required: true,
              enabled: true,
            },
            analytics: {
              name: 'Analytics',
              description: 'Help us understand how visitors interact with our website',
              required: false,
              enabled: false,
            },
            marketing: {
              name: 'Marketing',
              description: 'Used to show you relevant advertisements',
              required: false,
              enabled: false,
            },
          },
          languages: data.config?.languages || ['en'],
          services: data.config?.services || [],
        }

        // Check if we should apply category suggestions from cookie scanner
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('applySuggestions') === 'true') {
          const suggestionsJson = localStorage.getItem('cmp_category_suggestions')
          if (suggestionsJson) {
            try {
              const suggestions = JSON.parse(suggestionsJson)
              console.log('[Admin] Applying category suggestions from cookie scanner:', suggestions)

              // Convert suggestions to category format
              const newCategories = { ...initialConfig.categories }
              suggestions.forEach(suggestion => {
                newCategories[suggestion.key] = {
                  name: suggestion.name,
                  description: suggestion.description,
                  required: suggestion.required || false,
                  enabled: true, // Enable by default when applying from scan
                  cookies: suggestion.cookies || [] // Include cookie names from scan
                }
              })

              initialConfig.categories = newCategories

              // Clear the suggestions from localStorage
              localStorage.removeItem('cmp_category_suggestions')

              // Show success message
              setSuccessMessage(`✅ Applied ${suggestions.length} category suggestions from cookie scanner! Review and save.`)
              setSuccess(true)
              setTimeout(() => setSuccess(false), 8000)

              // Remove the query parameter from URL
              window.history.replaceState({}, '', '/admin/banner-config')

              // Scroll to categories section after a brief delay
              setTimeout(() => {
                const categoriesSection = document.querySelector('#categories-section')
                if (categoriesSection) {
                  categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  // Add a highlight effect
                  categoriesSection.classList.add('highlight-section')
                  setTimeout(() => {
                    categoriesSection.classList.remove('highlight-section')
                  }, 3000)
                }
              }, 500)
            } catch (err) {
              console.error('[Admin] Error parsing category suggestions:', err)
            }
          }
        }

        setConfig(initialConfig)
        setLoading(false)
      } catch (err) {
        console.error('[Admin] Error loading config:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadConfig()
  }, [apiUrl])

  // Validate configuration
  const validateConfig = (cfg) => {
    const errors = {}

    // Validate banner text
    if (!cfg.bannerText || Object.keys(cfg.bannerText).length === 0) {
      errors.bannerText = 'At least one language translation is required'
    }

    // Validate styles
    if (cfg.styles) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

      if (!hexColorRegex.test(cfg.styles.primaryColor)) {
        errors.primaryColor = 'Invalid hex color format'
      }
      if (!hexColorRegex.test(cfg.styles.secondaryColor)) {
        errors.secondaryColor = 'Invalid hex color format'
      }
      if (!hexColorRegex.test(cfg.styles.textColor)) {
        errors.textColor = 'Invalid hex color format'
      }
      if (!hexColorRegex.test(cfg.styles.backgroundColor)) {
        errors.backgroundColor = 'Invalid hex color format'
      }

      if (!['top', 'bottom', 'center'].includes(cfg.styles.position)) {
        errors.position = 'Position must be top, bottom, or center'
      }

      if (!['banner', 'modal', 'box'].includes(cfg.styles.layout)) {
        errors.layout = 'Layout must be banner, modal, or box'
      }
    }

    // Validate categories
    if (!cfg.categories || Object.keys(cfg.categories).length === 0) {
      errors.categories = 'At least one cookie category is required'
    }

    // Validate languages
    if (!cfg.languages || cfg.languages.length === 0) {
      errors.languages = 'At least one language is required'
    }

    return errors
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)
    setValidationErrors({})

    try {
      // Validate configuration
      const errors = validateConfig(config)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        setSaving(false)
        return
      }

      console.log('[Admin] Saving config:', config)

      // Send PUT request to backend
      const response = await fetch(`${apiUrl}/config/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to save config: ${response.status}`)
      }

      const result = await response.json()
      console.log('[Admin] Config saved successfully:', result)

      setSuccessMessage('Configuration saved successfully!')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000) // Hide success message after 5s
    } catch (err) {
      console.error('[Admin] Error saving config:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Update config state
  const updateConfig = (path, value) => {
    setConfig((prev) => {
      const newConfig = { ...prev }
      const keys = path.split('.')
      let current = newConfig

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newConfig
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading banner configuration...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error Loading Configuration</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Banner Configuration</h1>
              <p className="mt-1 text-sm text-gray-600">
                Site ID: <span className="font-mono text-xs">{siteId}</span>
              </p>
            </div>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Site
            </a>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✗ {error}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Configuration Form (2/3 width) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Manager */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
            <LanguageManager
              languages={config.languages}
              bannerText={config.bannerText}
              onChange={(languages, bannerText) => {
                setConfig((prev) => ({
                  ...prev,
                  languages,
                  bannerText,
                }))
              }}
              error={validationErrors.languages}
            />
          </div>

          {/* Banner Text Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Banner Text</h2>
            <BannerTextForm
              bannerText={config.bannerText}
              languages={config.languages}
              onChange={(bannerText) => updateConfig('bannerText', bannerText)}
              error={validationErrors.bannerText}
            />
          </div>

          {/* Style Configuration */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Style Settings</h2>
            <StyleConfigForm
              styles={config.styles}
              onChange={(styles) => updateConfig('styles', styles)}
              errors={validationErrors}
            />
          </div>

          {/* Category Configuration */}
          <div id="categories-section" className="bg-white shadow rounded-lg p-6 transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookie Categories</h2>
            <CategoryConfigForm
              categories={config.categories}
              onChange={(categories) => updateConfig('categories', categories)}
              error={validationErrors.categories}
            />
          </div>

          {/* Validation Errors Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
              <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                {Object.entries(validationErrors).map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </button>
          </div>
        </form>

            {/* JSON Preview (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 bg-gray-900 text-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Configuration Preview (Dev Only)</h3>
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right Side - Live Preview (1/3 width, sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👁️</span> Live Preview
                </h3>

                <div className="space-y-4">
                  {/* Preview Container */}
                  <div
                    className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                    style={{ minHeight: '400px', backgroundColor: '#f3f4f6' }}
                  >
                    {/* Mock Website Background */}
                    <div className="p-4 text-center text-gray-400 text-sm">
                      <div className="mb-4">
                        <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                      </div>
                    </div>

                    {/* Banner Preview */}
                    <div
                      className="absolute transition-all duration-300"
                      style={{
                        [config.styles.position === 'top' ? 'top' : config.styles.position === 'bottom' ? 'bottom' : 'top']:
                          config.styles.position === 'center' ? '50%' : '0',
                        left: config.styles.layout === 'box' ? '50%' : '0',
                        right: config.styles.layout === 'box' ? 'auto' : '0',
                        transform: config.styles.layout === 'box' ? 'translate(-50%, -50%)' :
                                  config.styles.position === 'center' ? 'translateY(-50%)' : 'none',
                        backgroundColor: config.styles.backgroundColor,
                        color: config.styles.textColor,
                        borderRadius: config.styles.borderRadius,
                        padding: '16px',
                        margin: config.styles.layout === 'box' ? '0' : '16px',
                        maxWidth: config.styles.layout === 'box' ? '400px' : 'none',
                        width: config.styles.layout === 'box' ? '90%' : 'auto',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {/* Banner Title */}
                      <h4 className="font-semibold mb-2 text-sm">
                        {config.bannerText[config.languages[0]]?.title || 'Cookie Consent'}
                      </h4>

                      {/* Banner Description */}
                      <p className="text-xs mb-3 opacity-90">
                        {config.bannerText[config.languages[0]]?.description || 'We use cookies to enhance your experience.'}
                      </p>

                      {/* Categories Preview */}
                      <div className="mb-3 space-y-1">
                        {Object.entries(config.categories).slice(0, 3).map(([key, cat]) => (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={cat.enabled}
                              readOnly
                              className="w-3 h-3"
                            />
                            <span className="opacity-80">{cat.name}</span>
                          </div>
                        ))}
                        {Object.keys(config.categories).length > 3 && (
                          <div className="text-xs opacity-60 pl-5">
                            +{Object.keys(config.categories).length - 3} more
                          </div>
                        )}
                      </div>

                      {/* Buttons Preview */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: config.styles.primaryColor,
                            color: config.styles.textColor
                          }}
                        >
                          {config.bannerText[config.languages[0]]?.acceptAll || 'Accept All'}
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: config.styles.secondaryColor,
                            color: config.styles.textColor
                          }}
                        >
                          {config.bannerText[config.languages[0]]?.saveSettings || 'Save Settings'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Info */}
                  <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">Position:</span>
                      <span className="capitalize">{config.styles.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Layout:</span>
                      <span className="capitalize">{config.styles.layout}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Categories:</span>
                      <span>{Object.keys(config.categories).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Languages:</span>
                      <span>{config.languages.join(', ').toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Preview Note */}
                  <div className="text-xs text-gray-500 italic">
                    💡 This preview updates in real-time as you change settings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for highlight animation */}
      <style jsx>{`
        :global(.highlight-section) {
          animation: highlight 3s ease-in-out;
          border: 2px solid #10b981 !important;
        }

        @keyframes highlight {
          0%, 100% {
            background-color: white;
          }
          50% {
            background-color: #ecfdf5;
          }
        }
      `}</style>
    </div>
  )
}
