# Admin Banner Configuration - Setup Guide

## Quick Start

### 1. Start Both Servers

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Access Admin Page

```bash
# Open in browser
http://localhost:3000/admin/banner-config

# Or with specific siteId
http://localhost:3000/admin/banner-config?siteId=223e4567-e89b-12d3-a456-426614174111
```

---

## What Was Built

### Frontend Components

**Page:** `/admin/banner-config/page.js`
- Main admin interface container
- Handles API fetching and saving
- Form validation and submission
- Success/error toast notifications
- Loading states

**Components Created:**

1. **LanguageManager** (`/components/admin/LanguageManager.js`)
   - Add/remove languages
   - Set default language
   - 14+ pre-configured languages with flags
   - Custom language code support

2. **BannerTextForm** (`/components/admin/BannerTextForm.js`)
   - Multi-language text editor
   - Tab-based language switcher
   - Translation completeness tracking
   - Required field validation

3. **StyleConfigForm** (`/components/admin/StyleConfigForm.js`)
   - Color pickers with hex validation
   - Position selector (top/bottom/center)
   - Layout selector (banner/modal/box)
   - Live style preview
   - Additional settings (border radius, font size, etc.)

4. **CategoryConfigForm** (`/components/admin/CategoryConfigForm.js`)
   - Add/edit/delete cookie categories
   - Category summary dashboard
   - Required/optional flags
   - Default enabled state

### Backend Endpoint

**Route:** `PUT /config/:siteId` (`backend/src/routes/config.js`)
- Updates site configuration in database
- Validates config structure
- Returns detailed error messages
- Logs configuration changes

### CSS Animations

**File:** `frontend/src/app/globals.css`
- Toast notification fade-in animation

---

## Features Overview

### ✅ Multi-Language Support
- Add unlimited languages
- Edit translations per language
- Track translation completeness
- Set default fallback language

### ✅ Style Customization
- Color picker + hex input
- Position: Top, Bottom, Center
- Layout: Banner, Modal, Box
- Border radius slider
- Font size selector
- Toggle options (close button, page blocking)
- Live preview panel

### ✅ Cookie Categories
- Add/remove categories dynamically
- Configure: name, description, required, default
- Cannot delete required categories
- Summary dashboard (total, enabled, required)

### ✅ Form Validation
**Client-side:**
- Hex color format validation
- Language code format validation
- Required field checking
- Summary of all errors before submission

**Server-side:**
- All client validations repeated
- Returns detailed error array
- Config structure validation

### ✅ UX Features
- Loading spinner during save
- Toast notifications (success/error)
- Auto-hide success message after 5s
- Reset button to reload original config
- JSON preview in dev mode
- Responsive design (mobile/desktop)

---

## Configuration Structure

The admin page manages this complete configuration object:

```json
{
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
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1f2937",
    "textColor": "#ffffff",
    "backgroundColor": "#1f2937",
    "position": "bottom",
    "layout": "banner",
    "borderRadius": "8px",
    "fontSize": "medium",
    "showCloseButton": true,
    "blockPageInteraction": false
  },
  "categories": {
    "necessary": {
      "name": "Necessary",
      "description": "Essential cookies",
      "required": true,
      "enabled": true
    }
  },
  "languages": ["en"],
  "services": []
}
```

---

## Testing

### Test Backend Endpoint

```bash
# Run test script
cd backend
./test-config-update.sh

# Or manual curl
curl -X PUT http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111 \
  -H "Content-Type: application/json" \
  -d '{"config": {...}}'
```

### Test Frontend

1. **Load existing config:**
   - Access `/admin/banner-config`
   - Verify form populates with existing data
   - Check console logs for loading messages

2. **Edit and save:**
   - Change banner title
   - Add a new language
   - Modify colors
   - Click "Save Configuration"
   - Check for success toast

3. **Validation:**
   - Enter invalid hex color (e.g., "blue")
   - Try to save
   - Verify error message appears
   - Fix error and save successfully

4. **Verify on main site:**
   - Go to `http://localhost:3000`
   - Clear cookies (or use incognito)
   - See updated banner with new config

---

## API Endpoints

### GET /config/:siteId
Fetch existing configuration

**Request:**
```bash
curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111
```

**Response:**
```json
{
  "siteId": "...",
  "config": { ... }
}
```

### PUT /config/:siteId
Update configuration

**Request:**
```bash
curl -X PUT http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111 \
  -H "Content-Type: application/json" \
  -d '{"config": {...}}'
```

**Success Response (200):**
```json
{
  "message": "Configuration updated successfully",
  "siteId": "...",
  "config": { ... }
}
```

**Error Response (400):**
```json
{
  "error": "Invalid config structure",
  "details": [
    "styles.primaryColor must be a valid hex color"
  ]
}
```

---

## Development Workflow

### 1. Make Changes in Admin UI

```bash
# 1. Open admin page
http://localhost:3000/admin/banner-config

# 2. Edit configuration
- Add German language
- Translate banner text
- Change primary color to green (#10b981)
- Add "Preferences" category

# 3. Save
- Click "Save Configuration"
- Wait for success toast
```

### 2. Verify Changes

```bash
# Option 1: Check in database
psql -d cmp_db -c "SELECT config FROM sites WHERE id = '223e4567-e89b-12d3-a456-426614174111';"

# Option 2: Check via API
curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111 | jq .

# Option 3: See on main site
# Open http://localhost:3000 in incognito mode
```

### 3. Debug Issues

**Check browser console:**
```javascript
// Look for these logs
[Admin] Fetching config for site: ...
[Admin] Config loaded: {...}
[Admin] Saving config: {...}
```

**Check network tab:**
- PUT request to `/config/:siteId`
- Status code (200 = success, 400 = validation error)
- Response body with error details

