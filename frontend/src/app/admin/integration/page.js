'use client'

import { useState, useEffect } from 'react'
import { getSiteId } from '../../../utils/getSiteId'

export default function IntegrationPage() {
  const [siteId, setSiteId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedExample, setCopiedExample] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const embedUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3003'

  useEffect(() => {
    try {
      const id = getSiteId()
      setSiteId(id)
    } catch (err) {
      console.error('Failed to get siteId:', err)
    }
  }, [])

  const embedScript = `<script async src="${embedUrl}/embed/embed.js?siteId=${siteId}"></script>`

  const exampleScript = `<!-- Google Analytics (Blocked until consent) -->
<script type="text/plain"
        data-type="application/javascript"
        data-name="google-analytics"
        data-cookiecategory="analytics"
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<script type="text/plain"
        data-type="application/javascript"
        data-name="google-analytics"
        data-cookiecategory="analytics">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`

  const copyToClipboard = (text, setCopiedState) => {
    navigator.clipboard.writeText(text)
    setCopiedState(true)
    setTimeout(() => setCopiedState(false), 2000)
  }

  if (!siteId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integration details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Integration</h1>
          <p className="text-gray-600">
            Follow these steps to integrate the cookie consent banner into your website
          </p>
        </div>

        {/* Step 1 - Add Embed Script */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm">1</span>
              Add Embed Script to Your Website
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Add this script tag to the <code className="bg-gray-100 px-2 py-1 rounded text-sm">&lt;head&gt;</code> section of your website,
              <strong> before any other third-party scripts</strong>:
            </p>

            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{embedScript}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(embedScript, setCopied)}
                className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>💡 Important:</strong> This script must load <strong>before</strong> any tracking scripts (Google Analytics, Facebook Pixel, etc.)
                to properly block them until consent is given.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 - Block Third-Party Scripts */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm">2</span>
              Mark Scripts to Block
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              For each third-party script that sets cookies, change the script tag to block it until consent:
            </p>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">❌ Before (runs immediately):</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`<script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>`}</code>
              </pre>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">✅ After (blocked until consent):</h3>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{exampleScript}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(exampleScript, setCopiedExample)}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  {copiedExample ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-sm text-yellow-900 mb-2">
                <strong>📝 Key Changes Required:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
                <li><code className="bg-yellow-100 px-1">type="text/plain"</code> - Prevents script execution</li>
                <li><code className="bg-yellow-100 px-1">data-type="application/javascript"</code> - Original script type</li>
                <li><code className="bg-yellow-100 px-1">data-name="service-name"</code> - Unique identifier</li>
                <li><code className="bg-yellow-100 px-1">data-cookiecategory="category"</code> - Cookie category (analytics, marketing, etc.)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 3 - Test Integration */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm">3</span>
              Test Your Integration
            </h2>
          </div>
          <div className="p-6">
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                <span>Clear your browser cookies</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <span>Open your website in incognito/private mode</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <span>Verify the consent banner appears</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                <span>Open browser DevTools (F12) → Network tab</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">5</span>
                <span>Verify tracking scripts are NOT loaded before consent</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">6</span>
                <span>Accept cookies and verify scripts now load</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">🔗 Helpful Resources</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={`${embedUrl}/embed/example.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold text-gray-900">Live Example</div>
                  <div className="text-sm text-gray-600">See working integration</div>
                </div>
              </a>

              <a
                href="/admin/cookie-scanner"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl">🔍</span>
                <div>
                  <div className="font-semibold text-gray-900">Cookie Scanner</div>
                  <div className="text-sm text-gray-600">Scan for cookies on your site</div>
                </div>
              </a>

              <a
                href="/admin/banner-config"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl">⚙️</span>
                <div>
                  <div className="font-semibold text-gray-900">Banner Settings</div>
                  <div className="text-sm text-gray-600">Customize banner appearance</div>
                </div>
              </a>

              <a
                href="/admin/consent-reports"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-semibold text-gray-900">Consent Reports</div>
                  <div className="text-sm text-gray-600">View consent analytics</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Site Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Site ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono">{siteId}</code>
          </p>
        </div>
      </div>
    </div>
  )
}
