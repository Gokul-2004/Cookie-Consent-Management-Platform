'use client'

import { useState } from 'react'

export default function BannerTextForm({ bannerText, languages, onChange, error }) {
  const [activeLanguage, setActiveLanguage] = useState(languages[0] || 'en')

  // Text fields to edit
  const fields = [
    { key: 'title', label: 'Banner Title', placeholder: 'Cookie Consent', required: true },
    { key: 'description', label: 'Description', placeholder: 'We use cookies to enhance your experience', multiline: true, required: true },
    { key: 'acceptAll', label: 'Accept All Button', placeholder: 'Accept All', required: true },
    { key: 'declineAll', label: 'Decline All Button', placeholder: 'Decline All', required: true },
    { key: 'saveSettings', label: 'Save Settings Button', placeholder: 'Save Settings', required: true },
    { key: 'learnMore', label: 'Learn More Link', placeholder: 'Learn More', required: false },
    { key: 'closeButton', label: 'Close Button Text', placeholder: 'Close', required: false },
  ]

  const handleChange = (field, value) => {
    const updated = {
      ...bannerText,
      [activeLanguage]: {
        ...(bannerText[activeLanguage] || {}),
        [field]: value,
      },
    }
    onChange(updated)
  }

  const currentText = bannerText[activeLanguage] || {}

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      {languages.length > 1 && (
        <div className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language to Edit
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLanguage(lang)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeLanguage === lang
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lang.toUpperCase()}
                {!bannerText[lang] && (
                  <span className="ml-2 text-xs opacity-70">(empty)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Fields */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          Editing translations for: <strong>{activeLanguage.toUpperCase()}</strong>
        </div>

        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.multiline ? (
              <textarea
                value={currentText[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <input
                type="text"
                value={currentText[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Translation Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Translation Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {languages.map((lang) => {
            const langData = bannerText[lang] || {}
            const requiredFields = fields.filter((f) => f.required)
            const filledRequired = requiredFields.filter((f) => langData[f.key]?.trim()).length
            const isComplete = filledRequired === requiredFields.length

            return (
              <div
                key={lang}
                className={`px-3 py-2 rounded-lg text-sm ${
                  isComplete
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                <span className="font-semibold">{lang.toUpperCase()}</span>
                <span className="ml-2">
                  {filledRequired}/{requiredFields.length}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
