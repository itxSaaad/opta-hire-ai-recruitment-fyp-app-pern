'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // User IDs
    const recruiterId = '00000000-0000-0000-0000-000000000002'; // Moiz Nadeem
    const interviewerId1 = '00000000-0000-0000-0000-000000000003'; // Hassaan Munir
    const interviewerId2 = '00000000-0000-0000-0000-000000000004'; // Hasnain Raza

    // Job IDs and ChatRoom IDs
    const jobId1 = '20000000-0000-0000-0000-000000000001'; // Senior Full Stack Developer
    const jobId2 = '20000000-0000-0000-0000-000000000002'; // Data Science Manager
    const jobId3 = '20000000-0000-0000-0000-000000000007'; // DevOps Engineer
    const jobId4 = '20000000-0000-0000-0000-000000000008'; // Product Manager
    const jobId5 = '20000000-0000-0000-0000-000000000006'; // Senior UX/UI Designer
    const jobId6 = '20000000-0000-0000-0000-000000000003'; // Digital Marketing Specialist

    const roomId1 = '40000000-0000-0000-0000-000000000001'; // Senior Full Stack Developer (Hassaan)
    const roomId2 = '40000000-0000-0000-0000-000000000004'; // Data Science Manager (Hasnain)
    const roomId3 = '40000000-0000-0000-0000-000000000002'; // DevOps Engineer (Hassaan)
    const roomId4 = '40000000-0000-0000-0000-000000000005'; // Product Manager (Hasnain)
    const roomId5 = '40000000-0000-0000-0000-000000000003'; // Senior UX/UI Designer (Hassaan)
    const roomId6 = '40000000-0000-0000-0000-000000000007'; // Digital Marketing Specialist (Hassaan)

    const contracts = [
      // Contract 1: Senior Full Stack Developer (Hassaan) - Active, Paid
      {
        id: '60000000-0000-0000-0000-000000000001',
        agreedPrice: 450.0, // 3 interviews × $150
        status: 'active',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_1234567890abcdef_fullstack',
        stripeApplicationFee: 11.25, // 2.5% of 450
        stripeTransferId: 'tr_1234567890abcdef_fullstack',
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        jobId: jobId1,
        roomId: roomId1,
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },

      // Contract 2: Data Science Manager (Hasnain) - Completed, Paid
      {
        id: '60000000-0000-0000-0000-000000000002',
        agreedPrice: 600.0, // 3 interviews × $200
        status: 'completed',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_0987654321fedcba_datascience',
        stripeApplicationFee: 15.0, // 2.5% of 600
        stripeTransferId: 'tr_0987654321fedcba_datascience',
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        jobId: jobId2,
        roomId: roomId2,
        createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },

      // Contract 3: DevOps Engineer (Hassaan) - Pending Payment
      {
        id: '60000000-0000-0000-0000-000000000003',
        agreedPrice: 300.0, // 2 interviews × $150
        status: 'pending',
        paymentStatus: 'pending',
        paymentIntentId: null,
        stripeApplicationFee: null,
        stripeTransferId: null,
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        jobId: jobId3,
        roomId: roomId3,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },

      // Contract 4: Product Manager (Hasnain) - Active, Paid
      {
        id: '60000000-0000-0000-0000-000000000004',
        agreedPrice: 525.0, // 3 interviews × $175
        status: 'active',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_abcdef1234567890_product',
        stripeApplicationFee: 13.13, // 2.5% of 525
        stripeTransferId: 'tr_abcdef1234567890_product',
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        jobId: jobId4,
        roomId: roomId4,
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },

      // Contract 5: Senior UX/UI Designer (Hassaan) - Pending
      {
        id: '60000000-0000-0000-0000-000000000005',
        agreedPrice: 360.0, // 2 interviews × $180
        status: 'pending',
        paymentStatus: 'pending',
        paymentIntentId: null,
        stripeApplicationFee: null,
        stripeTransferId: null,
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        jobId: jobId5,
        roomId: roomId5,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },

      // Contract 6: Digital Marketing Specialist (Hassaan) - Active, Paid (non-technical)
      {
        id: '60000000-0000-0000-0000-000000000006',
        agreedPrice: 240.0, // 2 interviews × $120
        status: 'active',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_marketing_specialist_2024',
        stripeApplicationFee: 6.0, // 2.5% of 240
        stripeTransferId: 'tr_marketing_specialist_2024',
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        jobId: jobId6,
        roomId: roomId6,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },

      // Contract 7: Failed Payment Example
      {
        id: '60000000-0000-0000-0000-000000000007',
        agreedPrice: 350.0, // 2 interviews × $175
        status: 'pending',
        paymentStatus: 'failed',
        paymentIntentId: 'pi_failed_payment_example',
        stripeApplicationFee: null,
        stripeTransferId: null,
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        jobId: jobId1, // Senior Full Stack Developer (backup interviewer)
        roomId: '40000000-0000-0000-0000-000000000006', // backup chat room
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },

      // Contract 8: Cancelled Contract
      {
        id: '60000000-0000-0000-0000-000000000008',
        agreedPrice: 200.0, // 1 interview × $200
        status: 'cancelled',
        paymentStatus: 'pending',
        paymentIntentId: null,
        stripeApplicationFee: null,
        stripeTransferId: null,
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        jobId: '20000000-0000-0000-0000-000000000004', // Financial Analyst
        roomId: '40000000-0000-0000-0000-000000000008',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    await queryInterface.bulkInsert('Contracts', contracts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Contracts', null, {});
  },
};
