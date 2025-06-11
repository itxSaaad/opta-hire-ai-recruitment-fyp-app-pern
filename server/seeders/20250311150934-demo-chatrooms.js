'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // User IDs
    const recruiterId = '00000000-0000-0000-0000-000000000002'; // Moiz Nadeem
    const interviewerId1 = '00000000-0000-0000-0000-000000000003'; // Hassaan Munir
    const interviewerId2 = '00000000-0000-0000-0000-000000000004'; // Hasnain Raza

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

    const chatRooms = [
      // Hassaan (Full-Stack Technical Interviewer) - Technical roles
      {
        id: '40000000-0000-0000-0000-000000000001',
        jobId: jobs[0], // Senior Full Stack Developer
        interviewerId: interviewerId1,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        jobId: jobs[6], // DevOps Engineer
        interviewerId: interviewerId1,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '40000000-0000-0000-0000-000000000003',
        jobId: jobs[5], // Senior UX/UI Designer
        interviewerId: interviewerId1,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },

      // Hasnain (System Design Interviewer) - Senior/Architecture roles
      {
        id: '40000000-0000-0000-0000-000000000004',
        jobId: jobs[1], // Data Science Manager
        interviewerId: interviewerId2,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '40000000-0000-0000-0000-000000000005',
        jobId: jobs[7], // Product Manager
        interviewerId: interviewerId2,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: '40000000-0000-0000-0000-000000000006',
        jobId: jobs[0], // Senior Full Stack Developer (backup interviewer)
        interviewerId: interviewerId2,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },

      // Additional chat rooms for non-technical roles (both interviewers can handle these)
      {
        id: '40000000-0000-0000-0000-000000000007',
        jobId: jobs[2], // Digital Marketing Specialist
        interviewerId: interviewerId1,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '40000000-0000-0000-0000-000000000008',
        jobId: jobs[3], // Financial Analyst
        interviewerId: interviewerId2,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: '40000000-0000-0000-0000-000000000009',
        jobId: jobs[4], // Sales Development Representative
        interviewerId: interviewerId1,
        recruiterId: recruiterId,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    await queryInterface.bulkInsert('ChatRooms', chatRooms, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ChatRooms', null, {});
  },
};
