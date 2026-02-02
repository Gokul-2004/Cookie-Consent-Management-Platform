# Quick Start Guide

Get the Cookie Consent Management Platform up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git (optional)

## Step 1: Database Setup (1 minute)

```bash
# Create the database
createdb cmp_db

# Or using psql
psql -U postgres -c "CREATE DATABASE cmp_db;"
```

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials (if needed)
# The defaults should work for most local PostgreSQL installations

# Run database migrations
npm run migrate

# Start the backend server
npm start
```

Backend will be running at: http://localhost:3001

## Step 3: Frontend Setup (2 minutes)

Open a new terminal window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Note: You'll need to add a valid NEXT_PUBLIC_SITE_ID after creating test data

# Start the frontend
npm run dev
```

Frontend will be running at: http://localhost:3000

## Step 4: Create Test Data (1 minute)

```bash
# Connect to database
psql -U postgres -d cmp_db

# Run this SQL to create a tenant and site
INSERT INTO tenants (id, name, "createdAt", "updatedAt")
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Company',
  NOW(),
  NOW()
);

INSERT INTO sites (id, "tenantId", domain, config, "createdAt", "updatedAt")
VALUES (
  '223e4567-e89b-12d3-a456-426614174111',
  '123e4567-e89b-12d3-a456-426614174000',
  'example.com',
  '{"services": [{"name": "analytics", "title": "Analytics", "purposes": ["analytics"], "default": false}, {"name": "marketing", "title": "Marketing", "purposes": ["marketing"], "default": false}]}'::jsonb,
  NOW(),
  NOW()
);

# Exit psql
\q
```

## Step 5: Configure Frontend with Site ID

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_ID=223e4567-e89b-12d3-a456-426614174111
```

Restart the frontend dev server (Ctrl+C and `npm run dev` again).

## Step 6: Test the API

```bash
# Health check
curl http://localhost:3001/health

# Get site configuration
curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111

# Create a consent record
curl -X POST http://localhost:3001/consent \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "223e4567-e89b-12d3-a456-426614174111",
    "userId": "test-user",
    "choices": {
      "analytics": true,
      "marketing": false
    }
  }'

# Get consent records
curl http://localhost:3001/consent/223e4567-e89b-12d3-a456-426614174111
```

## Step 7: Run Tests (Optional)

```bash
cd backend
npm test
```

## That's it!

You now have:
- ✅ Backend API running on http://localhost:3001
- ✅ Frontend running on http://localhost:3000
- ✅ PostgreSQL database with test data
- ✅ Working API endpoints

## What's Next?

### Explore the API
- [API Documentation](backend/API.md) - Complete API reference
- [Testing Guide](backend/TESTING.md) - Manual testing with cURL
- [Implementation Summary](backend/IMPLEMENTATION_SUMMARY.md) - Technical details

### Frontend Development
Visit http://localhost:3000 to see the "CMP Starter" page with Klaro consent banner integration.

### Backend Development
The backend has three main endpoints:
1. `GET /health` - Health check
2. `GET /config/:siteId` - Get site configuration
3. `POST /consent` - Record user consent
4. `GET /consent/:siteId` - Get consent records

### Database Management
```bash
# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:undo

# View data in database
psql -U postgres -d cmp_db -c "SELECT * FROM sites;"
psql -U postgres -d cmp_db -c "SELECT * FROM consent_records;"
```

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Check database exists: `psql -U postgres -l | grep cmp_db`
- Check environment variables in `.env`

### Frontend won't connect to backend
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Check for CORS errors in browser console

### Database connection error
- Verify PostgreSQL credentials in `backend/.env`
- Check PostgreSQL is accepting connections
- Try: `psql -U postgres -d cmp_db -c "SELECT 1;"`

### Migrations fail
- Ensure database exists
- Check database credentials
- Try: `npm run migrate:undo:all` then `npm run migrate`

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload on file changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Auto-reload on file changes
```

### Adding New Features
1. Create database migration if needed
2. Update models
3. Add/modify routes
4. Write tests
5. Update API documentation
6. Test manually with cURL

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production` in backend
2. Configure CORS for your production domain
3. Run migrations on production database
4. Build frontend: `cd frontend && npm run build`
5. Use a process manager like PM2 for backend
6. Set up HTTPS with Let's Encrypt or similar
7. Configure rate limiting
8. Set up monitoring and logging

See [README.md](README.md) for detailed production setup.

## Resources

- **Main README**: [README.md](README.md)
- **API Docs**: [backend/API.md](backend/API.md)
- **Testing Guide**: [backend/TESTING.md](backend/TESTING.md)
- **Migration Guide**: [backend/MIGRATIONS.md](backend/MIGRATIONS.md)
- **Implementation Details**: [backend/IMPLEMENTATION_SUMMARY.md](backend/IMPLEMENTATION_SUMMARY.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation files
3. Check the test files for usage examples
4. Review the implementation summary for technical details

## Quick Commands Reference

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run migrate          # Run migrations
npm start                # Start server
npm run dev              # Start with auto-reload
npm test                 # Run tests

# Frontend
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
createdb cmp_db                    # Create database
psql -U postgres -d cmp_db        # Connect to database
npm run migrate:status            # Check migrations
npm run migrate:undo              # Rollback migration
```

Happy coding! 🚀
