# 🚀 CMP Embed SDK Integration Guide

Complete guide for integrating the Cookie Consent Management Platform into your website.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [Blocking Third-Party Scripts](#blocking-third-party-scripts)
5. [Examples](#examples)
6. [Advanced Configuration](#advanced-configuration)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

---

## ⚡ Quick Start

### Step 1: Add the Embed Script

Add this script tag to your website's `<head>` section, **before any other scripts**:

```html
<script async src="https://your-cmp-domain.com/embed/embed.js?siteId=YOUR_SITE_ID"></script>
```

**Replace:**
- `your-cmp-domain.com` with your CMP domain
- `YOUR_SITE_ID` with your actual site ID from the admin panel

### Step 2: Mark Scripts for Consent

Change script tags that need consent from this:

```html
<script src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

To this:

```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="google-analytics"
        data-cookiecategory="analytics"
        src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

**That's it!** The CMP will now:
- Show a consent banner on first visit
- Block scripts until user gives consent
- Remember user preferences
- Automatically enable scripts after consent

---

## 📦 Installation

### Method 1: Direct Embed (Recommended)

Add to your HTML `<head>`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Website</title>

  <!-- CMP Embed Script - Add this FIRST -->
  <script async src="https://your-cmp-domain.com/embed/embed.js?siteId=YOUR_SITE_ID"></script>

  <!-- Your other scripts below -->
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

### Method 2: With Custom API URL

If your API is hosted separately:

```html
<script async src="https://your-cmp-domain.com/embed/embed.js?siteId=YOUR_SITE_ID&apiUrl=https://api.your-domain.com"></script>
```

### Method 3: For Development/Testing

```html
<script async src="http://localhost:3000/embed/embed.js?siteId=YOUR_SITE_ID&apiUrl=http://localhost:3001"></script>
```

---

## 🎯 Basic Usage

### Complete HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website with CMP</title>

  <!-- 1. CMP Embed (First!) -->
  <script async src="https://your-cmp-domain.com/embed/embed.js?siteId=abc-123-def"></script>

  <!-- 2. Necessary scripts (always run) -->
  <script src="/js/app.js"></script>

  <!-- 3. Analytics (blocked until consent) -->
  <script type="text/plain"
          data-type="application/javascript"
          data-name="google-analytics"
          data-cookiecategory="analytics">
    // Google Analytics code here
  </script>

  <!-- 4. Marketing scripts (blocked until consent) -->
  <script type="text/plain"
          data-type="application/javascript"
          data-name="facebook-pixel"
          data-cookiecategory="marketing"
          src="https://connect.facebook.net/en_US/fbevents.js"></script>
</head>
<body>
  <h1>Welcome to My Website</h1>
</body>
</html>
```

---

## 🚫 Blocking Third-Party Scripts

### Key Concepts

To block a script until consent:

1. **Change `type` to `text/plain`** - Prevents browser from executing
2. **Add `data-type="application/javascript"`** - Original type for Klaro to restore
3. **Add `data-name`** - Unique identifier for the service
4. **Add `data-cookiecategory`** - Category this script belongs to

### Attribute Reference

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `type="text/plain"` | ✅ Yes | Prevents script execution | `type="text/plain"` |
| `data-type` | ✅ Yes | Original script type | `data-type="application/javascript"` |
| `data-name` | ✅ Yes | Service identifier | `data-name="google-analytics"` |
| `data-cookiecategory` | ✅ Yes | Consent category | `data-cookiecategory="analytics"` |

### Common Categories

- `necessary` - Essential cookies (always enabled)
- `analytics` - Analytics and statistics
- `marketing` - Advertising and marketing
- `functional` - Enhanced functionality
- `preferences` - User preferences

---

## 📚 Examples

### Example 1: Google Analytics (GA4)

**Before (Always runs):**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**After (Requires consent):**
```html
<!-- External GA script -->
<script type="text/plain"
        data-type="application/javascript"
        data-name="google-analytics"
        data-cookiecategory="analytics"
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<!-- Inline GA initialization -->
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

### Example 2: Facebook Pixel

**Before:**
```html
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

**After:**
```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="facebook-pixel"
        data-cookiecategory="marketing">
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

### Example 3: Hotjar

```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="hotjar"
        data-cookiecategory="analytics">
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HJID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

### Example 4: Intercom Chat Widget

```html
<script type="text/plain"
        data-type="application/javascript"
        data-name="intercom"
        data-cookiecategory="functional">
  window.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: "YOUR_APP_ID"
  };
  (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){
  ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;
  var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};
  w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';
  s.async=true;s.src='https://widget.intercom.io/widget/YOUR_APP_ID';
  var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};
  if(document.readyState==='complete'){l();}else if(w.attachEvent){
  w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
</script>
```

### Example 5: YouTube Embed (with consent)

```html
<!-- YouTube video that requires consent -->
<div data-name="youtube"
     data-cookiecategory="marketing"
     data-src="https://www.youtube.com/embed/VIDEO_ID"
     style="width:560px;height:315px;background:#ccc;">
  <p style="text-align:center;padding-top:100px;">
    Accept marketing cookies to view this video.
  </p>
</div>

<script type="text/plain"
        data-type="application/javascript"
        data-name="youtube"
        data-cookiecategory="marketing">
  // Initialize YouTube iframe
  document.querySelectorAll('[data-name="youtube"]').forEach(function(el) {
    var iframe = document.createElement('iframe');
    iframe.src = el.getAttribute('data-src');
    iframe.width = '560';
    iframe.height = '315';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    el.innerHTML = '';
    el.appendChild(iframe);
  });
</script>
```

---

## ⚙️ Advanced Configuration

### Debug Mode

Enable debug logging in browser console:

```html
<script async src="https://your-cmp-domain.com/embed/embed.js?siteId=YOUR_SITE_ID&cmp-debug=true"></script>
```

Or add to URL:
```
https://your-website.com?cmp-debug=true
```

### Programmatic Access

The SDK exposes a global `window.CMPConsent` object:

```javascript
// Check if CMP is initialized
if (window.CMPConsent && window.CMPConsent.initialized) {
  console.log('CMP is ready');
  console.log('Site ID:', window.CMPConsent.siteId);
  console.log('User ID:', window.CMPConsent.userId);
}

// Access Klaro instance
if (window.Klaro) {
  // Show consent modal programmatically
  window.Klaro.show();

  // Get current consent
  var consent = window.Klaro.getManager().consents;
  console.log('Current consents:', consent);
}
```

### Custom Styling

The SDK automatically applies custom colors from your admin panel configuration. To override:

```html
<style>
  /* Override CMP styles */
  .klaro .cookie-notice {
    background-color: #your-color !important;
  }

  .klaro .cm-btn-success {
    background-color: #your-button-color !important;
  }
</style>
```

### Consent Change Events

Listen for consent changes:

```javascript
// Klaro fires consent change events
document.addEventListener('klaroManager', function(event) {
  console.log('Consent updated:', event.detail);
});
```

---

## 🔧 Troubleshooting

### Banner Not Showing

**Problem:** Consent banner doesn't appear

**Solutions:**
1. Check browser console for errors
2. Verify `siteId` is correct
3. Ensure embed script loads before other scripts
4. Check if consent already given (clear cookies to test)
5. Verify API endpoint is accessible

**Debug:**
```javascript
// In browser console
console.log('CMP loaded:', !!window.CMPConsent);
console.log('CMP initialized:', window.CMPConsent?.initialized);
console.log('Klaro loaded:', !!window.Klaro);
```

### Scripts Not Being Blocked

**Problem:** Third-party scripts run without consent

**Solutions:**
1. Verify `type="text/plain"` is set
2. Check `data-cookiecategory` attribute is present
3. Ensure script tags are in correct format
4. Make sure CMP loads before blocked scripts

**Example Fix:**
```html
<!-- Wrong (Still runs) -->
<script src="analytics.js"></script>

<!-- Correct (Blocked until consent) -->
<script type="text/plain"
        data-type="application/javascript"
        data-name="analytics"
        data-cookiecategory="analytics"
        src="analytics.js"></script>
```

### Scripts Not Running After Consent

**Problem:** Scripts don't execute even after accepting

**Solutions:**
1. Check `data-type` is set to `application/javascript`
2. Verify `data-name` matches category name
3. Check browser console for JavaScript errors in the script
4. Try hard refresh (Ctrl+Shift+R)

### API Connection Issues

**Problem:** "Failed to load config" error

**Solutions:**
1. Check if backend API is running
2. Verify CORS is enabled on backend
3. Check network tab in DevTools
4. Verify `apiUrl` parameter if using custom URL

**Test API manually:**
```bash
curl https://your-api-domain.com/config/YOUR_SITE_ID
```

### Cookie Not Persisting

**Problem:** Banner shows on every page load

**Solutions:**
1. Check if cookies are blocked in browser
2. Verify domain matches in cookie settings
3. Check for `SameSite` cookie issues
4. Try different browser/incognito mode

---

## 📖 API Reference

### Script Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `siteId` | ✅ Yes | Your unique site identifier | `?siteId=abc-123` |
| `apiUrl` | ❌ No | Custom API endpoint | `&apiUrl=https://api.example.com` |
| `cmp-debug` | ❌ No | Enable debug logging | `&cmp-debug=true` |

### Global Objects

#### `window.CMPConsent`

```javascript
{
  version: '1.0.0',        // SDK version
  siteId: 'abc-123',       // Current site ID
  userId: 'user-uuid',     // Generated user ID
  apiUrl: 'https://...',   // API endpoint
  initialized: true,       // Initialization status
  config: { ... },         // Loaded configuration

  // Methods
  log(...args),            // Debug logging
  error(...args),          // Error logging
  sendConsent(data)        // Send consent to backend
}
```

#### `window.Klaro`

Full Klaro API available at: https://klaro.org/docs

Common methods:
```javascript
// Show consent modal
window.Klaro.show();

// Get consent manager
var manager = window.Klaro.getManager();

// Get current consents
var consents = manager.consents;

// Update consent programmatically
manager.updateConsent('analytics', true);
```

---

## 🎨 Complete Integration Checklist

- [ ] Add CMP embed script to `<head>`
- [ ] Replace `siteId` with your actual ID
- [ ] Mark all third-party scripts with `type="text/plain"`
- [ ] Add `data-cookiecategory` to all blocked scripts
- [ ] Add `data-name` to all blocked scripts
- [ ] Add `data-type="application/javascript"` to all blocked scripts
- [ ] Test in incognito mode
- [ ] Verify banner appears on first visit
- [ ] Test "Accept All" functionality
- [ ] Test "Decline All" functionality
- [ ] Verify scripts run after accepting
- [ ] Check consent persistence across pages
- [ ] Test on mobile devices
- [ ] Verify analytics tracking works with consent
- [ ] Check browser console for errors
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)

---

## 📞 Support

For help with integration:

1. **Check Documentation**: This guide covers 95% of use cases
2. **Browser Console**: Enable debug mode and check console logs
3. **Admin Panel**: Verify configuration in admin dashboard
4. **API Health**: Test `/health` endpoint
5. **GitHub Issues**: Report bugs or request features

---

## 📄 License

Copyright © 2026 Your CMP Platform. All rights reserved.

---

**Ready to integrate? Copy the snippet below:**

```html
<!-- Add to your <head> section -->
<script async src="https://your-cmp-domain.com/embed/embed.js?siteId=YOUR_SITE_ID"></script>
```

**Happy implementing! 🎉**
