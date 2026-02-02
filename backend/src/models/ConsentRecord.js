const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Site = require('./Site');

const ConsentRecord = sequelize.define('ConsentRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  siteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional user identifier, null for anonymous visitors'
  },
  choices: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'JSON object representing consent choices for different categories'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'consent_records',
  timestamps: false,
  indexes: [
    {
      fields: ['siteId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['timestamp']
    }
  ]
});

// Define associations
Site.hasMany(ConsentRecord, { foreignKey: 'siteId', as: 'consentRecords' });
ConsentRecord.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

module.exports = ConsentRecord;
