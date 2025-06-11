'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Get demo users
    const recruiterId = '00000000-0000-0000-0000-000000000002'; // Moiz Nadeem
    const interviewerId1 = '00000000-0000-0000-0000-000000000003'; // Hassaan Munir
    const interviewerId2 = '00000000-0000-0000-0000-000000000004'; // Hasnain Raza

    const contracts = [
      {
        id: '60000000-0000-0000-0000-000000000001', // Senior Full Stack Developer (Hassaan) - Active, Paid
        agreedPrice: 450.0,
        status: 'active',
        paymentStatus: 'paid',
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
        interviewerId: interviewerId1,
      },
      {
        id: '60000000-0000-0000-0000-000000000002', // Data Science Manager (Hasnain) - Completed, Paid
        agreedPrice: 600.0,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
        interviewerId: interviewerId2,
      },
      {
        id: '60000000-0000-0000-0000-000000000003', // DevOps Engineer (Hassaan) - Pending Payment
        agreedPrice: 300.0,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        interviewerId: interviewerId1,
      },
      {
        id: '60000000-0000-0000-0000-000000000004', // Product Manager (Hasnain) - Active, Paid
        agreedPrice: 525.0,
        status: 'active',
        paymentStatus: 'paid',
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        interviewerId: interviewerId2,
      },
      {
        id: '60000000-0000-0000-0000-000000000005', // Senior UX/UI Designer (Hassaan) - Pending
        agreedPrice: 360.0,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        interviewerId: interviewerId1,
      },
      {
        id: '60000000-0000-0000-0000-000000000006', // Digital Marketing Specialist (Hassaan) - Active, Paid
        agreedPrice: 240.0,
        status: 'active',
        paymentStatus: 'paid',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        interviewerId: interviewerId1,
      },
      {
        id: '60000000-0000-0000-0000-000000000007', // Failed Payment Example
        agreedPrice: 350.0,
        status: 'pending',
        paymentStatus: 'failed',
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        interviewerId: interviewerId2,
      },
      {
        id: '60000000-0000-0000-0000-000000000008', // Cancelled Contract
        agreedPrice: 200.0,
        status: 'cancelled',
        paymentStatus: 'pending',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        interviewerId: interviewerId2,
      },
    ];

    // Calculate platform fee (2.5%)
    const calculateFee = (amount) => parseFloat((amount * 0.025).toFixed(2));

    const transactions = [];
    let transactionIdCounter = 1;

    // Helper function to generate transaction ID with leading zeros
    const generateTransactionId = () => {
      const id = `70000000-0000-0000-0000-${String(transactionIdCounter).padStart(12, '0')}`;
      transactionIdCounter++;
      return id;
    };

    contracts.forEach((contract) => {
      const platformFee = calculateFee(contract.agreedPrice);
      const netAmount = parseFloat(
        (contract.agreedPrice - platformFee).toFixed(2)
      );

      // Create transactions based on contract status
      if (
        contract.paymentStatus === 'pending' &&
        contract.status !== 'cancelled'
      ) {
        // Pending payment transaction - user attempted to pay but not yet completed
        transactions.push({
          id: generateTransactionId(),
          amount: contract.agreedPrice,
          status: 'pending',
          transactionDate: new Date(
            contract.createdAt.getTime() + 1 * 60 * 60 * 1000
          ), // 1 hour after contract creation
          transactionType: 'payment',
          contractId: contract.id,
          stripePaymentIntentId: `pi_pending_${contract.id.substring(25)}`,
          stripeTransferId: null,
          stripePayoutId: null,
          platformFee: platformFee,
          netAmount: netAmount,
          createdAt: new Date(
            contract.createdAt.getTime() + 1 * 60 * 60 * 1000
          ),
          updatedAt: new Date(
            contract.createdAt.getTime() + 1 * 60 * 60 * 1000
          ),
        });
      } else if (contract.paymentStatus === 'failed') {
        // Failed payment transaction
        transactions.push({
          id: generateTransactionId(),
          amount: contract.agreedPrice,
          status: 'failed',
          transactionDate: new Date(
            contract.createdAt.getTime() + 2 * 60 * 60 * 1000
          ), // 2 hours after contract creation
          transactionType: 'payment',
          contractId: contract.id,
          stripePaymentIntentId: `pi_failed_${contract.id.substring(25)}`,
          stripeTransferId: null,
          stripePayoutId: null,
          platformFee: platformFee,
          netAmount: netAmount,
          createdAt: new Date(
            contract.createdAt.getTime() + 2 * 60 * 60 * 1000
          ),
          updatedAt: new Date(
            contract.createdAt.getTime() + 2 * 60 * 60 * 1000
          ),
        });

        // Retry payment transaction (still failed)
        transactions.push({
          id: generateTransactionId(),
          amount: contract.agreedPrice,
          status: 'failed',
          transactionDate: new Date(
            contract.createdAt.getTime() + 8 * 60 * 60 * 1000
          ), // 8 hours after contract creation
          transactionType: 'payment',
          contractId: contract.id,
          stripePaymentIntentId: `pi_failed_retry_${contract.id.substring(25)}`,
          stripeTransferId: null,
          stripePayoutId: null,
          platformFee: platformFee,
          netAmount: netAmount,
          createdAt: new Date(
            contract.createdAt.getTime() + 8 * 60 * 60 * 1000
          ),
          updatedAt: new Date(
            contract.createdAt.getTime() + 8 * 60 * 60 * 1000
          ),
        });
      } else if (contract.paymentStatus === 'paid') {
        // Successful payment transaction
        const paymentDate = new Date(
          contract.createdAt.getTime() + 3 * 60 * 60 * 1000
        ); // 3 hours after contract creation
        transactions.push({
          id: generateTransactionId(),
          amount: contract.agreedPrice,
          status: 'completed',
          transactionDate: paymentDate,
          transactionType: 'payment',
          contractId: contract.id,
          stripePaymentIntentId: `pi_${contract.id.substring(25)}`,
          stripeTransferId: null,
          stripePayoutId: null,
          platformFee: platformFee,
          netAmount: netAmount,
          createdAt: paymentDate,
          updatedAt: paymentDate,
        });

        // Platform fee transaction - OptraHire's commission
        const platformFeeDate = new Date(
          paymentDate.getTime() + 15 * 60 * 1000
        ); // 15 minutes after payment
        transactions.push({
          id: generateTransactionId(),
          amount: platformFee,
          status: 'completed',
          transactionDate: platformFeeDate,
          transactionType: 'platform_fee',
          contractId: contract.id,
          stripePaymentIntentId: null,
          stripeTransferId: null,
          stripePayoutId: null,
          platformFee: null,
          netAmount: null,
          createdAt: platformFeeDate,
          updatedAt: platformFeeDate,
        });

        // Payout to interviewer - only if contract is completed or is older than 3 days
        if (
          contract.status === 'completed' ||
          now.getTime() - contract.createdAt.getTime() > 3 * 24 * 60 * 60 * 1000
        ) {
          const payoutDate = new Date(
            paymentDate.getTime() + 24 * 60 * 60 * 1000
          ); // 24 hours after payment
          transactions.push({
            id: generateTransactionId(),
            amount: netAmount,
            status: 'completed',
            transactionDate: payoutDate,
            transactionType: 'payout',
            contractId: contract.id,
            stripePaymentIntentId: null,
            stripeTransferId: `tr_${contract.id.substring(25)}`,
            stripePayoutId: `po_${contract.id.substring(25)}`,
            platformFee: null,
            netAmount: netAmount,
            createdAt: payoutDate,
            updatedAt: payoutDate,
          });
        }
      } else if (
        contract.status === 'cancelled' &&
        contract.paymentStatus === 'paid'
      ) {
        // Example of a refund scenario - payment made but then refunded
        const paymentDate = new Date(
          contract.createdAt.getTime() + 2 * 60 * 60 * 1000
        );
        const refundDate = new Date(
          contract.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000
        ); // 2 days after contract

        // The original payment
        transactions.push({
          id: generateTransactionId(),
          amount: contract.agreedPrice,
          status: 'completed',
          transactionDate: paymentDate,
          transactionType: 'payment',
          contractId: contract.id,
          stripePaymentIntentId: `pi_later_refunded_${contract.id.substring(25)}`,
          stripeTransferId: null,
          stripePayoutId: null,
          platformFee: platformFee,
          netAmount: netAmount,
          createdAt: paymentDate,
          updatedAt: paymentDate,
        });

        // The refund
        transactions.push({
          id: generateTransactionId(),
          amount: contract.agreedPrice,
          status: 'completed',
          transactionDate: refundDate,
          transactionType: 'refund',
          contractId: contract.id,
          stripePaymentIntentId: `pi_refund_${contract.id.substring(25)}`,
          stripeTransferId: null,
          stripePayoutId: null,
          platformFee: platformFee,
          netAmount: netAmount,
          createdAt: refundDate,
          updatedAt: refundDate,
        });
      }
    });

    await queryInterface.bulkInsert('Transactions', transactions, {});
    console.log(
      `Inserted ${transactions.length} transactions for various contract statuses`
    );
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('Transactions', null, {});
  },
};