**Check backend logs:**
```bash
# Terminal where backend is running
Config updated for site ...: { languages: 2, categories: 3, ... }
```

---

## Troubleshooting

### Issue: "Could not determine siteId"

**Cause:** No siteId found via URL parameter, hostname, or env variable

**Fix:**
```bash
# Option 1: Add to URL
http://localhost:3000/admin/banner-config?siteId=YOUR_SITE_ID

# Option 2: Set in .env.local
NEXT_PUBLIC_SITE_ID=223e4567-e89b-12d3-a456-426614174111

# Then restart frontend
cd frontend && npm run dev
```

### Issue: "Site not found"

**Cause:** SiteId doesn't exist in database

**Fix:**
```sql
-- Check if site exists
SELECT * FROM sites WHERE id = '223e4567-e89b-12d3-a456-426614174111';

-- If not, create it
INSERT INTO sites (id, tenant_id, domain, config)
VALUES (
  '223e4567-e89b-12d3-a456-426614174111',
  'your-tenant-id',
  'localhost',
  '{}'::jsonb
);
```

### Issue: Validation errors won't clear

**Fix:**
1. Check the red error box for specific issues
2. Fix each validation error
3. If stuck, click "Reset" button
4. Re-enter your changes correctly

### Issue: Changes not reflected on main site

**Fix:**
1. Clear browser cookies
2. Use incognito mode
3. Hard refresh (Ctrl+Shift+R)
4. Check that config actually saved (check API or database)

### Issue: Colors not showing in preview

**Fix:**
1. Verify hex format is correct (#RRGGBB)
2. Toggle preview off and on
3. Check browser console for errors
4. Save and test on actual banner

---

## Production Considerations

### 🔒 Security (REQUIRED for production)

**1. Add Authentication:**

This page has NO authentication currently. You MUST add auth before deploying to production.

**Example with Next.js middleware:**

```javascript
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Check if user is authenticated
  const token = request.cookies.get('admin_token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token with your auth service
  // ...

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

**2. Add Backend Authorization:**

```javascript
// backend/src/routes/config.js
router.put('/config/:siteId',
  verifyJWT,           // Verify user is logged in
  verifyAdminRole,     // Verify user is admin
  verifySiteAccess,    // Verify user has access to this site
  validateSiteId,
  async (req, res) => { ... }
)
```

### 📊 Monitoring

**Add logging:**
```javascript
// Track who changed what
console.log(`User ${userId} updated config for site ${siteId}`, {
  timestamp: new Date(),
  changes: diff(oldConfig, newConfig)
})
```

**Add audit trail:**
```sql
CREATE TABLE config_audit (
  id UUID PRIMARY KEY,
  site_id UUID REFERENCES sites(id),
  user_id VARCHAR,
  old_config JSONB,
  new_config JSONB,
  changed_at TIMESTAMP DEFAULT NOW()
);
```

### 🚀 Performance

**Add caching:**
- Cache GET /config/:siteId responses (5-10 minutes)
- Invalidate cache on PUT
- Use CDN for static assets

**Optimize queries:**
- Add database indexes on frequently queried fields
- Use connection pooling

---

## File Structure

```
BAN-MAN/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   │   └── banner-config/
│   │   │   │       └── page.js          # Main admin page
│   │   │   ├── globals.css              # Toast animation
│   │   │   └── layout.js
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── BannerTextForm.js    # Text editor
│   │   │   │   ├── StyleConfigForm.js   # Style editor
│   │   │   │   ├── CategoryConfigForm.js # Category manager
│   │   │   │   └── LanguageManager.js   # Language manager
│   │   │   └── ConsentManager.js
│   │   └── utils/
│   │       ├── getSiteId.js
│   │       └── consentApi.js
│   ├── ADMIN_BANNER_CONFIG.md           # Detailed docs
│   └── .env.local
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── config.js                # Added PUT endpoint
│   │   ├── models/
│   │   └── server.js
│   ├── test-config-update.sh            # Test script
│   └── .env
└── ADMIN_SETUP.md                        # This file
```

---

## Next Steps

### Immediate
1. ✅ Test the admin page locally
2. ✅ Create a few different configurations
3. ✅ Verify changes appear on main site
4. ✅ Test validation with invalid data

### Before Production
1. ⚠️ **Add authentication/authorization** (CRITICAL)
2. ⚠️ Add rate limiting on PUT endpoint
3. ⚠️ Add CSRF protection
4. ⚠️ Set up monitoring/logging
5. ⚠️ Create config backup/restore functionality

### Optional Enhancements
1. Config version history
2. Import/export config as JSON
3. Duplicate config to other sites
4. Live preview iframe
5. Theme presets
6. Custom CSS injection
7. A/B testing support

---

## Summary

✅ **Complete admin interface** built and tested
✅ **Multi-language support** with 14+ languages
✅ **Style customization** with live preview
✅ **Category management** (add/edit/delete)
✅ **Form validation** (client + server)
✅ **Backend endpoint** with detailed validation
✅ **Toast notifications** for feedback
✅ **Responsive design** for all devices
✅ **Development tools** (JSON preview, logging)

🎉 **Your CMP now has a fully functional admin panel!**

---

## Documentation

- [ADMIN_BANNER_CONFIG.md](frontend/ADMIN_BANNER_CONFIG.md) - Detailed user guide
- [CONSENT_PERSISTENCE.md](frontend/CONSENT_PERSISTENCE.md) - Consent API docs
- [DYNAMIC_SITE_ID.md](frontend/DYNAMIC_SITE_ID.md) - Dynamic siteId docs

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Review validation error messages
4. Test backend endpoint with curl
5. Verify database contains site record

Happy configuring! 🚀
