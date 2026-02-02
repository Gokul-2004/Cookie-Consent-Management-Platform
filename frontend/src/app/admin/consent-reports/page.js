'use client'

import { useState, useEffect } from 'react'
import { getSiteId } from '../../../utils/getSiteId'

export default function ConsentReportsPage() {
  const [siteId, setSiteId] = useState(null)
  const [consents, setConsents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 50

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    try {
      const id = getSiteId()
      setSiteId(id)
    } catch (err) {
      setError(`Failed to determine siteId: ${err.message}`)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (siteId) {
      fetchConsents()
    }
  }, [siteId])

  const fetchConsents = async () => {
    setLoading(true)
    setError(null)

    try {
      let url = `${apiUrl}/consent/${siteId}`

      // Add date filters if provided
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch consents: ${response.status}`)
      }

      const data = await response.json()
      setConsents(data)
      setCurrentPage(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchConsents()
  }

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setTimeout(() => fetchConsents(), 100)
  }

  // Calculate statistics
  const totalConsents = consents.length
  const acceptedConsents = consents.filter(c => {
    const choices = c.choices || {}
    return Object.values(choices).some(v => v === true)
  }).length
  const rejectedConsents = totalConsents - acceptedConsents
  const acceptanceRate = totalConsents > 0 ? ((acceptedConsents / totalConsents) * 100).toFixed(1) : 0

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = consents.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(consents.length / recordsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading && !consents.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consent reports...</p>
        </div>
      </div>
    )
  }

  if (error && !consents.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consent Reports</h1>
          <p className="text-gray-600">
            Site ID: <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{siteId}</span>
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Consents</div>
            <div className="text-3xl font-bold text-gray-900">{totalConsents}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Accepted</div>
            <div className="text-3xl font-bold text-green-600">{acceptedConsents}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-600">{rejectedConsents}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Acceptance Rate</div>
            <div className="text-3xl font-bold text-blue-600">{acceptanceRate}%</div>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Consent Distribution</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex h-12 rounded-lg overflow-hidden">
                {acceptedConsents > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(acceptedConsents / totalConsents) * 100}%` }}
                  >
                    {acceptedConsents > 0 && `${acceptedConsents}`}
                  </div>
                )}
                {rejectedConsents > 0 && (
                  <div
                    className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(rejectedConsents / totalConsents) * 100}%` }}
                  >
                    {rejectedConsents > 0 && `${rejectedConsents}`}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchConsents}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Apply Filters'}
              </button>

              <button
                onClick={handleClearFilters}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Consent Records Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Consent Records
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({currentRecords.length} of {totalConsents})
              </span>
            </h2>
          </div>

          {consents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg">No consent records found</p>
              <p className="text-sm mt-2">Consents will appear here once users interact with the banner</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Choices
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRecords.map((consent, index) => {
                      const choices = consent.choices || {}
                      const hasAccepted = Object.values(choices).some(v => v === true)
                      const timestamp = new Date(consent.timestamp || consent.createdAt)

                      return (
                        <tr key={consent.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {timestamp.toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {consent.userId ? consent.userId.substring(0, 8) + '...' : 'Anonymous'}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasAccepted ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Accepted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ Rejected
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-900">
                            {Object.keys(choices).length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {Object.keys(choices).map(category => (
                                  <span
                                    key={category}
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      choices[category]
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-800">
                                View JSON
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-xs">
                                {JSON.stringify(choices, null, 2)}
                              </pre>
                            </details>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, totalConsents)} of {totalConsents} records
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 rounded border text-sm ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
