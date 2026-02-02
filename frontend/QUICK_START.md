# Frontend Quick Start Guide

## Setup (2 minutes)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Copy example file
cp .env.local.example .env.local

# Edit with your values
nano .env.local
```

**Required Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_ID=223e4567-e89b-12d3-a456-426614174111
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## What You'll See

1. **Homepage** with "CMP Starter" title
2. **Cookie Consent Banner** at the bottom (on first visit)
3. **Console logs** showing API integration

## Testing the Integration

### 1. Check Banner Appears

- Open http://localhost:3000 in **incognito mode**
- Banner should appear at bottom
- Should show Analytics and Marketing options

### 2. Accept Cookies

- Click "Accept All" or customize choices
- Check browser console for logs:
  ```
  Fetching consent config for site: 223e4567-e89b-12d3-a456-426614174111
  Consent config loaded: {...}
  Initializing Klaro...
  Klaro initialized successfully
  Consent updated: {...}
  Sending consent to backend: {...}
  Consent recorded successfully: {...}
  ```

### 3. Verify in Backend

```bash
# Check consent was recorded
curl http://localhost:3001/consent/223e4567-e89b-12d3-a456-426614174111
```

Should return your consent record!

### 4. Test Return Visit

- Reload the page (not incognito)
- Banner should NOT appear (consent remembered)
- Cookie persists for 365 days

## Troubleshooting

### Banner Doesn't Appear

```bash
# 1. Check backend is running
curl http://localhost:3001/health

# 2. Check site exists
curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111

# 3. Check .env.local file exists
cat .env.local

# 4. Clear browser cookies and try incognito mode
```

### API Errors in Console

1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Verify `NEXT_PUBLIC_SITE_ID` matches database
3. Check backend server is running on port 3001
4. Check CORS is enabled in backend

### Changes Not Appearing

```bash
# Restart the dev server
# Kill existing process: Ctrl+C
npm run dev
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.js          → Root layout
│   │   ├── page.js            → Homepage
│   │   └── globals.css        → Global styles
│   └── components/
│       ├── ClientLayout.js    → Client wrapper
│       └── ConsentManager.js  → Klaro integration
├── .env.local                 → Environment config
├── package.json               → Dependencies
└── KLARO_INTEGRATION.md       → Full documentation
```

## Key Files

### ConsentManager.js

The main integration component:
- Fetches config from backend
- Initializes Klaro
- Sends consent to backend
- Handles errors

### .env.local

Environment configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_ID=223e4567-e89b-12d3-a456-426614174111
```

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Next Steps

1. ✅ Customize banner text and styling
2. ✅ Add more cookie services
3. ✅ Create privacy policy page
4. ✅ Test on multiple browsers
5. ✅ Deploy to production

## Complete Documentation

See [KLARO_INTEGRATION.md](KLARO_INTEGRATION.md) for:
- Architecture details
- API integration
- Customization options
- Advanced configuration
- Troubleshooting guide

## Success Checklist

- [x] Dependencies installed (`npm install`)
- [x] `.env.local` configured with site ID
- [x] Backend running on port 3001
- [x] Frontend running on port 3000
- [x] Banner appears on first visit
- [x] Console shows API integration logs
- [x] Consent recorded in database
- [x] Cookie persists between visits

**Everything Working?** 🎉

You now have a fully functional cookie consent manager integrated with your backend API!
