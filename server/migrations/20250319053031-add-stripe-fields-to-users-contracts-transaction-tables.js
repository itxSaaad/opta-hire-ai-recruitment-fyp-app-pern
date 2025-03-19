'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Contracts', 'paymentIntentId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe PaymentIntent ID for contract payments',
    });

    await queryInterface.addColumn('Transactions', 'transactionType', {
      type: Sequelize.ENUM('payment', 'refund', 'payout'),
      allowNull: true,
      comment: 'Type of transaction for Stripe payments',
    });

    await queryInterface.addColumn('Users', 'stripeAccountId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe connected account ID for interviewers',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Contracts', 'paymentIntentId');
    await queryInterface.removeColumn('Transactions', 'transactionType');
    await queryInterface.removeColumn('Users', 'stripeAccountId');
  },
};
