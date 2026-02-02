# 🧪 Complete Verification Checklist

## ✅ Current Status

- ✅ Backend running on port 3001
- ✅ Frontend running on port 3000
- ✅ Admin page accessible at `/admin/banner-config`
- ✅ PUT endpoint created and tested
- ✅ Configuration saved to database

---

## 🔍 1. Admin UI Loads Correctly

**Test:**
```
Open: http://localhost:3000/admin/banner-config
```

**Expected:**
- ✅ Page displays without errors
- ✅ Form shows with all sections:
  - Languages section
  - Banner Text form
  - Style Settings (colors, position, layout)
  - Cookie Categories
  - Save Configuration button

**Status:** ✅ WORKING (confirmed)

---

## 🔄 2. Config Fetching Works

**Test:**
```bash
# Check what's in database
curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111 | jq .
```

**Expected JSON:**
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "config": {
    "bannerText": {
      "en": { "title": "Updated Cookie Consent blabla", ... },
      "de": { "title": "Cookie-Zustimmung", ... }
    },
    "styles": {
      "primaryColor": "#10b981",
      "backgroundColor": "#1f2937",
      ...
    },
    "categories": {
      "necessary": { ... },
      "analytics": { ... }
    },
    "languages": ["en", "de"]
  }
}
```

**What to check:**
- [ ] Config contains your green colors (#10b981, #065f46)
- [ ] Config has both English and German translations
- [ ] Config has 2 categories (necessary, analytics)

---

## 📝 3. Form Fields Display Correctly

**Test:** Look at admin page sections

**Languages:**
- [ ] Shows "EN" and "DE" tabs
- [ ] Can add new language (try adding Italian)
- [ ] Can remove language

**Banner Text:**
- [ ] English tab shows: "Updated Cookie Consent blabla"
- [ ] German tab shows: "Cookie-Zustimmung"
- [ ] All fields editable

**Style Settings:**
- [ ] Primary Color shows: #10b981 (green)
- [ ] Secondary Color shows: #065f46 (dark green)
- [ ] Position selected: "bottom"
- [ ] Layout selected: "Banner"

**Categories:**
- [ ] "Necessary" category (required, enabled)
- [ ] "Analytics" category (optional, disabled by default)

---

## 🧾 4. Form Validation Works

**Test:** Try invalid inputs

**Test 1: Invalid Color**
1. Change Primary Color to: `blue` (not a hex code)
2. Click "Save Configuration"
3. Expected: Error message "Invalid hex color format"

**Test 2: Empty Language**
1. Remove all languages
2. Try to save
3. Expected: Error about needing at least one language

**Status:**
- [ ] Validation prevents saving invalid data
- [ ] Error messages clear and helpful

---

## 📤 5. Config Saving Works

**Test:**
1. Change banner title to: "My Custom Banner"
2. Change primary color to: #ff6b6b (red)
3. Click "Save Configuration"

**Expected:**
- [ ] Green toast notification: "Configuration saved successfully!"
- [ ] Toast disappears after 5 seconds

**Verify in backend:**
```bash
curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111 | jq '.config.bannerText.en.title'
# Should show: "My Custom Banner"

curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111 | jq '.config.styles.primaryColor'
# Should show: "#ff6b6b"
```

---

## 🎨 6. Frontend Banner Updates

**THIS IS THE KEY TEST!**

**Test:**
1. Make sure you saved a configuration with:
   - Green colors (#10b981)
   - Title: "Updated Cookie Consent blabla"
   - 2 categories: Necessary, Analytics

2. Clear browser cookies:
   ```
   Chrome: Ctrl+Shift+Delete → Cookies → Clear
   Firefox: Ctrl+Shift+Delete → Cookies → Clear
   ```

3. Open in **incognito/private** window:
   ```
   http://localhost:3000
   ```

**Expected:**
- [ ] Banner appears at **bottom** of page
- [ ] Banner has **GREEN** colors (not gray/dark)
- [ ] Title shows: "Updated Cookie Consent blabla"
- [ ] Two buttons visible: "Accept All" and "Decline All"
- [ ] Clicking settings shows 2 categories:
  - ✅ Necessary (pre-checked, cannot disable)
  - ☐ Analytics (unchecked, can toggle)

**If banner doesn't appear:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Look for logs:
   ```
   [CMP] Fetching consent config for site: ...
   [CMP] Using admin configuration  ← MUST SEE THIS
   [CMP] Klaro initialized successfully
   ```

---

## 🌐 7. Multi-Language Test

**Test:**
1. In admin panel, ensure both EN and DE are configured
2. Clear cookies
3. Change browser language to German:
   - Chrome: Settings → Languages → Move German to top
   - Firefox: Settings → Language → Add German, move to top

4. Visit: `http://localhost:3000`

**Expected:**
- [ ] Banner shows German text: "Cookie-Zustimmung"
- [ ] Buttons in German: "Alle akzeptieren", "Alle ablehnen"

---

## ❌ 8. Error Handling

**Test 1: Backend Down**
1. Stop backend: `Ctrl+C` in backend terminal
2. Try to save config in admin panel

