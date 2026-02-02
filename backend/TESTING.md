# Testing Guide

This guide provides instructions for testing the CMP backend API endpoints manually and with automated tests.

## Prerequisites

1. PostgreSQL running and database created
2. Environment variables configured in `.env`
3. Migrations run: `npm run migrate`
4. Dependencies installed: `npm install`

## Setup Test Data

Before testing the API endpoints, create some test data in the database:

```sql
-- Connect to the database
psql -U postgres -d cmp_db

-- Create a test tenant
INSERT INTO tenants (id, name, "createdAt", "updatedAt")
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Company',
  NOW(),
  NOW()
);

-- Create a test site
INSERT INTO sites (id, "tenantId", domain, config, "createdAt", "updatedAt")
VALUES (
  '223e4567-e89b-12d3-a456-426614174111',
  '123e4567-e89b-12d3-a456-426614174000',
  'example.com',
  '{"services": [{"name": "analytics", "title": "Analytics", "purposes": ["analytics"], "default": false}, {"name": "marketing", "title": "Marketing", "purposes": ["marketing"], "default": false}]}'::jsonb,
  NOW(),
  NOW()
);
```

## Running Automated Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Test Coverage
The test suite covers:
- ✅ Health check endpoint
- ✅ Configuration retrieval with validation
- ✅ Consent record creation with various scenarios
- ✅ Consent record retrieval with filtering
- ✅ Error handling for all endpoints
- ✅ Input validation
- ✅ UUID format validation

## Manual Testing with cURL

### 1. Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok"
}
```

---

### 2. Get Site Configuration

**Valid Request:**
```bash
curl http://localhost:3001/config/223e4567-e89b-12d3-a456-426614174111
```

Expected response:
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

**Invalid UUID:**
```bash
curl http://localhost:3001/config/invalid-uuid
```

Expected response (400):
```json
{
  "error": "Invalid siteId format: must be a valid UUID"
}
```

**Non-existent Site:**
```bash
curl http://localhost:3001/config/999e4567-e89b-12d3-a456-426614174999
```

Expected response (404):
```json
{
  "error": "Site not found"
}
```

---

### 3. Create Consent Record

**Valid Request with User ID:**
```bash
curl -X POST http://localhost:3001/consent \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "223e4567-e89b-12d3-a456-426614174111",
    "userId": "user123",
    "choices": {
      "analytics": true,
      "marketing": false
    }
  }'
```

Expected response (201):
```json
{
  "message": "Consent recorded successfully",
  "record": {
    "id": "...",
    "siteId": "223e4567-e89b-12d3-a456-426614174111",
    "userId": "user123",
    "choices": {
      "analytics": true,
      "marketing": false
    },
    "timestamp": "2024-01-22T10:30:00.000Z"
  }
}
```

**Anonymous User (null userId):**
```bash
curl -X POST http://localhost:3001/consent \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "223e4567-e89b-12d3-a456-426614174111",
    "userId": null,
    "choices": {
      "analytics": false,
      "marketing": false
    }
  }'
```

**Missing siteId:**
```bash
curl -X POST http://localhost:3001/consent \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "choices": {
      "analytics": true
    }
  }'
```

Expected response (400):
```json
{
  "error": "Missing required field: siteId"
}
```

**Missing choices:**
```bash
curl -X POST http://localhost:3001/consent \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "223e4567-e89b-12d3-a456-426614174111",
    "userId": "user123"
  }'
```

Expected response (400):
```json
{
  "error": "Missing required field: choices"
}
```

**Invalid siteId format:**
```bash
curl -X POST http://localhost:3001/consent \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "invalid-uuid",
    "choices": {
      "analytics": true
    }
  }'
```

Expected response (400):
```json
{
  "error": "Invalid siteId format: must be a valid UUID"
}
```

**Invalid choices format (not an object):**
```bash
curl -X POST http://localhost:3001/consent \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "223e4567-e89b-12d3-a456-426614174111",
    "choices": "invalid"
  }'
