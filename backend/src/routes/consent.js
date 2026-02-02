const express = require('express');
const router = express.Router();
const { ConsentRecord, Site } = require('../models');
const { validateSiteId, validateConsentCreation } = require('../middleware/validation');

// Create a new consent record
router.post('/consent', validateConsentCreation, async (req, res) => {
  try {
    const { siteId, userId, choices } = req.body;

    // Verify site exists
    const site = await Site.findByPk(siteId);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Create consent record
    const consentRecord = await ConsentRecord.create({
      siteId,
      userId: userId || null,
      choices,
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'Consent recorded successfully',
      record: consentRecord
    });
  } catch (error) {
    console.error('Error creating consent record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get consent records for a site
// Supports optional query parameters: userId, startDate, endDate, limit
router.get('/consent/:siteId', validateSiteId, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { userId, startDate, endDate, limit } = req.query;

    // Verify site exists
    const site = await Site.findByPk(siteId);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Build where clause
    const where = { siteId };

    if (userId) {
      where.userId = userId;
    }

    // Add date range filters
    if (startDate || endDate) {
      where.timestamp = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.timestamp.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp.$lte = end;
      }
    }

    // Parse limit or default to 1000
    const recordLimit = limit ? parseInt(limit, 10) : 1000;

    // Fetch consent records
    const records = await ConsentRecord.findAll({
      where,
      limit: recordLimit,
      order: [['timestamp', 'DESC']]
    });

    // Return array directly (frontend expects array, not object)
    res.json(records);
  } catch (error) {
    console.error('Error fetching consent records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get consent records for a specific user
router.get('/consent/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { siteId } = req.query;

    const where = { userId };
    if (siteId) {
      where.siteId = siteId;
    }

    const records = await ConsentRecord.findAll({
      where,
      order: [['timestamp', 'DESC']],
      include: [{
        model: Site,
        as: 'site',
        attributes: ['id', 'domain']
      }]
    });

    res.json({ records });
  } catch (error) {
    console.error('Error fetching user consent records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
