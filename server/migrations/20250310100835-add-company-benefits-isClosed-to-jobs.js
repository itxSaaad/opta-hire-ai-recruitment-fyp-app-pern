'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Jobs', 'company', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Jobs', 'benefits', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Jobs', 'isClosed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Jobs', 'company');
    await queryInterface.removeColumn('Jobs', 'benefits');
    await queryInterface.removeColumn('Jobs', 'isClosed');
  },
};
