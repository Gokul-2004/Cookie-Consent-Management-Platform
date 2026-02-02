const express = require('express');
const router = express.Router();
const { Site } = require('../models');
const { validateSiteId } = require('../middleware/validation');

router.get('/config/:siteId', validateSiteId, async (req, res) => {
  try {
    const { siteId } = req.params;

    const site = await Site.findByPk(siteId);

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Return Klaro-compatible config
    res.json({
      siteId: site.id,
      config: site.config || {}
    });
  } catch (error) {
    console.error('Error fetching site config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /config/:siteId - Update site configuration
router.put('/config/:siteId', validateSiteId, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { config } = req.body;

    // Validate config is provided
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Invalid config format. Expected an object.' });
    }

    // Find the site
    const site = await Site.findByPk(siteId);

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Validate config structure (basic validation)
    const validationErrors = validateConfigStructure(config);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Invalid config structure',
        details: validationErrors
      });
    }

    // Update the site configuration
    site.config = config;
    await site.save();

    console.log(`Config updated for site ${siteId}:`, {
      languages: config.languages?.length || 0,
      categories: Object.keys(config.categories || {}).length,
      hasStyles: !!config.styles,
      hasBannerText: !!config.bannerText
    });

    res.json({
      message: 'Configuration updated successfully',
      siteId: site.id,
      config: site.config
    });
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to validate config structure
function validateConfigStructure(config) {
  const errors = [];

  // Validate bannerText
  if (config.bannerText) {
    if (typeof config.bannerText !== 'object') {
      errors.push('bannerText must be an object');
    } else {
      const languages = Object.keys(config.bannerText);
      if (languages.length === 0) {
        errors.push('bannerText must contain at least one language');
      }
    }
  }

  // Validate styles
  if (config.styles) {
    if (typeof config.styles !== 'object') {
      errors.push('styles must be an object');
    } else {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

      if (config.styles.primaryColor && !hexColorRegex.test(config.styles.primaryColor)) {
        errors.push('styles.primaryColor must be a valid hex color');
      }
      if (config.styles.secondaryColor && !hexColorRegex.test(config.styles.secondaryColor)) {
        errors.push('styles.secondaryColor must be a valid hex color');
      }
      if (config.styles.textColor && !hexColorRegex.test(config.styles.textColor)) {
        errors.push('styles.textColor must be a valid hex color');
      }
      if (config.styles.backgroundColor && !hexColorRegex.test(config.styles.backgroundColor)) {
        errors.push('styles.backgroundColor must be a valid hex color');
      }

      const validPositions = ['top', 'bottom', 'center'];
      if (config.styles.position && !validPositions.includes(config.styles.position)) {
        errors.push('styles.position must be one of: top, bottom, center');
      }

      const validLayouts = ['banner', 'modal', 'box'];
      if (config.styles.layout && !validLayouts.includes(config.styles.layout)) {
        errors.push('styles.layout must be one of: banner, modal, box');
      }
    }
  }

  // Validate categories
  if (config.categories) {
    if (typeof config.categories !== 'object') {
      errors.push('categories must be an object');
    } else if (Object.keys(config.categories).length === 0) {
      errors.push('categories must contain at least one category');
    }
  }

  // Validate languages array
  if (config.languages) {
    if (!Array.isArray(config.languages)) {
      errors.push('languages must be an array');
    } else if (config.languages.length === 0) {
      errors.push('languages array must contain at least one language code');
    } else {
      // Validate language codes format
      const invalidLangs = config.languages.filter(lang => !/^[a-z]{2,3}$/.test(lang));
      if (invalidLangs.length > 0) {
        errors.push(`Invalid language codes: ${invalidLangs.join(', ')}`);
      }
    }
  }

  return errors;
}

module.exports = router;
