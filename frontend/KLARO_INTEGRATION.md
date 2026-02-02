# Klaro Consent Manager Integration

This document explains how the Klaro consent manager is integrated into the Next.js frontend.

## Overview

The Cookie Consent Management Platform uses [Klaro](https://github.com/kiprotect/klaro) - an open-source, privacy-friendly consent manager that complies with GDPR, CCPA, and other privacy regulations.

## Features

✅ **Backend Integration**
- Fetches consent banner configuration from backend API
- Sends user consent choices back to backend
- Stores consent records in PostgreSQL database

✅ **Client-Side Only**
- No SSR - runs only in browser
- Prevents hydration issues
- Respects user privacy

✅ **Error Handling**
- Graceful fallback if API is unavailable
- Development-mode error display
- Console logging for debugging

✅ **User Experience**
- Clean, modern consent banner
- Customizable translations
- Remembers user choices (365 days)
- Easy to update preferences

## Architecture

```
┌─────────────────┐
│  Root Layout    │
│  (layout.js)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  ClientLayout   │ ← 'use client' wrapper
│  (ClientLayout) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ ConsentManager  │ ← Klaro integration
│                 │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────┐
│  Fetch Config   │──────→│  Backend API │
│  GET /config/   │      │  :3001       │
└─────────────────┘      └──────────────┘
         │
         ↓
┌─────────────────┐
│  Initialize     │
│  Klaro Banner   │
└─────────────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────┐
│  User Accepts   │──────→│  Backend API │
│  Send Consent   │      │  POST        │
└─────────────────┘      │  /consent    │
                         └──────────────┘
```

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout (includes ClientLayout)
│   │   └── page.js            # Home page
│   └── components/
│       ├── ClientLayout.js    # Client-side wrapper
│       └── ConsentManager.js  # Klaro integration component
├── .env.local                 # Environment configuration
└── package.json               # Dependencies (includes klaro)
```

## Components

### 1. ConsentManager.js

**Location:** `src/components/ConsentManager.js`

**Purpose:** Main integration component that:
- Fetches configuration from backend
- Initializes Klaro with proper settings
- Sends consent choices to backend
- Handles errors gracefully

**Key Features:**
- Client-side only (`'use client'`)
- Uses React hooks (useState, useEffect)
- Imports Klaro from npm package
- Includes callback to POST consent to backend

**Code Structure:**
```javascript
'use client'

import { useEffect, useState } from 'react'
import * as Klaro from 'klaro/dist/klaro-no-css'
import 'klaro/dist/klaro.css'

export default function ConsentManager() {
  // State for error handling and loading
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Klaro on client side only
    const initializeKlaro = async () => {
      // 1. Get configuration
      // 2. Fetch from backend API
      // 3. Initialize Klaro
      // 4. Set up consent callback
    }

    if (typeof window !== 'undefined') {
      initializeKlaro()
    }
  }, [])

  return null // No visual output
}
```

### 2. ClientLayout.js

**Location:** `src/components/ClientLayout.js`

**Purpose:** Wrapper component that ensures ConsentManager runs on all pages.

```javascript
'use client'

import ConsentManager from './ConsentManager'

export default function ClientLayout({ children }) {
  return (
    <>
      <ConsentManager />
      {children}
    </>
  )
}
```

### 3. layout.js

**Location:** `src/app/layout.js`

**Purpose:** Root layout that includes ClientLayout.

```javascript
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
```

## Configuration

### Environment Variables

Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_ID=223e4567-e89b-12d3-a456-426614174111
```

**Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SITE_ID` - Site UUID from database

### Klaro Configuration

The configuration is fetched from the backend API and merged with defaults:

```javascript
const klaroConfig = {
  elementID: 'klaro',
  storageMethod: 'cookie',
  cookieName: 'klaro',
  cookieExpiresAfterDays: 365,

  // Services from backend
  services: [
    {
      name: 'analytics',
      title: 'Analytics',
      description: 'Help us improve',
      purposes: ['analytics'],
      default: false
    },
    // More services...
  ],

  // Callback when consent changes
  callback: async (consent, service) => {
    // Send to backend API
  }
}
```

## API Integration

### Fetching Configuration

```javascript
const response = await fetch(`${apiUrl}/config/${siteId}`)
const data = await response.json()
// data.config contains services array
```

**Response Format:**
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "config": {
    "services": [
      {
        "name": "analytics",
        "title": "Analytics",
        "purposes": ["analytics"],
        "default": false
      }
    ]
  }
}
```

### Sending Consent

```javascript
await fetch(`${apiUrl}/consent`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    siteId: siteId,
    userId: localStorage.getItem('userId') || null,
    choices: {
      analytics: true,
      marketing: false
    }
  })
})
```

