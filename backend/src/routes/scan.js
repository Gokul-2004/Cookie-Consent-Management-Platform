const express = require('express');
const router = express.Router();
const { Site, ScanResult } = require('../models');
const { scanWebsite, generateCategorySuggestions } = require('../services/cookieScanner');
const { validateSiteId } = require('../middleware/validation');

/**
 * POST /scan
 * Scan a website for cookies
 */
router.post('/scan', async (req, res) => {
  try {
    const { siteUrl, siteId } = req.body;

    // Validate required fields
    if (!siteUrl) {
      return res.status(400).json({ error: 'siteUrl is required' });
    }

    // Validate URL format
    try {
      new URL(siteUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`[Scan API] Starting scan for ${siteUrl}`);

    // Perform the scan
    const scanResults = await scanWebsite(siteUrl, {
      timeout: 30000,
      waitForNetworkIdle: true
    });

    if (!scanResults.success) {
      return res.status(500).json({
        error: 'Scan failed',
        message: scanResults.error,
        siteUrl
      });
    }

    // Generate category suggestions
    const categorySuggestions = generateCategorySuggestions(scanResults);

    // If siteId provided, save to database
    let savedScan = null;
    if (siteId) {
      // Verify site exists
      const site = await Site.findByPk(siteId);
      if (site) {
        savedScan = await ScanResult.create({
          siteId,
          siteUrl,
          results: scanResults,
          scannedAt: new Date()
        });
        console.log(`[Scan API] Saved scan result with ID: ${savedScan.id}`);
      } else {
        console.warn(`[Scan API] Site ${siteId} not found, scan not saved`);
      }
    }

    // Return response
    res.json({
      success: true,
      siteUrl: scanResults.siteUrl,
      scannedAt: scanResults.scannedAt,
      cookies: scanResults.cookies,
      cookiesByCategory: scanResults.cookiesByCategory,
      stats: scanResults.stats,
      categorySuggestions,
      scanId: savedScan?.id || null
    });

  } catch (error) {
    console.error('[Scan API] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /scan/:siteId
 * Get scan history for a site
 */
router.get('/scan/:siteId', validateSiteId, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { limit = 10 } = req.query;

    // Verify site exists
    const site = await Site.findByPk(siteId);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Fetch scan results
    const scans = await ScanResult.findAll({
      where: { siteId },
      limit: parseInt(limit, 10),
      order: [['scannedAt', 'DESC']],
      attributes: ['id', 'siteUrl', 'scannedAt', 'results']
    });

    res.json({
      siteId,
      total: scans.length,
      scans: scans.map(scan => ({
        id: scan.id,
        siteUrl: scan.siteUrl,
        scannedAt: scan.scannedAt,
        stats: scan.results?.stats || {},
        cookieCount: scan.results?.cookies?.length || 0
      }))
    });

  } catch (error) {
    console.error('[Scan API] Error fetching scan history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /scan/result/:scanId
 * Get detailed scan result by ID
 */
router.get('/scan/result/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const scan = await ScanResult.findByPk(scanId);

    if (!scan) {
      return res.status(404).json({ error: 'Scan result not found' });
    }

    res.json({
      id: scan.id,
      siteId: scan.siteId,
      siteUrl: scan.siteUrl,
      scannedAt: scan.scannedAt,
      results: scan.results
    });

  } catch (error) {
    console.error('[Scan API] Error fetching scan result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /scan/:scanId
 * Delete a scan result
 */
router.delete('/scan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const scan = await ScanResult.findByPk(scanId);

    if (!scan) {
      return res.status(404).json({ error: 'Scan result not found' });
    }

    await scan.destroy();

    res.json({
      message: 'Scan result deleted successfully',
      scanId
    });

  } catch (error) {
    console.error('[Scan API] Error deleting scan result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
