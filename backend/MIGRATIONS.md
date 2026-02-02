# Database Migrations Guide

This guide explains how to use database migrations in the Cookie Consent Management Platform backend.

## Overview

The backend uses Sequelize ORM with Sequelize CLI for database migrations. Migrations allow you to:
- Version control your database schema
- Apply schema changes incrementally
- Roll back changes if needed
- Share schema changes with your team

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

## Relationships

```
Tenant
  └── hasMany → Site
        └── hasMany → ConsentRecord
```

## Setup

1. Ensure PostgreSQL is running and the database exists:
```bash
createdb cmp_db
```

2. Configure your database credentials in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cmp_db
DB_USER=postgres
DB_PASSWORD=postgres
```

3. Install dependencies:
```bash
npm install
```

## Migration Commands

### Run all pending migrations
```bash
npm run migrate
```

This creates the tables: `tenants`, `sites`, and `consent_records`.

### Check migration status
```bash
npm run migrate:status
```

Shows which migrations have been applied and which are pending.

### Rollback last migration
```bash
npm run migrate:undo
```

Rolls back the most recently applied migration.

### Rollback all migrations
```bash
npm run migrate:undo:all
```

Drops all tables by rolling back all migrations.

## Migration Files

Migrations are located in `src/migrations/` and are executed in order:

1. `20240101000001-create-tenants.js` - Creates tenants table
2. `20240101000002-create-sites.js` - Creates sites table with foreign key to tenants
3. `20240101000003-create-consent-records.js` - Creates consent_records table with foreign key to sites

## Creating New Migrations

To create a new migration:

```bash
npx sequelize-cli migration:generate --name your-migration-name
```

This creates a new migration file in `src/migrations/`. Edit the file to define the `up` (apply) and `down` (rollback) functions.

## Example: Adding Test Data

After running migrations, you can add test data:

```sql
-- Insert a tenant
INSERT INTO tenants (id, name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Acme Corporation',
  NOW(),
  NOW()
);

-- Insert a site (replace <tenant-id> with the UUID from above)
INSERT INTO sites (id, "tenantId", domain, config, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  '<tenant-id>',
  'example.com',
  '{"services": [{"name": "analytics", "title": "Analytics", "purposes": ["analytics"]}]}'::jsonb,
  NOW(),
  NOW()
);

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

## Troubleshooting

### Migration already exists error
If you see "Migration already applied", check the `SequelizeMeta` table:
```sql
SELECT * FROM "SequelizeMeta";
```

To manually mark a migration as not applied:
```sql
DELETE FROM "SequelizeMeta" WHERE name = 'migration-filename.js';
```

### Connection errors
Verify your database credentials in `.env` and ensure PostgreSQL is running:
```bash
psql -U postgres -d cmp_db -c "SELECT 1;"
```

### Foreign key constraint errors
Ensure you run migrations in order. The `sites` table depends on `tenants`, and `consent_records` depends on `sites`.

## Best Practices

1. **Never modify existing migrations** that have been applied to production
2. **Always create new migrations** for schema changes
3. **Test migrations** in development before applying to production
4. **Back up your database** before running migrations in production
5. **Version control** all migration files
6. **Document** any complex migrations

## Production Deployment

For production:

1. Back up the database
2. Run migrations:
   ```bash
   NODE_ENV=production npm run migrate
   ```
3. Verify the migration status:
   ```bash
   npm run migrate:status
   ```
4. Monitor application logs for errors

## Additional Resources

- [Sequelize Migrations Documentation](https://sequelize.org/docs/v6/other-topics/migrations/)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
