# Admin Banner Configuration Page

## Overview

A comprehensive admin interface for managing cookie consent banner configurations. Allows tenants to customize banner appearance, text, categories, and multi-language support through an intuitive web UI.

## Access

**URL:** `/admin/banner-config`

**Example:**
```
http://localhost:3000/admin/banner-config
http://localhost:3000/admin/banner-config?siteId=223e4567-e89b-12d3-a456-426614174111
```

## Features

### ✅ 1. Dynamic Site Detection
- Automatically detects siteId using the same logic as the main banner
- Supports URL parameter override for testing
- Displays current siteId in the header

### ✅ 2. Language Management
- Add/remove languages dynamically
- 14+ pre-configured languages with flag emojis
- Custom language code support
- Set default language (first in list)
- Translation status tracking per language

### ✅ 3. Banner Text Editing
- Multi-language text editor with tab interface
- Fields: Title, Description, Button labels (Accept/Decline/Save)
- Real-time translation completeness indicator
- Language-specific placeholders
- Required field validation

### ✅ 4. Style Configuration
- **Colors:** Primary, Secondary, Text, Background
  - Visual color picker
  - Hex code input with validation
  - Live preview
- **Position:** Top, Bottom, Center
- **Layout:** Banner (full-width), Modal (centered), Box (corner)
- **Additional Settings:**
  - Border radius slider
  - Font size selector
  - Show/hide close button
  - Block page interaction toggle

### ✅ 5. Cookie Categories Management
- Add/remove cookie categories
- Configure per category:
  - Display name
  - Description
  - Required flag (always enabled)
  - Default enabled state
- Category summary dashboard
- Cannot delete required categories

### ✅ 6. Form Validation
- Client-side validation before submission
- Hex color format validation
- Language code validation (ISO 639-1)
- Required field checking
- Backend validation with detailed error messages

### ✅ 7. API Integration
- Loads existing config on mount
- PUT request to update config
- Success/error toast notifications
- Loading states with spinners
- Reset functionality

### ✅ 8. Development Tools
- JSON config preview (dev mode only)
- Console logging for debugging
- Detailed error messages

---

## Page Structure

### Components

1. **Main Page:** `/admin/banner-config/page.js`
   - Container component
   - API integration
   - Form submission logic
   - Validation orchestration

2. **LanguageManager:** `/components/admin/LanguageManager.js`
   - Add/remove languages
   - Set default language
   - Flag emoji display
   - Translation status

3. **BannerTextForm:** `/components/admin/BannerTextForm.js`
   - Multi-language text editor
   - Tab interface for language selection
   - Field validation
   - Translation completeness tracking

4. **StyleConfigForm:** `/components/admin/StyleConfigForm.js`
   - Color pickers with hex validation
   - Position radio buttons
   - Layout selection cards
   - Style preview panel

5. **CategoryConfigForm:** `/components/admin/CategoryConfigForm.js`
   - Category list with edit/delete
   - Add new category form
   - Category summary dashboard
   - Required category protection

---

## Configuration Schema

The admin page manages this JSON structure:

```json
{
  "bannerText": {
    "en": {
      "title": "Cookie Consent",
      "description": "We use cookies to enhance your browsing experience.",
      "acceptAll": "Accept All",
      "declineAll": "Decline All",
      "saveSettings": "Save Settings",
      "learnMore": "Learn More"
    },
    "de": {
      "title": "Cookie-Zustimmung",
      "description": "Wir verwenden Cookies...",
      ...
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
      "description": "Essential cookies required for the website to function",
      "required": true,
      "enabled": true
    },
    "analytics": {
      "name": "Analytics",
      "description": "Help us understand how visitors interact",
      "required": false,
      "enabled": false,
      "default": false
    }
  },
  "languages": ["en", "de", "es"],
  "services": []
}
```

---

## API Endpoints

### GET /config/:siteId

**Request:**
```http
GET /config/223e4567-e89b-12d3-a456-426614174111
```

**Response:**
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "config": { ... }
}
```

---

### PUT /config/:siteId

**Request:**
```http
PUT /config/223e4567-e89b-12d3-a456-426614174111
Content-Type: application/json

{
  "config": {
    "bannerText": { ... },
    "styles": { ... },
    "categories": { ... },
    "languages": ["en", "de"]
  }
}
```

**Success Response (200):**
```json
{
  "message": "Configuration updated successfully",
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "config": { ... }
}
```

**Error Response (400):**
```json
{
  "error": "Invalid config structure",
  "details": [
    "styles.primaryColor must be a valid hex color",
    "languages array must contain at least one language code"
  ]
}
```

---

## Validation Rules

### Client-Side Validation

**Banner Text:**
- At least one language translation required

**Styles:**
- Colors must match regex: `/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/`
- Position must be: `top`, `bottom`, or `center`
- Layout must be: `banner`, `modal`, or `box`

**Categories:**
- At least one category required

**Languages:**
- At least one language required
- Language codes must match: `/^[a-z]{2,3}$/`

### Server-Side Validation

Backend validates the same rules plus:
- Config must be an object
- BannerText must have at least one language
- All color values validated if present
- Position/layout values validated if present

---

## Usage Guide

### 1. Access the Admin Page

```bash
# Start both servers
cd backend && npm start    # Port 3001
cd frontend && npm run dev # Port 3000

