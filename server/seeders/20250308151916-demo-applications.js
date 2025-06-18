'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // User IDs
    const candidateId1 = '00000000-0000-0000-0000-000000000005'; // Muhammad Umair
    const candidateId2 = '00000000-0000-0000-0000-000000000006'; // Adnan Rao

    // Job IDs
    const jobs = [
      '20000000-0000-0000-0000-000000000001', // Senior Full Stack Developer
      '20000000-0000-0000-0000-000000000002', // Data Science Manager
      '20000000-0000-0000-0000-000000000003', // Digital Marketing Specialist
      '20000000-0000-0000-0000-000000000004', // Financial Analyst
      '20000000-0000-0000-0000-000000000005', // Sales Development Representative
      '20000000-0000-0000-0000-000000000006', // Senior UX/UI Designer
      '20000000-0000-0000-0000-000000000007', // DevOps Engineer
      '20000000-0000-0000-0000-000000000008', // Product Manager
    ];

    const applications = [
      // Muhammad Umair (Full-Stack Developer) applications
      {
        id: '30000000-0000-0000-0000-000000000001',
        status: 'shortlisted',
        applicationDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        jobId: jobs[0], // Senior Full Stack Developer - Perfect match
        candidateId: candidateId1,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        status: 'applied',
        applicationDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        jobId: jobs[5], // Senior UX/UI Designer - Stretch application
        candidateId: candidateId1,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        status: 'rejected',
        applicationDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        jobId: jobs[1], // Data Science Manager - Not a good fit
        candidateId: candidateId1,
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: '30000000-0000-0000-0000-000000000004',
        status: 'applied',
        applicationDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        jobId: jobs[7], // Product Manager - Recent application
        candidateId: candidateId1,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },

      // Adnan Rao (DevOps Engineer) applications
      {
        id: '30000000-0000-0000-0000-000000000005',
        status: 'hired',
        applicationDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        jobId: jobs[6], // DevOps Engineer - Perfect match, got hired
        candidateId: candidateId2,
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '30000000-0000-0000-0000-000000000006',
        status: 'shortlisted',
        applicationDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        jobId: jobs[0], // Senior Full Stack Developer - Good backend skills
        candidateId: candidateId2,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: '30000000-0000-0000-0000-000000000007',
        status: 'applied',
        applicationDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        jobId: jobs[7], // Product Manager - Technical PM role
        candidateId: candidateId2,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: '30000000-0000-0000-0000-000000000008',
        status: 'rejected',
        applicationDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        jobId: jobs[2], // Digital Marketing Specialist - Not relevant
        candidateId: candidateId2,
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },

      // Additional applications for testing variety
      {
        id: '30000000-0000-0000-0000-000000000009',
        status: 'applied',
        applicationDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        jobId: jobs[3], // Financial Analyst - Umair trying different field
        candidateId: candidateId1,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '30000000-0000-0000-0000-000000000010',
        status: 'applied',
        applicationDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        jobId: jobs[4], // Sales Development Representative - Adnan exploring sales
        candidateId: candidateId2,
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
    ];

    await queryInterface.bulkInsert('Applications', applications, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Applications', null, {});
  },
};
