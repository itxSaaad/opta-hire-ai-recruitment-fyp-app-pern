'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const contractRows = await queryInterface.sequelize.query(
      `SELECT id FROM "Contracts" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!contractRows || contractRows.length === 0) {
      throw new Error('No contract found. Please seed Contracts first.');
    }

    const contractId = contractRows[0].id;

    const transactions = [
      {
        amount: 5000.0,
        status: 'pending',
        transactionDate: new Date(),
        contractId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        amount: 7500.0,
        status: 'completed',
        transactionDate: new Date(),
        contractId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Transactions', transactions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Transactions', null, {});
  },
};