**Request Body:**
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "userId": "user123",
  "choices": {
    "analytics": true,
    "marketing": false
  }
}
```

## Error Handling

### Development Mode

In development, errors are displayed visually:

```javascript
if (process.env.NODE_ENV === 'development' && error) {
  return (
    <div style={{ /* error styling */ }}>
      <strong>Consent Manager Error:</strong>
      <p>{error}</p>
    </div>
  )
}
```

### Production Mode

In production, errors are logged to console only:

```javascript
console.error('Error initializing Klaro:', error)
```

### Graceful Fallbacks

1. **Missing Site ID:** Warning logged, banner doesn't load
2. **API Unavailable:** Error logged, default services used
3. **Network Error:** Error logged, banner still initializes with defaults

## User Flow

### First Visit

1. User visits website
2. ConsentManager fetches configuration from backend
3. Klaro banner appears at bottom of page
4. User makes choices (Accept All / Decline / Save Settings)
5. Choices sent to backend API
6. Choices stored in cookie for 365 days

### Return Visit

1. User visits website
2. Klaro reads cookie from previous visit
3. Banner doesn't appear (consent already given)
4. User can open settings to change preferences

### Changing Preferences

User can click "Cookie Settings" button to:
- View current choices
- Enable/disable individual services
- Accept all or decline all
- Save new preferences (sent to backend)

## Customization

### Adding New Services

Edit the backend site configuration or update the default services:

```javascript
services: [
  {
    name: 'my-service',
    title: 'My Service',
    description: 'Description of what this service does',
    purposes: ['analytics', 'marketing'],
    default: false,
    required: false
  }
]
```

### Translations

Add or modify translations in the klaroConfig:

```javascript
translations: {
  en: {
    consentModal: {
      title: 'Your Custom Title',
      description: 'Your custom description'
    }
  },
  es: {
    // Spanish translations
  }
}
```

### Styling

Klaro uses CSS that can be customized:

```javascript
// Import default styles
import 'klaro/dist/klaro.css'

// Or create custom CSS file
import './custom-klaro-styles.css'
```

## Testing

### Local Testing

1. Start backend:
   ```bash
   cd backend
   npm start
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit http://localhost:3000
4. Consent banner should appear
5. Check browser console for logs

### Verify API Integration

Open browser DevTools → Network tab:

1. **On page load:**
   - See `GET /config/[siteId]` request
   - Response should contain services

2. **After accepting cookies:**
   - See `POST /consent` request
   - Response should confirm consent recorded

### Check Console Logs

```
Fetching consent config for site: 223e4567-e89b-12d3-a456-426614174111
Consent config loaded: { siteId: '...', config: {...} }
Initializing Klaro...
Klaro initialized successfully
Consent updated: { services: ['analytics'] }
Sending consent to backend: { siteId: '...', userId: null, choices: {...} }
Consent recorded successfully: { message: '...', record: {...} }
```

## Troubleshooting

### Banner Doesn't Appear

1. Check `.env.local` has correct values
2. Check backend is running on :3001
3. Check browser console for errors
4. Clear browser cookies and reload

### API Errors

1. Verify backend is running: `curl http://localhost:3001/health`
2. Verify site exists: `curl http://localhost:3001/config/[siteId]`
3. Check CORS is enabled in backend
4. Check network requests in DevTools

### Hydration Errors

Klaro must run client-side only:
- ✅ Uses `'use client'` directive
- ✅ Checks `typeof window !== 'undefined'`
- ✅ Wrapped in ClientLayout component

### Cookie Not Persisting

1. Check browser allows cookies
2. Check cookieExpiresAfterDays setting
3. Try clearing all cookies and retry
4. Check cookie in DevTools → Application → Cookies

## Best Practices

1. **Always use environment variables** for configuration
2. **Test in incognito mode** to see first-visit experience
3. **Check console logs** for debugging information
4. **Verify backend integration** with network tab
5. **Test on multiple browsers** for compatibility
6. **Keep Klaro updated** to latest version

## Dependencies

```json
{
  "dependencies": {
    "klaro": "^0.7.22",
    "next": "^14.0.4",
    "react": "^18.2.0"
  }
}
```

## Resources

- [Klaro Documentation](https://kiprotect.com/docs/klaro)
- [Klaro GitHub](https://github.com/kiprotect/klaro)
- [GDPR Compliance](https://gdpr.eu/)
- [Backend API Documentation](../backend/API.md)

## License

Klaro is open-source under BSD-3-Clause license.

---

**Implementation Complete!** ✅

The Klaro consent manager is fully integrated with:
- Backend API integration
- Client-side only rendering
- Error handling
- Consent tracking
- 365-day cookie persistence
