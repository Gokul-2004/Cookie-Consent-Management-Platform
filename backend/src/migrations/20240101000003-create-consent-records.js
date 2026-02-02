'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('consent_records', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      userId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Optional user identifier, null for anonymous visitors'
      },
      choices: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: 'JSON object representing consent choices for different categories'
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('consent_records', ['siteId']);
    await queryInterface.addIndex('consent_records', ['userId']);
    await queryInterface.addIndex('consent_records', ['timestamp']);
    await queryInterface.addIndex('consent_records', ['siteId', 'userId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('consent_records');
  }
};