```

Expected response (400):
```json
{
  "error": "Invalid choices format: must be an object"
}
```

---

### 4. Get Consent Records

**All records for a site:**
```bash
curl http://localhost:3001/consent/223e4567-e89b-12d3-a456-426614174111
```

Expected response:
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "total": 5,
  "records": [
    {
      "id": "...",
      "siteId": "223e4567-e89b-12d3-a456-426614174111",
      "userId": "user123",
      "choices": {
        "analytics": true,
        "marketing": false
      },
      "timestamp": "2024-01-22T10:30:00.000Z"
    }
  ]
}
```

**Filter by userId:**
```bash
curl "http://localhost:3001/consent/223e4567-e89b-12d3-a456-426614174111?userId=user123"
```

Expected response (only records for user123):
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "total": 2,
  "records": [
    {
      "id": "...",
      "siteId": "223e4567-e89b-12d3-a456-426614174111",
      "userId": "user123",
      "choices": {...},
      "timestamp": "2024-01-22T10:30:00.000Z"
    }
  ]
}
```

**Invalid UUID:**
```bash
curl http://localhost:3001/consent/invalid-uuid
```

Expected response (400):
```json
{
  "error": "Invalid siteId format: must be a valid UUID"
}
```

**Non-existent Site:**
```bash
curl http://localhost:3001/consent/999e4567-e89b-12d3-a456-426614174999
```

Expected response (404):
```json
{
  "error": "Site not found"
}
```

---

## Testing with Postman

### Import Collection

1. Open Postman
2. Create a new collection "CMP API"
3. Add requests for each endpoint as documented above
4. Save environment variables:
   - `baseUrl`: `http://localhost:3001`
   - `testSiteId`: `223e4567-e89b-12d3-a456-426614174111`

### Test Scenarios

1. **Happy Path Testing**
   - Health check
   - Get valid site config
   - Create consent record
   - Retrieve consent records

2. **Error Handling Testing**
   - Invalid UUIDs
   - Missing required fields
   - Non-existent resources
   - Invalid data types

3. **Edge Cases**
   - Anonymous users (null userId)
   - Empty choices object
   - Very long userId strings
   - Special characters in choices

---

## Database Verification

After creating consent records, verify in the database:

```sql
-- View all consent records
SELECT * FROM consent_records ORDER BY timestamp DESC LIMIT 10;

-- Count records by site
SELECT "siteId", COUNT(*) as total
FROM consent_records
GROUP BY "siteId";

-- View records for specific user
SELECT * FROM consent_records
WHERE "userId" = 'user123'
ORDER BY timestamp DESC;

-- Check JSONB choices structure
SELECT "userId", choices->'analytics' as analytics_choice
FROM consent_records;
```

---

## Performance Testing

### Load Testing with Apache Bench

Test consent creation endpoint:
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 -T application/json -p consent.json \
  http://localhost:3001/consent
```

Create `consent.json`:
```json
{
  "siteId": "223e4567-e89b-12d3-a456-426614174111",
  "userId": "loadtest",
  "choices": {
    "analytics": true,
    "marketing": false
  }
}
```

---

## Troubleshooting

### Server won't start
```bash
# Check database connection
npm run migrate:status

# Check for port conflicts
lsof -i :3001

# Check environment variables
cat .env
```

### Tests failing
```bash
# Ensure test database is clean
npm run migrate:undo:all
npm run migrate

# Run tests with verbose output
npm test -- --verbose
```

### Database issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l | grep cmp_db

# Reset database
npm run migrate:undo:all
npm run migrate
```

---

## Continuous Integration

For CI/CD pipelines, create a test script:

```bash
#!/bin/bash
set -e

echo "Setting up test environment..."
export NODE_ENV=test
export DB_NAME=cmp_test_db

echo "Running migrations..."
npm run migrate

echo "Running tests..."
npm test

echo "Cleaning up..."
npm run migrate:undo:all
```

---

## Next Steps

After verifying all endpoints work correctly:

1. ✅ Configure CORS for production domains
2. ✅ Add authentication/authorization
3. ✅ Implement rate limiting
4. ✅ Set up monitoring and logging
5. ✅ Deploy to staging environment
6. ✅ Perform load testing
7. ✅ Document any additional custom endpoints
