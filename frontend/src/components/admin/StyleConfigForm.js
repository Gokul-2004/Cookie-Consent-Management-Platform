'use client'

import { useState } from 'react'

export default function StyleConfigForm({ styles, onChange, errors }) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleChange = (field, value) => {
    onChange({
      ...styles,
      [field]: value,
    })
  }

  // Color picker with validation
  const ColorField = ({ label, field, error }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={styles[field] || '#000000'}
          onChange={(e) => handleChange(field, e.target.value)}
          className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={styles[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder="#000000"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Color Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorField
            label="Primary Color"
            field="primaryColor"
            error={errors.primaryColor}
          />
          <ColorField
            label="Secondary Color"
            field="secondaryColor"
            error={errors.secondaryColor}
          />
          <ColorField
            label="Text Color"
            field="textColor"
            error={errors.textColor}
          />
          <ColorField
            label="Background Color"
            field="backgroundColor"
            error={errors.backgroundColor}
          />
        </div>
      </div>

      {/* Position Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Position</h3>
        <div className="space-y-3">
          {['top', 'bottom', 'center'].map((position) => (
            <label
              key={position}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                styles.position === position
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="position"
                value={position}
                checked={styles.position === position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900 capitalize">
                  {position}
                </span>
                <span className="block text-xs text-gray-500">
                  {position === 'top' && 'Display banner at the top of the page'}
                  {position === 'bottom' && 'Display banner at the bottom of the page'}
                  {position === 'center' && 'Display banner centered on the page'}
                </span>
              </div>
            </label>
          ))}
        </div>
        {errors.position && (
          <p className="text-red-500 text-sm mt-2">{errors.position}</p>
        )}
      </div>

      {/* Layout Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              value: 'banner',
              label: 'Banner',
              description: 'Full-width horizontal banner',
              icon: '━',
            },
            {
              value: 'modal',
              label: 'Modal',
              description: 'Centered modal overlay',
              icon: '▢',
            },
            {
              value: 'box',
              label: 'Box',
              description: 'Small corner notification',
              icon: '▣',
            },
          ].map((layout) => (
            <label
              key={layout.value}
              className={`flex flex-col items-center p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                styles.layout === layout.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="layout"
                value={layout.value}
                checked={styles.layout === layout.value}
                onChange={(e) => handleChange('layout', e.target.value)}
                className="sr-only"
              />
              <div className="text-4xl mb-2">{layout.icon}</div>
              <span className="block text-sm font-medium text-gray-900">
                {layout.label}
              </span>
              <span className="block text-xs text-gray-500 text-center mt-1">
                {layout.description}
              </span>
            </label>
          ))}
        </div>
        {errors.layout && (
          <p className="text-red-500 text-sm mt-2">{errors.layout}</p>
        )}
      </div>

      {/* Additional Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="24"
                value={parseInt(styles.borderRadius) || 8}
                onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
                className="flex-1"
              />
              <input
                type="text"
                value={styles.borderRadius || '8px'}
                onChange={(e) => handleChange('borderRadius', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <select
              value={styles.fontSize || 'medium'}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={styles.showCloseButton !== false}
                onChange={(e) => handleChange('showCloseButton', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Show close button</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={styles.blockPageInteraction || false}
                onChange={(e) => handleChange('blockPageInteraction', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Block page interaction until consent given
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Button */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setPreviewOpen(!previewOpen)}
          className="w-full md:w-auto px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {previewOpen ? '▲ Hide' : '▼ Show'} Style Preview
        </button>

        {previewOpen && (
          <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div
              className="p-6 rounded-lg shadow-lg"
              style={{
                backgroundColor: styles.backgroundColor,
                color: styles.textColor,
                borderRadius: styles.borderRadius,
              }}
            >
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: styles.primaryColor }}
              >
                Cookie Consent Banner
              </h3>
              <p className="text-sm mb-4">
                This is a preview of how your banner will look with the current style settings.
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    backgroundColor: styles.primaryColor,
                    color: '#ffffff',
                  }}
                >
                  Accept All
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    backgroundColor: styles.secondaryColor,
                    color: styles.textColor,
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
