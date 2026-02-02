# API Documentation

Complete API documentation for the Cookie Consent Management Platform backend.

## Base URL

```
http://localhost:3001
```

## Endpoints

### 1. Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200 OK` - Server is running

---

### 2. Get Site Configuration

Fetch the banner configuration for a given site.

**Endpoint:** `GET /config/:siteId`

**Parameters:**
- `siteId` (string, required) - UUID of the site

**Response:**
```json
{
  "siteId": "123e4567-e89b-12d3-a456-426614174000",
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

**Status Codes:**
- `200 OK` - Configuration retrieved successfully
- `400 Bad Request` - Invalid siteId format
- `404 Not Found` - Site not found
- `500 Internal Server Error` - Server error

**Example Request:**
```bash
curl http://localhost:3001/config/123e4567-e89b-12d3-a456-426614174000
```

**Error Response Examples:**

```json
// 400 Bad Request
{
  "error": "Invalid siteId format: must be a valid UUID"
}

// 404 Not Found
{
  "error": "Site not found"
}
```

---

### 3. Create Consent Record

Record a user's consent choices.

**Endpoint:** `POST /consent`

**Request Body:**
```json
{
  "siteId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user123",
  "choices": {
    "analytics": true,
    "marketing": false,
    "necessary": true
  }
}
```

**Fields:**
- `siteId` (string, required) - UUID of the site
- `userId` (string, optional) - User identifier, can be null for anonymous visitors
- `choices` (object, required) - Consent choices per category

**Response:**
```json
{
  "message": "Consent recorded successfully",
  "record": {
    "id": "987fcdeb-51a2-43d7-9876-543210fedcba",
    "siteId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user123",
    "choices": {
      "analytics": true,
      "marketing": false,
      "necessary": true
    },
    "timestamp": "2024-01-22T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `201 Created` - Consent recorded successfully
- `400 Bad Request` - Invalid request body or missing required fields
- `404 Not Found` - Site not found
- `500 Internal Server Error` - Server error

**Example Request:**
```bash
curl -X POST http://localhost:3001/consent \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user123",
    "choices": {
      "analytics": true,
      "marketing": false
    }
  }'
```

**Error Response Examples:**

```json
// 400 Bad Request - Missing siteId
{
  "error": "Missing required field: siteId"
}

// 400 Bad Request - Missing choices
{
  "error": "Missing required field: choices"
}

// 400 Bad Request - Invalid siteId format
{
  "error": "Invalid siteId format: must be a valid UUID"
}

// 400 Bad Request - Invalid choices format
{
  "error": "Invalid choices format: must be an object"
}

// 404 Not Found
{
  "error": "Site not found"
}
```

---

### 4. Get Consent Records for a Site

Retrieve consent records for a specific site, with optional filtering by userId.

**Endpoint:** `GET /consent/:siteId`

**Parameters:**
- `siteId` (string, required) - UUID of the site

**Query Parameters:**
- `userId` (string, optional) - Filter records by specific user

**Response:**
```json
{
  "siteId": "123e4567-e89b-12d3-a456-426614174000",
  "total": 25,
  "records": [
    {
      "id": "987fcdeb-51a2-43d7-9876-543210fedcba",
      "siteId": "123e4567-e89b-12d3-a456-426614174000",
      "userId": "user123",
      "choices": {
        "analytics": true,
        "marketing": false
      },
      "timestamp": "2024-01-22T10:30:00.000Z"
    },
    {
      "id": "876fedcb-a123-45d6-7890-abcdef123456",
      "siteId": "123e4567-e89b-12d3-a456-426614174000",
      "userId": "user456",
      "choices": {
        "analytics": false,
        "marketing": true
      },
      "timestamp": "2024-01-22T09:15:00.000Z"
    }
  ]
}
```

**Features:**
- Returns up to 100 most recent consent records
- Records are sorted by timestamp in descending order (newest first)
- Optional filtering by userId via query parameter

**Status Codes:**
- `200 OK` - Records retrieved successfully
- `400 Bad Request` - Invalid siteId format
- `404 Not Found` - Site not found
- `500 Internal Server Error` - Server error

**Example Requests:**

```bash
# Get all consent records for a site (limit 100)
curl http://localhost:3001/consent/123e4567-e89b-12d3-a456-426614174000

# Filter by specific user
curl http://localhost:3001/consent/123e4567-e89b-12d3-a456-426614174000?userId=user123
```

**Error Response Examples:**

```json
// 400 Bad Request
{
  "error": "Invalid siteId format: must be a valid UUID"
}

// 404 Not Found
{
  "error": "Site not found"
}
```

---

## Validation Rules

### UUID Format
All UUIDs must match the standard UUID v4 format:
```
123e4567-e89b-12d3-a456-426614174000
```

### Consent Choices
The `choices` field must be:
- A valid JSON object
- Not an array
- Not null
- Can contain any number of key-value pairs representing consent categories

Example valid choices:
```json
{
  "analytics": true,
  "marketing": false,
  "necessary": true,
  "preferences": true
}
```

### User ID
The `userId` field:
- Can be any non-empty string
- Can be null for anonymous visitors
- Should be consistent for the same user across requests

---

## Error Handling

All endpoints return consistent error responses with the following structure:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters or body
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Testing

Run the test suite:

```bash
npm test
```

The test suite includes:
- Health check endpoint tests
- Configuration endpoint tests with validation
- Consent creation tests with various scenarios
- Consent retrieval tests with filtering
- Error handling tests for all endpoints

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting in production.

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

---

## Database

All data is stored in PostgreSQL with the following guarantees:
- ACID transactions
- Foreign key constraints
- Cascading deletes (deleting a site deletes all its consent records)
- JSONB indexing for fast queries on config and choices fields

---

## Example Use Cases

### 1. Initialize Consent Banner on Page Load

```javascript
// Frontend code
const siteId = 'your-site-id';
const response = await fetch(`http://localhost:3001/config/${siteId}`);
const { config } = await response.json();

// Initialize Klaro with config
window.klaroConfig = config;
```

### 2. Save User Consent

```javascript
// When user accepts/rejects cookies
const saveConsent = async (choices) => {
  await fetch('http://localhost:3001/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteId: 'your-site-id',
      userId: getCurrentUserId(), // or null for anonymous
      choices: choices
    })
  });
};
```

### 3. Audit Consent Records

```javascript
// Get all consent records for compliance audit
const response = await fetch(`http://localhost:3001/consent/${siteId}`);
const { records } = await response.json();

// Filter for specific user
const userResponse = await fetch(
  `http://localhost:3001/consent/${siteId}?userId=user123`
);
```

---

## Security Considerations

1. **Input Validation**: All inputs are validated before processing
2. **SQL Injection**: Protected by Sequelize ORM parameterized queries
3. **UUID Validation**: Ensures only valid UUIDs are accepted
4. **Error Messages**: Generic error messages to avoid information disclosure
5. **CORS**: Configure for specific origins in production
6. **HTTPS**: Use HTTPS in production
7. **Authentication**: Consider adding authentication for sensitive endpoints

---

## Future Enhancements

Consider implementing:
- Rate limiting per IP/user
- Authentication and authorization
- API versioning (e.g., `/api/v1/consent`)
- Pagination for consent records (currently limited to 100)
- Bulk consent record operations
- Webhook notifications for consent changes
- Analytics dashboard endpoints
