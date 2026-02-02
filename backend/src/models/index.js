const sequelize = require('../config/database');
const Tenant = require('./Tenant');
const Site = require('./Site');
const ConsentRecord = require('./ConsentRecord');

// Initialize ScanResult model (it's a factory function)
const initScanResult = require('./ScanResult');
const ScanResult = initScanResult(sequelize);

const models = {
  Tenant,
  Site,
  ConsentRecord,
  ScanResult,
  sequelize
};

// Setup associations
ScanResult.belongsTo(Site, {
  foreignKey: 'siteId',
  as: 'site'
});

Site.hasMany(ScanResult, {
  foreignKey: 'siteId',
  as: 'scanResults'
});

module.exports = models;
