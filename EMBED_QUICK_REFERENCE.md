# 🚀 CMP Embed SDK - Quick Reference Card

## 📝 Installation (Copy & Paste)

```html
<!-- Add to <head> BEFORE other scripts -->
<script async src="https://your-cmp-domain.com/embed/embed.js?siteId=YOUR_SITE_ID"></script>
```

---

## 🔒 Block a Script (3-Step Pattern)

### Before (Runs immediately):
```html
<script src="https://example.com/analytics.js"></script>
```

### After (Blocked until consent):
```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="analytics"
        data-cookiecategory="analytics"
        src="https://example.com/analytics.js"></script>
```

**Key Changes:**
1. `type="text/plain"` - Prevents execution
2. `data-type="application/javascript"` - Original type
3. `data-cookiecategory="analytics"` - Consent category

---

## 📦 Common Categories

| Category | Use For | Example |
|----------|---------|---------|
| `necessary` | Essential scripts | Session, Auth, CSRF |
| `analytics` | Statistics | Google Analytics, Hotjar |
| `marketing` | Advertising | Facebook Pixel, Google Ads |
| `functional` | Features | Chat widgets, Maps |
| `preferences` | Settings | Theme, Language |

---

## 🎯 Quick Examples

### Google Analytics
```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="google-analytics"
        data-cookiecategory="analytics"
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>

<script type="text/plain"
        data-type="application/javascript"
        data-name="google-analytics"
        data-cookiecategory="analytics">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXX');
</script>
```

### Facebook Pixel
```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="facebook-pixel"
        data-cookiecategory="marketing">
  !function(f,b,e,v,n,t,s){/* FB Pixel code */}
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

### Intercom Chat
```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="intercom"
        data-cookiecategory="functional">
  window.intercomSettings = {app_id: "YOUR_APP_ID"};
  /* Intercom initialization code */
</script>
```

---

## 🛠️ JavaScript API

```javascript
// Show consent modal
window.Klaro.show();

// Check if CMP is ready
if (window.CMPConsent?.initialized) {
  console.log('CMP ready');
}

// Get current consent
var consents = window.Klaro.getManager().consents;
console.log(consents); // { analytics: true, marketing: false, ... }

// Programmatically update consent
window.Klaro.getManager().updateConsent('analytics', true);
```

---

## 🐛 Debug Mode

Add to URL or script tag:
```
?cmp-debug=true
```

Check in console:
```javascript
console.log(window.CMPConsent);
console.log(window.Klaro);
```

---

## ✅ Integration Checklist

- [ ] Add embed script to `<head>`
- [ ] Replace `YOUR_SITE_ID` with actual ID
- [ ] Change blocked scripts to `type="text/plain"`
- [ ] Add `data-cookiecategory` to each script
- [ ] Add `data-type` to each script
- [ ] Add `data-name` to each script
- [ ] Test in incognito mode
- [ ] Clear cookies between tests

---

## ⚠️ Common Mistakes

### ❌ Wrong:
```html
<!-- Still runs (no type="text/plain") -->
<script data-cookiecategory="analytics" src="analytics.js"></script>
```

### ✅ Correct:
```html
<script type="text/plain"
        data-type="application/javascript"
        data-cookiecategory="analytics"
        src="analytics.js"></script>
```

---

## 📊 Testing

```bash
# 1. Clear cookies
# Chrome: Ctrl+Shift+Delete

# 2. Open incognito/private window

# 3. Visit your site

# 4. Check console:
window.CMPConsent.initialized  // Should be true
window.Klaro                    // Should exist

# 5. Accept consent

# 6. Verify scripts loaded:
# Check Network tab for analytics.js, pixel.js, etc.
```

---

## 🔗 URLs

- **Example Page:** `/embed/example.html`
- **Full Docs:** `EMBED_INTEGRATION_GUIDE.md`
- **Admin Panel:** `/admin/banner-config`
- **API Health:** `/health`

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| Banner not showing | Clear cookies, check siteId |
| Scripts not blocked | Add `type="text/plain"` |
| Scripts not running after consent | Add `data-type="application/javascript"` |
| API errors | Check backend is running |
| CORS errors | Enable CORS on backend |

---

**Need help?** Check browser console for `[CMP SDK]` messages
