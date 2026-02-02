const request = require('supertest');
const { createTestApp } = require('./setup');
const { Tenant, Site, ConsentRecord, sequelize } = require('../src/models');

const app = createTestApp();

// Test data
let testTenant;
let testSite;
const validUUID = '123e4567-e89b-12d3-a456-426614174000';

describe('API Endpoints', () => {
  // Setup: Create test database records before all tests
  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: true });

      // Create test tenant
      testTenant = await Tenant.create({
        name: 'Test Tenant'
      });

      // Create test site
      testSite = await Site.create({
        tenantId: testTenant.id,
        domain: 'test.example.com',
        config: {
          services: [
            {
              name: 'analytics',
              title: 'Analytics',
              purposes: ['analytics'],
              default: false
            }
          ]
        }
      });
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
  });

  // Cleanup after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /health', () => {
    it('should return status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /config/:siteId', () => {
    it('should return site configuration for valid siteId', async () => {
      const response = await request(app)
        .get(`/config/${testSite.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('siteId', testSite.id);
      expect(response.body).toHaveProperty('config');
      expect(response.body.config).toHaveProperty('services');
      expect(Array.isArray(response.body.config.services)).toBe(true);
    });

    it('should return 404 for non-existent siteId', async () => {
      const response = await request(app)
        .get(`/config/${validUUID}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Site not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/config/invalid-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid siteId format');
    });

    it('should return 400 for missing siteId', async () => {
      const response = await request(app)
        .get('/config/')
        .expect(404); // Express returns 404 for missing params in route

      // Note: This tests that the route doesn't match without siteId
    });
  });

  describe('POST /consent', () => {
    it('should create consent record with valid data', async () => {
      const consentData = {
        siteId: testSite.id,
        userId: 'user123',
        choices: {
          analytics: true,
          marketing: false
        }
      };

      const response = await request(app)
        .post('/consent')
        .send(consentData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Consent recorded successfully');
      expect(response.body).toHaveProperty('record');
      expect(response.body.record).toHaveProperty('siteId', testSite.id);
      expect(response.body.record).toHaveProperty('userId', 'user123');
      expect(response.body.record).toHaveProperty('choices');
      expect(response.body.record.choices).toEqual(consentData.choices);
    });

    it('should create consent record with null userId (anonymous)', async () => {
      const consentData = {
        siteId: testSite.id,
        userId: null,
        choices: {
          analytics: false,
          marketing: false
        }
      };

      const response = await request(app)
        .post('/consent')
        .send(consentData)
        .expect(201);

      expect(response.body.record).toHaveProperty('userId', null);
    });

    it('should return 400 for missing siteId', async () => {
      const consentData = {
        userId: 'user123',
        choices: { analytics: true }
      };

      const response = await request(app)
        .post('/consent')
        .send(consentData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('siteId');
    });

    it('should return 400 for missing choices', async () => {
      const consentData = {
        siteId: testSite.id,
        userId: 'user123'
      };

      const response = await request(app)
        .post('/consent')
        .send(consentData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('choices');
    });

    it('should return 400 for invalid siteId format', async () => {
      const consentData = {
        siteId: 'invalid-uuid',
        choices: { analytics: true }
      };

      const response = await request(app)
        .post('/consent')
        .send(consentData)
        .expect(400);

      expect(response.body.error).toContain('Invalid siteId format');
    });

    it('should return 400 for invalid choices format (not an object)', async () => {
      const consentData = {
        siteId: testSite.id,
        choices: 'invalid'
      };

      const response = await request(app)
        .post('/consent')
        .send(consentData)
        .expect(400);

      expect(response.body.error).toContain('Invalid choices format');
    });

    it('should return 404 for non-existent siteId', async () => {
      const consentData = {
        siteId: validUUID,
        choices: { analytics: true }
      };

      const response = await request(app)
        .post('/consent')
        .send(consentData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Site not found');
    });
  });

  describe('GET /consent/:siteId', () => {
    beforeAll(async () => {
      // Create multiple consent records for testing
      await ConsentRecord.bulkCreate([
        {
          siteId: testSite.id,
          userId: 'user1',
          choices: { analytics: true, marketing: false },
          timestamp: new Date('2024-01-01')
        },
        {
          siteId: testSite.id,
          userId: 'user2',
          choices: { analytics: false, marketing: true },
          timestamp: new Date('2024-01-02')
        },
        {
          siteId: testSite.id,
          userId: 'user1',
          choices: { analytics: true, marketing: true },
          timestamp: new Date('2024-01-03')
        }
      ]);
    });

    it('should return all consent records for a site (limit 100)', async () => {
      const response = await request(app)
        .get(`/consent/${testSite.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('siteId', testSite.id);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('records');
      expect(Array.isArray(response.body.records)).toBe(true);
      expect(response.body.records.length).toBeGreaterThan(0);
      expect(response.body.records.length).toBeLessThanOrEqual(100);
    });

    it('should filter consent records by userId', async () => {
      const response = await request(app)
        .get(`/consent/${testSite.id}?userId=user1`)
        .expect(200);

      expect(response.body.records.length).toBeGreaterThan(0);
      response.body.records.forEach(record => {
        expect(record.userId).toBe('user1');
      });
    });

    it('should return empty array for userId with no records', async () => {
      const response = await request(app)
        .get(`/consent/${testSite.id}?userId=nonexistent`)
        .expect(200);

      expect(response.body.records).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return records in descending order by timestamp', async () => {
      const response = await request(app)
        .get(`/consent/${testSite.id}`)
        .expect(200);

      const records = response.body.records;
      for (let i = 0; i < records.length - 1; i++) {
        const currentTime = new Date(records[i].timestamp).getTime();
        const nextTime = new Date(records[i + 1].timestamp).getTime();
        expect(currentTime).toBeGreaterThanOrEqual(nextTime);
      }
    });

    it('should return 404 for non-existent siteId', async () => {
      const response = await request(app)
        .get(`/consent/${validUUID}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Site not found');
    });

    it('should return 400 for invalid siteId format', async () => {
      const response = await request(app)
        .get('/consent/invalid-uuid')
        .expect(400);

      expect(response.body.error).toContain('Invalid siteId format');
    });
  });
});
