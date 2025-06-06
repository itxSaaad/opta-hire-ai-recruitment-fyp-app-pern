'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get recruiter user
    const recruiterRows = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'recruiter@optahire.com' AND "isRecruiter" = true LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!recruiterRows || recruiterRows.length === 0) {
      throw new Error('Recruiter not found. Please seed Users first.');
    }

    const recruiterId = recruiterRows[0].id;

    // Get all contracts for the recruiter
    const contractRows = await queryInterface.sequelize.query(
      `SELECT id, "agreedPrice", status, "paymentStatus" FROM "Contracts" WHERE "recruiterId" = $1 ORDER BY "createdAt";`,
      {
        bind: [recruiterId],
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!contractRows || contractRows.length === 0) {
      throw new Error('No contracts found. Please seed Contracts first.');
    }

    const transactions = [];

    // Create transactions for each contract
    contractRows.forEach((contract, index) => {
      const contractId = contract.id;
      const amount = contract.agreedPrice;
      const platformFee = amount * 0.025; // 2.5%
      const netAmount = amount - platformFee;

      if (contract.paymentStatus === 'pending') {
        // Pending payment transaction
        transactions.push({
          amount: amount,
          status: 'pending',
          transactionDate: new Date(),
          transactionType: 'payment',
          contractId,
          stripePaymentIntentId: `pi_pending_${Date.now()}_${index}`,
          platformFee: platformFee,
          netAmount: netAmount,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (contract.paymentStatus === 'paid') {
        // Completed payment transaction
        transactions.push({
          amount: amount,
          status: 'completed',
          transactionDate: new Date(),
          transactionType: 'payment',
          contractId,
          stripePaymentIntentId: `pi_completed_${Date.now()}_${index}`,
          stripeTransferId: `tr_completed_${Date.now()}_${index}`,
          platformFee: platformFee,
          netAmount: netAmount,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Platform fee transaction
        transactions.push({
          amount: platformFee,
          status: 'completed',
          transactionDate: new Date(),
          transactionType: 'platform_fee',
          contractId,
          platformFee: platformFee,
          netAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Interviewer payout transaction
        transactions.push({
          amount: netAmount,
          status: 'completed',
          transactionDate: new Date(),
          transactionType: 'withdrawal',
          contractId,
          stripePayoutId: `po_payout_${Date.now()}_${index}`,
          netAmount: netAmount,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    await queryInterface.bulkInsert('Transactions', transactions, {});
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('Transactions', null, {});
  },
};