# Visit admin page
open http://localhost:3000/admin/banner-config
```

---

### 2. Manage Languages

**Add a Language:**
1. Click **"+ Add Language"**
2. Select from dropdown (English, German, Spanish, etc.)
3. Or choose "Custom" and enter 2-3 letter code
4. Click **"Add"**

**Remove a Language:**
1. Find language in list
2. Click **"Remove"** button
3. Confirm deletion (translations will be lost)

**Set Default Language:**
1. Click **"Set as default"** on any non-default language
2. Language moves to first position
3. Users see this if browser language not supported

---

### 3. Edit Banner Text

**Switch Language:**
- Click language buttons at top of form
- Current language highlighted in blue

**Edit Fields:**
- Fill in Title, Description, Button labels
- Required fields marked with red asterisk (*)
- Changes saved when you submit the form

**Check Translation Status:**
- Green badge: All required fields filled
- Yellow badge: Missing required fields
- Shows count like "5/5" (filled/required)

---

### 4. Configure Styles

**Colors:**
1. Click color picker to choose visually
2. Or enter hex code manually (e.g., `#3b82f6`)
3. Invalid hex codes show error message

**Position:**
- Select Top, Bottom, or Center
- Radio buttons with descriptions

**Layout:**
- Banner: Full-width horizontal bar
- Modal: Centered overlay with backdrop
- Box: Small corner notification

**Additional Settings:**
- Border Radius: Drag slider (0-24px)
- Font Size: Small/Medium/Large dropdown
- Show Close Button: Checkbox
- Block Page Interaction: Checkbox

**Preview:**
- Click **"Show Style Preview"**
- See live preview with your colors/styles
- Click **"Hide"** to collapse

---

### 5. Manage Cookie Categories

**Edit Category:**
1. Click checkbox to enable/disable
2. Edit Display Name
3. Edit Description
4. Toggle "Required" (always enabled)
5. Toggle "Default" (enabled by default for new users)

**Add Category:**
1. Click **"+ Add New Category"**
2. Enter category name (e.g., "Preferences")
3. Key auto-generated (e.g., `preferences`)
4. Click **"Add Category"**
5. Configure the new category fields

**Delete Category:**
1. Click **"Delete"** button on category
2. Confirm deletion
3. Cannot delete required categories

**Category Summary:**
- Total Categories
- Enabled count
- Required count
- Default On count

---

### 6. Save Configuration

**Submit:**
1. Review all sections
2. Click **"Save Configuration"** at bottom
3. Wait for spinner
4. See success toast (green) or error toast (red)

**Validation Errors:**
- Red box appears above submit button
- Lists all validation errors
- Fix errors and try again

**Reset:**
- Click **"Reset"** button
- Reloads page (loses unsaved changes)

---

## Testing Scenarios

### Test 1: Create New Language

```bash
# 1. Access admin page
open http://localhost:3000/admin/banner-config

# 2. Add German language
- Click "+ Add Language"
- Select "German (Deutsch) (de)"
- Click "Add"

# 3. Translate banner text
- Click "DE" tab in Banner Text section
- Fill in all fields in German
- Check translation status shows 5/5

# 4. Save
- Click "Save Configuration"
- Check success toast appears
```

---

### Test 2: Change Banner Style

```bash
# 1. Go to Style Settings section
# 2. Change colors
- Primary Color: #10b981 (green)
- Background: #065f46 (dark green)

# 3. Change position
- Select "Top"

# 4. Click "Show Style Preview"
- Verify preview shows green colors
- Verify buttons render correctly

# 5. Save and verify on main site
- Save configuration
- Go to http://localhost:3000
- Clear cookies
- See new green banner at top
```

---

### Test 3: Add Custom Category

```bash
# 1. Go to Cookie Categories section
# 2. Click "+ Add New Category"
# 3. Enter "Social Media"
# 4. Click "Add Category"
# 5. Edit the new category:
- Name: "Social Media"
- Description: "Enable social sharing features"
- Required: No
- Default: Yes

# 6. Save configuration
# 7. Verify category appears in banner on main site
```

---

### Test 4: Validation Errors

```bash
# 1. Go to Style Settings
# 2. Enter invalid hex color: "blue"
# 3. Try to save
# 4. See validation error:
   "Invalid hex color format"

# 5. Fix by entering: "#0000ff"
# 6. Save successfully
```

