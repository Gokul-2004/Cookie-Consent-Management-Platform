'use client'

import { useState } from 'react'

export default function CategoryConfigForm({ categories, onChange, error }) {
  const [newCategoryKey, setNewCategoryKey] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})

  const handleUpdateCategory = (key, field, value) => {
    onChange({
      ...categories,
      [key]: {
        ...categories[key],
        [field]: value,
      },
    })
  }

  const toggleCategoryExpansion = (key) => {
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleAddCategory = () => {
    if (!newCategoryKey.trim()) return

    const key = newCategoryKey.toLowerCase().replace(/\s+/g, '_')

    if (categories[key]) {
      alert('Category with this key already exists')
      return
    }

    onChange({
      ...categories,
      [key]: {
        name: newCategoryKey,
        description: '',
        required: false,
        enabled: false,
      },
    })

    setNewCategoryKey('')
    setShowAddForm(false)
  }

  const handleDeleteCategory = (key) => {
    if (categories[key]?.required) {
      alert('Cannot delete required category')
      return
    }

    if (!confirm(`Delete category "${categories[key]?.name}"?`)) {
      return
    }

    const updated = { ...categories }
    delete updated[key]
    onChange(updated)
  }

  const categoryKeys = Object.keys(categories)

  return (
    <div className="space-y-4">
      {/* Category List */}
      <div className="space-y-3">
        {categoryKeys.map((key) => {
          const category = categories[key]
          return (
            <div
              key={key}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={category.enabled}
                    onChange={(e) => handleUpdateCategory(key, 'enabled', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  {/* Expandable arrow for categories with cookies */}
                  {category.cookies && category.cookies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpansion(key)}
                      className="text-gray-500 hover:text-gray-700 transition-transform"
                      style={{ transform: expandedCategories[key] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      ▶
                    </button>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {category.name}
                        {category.required && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            Required
                          </span>
                        )}
                      </h4>
                      {category.cookies && category.cookies.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          {category.cookies.length} {category.cookies.length === 1 ? 'cookie' : 'cookies'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">Key: {key}</p>
                  </div>
                </div>

                {!category.required && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(key)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Cookie list (expandable) */}
              {category.cookies && category.cookies.length > 0 && expandedCategories[key] && (
                <div className="mb-3 ml-8 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2">Cookies found in this category:</h5>
                  <div className="flex flex-wrap gap-1">
                    {category.cookies.map((cookieName, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono text-gray-700"
                      >
                        {cookieName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 ml-8">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleUpdateCategory(key, 'name', e.target.value)}
                    placeholder="Analytics"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={category.description}
                    onChange={(e) => handleUpdateCategory(key, 'description', e.target.value)}
                    placeholder="Help us understand how visitors interact with our website"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={category.required}
                      onChange={(e) => handleUpdateCategory(key, 'required', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">Required (always enabled)</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={category.default || false}
                      onChange={(e) => handleUpdateCategory(key, 'default', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">Enabled by default</span>
                  </label>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add New Category */}
      {!showAddForm ? (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add New Category
        </button>
      ) : (
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Add New Category</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryKey}
                onChange={(e) => setNewCategoryKey(e.target.value)}
                placeholder="e.g., Preferences, Social Media"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Key will be: <span className="font-mono">{newCategoryKey.toLowerCase().replace(/\s+/g, '_') || 'category_key'}</span>
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewCategoryKey('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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

      {/* Category Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{categoryKeys.length}</div>
            <div className="text-xs text-gray-600">Total Categories</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {categoryKeys.filter((k) => categories[k].enabled).length}
            </div>
            <div className="text-xs text-gray-600">Enabled</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {categoryKeys.filter((k) => categories[k].required).length}
            </div>
            <div className="text-xs text-gray-600">Required</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {categoryKeys.filter((k) => categories[k].default).length}
            </div>
            <div className="text-xs text-gray-600">Default On</div>
          </div>
        </div>
      </div>
    </div>
  )
}
