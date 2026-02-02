# Cookie Consent Management Platform - Complete Documentation

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Admin Dashboard Guide](#admin-dashboard-guide)
5. [Website Integration](#website-integration)
6. [API Reference](#api-reference)
7. [Features In-Depth](#features-in-depth)
8. [Database Schema](#database-schema)
9. [Customization Guide](#customization-guide)
10. [Troubleshooting](#troubleshooting)
11. [Deployment](#deployment)
12. [Best Practices](#best-practices)

---

## 🎯 Overview

The Cookie Consent Management Platform (CMP) is a full-stack, GDPR-compliant solution for managing cookie consent on websites. It provides an intuitive admin dashboard for configuration, automated cookie scanning, and a lightweight embeddable SDK for seamless integration.

### Key Components

- **Backend API**: Express.js REST API with PostgreSQL database
- **Admin Dashboard**: Next.js 14 application with real-time preview
- **Cookie Scanner**: Puppeteer-based automated cookie detection
- **Embed SDK**: Lightweight JavaScript SDK for website integration
- **Consent Manager**: Klaro-based cookie consent implementation

### Technology Stack

```
Backend:
├── Express.js (Node.js framework)
├── PostgreSQL (Database)
├── Sequelize ORM (Database management)
└── Puppeteer (Cookie scanning)

Frontend:
├── Next.js 14 (React framework)
├── Tailwind CSS (Styling)
└── Klaro (Consent manager)

Development:
├── Node.js 18+
├── npm/yarn (Package management)
└── Git (Version control)
```

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Website                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Embed SDK (embed.js)                               │   │
│  │  - Loads Klaro consent manager                      │   │
│  │  - Blocks third-party scripts                       │   │
│  │  - Sends consent data to backend                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Config     │  │   Consent    │  │    Scan      │     │
│  │   Routes     │  │   Routes     │  │   Routes     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                              │                               │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │   PostgreSQL DB   │                     │
│                    │  - Tenants        │                     │
│                    │  - Sites          │                     │
│                    │  - Consent        │                     │
│                    │  - Scan Results   │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│              Admin Dashboard (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Integration  │  │    Banner    │  │    Cookie    │     │
│  │     Page     │  │    Config    │  │   Scanner    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────┐     │
│  │           Consent Reports & Analytics             │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Website Owner** configures consent banner via Admin Dashboard
2. **Configuration** is stored in PostgreSQL database
3. **Embed SDK** fetches configuration from Backend API
4. **Banner** is displayed to end users on the website
5. **User consent** is captured and sent to Backend API
6. **Consent records** are stored in database
7. **Analytics** are accessible via Admin Dashboard

---

## 🚀 Installation & Setup

### Prerequisites

```bash
# Check versions
node --version    # v18+ required
npm --version     # v9+ required
psql --version    # PostgreSQL 14+ required
```

### 1. Clone Repository

```bash
git clone https://github.com/Gokul-2004/Cookie-Consent-Management-Platform.git
cd Cookie-Consent-Management-Platform
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb cookie_consent_db

# Configure environment variables
cp .env.example .env
nano .env
```

**`.env` Configuration:**

```env
# Database
DB_NAME=cookie_consent_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

**Run Database Migrations:**

```bash
npm run migrate

# Expected output:
# ✓ 001-create-tenants.js migrated
# ✓ 002-create-sites.js migrated
# ✓ 003-create-consent-records.js migrated
# ✓ 004-create-scan-results.js migrated
```

**Start Backend Server:**

```bash
npm start

# Server should start on http://localhost:3001
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
nano .env.local
```

**`.env.local` Configuration:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Start Frontend:**

```bash
npm run dev

# Frontend should start on http://localhost:3000
```

### 4. Verify Installation

**Test Backend:**
```bash
curl http://localhost:3001/health

# Expected: {"status":"healthy","timestamp":"..."}
```

**Test Frontend:**
```bash
# Open browser: http://localhost:3000
# You should see the landing page
```

**Access Admin Dashboard:**
```bash
# Open: http://localhost:3000/admin/integration
```

---

## 📊 Admin Dashboard Guide

### Dashboard Overview

The admin dashboard consists of 4 main sections accessible via navigation tabs:

```
🚀 Integration → 🎨 Banner Config → 🔍 Cookie Scanner → 📊 Consent Reports
```

### 1. Integration Page

**Purpose**: Get embed script for website integration

**Features**:
- Pre-filled embed script with unique `siteId`
- One-click copy to clipboard
- Step-by-step integration guide
- Before/After examples for script blocking
- Testing checklist

**How to Use**:

1. Navigate to `/admin/integration`
2. Copy the embed script:
   ```html
   <script async src="http://localhost:3000/embed/embed.js?siteId=YOUR_SITE_ID"></script>
   ```
3. Add to your website's `<head>` section
4. Follow the 3-step guide:
   - ✅ Add embed script
   - ✅ Mark third-party scripts to block
   - ✅ Test integration

**Script Blocking Example**:

```html
<!-- BEFORE: Script runs immediately -->
<script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>

<!-- AFTER: Script blocked until consent -->
<script type="text/plain"
        data-type="application/javascript"
        data-name="google-analytics"
        data-cookiecategory="analytics"
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
```

### 2. Banner Configuration

**Purpose**: Customize consent banner appearance and behavior

**Features**:
- **Live Preview Panel** (right side) - See changes in real-time
- **Multi-language Support** - Add EN, DE, FR, ES, etc.
- **Style Customization** - Colors, position, layout, border radius
- **Category Management** - Add, edit, delete cookie categories
- **Text Customization** - Title, description, button labels

#### Language Manager

**Add Language**:
1. Select language from dropdown (EN, DE, FR, ES, IT, NL, PT)
2. Click "Add Language"
3. Fill in translations for:
   - Title
   - Description
   - Accept All button
   - Decline All button
   - Save Settings button
   - Learn More link

**Example Configuration**:
```json
{
  "en": {
    "title": "Cookie Consent",
    "description": "We use cookies to enhance your experience.",
    "acceptAll": "Accept All",
    "declineAll": "Decline All",
    "saveSettings": "Save Settings",
    "learnMore": "Learn More"
  },
  "de": {
    "title": "Cookie-Zustimmung",
    "description": "Wir verwenden Cookies.",
    "acceptAll": "Alle akzeptieren",
    "declineAll": "Alle ablehnen",
    "saveSettings": "Einstellungen speichern",
    "learnMore": "Mehr erfahren"
  }
}
```

#### Style Configuration

**Available Options**:

| Setting | Options | Description |
|---------|---------|-------------|
| **Primary Color** | Hex color | Accept button background |
| **Secondary Color** | Hex color | Other buttons background |
| **Background Color** | Hex color | Banner background |
| **Text Color** | Hex color | All text color |
| **Position** | top, bottom, center | Banner placement |
| **Layout** | banner, modal, box | Banner style |
| **Border Radius** | 0-50px | Corner roundness |

**Example Styles**:
```json
{
  "primaryColor": "#10b981",      // Green
  "secondaryColor": "#065f46",    // Dark green
  "backgroundColor": "#1f2937",   // Dark gray
  "textColor": "#ffffff",         // White
  "position": "bottom",           // Bottom of page
  "layout": "banner",             // Full-width banner
  "borderRadius": "8px"           // Rounded corners
}
```

#### Category Management

**Add New Category**:
1. Click "+ Add New Category"
2. Enter category name (e.g., "Social Media")
3. Fill in:
   - Display Name: "Social Media"
   - Description: "Cookies for social sharing features"
   - Required: No
   - Default On: Optional

**Edit Existing Category**:
1. Find category in list
2. Modify fields:
   - Display Name
   - Description
   - Required checkbox
   - Default On checkbox
3. Click "Save Configuration"

**Category with Cookies (from Scanner)**:

When categories are applied from Cookie Scanner:
- Shows cookie count badge (e.g., "5 cookies")
- Click ▶ arrow to expand
- View all cookie names in blue pills
- Example: `_ga`, `_gid`, `_gat_gtag_UA_XXXXXX`

#### Live Preview Features

The right-side panel shows:
- ✅ Real-time banner preview
- ✅ Exact colors and styles
- ✅ Position and layout
- ✅ Button labels
- ✅ Category checkboxes
- ✅ Configuration summary

**Preview Updates Instantly** when you change:
- Colors → Buttons change color
- Position → Banner moves
- Layout → Banner reshapes
- Text → Content updates
- Border radius → Corners adjust

### 3. Cookie Scanner

**Purpose**: Discover and categorize cookies on any website

**Features**:
- **Automated Detection** - Scans website using Puppeteer
- **Smart Categorization** - AI-based cookie classification
- **Cookie Names** - Expandable list showing all cookies
- **Statistics** - Total, first-party, third-party, by category
- **Scan History** - Previous scans with timestamps
- **One-Click Apply** - Send categories to Banner Config

#### How to Scan

**Step 1: Enter URL**
```
https://google.com
https://bbc.com
https://amazon.com
```

**Step 2: Click "Scan Website"**
- Wait for scan to complete (5-30 seconds)
- Loading spinner shows progress

**Step 3: View Results**

**Statistics Cards**:
- Total Cookies: 15
- First-Party: 8
- Third-Party: 7
- Categories: 4

**Category Breakdown**:
- Analytics: 5 cookies
- Marketing: 3 cookies
- Necessary: 4 cookies
- Functional: 3 cookies

**Category Suggestions**:

Example suggestion:
```
💡 Analytics (5 cookies)
Cookies used to analyze site usage and improve user experience.

Cookies found:
_ga, _gid, _gat, AMP_TOKEN, _gac_UA_XXXXXX

[→ Apply to Banner Configuration]
```

#### Cookie Table

| Cookie Name | Domain | Category | Type | Properties |
|------------|--------|----------|------|------------|
| _ga | .google.com | Analytics | 3rd Party | Secure, SameSite |
| _gid | .google.com | Analytics | 3rd Party | Secure |
| PHPSESSID | example.com | Necessary | 1st Party | HttpOnly, Secure |
| _fbp | .facebook.com | Marketing | 3rd Party | Secure |

#### Cookie Categorization Logic

**Analytics**:
- Patterns: `_ga`, `_gid`, `_gat`, `amplitude`, `mixpanel`, `analytics`
- Purpose: Track user behavior, page views, conversions

**Marketing**:
- Patterns: `_fbp`, `ads`, `doubleclick`, `_gcl`, `utm`, `campaign`
- Purpose: Advertising, retargeting, ad measurement

**Functional**:
- Patterns: `session`, `user`, `cart`, `wishlist`, `preferences`
- Purpose: Shopping cart, login status, user preferences

**Necessary**:
- Patterns: `PHPSESSID`, `csrf`, `security`, `auth`, `cookie_consent`
- Purpose: Essential website functionality, security

**Preferences**:
- Patterns: `language`, `currency`, `theme`, `settings`
- Purpose: User customization, display preferences

#### Scan History

View previous scans:
- URL scanned
- Timestamp
- Cookie count
- Category breakdown
- Click to view full details

### 4. Consent Reports

**Purpose**: View and analyze user consent data

**Features**:
- **Summary Statistics** - Total, accepted, rejected, acceptance rate
- **Visual Charts** - Bar chart showing consent trends
- **Filterable Table** - Search and filter consent records
- **Date Range** - Filter by date range
- **Pagination** - 10 records per page
- **Export** - Download consent data (coming soon)

#### Summary Cards

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Total Consents  │  │    Accepted     │  │    Rejected     │  │ Acceptance Rate │
│      1,234      │  │       987       │  │       247       │  │     80.0%       │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### Date Range Filtering

**Filter Options**:
- Start Date: `2024-01-01`
- End Date: `2024-12-31`
- Click "Filter" to apply

**URL Parameters**:
```
/admin/consent-reports?startDate=2024-01-01&endDate=2024-12-31
```

#### Consent Table

| User ID | Timestamp | Necessary | Analytics | Marketing | IP Address |
|---------|-----------|-----------|-----------|-----------|------------|
| user-123 | 2024-01-15 10:30 | ✅ | ✅ | ❌ | 192.168.1.1 |
| user-456 | 2024-01-15 11:45 | ✅ | ❌ | ❌ | 10.0.0.5 |
| user-789 | 2024-01-15 12:00 | ✅ | ✅ | ✅ | 172.16.0.1 |

#### Analytics Insights

**Key Metrics**:
- **Acceptance Rate**: % of users accepting cookies
- **Category Acceptance**: Which categories are most accepted
- **Trend Analysis**: Consent patterns over time
- **Compliance**: GDPR compliance status

---

## 🌐 Website Integration

### Quick Start Integration

**Step 1: Add Embed Script**

Add to `<head>` section of your website:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Cookie Consent - Add BEFORE other scripts -->
  <script async src="http://localhost:3000/embed/embed.js?siteId=223e4567-e89b-12d3-a456-426614174111"></script>
  
  <!-- Other scripts below... -->
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

**Step 2: Block Third-Party Scripts**

**Google Analytics**:
```html
<!-- Blocked until consent -->
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
</script>
```

**Facebook Pixel**:
```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="facebook-pixel"
        data-cookiecategory="marketing"
        src="https://connect.facebook.net/en_US/fbevents.js"></script>

<script type="text/plain"
        data-type="application/javascript"
        data-name="facebook-pixel"
        data-cookiecategory="marketing">
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

**Hotjar**:
```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="hotjar"
        data-cookiecategory="analytics">
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

**Step 3: Test Integration**

1. Open website in incognito/private mode
2. Open browser DevTools (F12) → Console
3. Verify console messages:
   ```
   [CMP SDK] Initializing...
   [CMP SDK] Configuration loaded successfully
   [CMP SDK] Klaro initialized
   ```
4. Verify banner appears
5. Check that scripts don't load before consent
6. Accept consent and verify scripts now load

### Advanced Integration

#### Custom Consent Callback

```javascript
// Listen for consent changes
window.addEventListener('klaroConfig', function() {
  window.klaro.show();
});

// Get current consent state
const consent = window.klaro.getManager().consents;
console.log('User consents:', consent);

// Check specific category
if (consent.analytics) {
  console.log('Analytics allowed');
  // Load analytics scripts
}
```

#### Programmatic Control

```javascript
// Show consent modal
window.klaro.show();

// Get consent manager
const manager = window.klaro.getManager();

// Update consent
manager.updateConsent('analytics', true);

// Get all consents
const allConsents = manager.consents;
```

#### Dynamic Script Loading

```javascript
// Load script after consent
function loadScriptWithConsent(src, category) {
  const script = document.createElement('script');
  script.type = 'text/plain';
  script.setAttribute('data-type', 'application/javascript');
  script.setAttribute('data-cookiecategory', category);
  script.src = src;
  document.head.appendChild(script);
}

// Usage
loadScriptWithConsent('https://example.com/analytics.js', 'analytics');
```

---

## 🔌 API Reference

### Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3001
```

### Authentication

Currently, the API doesn't require authentication. For production:
- Implement JWT authentication
- Add API keys for webhook endpoints
- Use HTTPS for all requests

### Endpoints

#### 1. Health Check

**GET** `/health`

Check API status.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Get Site Configuration

**GET** `/config/:siteId`

Fetch configuration for a specific site.

**Parameters**:
- `siteId` (string, required) - Unique site identifier

**Response**:
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "config": {
    "bannerText": {
      "en": {
        "title": "Cookie Consent",
        "description": "We use cookies...",
        "acceptAll": "Accept All",
        "declineAll": "Decline All",
        "saveSettings": "Save Settings",
        "learnMore": "Learn More"
      }
    },
    "styles": {
      "primaryColor": "#10b981",
      "secondaryColor": "#065f46",
      "backgroundColor": "#1f2937",
      "textColor": "#ffffff",
      "position": "bottom",
      "layout": "banner",
      "borderRadius": "8px"
    },
    "categories": {
      "necessary": {
        "name": "Necessary",
        "description": "Essential cookies",
        "required": true,
        "enabled": true
      },
      "analytics": {
        "name": "Analytics",
        "description": "Analytics cookies",
        "required": false,
        "enabled": false
      }
    },
    "languages": ["en", "de"],
    "services": []
  }
}
```

#### 3. Update Site Configuration

**PUT** `/config/:siteId`

Update configuration for a site.

**Parameters**:
- `siteId` (string, required) - Unique site identifier

**Body**:
```json
{
  "config": {
    "bannerText": {...},
    "styles": {...},
    "categories": {...},
    "languages": [...],
    "services": [...]
  }
}
```

**Response**:
```json
{
  "message": "Configuration updated successfully",
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "config": {...}
}
```

#### 4. Record Consent

**POST** `/consent`

Record user consent choice.

**Body**:
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "userId": "user-123-456",
  "choices": {
    "necessary": true,
    "analytics": true,
    "marketing": false
  }
}
```

**Response**:
```json
{
  "id": "consent-789-012",
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "userId": "user-123-456",
  "choices": {
    "necessary": true,
    "analytics": true,
    "marketing": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 5. Get Consent Records

**GET** `/consent/:siteId`

Fetch consent records for a site.

**Parameters**:
- `siteId` (string, required) - Unique site identifier

**Query Parameters**:
- `userId` (string, optional) - Filter by user
- `startDate` (string, optional) - Start date (YYYY-MM-DD)
- `endDate` (string, optional) - End date (YYYY-MM-DD)
- `limit` (number, optional) - Max records (default: 100)

**Response**:
```json
[
  {
    "id": "consent-789-012",
    "siteId": "223e4567-e89b-12d3-a456-426614174111",
    "userId": "user-123-456",
    "choices": {
      "necessary": true,
      "analytics": true,
      "marketing": false
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

#### 6. Scan Website

**POST** `/scan`

Scan website for cookies.

**Body**:
```json
{
  "siteUrl": "https://example.com",
  "siteId": "223e4567-e89b-12d3-a456-426614174111"
}
```

**Response**:
```json
{
  "success": true,
  "siteUrl": "https://example.com",
  "scannedAt": "2024-01-15T10:30:00.000Z",
  "cookies": [
    {
      "name": "_ga",
      "domain": ".google.com",
      "category": "analytics",
      "httpOnly": false,
      "secure": true,
      "sameSite": "None"
    }
  ],
  "stats": {
    "total": 15,
    "firstParty": 8,
    "thirdParty": 7,
    "byCategory": {
      "analytics": 5,
      "marketing": 3,
      "necessary": 4,
      "functional": 3
    }
  },
  "categorySuggestions": [
    {
      "key": "analytics",
      "name": "Analytics",
      "description": "Cookies used to analyze site usage",
      "cookieCount": 5,
      "cookies": ["_ga", "_gid", "_gat", "AMP_TOKEN", "_gac"]
    }
  ]
}
```

#### 7. Get Scan History

**GET** `/scan/:siteId`

Get scan history for a site.

**Response**:
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "total": 10,
  "scans": [
    {
      "id": "scan-123-456",
      "siteUrl": "https://example.com",
      "scannedAt": "2024-01-15T10:30:00.000Z",
      "cookieCount": 15,
      "stats": {...}
    }
  ]
}
```

#### 8. Get Scan Result

**GET** `/scan/result/:scanId`

Get specific scan result.

**Response**: Same as POST `/scan` response

#### 9. Delete Scan

**DELETE** `/scan/:scanId`

Delete a scan result.

**Response**:
```json
{
  "message": "Scan result deleted successfully"
}
```

---

## 💡 Features In-Depth

### Live Preview Panel

**How It Works**:
1. React state updates on every form change
2. Preview component receives updated config
3. Inline styles are applied dynamically
4. CSS transitions smooth the changes

**Technical Implementation**:
```jsx
// Dynamic styling based on config
<div style={{
  backgroundColor: config.styles.backgroundColor,
  color: config.styles.textColor,
  borderRadius: config.styles.borderRadius,
  // Position logic
  [config.styles.position === 'top' ? 'top' : 'bottom']: '0'
}}>
  {/* Banner content */}
</div>
```

### Cookie Scanner Categorization

**Pattern Matching Algorithm**:

```javascript
const COOKIE_PATTERNS = {
  analytics: ['_ga', '_gid', '_gat', 'analytics', 'amplitude'],
  marketing: ['_fbp', 'ads', 'doubleclick', 'campaign', 'utm'],
  functional: ['session', 'user', 'cart', 'wishlist'],
  necessary: ['PHPSESSID', 'csrf', 'security', 'auth'],
  preferences: ['language', 'currency', 'theme', 'settings']
};

function categorizeCookie(name, domain) {
  for (const [category, patterns] of Object.entries(COOKIE_PATTERNS)) {
    if (patterns.some(p => name.toLowerCase().includes(p))) {
      return category;
    }
  }
  return 'unclassified';
}
```

**First-Party vs Third-Party Detection**:

```javascript
function isFirstParty(cookieDomain, siteHostname) {
  return cookieDomain === siteHostname || 
         cookieDomain === `.${siteHostname}`;
}
```

### Expandable Cookie Names

**State Management**:

```javascript
const [expandedCategories, setExpandedCategories] = useState({});

function toggleExpansion(key) {
  setExpandedCategories(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
}
```

**Rendering**:

```jsx
{category.cookies?.length > 0 && (
  <button onClick={() => toggleExpansion(key)}>
    <span style={{
      transform: expandedCategories[key] ? 'rotate(90deg)' : 'rotate(0deg)'
    }}>
      ▶
    </span>
  </button>
)}

{expandedCategories[key] && (
  <div>
    {category.cookies.map(name => (
      <span key={name}>{name}</span>
    ))}
  </div>
)}
```

### Multi-Language Support

**Storage Format**:

```json
{
  "bannerText": {
    "en": { "title": "Cookie Consent", ... },
    "de": { "title": "Cookie-Zustimmung", ... },
    "fr": { "title": "Consentement aux cookies", ... }
  },
  "languages": ["en", "de", "fr"]
}
```

**Language Detection**:

```javascript
// Klaro auto-detects browser language
const browserLang = navigator.language.split('-')[0]; // 'en-US' → 'en'
const defaultLang = config.languages.includes(browserLang) 
  ? browserLang 
  : config.languages[0];
```

### Consent Persistence

**LocalStorage Storage**:

```javascript
// Klaro stores consent in localStorage
localStorage.getItem('klaro'); 

// Format:
{
  "consent-analytics": true,
  "consent-marketing": false,
  "consent-necessary": true
}
```

**Backend Recording**:

```javascript
// Embed SDK sends to backend
fetch(`${apiUrl}/consent`, {
  method: 'POST',
  body: JSON.stringify({
    siteId,
    userId,
    choices: {
      analytics: true,
      marketing: false
    }
  })
});
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│   Tenants   │
│─────────────│
│ id (PK)     │
│ name        │
│ email       │
│ createdAt   │
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│    Sites    │
│─────────────│
│ id (PK)     │◄───┐
│ tenantId FK │    │
│ domain      │    │
│ config JSON │    │
│ createdAt   │    │
└─────────────┘    │
       │           │
       │ 1:N       │ 1:N
       ▼           │
┌─────────────┐   │
│  Consent    │   │
│  Records    │   │
│─────────────│   │
│ id (PK)     │   │
│ siteId FK   │───┘
│ userId      │
│ choices JSON│
│ timestamp   │
└─────────────┘

┌─────────────┐
│   Scan      │
│  Results    │
│─────────────│
│ id (PK)     │
│ siteId FK   │───┘
│ siteUrl     │
│ results JSON│
│ scannedAt   │
└─────────────┘
```

### Table Definitions

#### Tenants

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Sites

```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sites_tenant ON sites(tenant_id);
CREATE INDEX idx_sites_domain ON sites(domain);
```

#### Consent Records

```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  choices JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consent_site ON consent_records(site_id);
CREATE INDEX idx_consent_user ON consent_records(user_id);
CREATE INDEX idx_consent_timestamp ON consent_records(timestamp);
```

#### Scan Results

```sql
CREATE TABLE scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  site_url VARCHAR(255) NOT NULL,
  results JSONB NOT NULL,
  scanned_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scan_site ON scan_results(site_id);
CREATE INDEX idx_scan_date ON scan_results(scanned_at);
```

---

## 🎨 Customization Guide

### Custom Styling

**Override Klaro Styles**:

```javascript
// In configMapper.js or embed.js
function applyCustomStyles(styles) {
  const css = `
    .klaro .cookie-notice {
      background-color: ${styles.backgroundColor} !important;
      color: ${styles.textColor} !important;
      border-radius: ${styles.borderRadius} !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
    }
    
    .klaro .cm-btn-success {
      background-color: ${styles.primaryColor} !important;
      border-color: ${styles.primaryColor} !important;
    }
    
    .klaro .cm-btn-success:hover {
      background-color: ${darken(styles.primaryColor, 10)} !important;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}
```

### Custom Categories

**Add New Category**:

1. Admin Dashboard → Banner Configuration
2. Click "+ Add New Category"
3. Configure:
   ```json
   {
     "key": "social_media",
     "name": "Social Media",
     "description": "Cookies for social sharing and embedded content",
     "required": false,
     "enabled": false
   }
   ```

**Use in Website**:

```html
<script type="text/plain"
        data-cookiecategory="social_media"
        src="https://connect.facebook.net/en_US/sdk.js"></script>
```

### Custom Language

**Add Custom Translation**:

```javascript
// In LanguageManager component
const customTranslations = {
  'es': {
    title: 'Consentimiento de Cookies',
    description: 'Utilizamos cookies para mejorar tu experiencia.',
    acceptAll: 'Aceptar Todas',
    declineAll: 'Rechazar Todas',
    saveSettings: 'Guardar Configuración',
    learnMore: 'Más Información'
  }
};
```

### Webhook Integration

**Add Consent Webhook** (Future):

```javascript
// POST /consent webhook
app.post('/consent', async (req, res) => {
  const { siteId, userId, choices } = req.body;
  
  // Save to database
  await ConsentRecord.create({...});
  
  // Trigger webhook
  if (site.webhookUrl) {
    await fetch(site.webhookUrl, {
      method: 'POST',
      body: JSON.stringify({
        event: 'consent_updated',
        siteId,
        userId,
        choices,
        timestamp: new Date()
      })
    });
  }
  
  res.json({ success: true });
});
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Banner Not Showing

**Problem**: Embed script loaded but banner doesn't appear

**Solutions**:

```bash
# Check 1: Verify script is loaded
curl http://localhost:3000/embed/embed.js

# Check 2: Check console for errors
# Open DevTools (F12) → Console
# Look for: [CMP SDK] messages

# Check 3: Verify configuration exists
curl http://localhost:3001/config/YOUR_SITE_ID

# Check 4: Check Klaro loaded
# In browser console:
console.log(window.klaro);  // Should not be undefined
```

**Common Causes**:
- Wrong `siteId` in embed script
- Backend not running
- CORS blocking requests
- JavaScript error preventing execution

#### 2. Scripts Not Blocking

**Problem**: Third-party scripts run before consent

**Solutions**:

```html
<!-- ❌ WRONG: Script runs immediately -->
<script src="https://analytics.com/script.js"></script>

<!-- ✅ CORRECT: Script blocked -->
<script type="text/plain"
        data-type="application/javascript"
        data-cookiecategory="analytics"
        src="https://analytics.com/script.js"></script>
```

**Checklist**:
- [ ] `type="text/plain"` is set
- [ ] `data-cookiecategory` matches category key
- [ ] `data-type="application/javascript"` is set
- [ ] Embed script loads BEFORE third-party scripts

#### 3. Klaro Library Error

**Problem**: `window.klaro` is undefined

**Solution**: Check case sensitivity

```javascript
// ❌ WRONG (uppercase K)
if (window.Klaro) { ... }

// ✅ CORRECT (lowercase k)
if (window.klaro) { ... }
```

#### 4. Styling Not Applying

**Problem**: Custom colors don't show

**Solutions**:

```javascript
// Increase CSS specificity
.klaro div.cookie-notice {
  background-color: ${color} !important;
}

// Apply styles AFTER Klaro loads
setTimeout(() => {
  applyCustomStyles(config.styles);
}, 100);
```

#### 5. Database Connection Error

**Problem**: `Error: connect ECONNREFUSED`

**Solutions**:

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check connection
psql -U postgres -d cookie_consent_db

# Verify .env file
cat backend/.env | grep DB_
```

#### 6. Cookie Scanner Timeout

**Problem**: Scan times out or fails

**Solutions**:

```javascript
// Increase timeout in scan route
const result = await scanWebsite(siteUrl, { 
  timeout: 60000  // 60 seconds
});

// Check Puppeteer installation
npm list puppeteer

// Reinstall if needed
npm install puppeteer --force
```

#### 7. CORS Errors

**Problem**: `Access-Control-Allow-Origin` error

**Solution**: Update backend CORS config

```javascript
// backend/src/index.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://your-domain.com'
  ],
  credentials: true
}));
```

### Debug Mode

**Enable Debug Logging**:

```javascript
// In embed.js
const CMP = {
  debug: true,
  
  log: function(...args) {
    if (this.debug) {
      console.log('[CMP SDK]', ...args);
    }
  }
};
```

**View Logs**:

```javascript
// Browser Console
[CMP SDK] Initializing...
[CMP SDK] Site ID: 223e4567-e89b-12d3-a456-426614174111
[CMP SDK] Configuration loaded successfully
[CMP SDK] Klaro library loaded
[CMP SDK] Klaro initialized
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] PostgreSQL database created
- [ ] Database migrations run
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] API rate limiting enabled
- [ ] Error logging configured
- [ ] Backups scheduled
- [ ] Monitoring setup

### Backend Deployment (Heroku)

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create your-cmp-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.com

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-backend.herokuapp.com

# Deploy to production
vercel --prod
```

### Database Deployment (Supabase)

1. Go to https://supabase.com
2. Create new project
3. Get connection string
4. Update backend `.env`:
   ```env
   DB_HOST=db.xxxxx.supabase.co
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_PORT=5432
   ```
5. Run migrations

### Environment Variables

**Backend (.env)**:
```env
# Production
NODE_ENV=production
PORT=3001

# Database
DB_HOST=your-db-host.com
DB_NAME=cookie_consent_db
DB_USER=postgres
DB_PASSWORD=strong_password_here
DB_PORT=5432

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Optional
RATE_LIMIT=100
SESSION_SECRET=random_secret_here
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

---

## 📚 Best Practices

### Security

1. **Never commit `.env` files**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use HTTPS in production**
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     if (req.protocol !== 'https') {
       return res.redirect('https://' + req.get('host') + req.url);
     }
   }
   ```

3. **Sanitize user input**
   ```javascript
   const { siteUrl } = req.body;
   
   // Validate URL
   try {
     new URL(siteUrl);
   } catch (e) {
     return res.status(400).json({ error: 'Invalid URL' });
   }
   ```

4. **Rate limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

### Performance

1. **Database indexing**
   ```sql
   CREATE INDEX idx_consent_site_user ON consent_records(site_id, user_id);
   CREATE INDEX idx_consent_timestamp ON consent_records(timestamp DESC);
   ```

2. **Caching**
   ```javascript
   const NodeCache = require('node-cache');
   const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes
   
   app.get('/config/:siteId', async (req, res) => {
     const cached = cache.get(req.params.siteId);
     if (cached) return res.json(cached);
     
     const config = await fetchConfig(req.params.siteId);
     cache.set(req.params.siteId, config);
     res.json(config);
   });
   ```

3. **CDN for embed script**
   ```html
   <!-- Serve from CDN instead of your server -->
   <script src="https://cdn.your-domain.com/embed.js?siteId=xxx"></script>
   ```

### GDPR Compliance

1. **Cookie consent before tracking**
   - ✅ Block all non-essential scripts by default
   - ✅ Only load after explicit consent
   - ✅ Provide granular category control

2. **Data retention**
   ```javascript
   // Delete old consent records (90 days)
   cron.schedule('0 0 * * *', async () => {
     await ConsentRecord.destroy({
       where: {
         timestamp: {
           [Op.lt]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
         }
       }
     });
   });
   ```

3. **User rights**
   - Right to access: GET `/consent/:siteId?userId=xxx`
   - Right to deletion: DELETE `/consent/:consentId`
   - Right to withdraw: Update consent with all false

### Code Quality

1. **Error handling**
   ```javascript
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ 
       error: 'Internal server error',
       message: process.env.NODE_ENV === 'development' ? err.message : undefined
     });
   });
   ```

2. **Logging**
   ```javascript
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

3. **Testing**
   ```javascript
   // backend/__tests__/api.test.js
   describe('Config API', () => {
     it('should fetch site configuration', async () => {
       const res = await request(app)
         .get('/config/test-site-id')
         .expect(200);
       
       expect(res.body).toHaveProperty('siteId');
       expect(res.body).toHaveProperty('config');
     });
   });
   ```

---

## 📞 Support & Contact

For issues, questions, or contributions:

- **GitHub**: https://github.com/Gokul-2004/Cookie-Consent-Management-Platform
- **Issues**: https://github.com/Gokul-2004/Cookie-Consent-Management-Platform/issues
- **Email**: your-email@example.com

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Klaro**: Open-source consent manager (https://github.com/kiprotect/klaro)
- **Puppeteer**: Headless browser automation
- **Next.js**: React framework
- **Express.js**: Node.js web framework
- **PostgreSQL**: Database

---

**Built with ❤️ by Gokul**

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
