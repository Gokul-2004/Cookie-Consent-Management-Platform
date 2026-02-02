# Cookie Consent Management Platform (CMP)

A full-stack Cookie Consent Management Platform with multi-tenant support, built with Node.js, Express, PostgreSQL, Next.js, and Klaro.

## Project Structure

```
BAN-MAN/
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── models/      # Sequelize models (Tenant, Site, ConsentRecord)
│   │   ├── migrations/  # Database migrations
│   │   ├── routes/      # API routes
│   │   └── index.js     # Server entry point
│   ├── MIGRATIONS.md    # Migration guide
│   └── package.json
└── frontend/         # Next.js React application
    ├── src/
    │   ├── app/      # Next.js 14 app directory
    │   └── components/ # React components
    └── package.json
```

## Features

### Backend
- Express.js REST API
- PostgreSQL database with Sequelize ORM
- Multi-tenant architecture with three models:
  - **Tenant**: Organizations using the platform
  - **Site**: Websites belonging to tenants
  - **ConsentRecord**: User consent choices
- Database migrations for schema management
- CORS and JSON middleware
- RESTful API endpoints for health checks, configuration, and consent tracking

### Frontend
- Next.js 14 with App Router
- React 18
- Tailwind CSS for styling
- Klaro consent banner integration
- Dynamic configuration fetching from backend

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb cmp_db
```

Or using psql:
```bash
psql -U postgres
CREATE DATABASE cmp_db;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Update DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Run database migrations to create tables
npm run migrate

# Start the server
npm start
```

The backend server will run on `http://localhost:3001`

**Note**: Database migrations must be run before starting the server. See [backend/MIGRATIONS.md](backend/MIGRATIONS.md) for detailed migration documentation.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your configuration
# Set NEXT_PUBLIC_SITE_ID to a valid site UUID (create one in the database first)

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Database Models

### Tenant
- `id` (UUID, primary key)
- `name` (String)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Site
- `id` (UUID, primary key)
- `tenantId` (UUID, foreign key → Tenant)
- `domain` (String)
- `config` (JSONB - banner configuration)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### ConsentRecord
- `id` (UUID, primary key)
- `siteId` (UUID, foreign key → Site)
- `userId` (String, nullable - for anonymous visitors)
- `choices` (JSONB - consent choices per category)
- `timestamp` (Timestamp)

### Relationships
```
Tenant (1) → (Many) Site (1) → (Many) ConsentRecord
```

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns: `{ "status": "ok" }`

### Configuration
- **GET** `/config/:siteId`
  - Returns: Klaro configuration for the specified site
  - Response: `{ "siteId": "...", "config": {...} }`

### Consent Management
- **POST** `/consent`
  - Creates a new consent record
  - Body: `{ "siteId": "uuid", "userId": "optional", "choices": {...} }`
  - Returns: Created consent record

- **GET** `/consent/:siteId?userId=optional`
  - Returns: Consent records for a specific site (limit 100 latest)
  - Supports optional userId query parameter for filtering
  - Returns records in descending order by timestamp

## Database Migrations

### Available Commands

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:undo

# Rollback all migrations
npm run migrate:undo:all
```

See [backend/MIGRATIONS.md](backend/MIGRATIONS.md) for comprehensive migration documentation.

## API Testing

### Run Automated Tests
```bash
cd backend
npm test
```

The test suite includes comprehensive tests for:
- Health check endpoint
- Configuration retrieval with validation
- Consent record creation with various scenarios
- Consent record retrieval with filtering
- Error handling and input validation

See [backend/TESTING.md](backend/TESTING.md) for manual testing guide with cURL examples.

See [backend/API.md](backend/API.md) for complete API documentation.

## Creating Test Data

After running migrations, you can create test data:

```sql
-- Insert a tenant
INSERT INTO tenants (id, name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Test Company',
  NOW(),
  NOW()
) RETURNING id;

-- Insert a site (replace <tenant-id> with the UUID from above)
INSERT INTO sites (id, "tenantId", domain, config, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  '<tenant-id>',
  'example.com',
  '{"services": [{"name": "analytics", "title": "Analytics", "purposes": ["analytics"], "default": false}]}'::jsonb,
  NOW(),
  NOW()
) RETURNING id;

-- Insert a consent record (replace <site-id> with the UUID from above)
INSERT INTO consent_records (id, "siteId", "userId", choices, timestamp)
VALUES (
  gen_random_uuid(),
  '<site-id>',
  'user123',
  '{"analytics": true, "marketing": false}'::jsonb,
  NOW()
);
```

Use the generated site UUID in your frontend `.env.local` file as `NEXT_PUBLIC_SITE_ID`.

## Klaro Integration

The Klaro consent banner is integrated via the `ConsentManager` component. It:

1. Fetches configuration from the backend `/config/:siteId` endpoint
2. Loads the Klaro script and styles from CDN
3. Initializes Klaro with the fetched configuration

The consent settings are stored in the browser's local storage/cookies.

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

## Production Build

### Backend
```bash
cd backend
NODE_ENV=production npm run migrate  # Run migrations
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Environment Variables

### Backend (.env)
```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cmp_db
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_ID=your-site-id-here
```

## Project Architecture

### Multi-Tenant Structure
- Each **Tenant** represents an organization/company
- Each Tenant can have multiple **Sites** (domains)
- Each Site can have multiple **ConsentRecords** tracking user consent choices
- Site configuration is stored as JSONB for flexibility
- Consent choices are stored as JSONB to support any consent categories

### ORM and Migrations
- Uses Sequelize ORM for database operations
- Schema changes managed through migrations (not auto-sync)
- Supports PostgreSQL-specific features (JSONB, UUID)
- Proper foreign key constraints and cascading deletes

## Technologies Used

- **Backend**: Node.js, Express, PostgreSQL, Sequelize
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Consent Management**: Klaro (https://github.com/kiprotect/klaro)
- **Database**: PostgreSQL with JSONB support

## License

MIT