**Expected:**
- [ ] Red toast error message
- [ ] Clear error about network failure

**Test 2: Invalid siteId**
1. Visit: `http://localhost:3000/admin/banner-config?siteId=invalid-uuid-123`

**Expected:**
- [ ] Page loads but shows error
- [ ] Error message about invalid siteId format

---

## 🔀 9. Dynamic siteId

**Test:**
1. Visit admin with URL parameter:
   ```
   http://localhost:3000/admin/banner-config?siteId=223e4567-e89b-12d3-a456-426614174111
   ```

**Expected:**
- [ ] Page loads with correct siteId shown in header
- [ ] Config loads for that specific site

**Test hostname mapping:**
1. Open `frontend/src/utils/getSiteId.js`
2. Check line 18-25 for hostname mappings
3. Verify `localhost:3000` maps to your siteId

---

## 🎯 10. UX & Usability

**Test:**
- [ ] Can tab through form fields
- [ ] Required fields marked with red asterisk (*)
- [ ] Color pickers work (click to choose color)
- [ ] Save button shows spinner while saving
- [ ] Success message visible and auto-hides
- [ ] Reset button reloads page
- [ ] JSON preview shows at bottom (dev mode)

---

## 🚀 Final Integration Test

**Complete Flow:**

1. **Admin Panel:**
   - Change title to: "Test Integration"
   - Change colors to RED: #ff0000
   - Save successfully

2. **Database:**
   ```bash
   curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111 | jq '.config.bannerText.en.title'
   ```
   - Verify shows: "Test Integration"

3. **Frontend:**
   - Clear cookies
   - Open incognito: `http://localhost:3000`
   - See RED banner with "Test Integration"

4. **Consent Recording:**
   - Click "Accept All"
   - Check console for:
     ```
     [CMP] ✅ Consent successfully recorded in backend
     ```
   - Verify in database:
     ```bash
     curl http://localhost:3001/consent/223e4567-e89b-12d3-a456-426614174111 | jq '. | length'
     ```
     Should show count increased

---

## 📋 Quick Verification Script

Run this to test everything at once:

```bash
#!/bin/bash

echo "=== VERIFICATION SCRIPT ==="
echo ""

echo "1. Checking backend..."
curl -s http://localhost:3001/health && echo "✅ Backend UP" || echo "❌ Backend DOWN"
echo ""

echo "2. Checking config in database..."
CONFIG=$(curl -s http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111)
echo "$CONFIG" | jq '.config.bannerText.en.title'
echo "$CONFIG" | jq '.config.styles.primaryColor'
echo ""

echo "3. Checking frontend..."
curl -s http://localhost:3000 | grep -q "CMP Starter" && echo "✅ Frontend UP" || echo "❌ Frontend DOWN"
echo ""

echo "4. Checking admin page..."
curl -s http://localhost:3000/admin/banner-config | grep -q "Banner Configuration" && echo "✅ Admin page UP" || echo "❌ Admin page issue"
echo ""

echo "5. Checking consent records..."
COUNT=$(curl -s http://localhost:3001/consent/223e4567-e89b-12d3-a456-426614174111 | jq '. | length')
echo "Total consent records: $COUNT"
echo ""

echo "=== VERIFICATION COMPLETE ==="
```

Save as `verify.sh`, run: `chmod +x verify.sh && ./verify.sh`

---

## ✅ Success Criteria

**Minimum to pass:**
- [ ] Admin page loads and displays form
- [ ] Config saves to database successfully
- [ ] Frontend banner appears (even if with default styling)
- [ ] Consent recording works

**Full success:**
- [ ] Admin config applied to frontend banner
- [ ] Custom colors visible on banner
- [ ] Multi-language works
- [ ] All validation works
- [ ] Error handling graceful

---

## 🐛 Common Issues & Fixes

### Issue: Banner doesn't appear
**Fix:**
1. Check browser console for errors
2. Clear cookies and reload
3. Try incognito mode
4. Check `[CMP]` logs in console

### Issue: Old banner styling appears
**Fix:**
1. Hard refresh: `Ctrl+Shift+R`
2. Clear browser cache completely
3. Check console shows "Using admin configuration"

### Issue: Admin page blank/loading forever
**Fix:**
1. Check browser console for errors
2. Verify backend is running
3. Check network tab for API calls
4. Verify siteId is valid UUID

### Issue: "Site not found" error
**Fix:**
1. Check siteId exists in database
2. Run: `SELECT * FROM sites WHERE id = 'your-uuid';`
3. Create site if missing

---

## 📞 Debug Commands

```bash
# Check what's running on ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# View backend logs
cd backend && npm start

# View frontend logs
cd frontend && npm run dev

# Test backend directly
curl http://localhost:3001/health
curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111

# Check database
psql -d cmp_db -c "SELECT id, domain FROM sites;"
psql -d cmp_db -c "SELECT config FROM sites WHERE id = '223e4567-e89b-12d3-a456-426614174111';"
```

---

**Ready to verify? Start with step 1 and work through each section!** 🚀
