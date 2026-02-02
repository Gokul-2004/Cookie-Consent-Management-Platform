/**
 * Validation middleware for API requests
 */

// Validate UUID format
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Validate siteId parameter
const validateSiteId = (req, res, next) => {
  const { siteId } = req.params;

  if (!siteId) {
    return res.status(400).json({
      error: 'Missing required parameter: siteId'
    });
  }

  if (!isValidUUID(siteId)) {
    return res.status(400).json({
      error: 'Invalid siteId format: must be a valid UUID'
    });
  }

  next();
};

// Validate consent creation request
const validateConsentCreation = (req, res, next) => {
  const { siteId, choices } = req.body;

  // Check required fields
  if (!siteId) {
    return res.status(400).json({
      error: 'Missing required field: siteId'
    });
  }

  if (!choices) {
    return res.status(400).json({
      error: 'Missing required field: choices'
    });
  }

  // Validate siteId format
  if (!isValidUUID(siteId)) {
    return res.status(400).json({
      error: 'Invalid siteId format: must be a valid UUID'
    });
  }

  // Validate choices is an object
  if (typeof choices !== 'object' || Array.isArray(choices) || choices === null) {
    return res.status(400).json({
      error: 'Invalid choices format: must be an object'
    });
  }

  // Validate userId if provided
  if (req.body.userId !== undefined && req.body.userId !== null) {
    if (typeof req.body.userId !== 'string' || req.body.userId.trim() === '') {
      return res.status(400).json({
        error: 'Invalid userId format: must be a non-empty string or null'
      });
    }
  }

  next();
};

module.exports = {
  validateSiteId,
  validateConsentCreation,
  isValidUUID
};
