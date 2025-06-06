'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add Stripe Connect fields to Users table
    await queryInterface.addColumn('Users', 'stripeAccountStatus', {
      type: Sequelize.ENUM('pending', 'verified', 'restricted', 'rejected'),
      allowNull: true,
      comment: 'Stripe Connect account verification status',
    });

    await queryInterface.addColumn('Users', 'payoutEnabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the interviewer can receive payouts',
    });

    await queryInterface.addColumn('Users', 'stripeAccountId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe Connect account ID for interviewers',
    });

    await queryInterface.addColumn('Users', 'stripeCustomerId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe Customer ID for recruiters',
    });

    // Add additional Stripe fields to Contracts table
    await queryInterface.addColumn('Contracts', 'paymentIntentId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe Payment Intent ID for contract payments',
    });

    await queryInterface.addColumn('Contracts', 'stripeApplicationFee', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Platform fee amount (2.5%)',
    });

    await queryInterface.addColumn('Contracts', 'stripeTransferId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe Transfer ID when paying interviewer',
    });

    // Add Stripe fields to Transactions table
    await queryInterface.addColumn('Transactions', 'stripePaymentIntentId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe PaymentIntent ID',
    });

    await queryInterface.addColumn('Transactions', 'stripeTransferId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe Transfer ID for payouts',
    });

    await queryInterface.addColumn('Transactions', 'stripePayoutId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe Payout ID',
    });

    await queryInterface.addColumn('Transactions', 'platformFee', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Platform fee deducted (2.5%)',
    });

    await queryInterface.addColumn('Transactions', 'netAmount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Amount after platform fee deduction',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'stripeAccountStatus');
    await queryInterface.removeColumn('Users', 'payoutEnabled');
    await queryInterface.removeColumn('Users', 'stripeCustomerId');

    await queryInterface.removeColumn('Contracts', 'paymentIntentId');
    await queryInterface.removeColumn('Contracts', 'stripeApplicationFee');
    await queryInterface.removeColumn('Contracts', 'stripeTransferId');

    await queryInterface.removeColumn('Transactions', 'transactionType');
    await queryInterface.removeColumn('Transactions', 'stripePaymentIntentId');
    await queryInterface.removeColumn('Transactions', 'stripeTransferId');
    await queryInterface.removeColumn('Transactions', 'stripePayoutId');
    await queryInterface.removeColumn('Transactions', 'platformFee');
    await queryInterface.removeColumn('Transactions', 'netAmount');
  },
};
