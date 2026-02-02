'use client'

import { useState, useEffect } from 'react'
import { getSiteId } from '../../../utils/getSiteId'

export default function CookieScannerPage() {
  const [siteId, setSiteId] = useState(null)
  const [siteUrl, setSiteUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [error, setError] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    try {
      const id = getSiteId()
      setSiteId(id)
      fetchScanHistory(id)
    } catch (err) {
      setError(`Failed to determine siteId: ${err.message}`)
      setLoadingHistory(false)
    }
  }, [])

  const fetchScanHistory = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/scan/${id}`)
      if (!response.ok) throw new Error('Failed to fetch scan history')

      const data = await response.json()
      setScanHistory(data.scans || [])
    } catch (err) {
      console.error('Error fetching scan history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleScan = async () => {
    if (!siteUrl.trim()) {
      setError('Please enter a website URL')
      return
    }

    setScanning(true)
    setError(null)
    setScanResult(null)

    try {
      const response = await fetch(`${apiUrl}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteUrl: siteUrl.trim(),
          siteId: siteId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Scan failed')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Scan failed')
      }

      setScanResult(data)

      // Refresh scan history
      if (siteId) {
        fetchScanHistory(siteId)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      necessary: 'bg-blue-100 text-blue-800',
      analytics: 'bg-purple-100 text-purple-800',
      marketing: 'bg-pink-100 text-pink-800',
      functional: 'bg-green-100 text-green-800',
      preferences: 'bg-yellow-100 text-yellow-800',
      unclassified: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.unclassified
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Scanner</h1>
          <p className="text-gray-600">
            Scan any website to discover cookies and get category suggestions for your CMP configuration
          </p>
          {siteId && (
            <p className="text-sm text-gray-500 mt-2">
              Site ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{siteId}</span>
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scan Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan a Website</h2>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                id="siteUrl"
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={scanning}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the full URL of the website you want to scan
              </p>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleScan}
                disabled={scanning || !siteUrl.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 h-[42px]"
              >
                {scanning ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scanning...
                  </>
                ) : (
                  <>
                    🔍 Scan Website
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Scan Results</h2>
              <p className="text-sm text-gray-600 mt-1">
                Scanned: <span className="font-medium">{scanResult.siteUrl}</span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(scanResult.scannedAt).toLocaleString()}
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-600 mb-1">Total Cookies</div>
                <div className="text-3xl font-bold text-blue-900">{scanResult.stats.total}</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-green-600 mb-1">First-Party</div>
                <div className="text-3xl font-bold text-green-900">{scanResult.stats.firstParty}</div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm font-medium text-orange-600 mb-1">Third-Party</div>
                <div className="text-3xl font-bold text-orange-900">{scanResult.stats.thirdParty}</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-600 mb-1">Categories</div>
                <div className="text-3xl font-bold text-purple-900">
                  {Object.keys(scanResult.stats.byCategory).length}
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {scanResult.stats.byCategory && Object.keys(scanResult.stats.byCategory).length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Cookies by Category</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(scanResult.stats.byCategory).map(([category, count]) => (
                    <div key={category} className={`px-4 py-2 rounded-full ${getCategoryColor(category)} font-medium`}>
                      {category}: {count}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Suggestions */}
            {scanResult.categorySuggestions && scanResult.categorySuggestions.length > 0 && (
              <div className="p-6 border-b border-gray-200 bg-green-50">
                <h3 className="text-md font-semibold text-gray-900 mb-2">
                  💡 Suggested Categories for Your CMP
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Based on the cookies found, we recommend adding these categories to your banner configuration:
                </p>
                <div className="space-y-3">
                  {scanResult.categorySuggestions.map((suggestion) => (
                    <div key={suggestion.key} className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {suggestion.name}
                            {suggestion.required && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Required</span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-2xl font-bold text-gray-900">{suggestion.cookieCount}</div>
                          <div className="text-xs text-gray-500">cookies</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Store suggestions in localStorage
                      localStorage.setItem('cmp_category_suggestions', JSON.stringify(scanResult.categorySuggestions))
                      // Navigate to banner config
                      window.location.href = '/admin/banner-config?applySuggestions=true'
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    → Apply to Banner Configuration
                  </button>
                </div>
              </div>
            )}

            {/* Cookies Table */}
            <div className="p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">
                All Cookies ({scanResult.cookies.length})
              </h3>

              {scanResult.cookies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No cookies found on this website</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cookie Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Properties
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scanResult.cookies.map((cookie, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {cookie.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {cookie.domain}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(cookie.category)}`}>
                              {cookie.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {cookie.domain.startsWith('.') || cookie.domain !== new URL(scanResult.siteUrl).hostname
                              ? '3rd Party'
                              : '1st Party'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex gap-1">
                              {cookie.httpOnly && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                  HttpOnly
                                </span>
                              )}
                              {cookie.secure && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                                  Secure
                                </span>
                              )}
                              {cookie.sameSite && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                  {cookie.sameSite}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scan History */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Scan History</h2>
            <p className="text-sm text-gray-600 mt-1">
              Previous scans for this site
            </p>
          </div>

          <div className="p-6">
            {loadingHistory ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Loading scan history...</p>
              </div>
            ) : scanHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No scan history yet</p>
                <p className="text-sm mt-2">Scan a website above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{scan.siteUrl}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(scan.scannedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-gray-900">{scan.cookieCount}</div>
                        <div className="text-xs text-gray-500">cookies found</div>
                      </div>
                    </div>

                    {scan.stats && scan.stats.byCategory && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(scan.stats.byCategory).map(([category, count]) => (
                          <span key={category} className={`inline-flex items-center px-2 py-1 rounded text-xs ${getCategoryColor(category)}`}>
                            {category}: {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
