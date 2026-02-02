module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('scan_results', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      siteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sites',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      siteUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      results: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      scannedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('scan_results', ['siteId']);
    await queryInterface.addIndex('scan_results', ['scannedAt']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('scan_results');
  }
};
