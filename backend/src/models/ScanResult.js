const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ScanResult = sequelize.define('ScanResult', {
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
      }
    },
    siteUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    results: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    scannedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'scan_results',
    timestamps: true,
    indexes: [
      {
        fields: ['siteId']
      },
      {
        fields: ['scannedAt']
      }
    ]
  });

  ScanResult.associate = (models) => {
    ScanResult.belongsTo(models.Site, {
      foreignKey: 'siteId',
      as: 'site'
    });
  };

  return ScanResult;
};