---

### Test 5: Multi-Language Setup

```bash
# 1. Add 3 languages: English, German, Spanish
# 2. Translate all banner text for each language
# 3. Set German as default:
   - Click "Set as default" on German
   - Verify German is now first in list

# 4. Save configuration
# 5. Test on main site:
   - Browser set to German: See German text
   - Browser set to French: See German text (fallback)
   - Browser set to Spanish: See Spanish text
```

---

## Troubleshooting

### Issue: Page Shows "Could not determine siteId"

**Solution:**
1. Check `.env.local` has `NEXT_PUBLIC_SITE_ID`
2. Or provide `?siteId=...` in URL
3. Restart dev server after changing `.env.local`

---

### Issue: "Site not found" Error

**Solution:**
1. Verify siteId exists in database:
   ```sql
   SELECT * FROM sites WHERE id = '223e4567-e89b-12d3-a456-426614174111';
   ```
2. If not, create site record in backend
3. Check backend is running on port 3001

---

### Issue: Changes Not Saving

**Solution:**
1. Open browser DevTools → Network tab
2. Submit form and check PUT request
3. Look at response status code:
   - 400: Validation error (check details)
   - 404: Site not found
   - 500: Server error (check backend logs)
4. Check backend console for error messages

---

### Issue: Validation Error Won't Clear

**Solution:**
1. Check red error box for specific error
2. Fix the validation issue
3. If error persists, click "Reset" to reload
4. Re-enter your changes

---

### Issue: Colors Not Updating in Preview

**Solution:**
1. Check hex color format is correct
2. Click "Hide Preview" then "Show Preview" to refresh
3. Save configuration and test on main site

---

## Best Practices

### 1. Language Management
- Always translate banner text for all languages before saving
- Keep language list short (3-5 languages) for maintainability
- Set most common language as default

### 2. Style Configuration
- Use consistent brand colors across site
- Test banner on both light/dark backgrounds
- Ensure text color contrasts with background (accessibility)
- Preview before saving

### 3. Cookie Categories
- Keep category names short and clear
- Write descriptions in plain language
- Mark only truly essential categories as "Required"
- Test banner with all category combinations

### 4. Testing
- Test on different browsers
- Test with browser language settings
- Clear cookies before testing
- Use incognito mode for fresh sessions

---

## Security Considerations

1. **Admin Access:** This page has no authentication (development only)
   - **TODO:** Add authentication/authorization in production
   - Restrict access to admin users only

2. **Input Validation:** All inputs validated on client and server
   - Prevents XSS via color injection
   - Validates language codes format
   - Sanitizes text inputs

3. **CORS:** Backend CORS configured to allow frontend origin
   - Check `backend/src/server.js` CORS settings

---

## Production Deployment

### 1. Add Authentication

```javascript
// Example with Next.js middleware
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('admin_token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

### 2. Environment Variables

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourcmp.com
NEXT_PUBLIC_SITE_ID=your-production-site-id
```

### 3. Backend API Security

```javascript
// Add JWT verification
router.put('/config/:siteId',
  verifyAdminToken,  // Add this middleware
  validateSiteId,
  async (req, res) => { ... }
)
```

---

## Future Enhancements

Possible improvements:

- [ ] Add authentication/authorization
- [ ] Multi-tenant user management
- [ ] Config version history (rollback capability)
- [ ] Import/export config as JSON
- [ ] Duplicate config to other sites
- [ ] A/B testing different banner configurations
- [ ] Analytics dashboard (consent rates, etc.)
- [ ] Bulk operations (apply same config to multiple sites)
- [ ] Live preview iframe (see changes without saving)
- [ ] Theme presets (pre-configured color schemes)
- [ ] Custom CSS injection
- [ ] Schedule config changes (publish at specific time)

---

## Files Created

### Frontend Files

1. `/app/admin/banner-config/page.js` - Main admin page
2. `/components/admin/BannerTextForm.js` - Multi-language text editor
3. `/components/admin/StyleConfigForm.js` - Style configuration
4. `/components/admin/CategoryConfigForm.js` - Category management
5. `/components/admin/LanguageManager.js` - Language add/remove/reorder
6. `/app/globals.css` - Added toast animation

### Backend Files

1. `/routes/config.js` - Added PUT endpoint and validation

---

## Summary

✅ **Complete admin interface** for banner configuration
✅ **Multi-language support** with 14+ languages
✅ **Style customization** with live preview
✅ **Category management** with add/delete
✅ **Form validation** client and server-side
✅ **API integration** with error handling
✅ **Toast notifications** for success/error
✅ **Responsive design** works on mobile/desktop
✅ **Development tools** with JSON preview

Your CMP now has a full-featured admin interface! 🎉
