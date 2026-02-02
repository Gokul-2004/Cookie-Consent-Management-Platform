'use client'

import { useState } from 'react'

// Common language codes
const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'nl', name: 'Dutch (Nederlands)' },
  { code: 'pl', name: 'Polish (Polski)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
]

export default function LanguageManager({ languages, bannerText, onChange, error }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [customLanguageCode, setCustomLanguageCode] = useState('')

  const handleAddLanguage = () => {
    const langCode = selectedLanguage === 'custom' ? customLanguageCode.toLowerCase().trim() : selectedLanguage

    if (!langCode) {
      alert('Please select or enter a language code')
      return
    }

    if (languages.includes(langCode)) {
      alert('Language already added')
      return
    }

    // Validate language code format (2-3 letters)
    if (!/^[a-z]{2,3}$/.test(langCode)) {
      alert('Invalid language code format. Use 2-3 lowercase letters (e.g., en, de, es)')
      return
    }

    const updatedLanguages = [...languages, langCode]
    const updatedBannerText = { ...bannerText }

    // Initialize empty translation for new language
    if (!updatedBannerText[langCode]) {
      updatedBannerText[langCode] = {
        title: '',
        description: '',
        acceptAll: '',
        declineAll: '',
        saveSettings: '',
        learnMore: '',
      }
    }

    onChange(updatedLanguages, updatedBannerText)
    setShowAddForm(false)
    setSelectedLanguage('')
    setCustomLanguageCode('')
  }

  const handleRemoveLanguage = (langCode) => {
    if (languages.length === 1) {
      alert('Cannot remove the last language')
      return
    }

    if (!confirm(`Remove language "${langCode}"? This will delete all translations for this language.`)) {
      return
    }

    const updatedLanguages = languages.filter((lang) => lang !== langCode)
    const updatedBannerText = { ...bannerText }
    delete updatedBannerText[langCode]

    onChange(updatedLanguages, updatedBannerText)
  }

  const handleSetDefaultLanguage = (langCode) => {
    // Move selected language to first position
    const updatedLanguages = [langCode, ...languages.filter((lang) => lang !== langCode)]
    onChange(updatedLanguages, bannerText)
  }

  const getLanguageName = (code) => {
    const lang = LANGUAGE_OPTIONS.find((l) => l.code === code)
    return lang ? lang.name : code.toUpperCase()
  }

  const availableLanguages = LANGUAGE_OPTIONS.filter((lang) => !languages.includes(lang.code))

  return (
    <div className="space-y-4">
      {/* Current Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supported Languages
          {languages.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({languages.length} language{languages.length !== 1 ? 's' : ''})
            </span>
          )}
        </label>
        <div className="space-y-2">
          {languages.map((langCode, index) => (
            <div
              key={langCode}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFlagEmoji(langCode)}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {getLanguageName(langCode)}
                    </span>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {langCode}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {bannerText[langCode] && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.keys(bannerText[langCode]).filter(
                        (key) => bannerText[langCode][key]?.trim()
                      ).length}{' '}
                      fields translated
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetDefaultLanguage(langCode)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Set as default
                  </button>
                )}
                {languages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(langCode)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Language Form */}
      {!showAddForm ? (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm"
        >
          + Add Language
        </button>
      ) : (
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Language</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a language --</option>
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {getFlagEmoji(lang.code)} {lang.name} ({lang.code})
                  </option>
                ))}
                <option value="custom">Custom language code...</option>
              </select>
            </div>

            {selectedLanguage === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Custom Language Code
                </label>
                <input
                  type="text"
                  value={customLanguageCode}
                  onChange={(e) => setCustomLanguageCode(e.target.value)}
                  placeholder="e.g., sv, no, fi"
                  pattern="^[a-z]{2,3}$"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use ISO 639-1 language codes (2-3 lowercase letters)
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddLanguage}
                disabled={!selectedLanguage || (selectedLanguage === 'custom' && !customLanguageCode)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setSelectedLanguage('')
                  setCustomLanguageCode('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <strong>Tip:</strong> The first language in the list is the default language. Users will see this
        language if their browser language is not supported.
      </div>
    </div>
  )
}

// Helper function to get flag emoji for language code
function getFlagEmoji(langCode) {
  const flagMap = {
    en: '🇬🇧',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷',
    it: '🇮🇹',
    pt: '🇵🇹',
    nl: '🇳🇱',
    pl: '🇵🇱',
    ru: '🇷🇺',
    zh: '🇨🇳',
    ja: '🇯🇵',
    ko: '🇰🇷',
    ar: '🇸🇦',
    hi: '🇮🇳',
    sv: '🇸🇪',
    no: '🇳🇴',
    fi: '🇫🇮',
    da: '🇩🇰',
    tr: '🇹🇷',
    el: '🇬🇷',
  }
  return flagMap[langCode] || '🌐'
}
