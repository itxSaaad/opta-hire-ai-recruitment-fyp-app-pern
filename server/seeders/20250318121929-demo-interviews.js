'use strict';

const generateRoomId = (length = 12) => {
  const timestamp = Date.now().toString(36);
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from({ length: 6 }, () =>
    randomChars.charAt(Math.floor(Math.random() * randomChars.length))
  ).join('');
  return `${timestamp.slice(-4)}-${randomPart.slice(0, 4)}-${randomPart.slice(4)}`;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // User IDs
    const candidateId1 = '00000000-0000-0000-0000-000000000005'; // Muhammad Umair
    const candidateId2 = '00000000-0000-0000-0000-000000000006'; // Adnan Rao
    const interviewerId1 = '00000000-0000-0000-0000-000000000003'; // Hassaan Munir
    const interviewerId2 = '00000000-0000-0000-0000-000000000004'; // Hasnain Raza

    // Application IDs and Job IDs
    const applicationId1 = '30000000-0000-0000-0000-000000000001'; // Umair -> Senior Full Stack (shortlisted)
    const applicationId2 = '30000000-0000-0000-0000-000000000005'; // Adnan -> DevOps Engineer (hired)
    const applicationId3 = '30000000-0000-0000-0000-000000000006'; // Adnan -> Senior Full Stack (shortlisted)
    const applicationId4 = '30000000-0000-0000-0000-000000000007'; // Adnan -> Product Manager (applied)
    const applicationId5 = '30000000-0000-0000-0000-000000000002'; // Umair -> Senior UX/UI (applied)

    const jobId1 = '20000000-0000-0000-0000-000000000001'; // Senior Full Stack Developer
    const jobId2 = '20000000-0000-0000-0000-000000000007'; // DevOps Engineer
    const jobId3 = '20000000-0000-0000-0000-000000000008'; // Product Manager
    const jobId4 = '20000000-0000-0000-0000-000000000006'; // Senior UX/UI Designer

    const interviews = [
      // Interview 1: Umair for Senior Full Stack Developer (Scheduled - Future)
      {
        id: '70000000-0000-0000-0000-000000000001',
        roomId: generateRoomId(),
        scheduledTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
        callStartedAt: null,
        callEndedAt: null,
        interviewerId: interviewerId1,
        candidateId: candidateId1,
        jobId: jobId1,
        applicationId: applicationId1,
        status: 'scheduled',
        remarks:
          'Technical interview scheduled for full-stack position. Focus on React, Node.js, and system design.',
        summary: null,
        rating: null,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },

      // Interview 2: Adnan for DevOps Engineer (Completed - Past)
      {
        id: '70000000-0000-0000-0000-000000000002',
        roomId: generateRoomId(),
        scheduledTime: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        callStartedAt: new Date(
          now.getTime() - 15 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000
        ), // 5 min late
        callEndedAt: new Date(
          now.getTime() - 15 * 24 * 60 * 60 * 1000 + 65 * 60 * 1000
        ), // 60 min duration
        interviewerId: interviewerId1,
        candidateId: candidateId2,
        jobId: jobId2,
        applicationId: applicationId2,
        status: 'completed',
        remarks:
          'Excellent candidate with strong DevOps knowledge. Demonstrated proficiency in AWS, Docker, and Kubernetes.',
        summary:
          'Candidate showed exceptional technical skills in cloud infrastructure and containerization. Strong problem-solving abilities and practical experience with CI/CD pipelines. Highly recommended for the position.',
        rating: 4.8,
        createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },

      // Interview 3: Adnan for Senior Full Stack Developer (Completed - Past)
      {
        id: '70000000-0000-0000-0000-000000000003',
        roomId: generateRoomId(),
        scheduledTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        callStartedAt: new Date(
          now.getTime() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000
        ), // 2 min late
        callEndedAt: new Date(
          now.getTime() - 5 * 24 * 60 * 60 * 1000 + 58 * 60 * 1000
        ), // 56 min duration
        interviewerId: interviewerId1,
        candidateId: candidateId2,
        jobId: jobId1,
        applicationId: applicationId3,
        status: 'completed',
        remarks:
          'Strong backend skills but limited frontend experience. Good system thinking and DevOps background.',
        summary:
          'Candidate demonstrated solid understanding of backend technologies and system architecture. However, frontend skills need improvement for a full-stack role. Better suited for backend-focused positions.',
        rating: 3.7,
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },

      // Interview 4: Adnan for Product Manager (Scheduled - Tomorrow)
      {
        id: '70000000-0000-0000-0000-000000000004',
        roomId: generateRoomId(),
        scheduledTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day in future
        callStartedAt: null,
        callEndedAt: null,
        interviewerId: interviewerId2,
        candidateId: candidateId2,
        jobId: jobId3,
        applicationId: applicationId4,
        status: 'scheduled',
        remarks:
          'System design interview for Product Manager role. Focus on technical product management and strategic thinking.',
        summary: null,
        rating: null,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },

      // Interview 5: Umair for Senior UX/UI Designer (Cancelled)
      {
        id: '70000000-0000-0000-0000-000000000005',
        roomId: generateRoomId(),
        scheduledTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        callStartedAt: null,
        callEndedAt: null,
        interviewerId: interviewerId1,
        candidateId: candidateId1,
        jobId: jobId4,
        applicationId: applicationId5,
        status: 'cancelled',
        remarks:
          'Interview cancelled due to candidate scheduling conflict. Will reschedule next week.',
        summary: null,
        rating: null,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },

      // Interview 6: Additional completed interview for Data Science Manager role
      {
        id: '70000000-0000-0000-0000-000000000006',
        roomId: generateRoomId(),
        scheduledTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        callStartedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // On time
        callEndedAt: new Date(
          now.getTime() - 10 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000
        ), // 90 min duration
        interviewerId: interviewerId2,
        candidateId: candidateId1, // Umair trying for a stretch position
        jobId: '20000000-0000-0000-0000-000000000002', // Data Science Manager
        applicationId: '30000000-0000-0000-0000-000000000003', // Umair's rejected application
        status: 'completed',
        remarks:
          'Candidate has strong technical skills but lacks data science and management experience.',
        summary:
          'While the candidate demonstrated excellent programming abilities and system thinking, they lack the specific data science expertise and leadership experience required for this senior management role.',
        rating: 2.8,
        createdAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      },

      // Interview 7: Ongoing interview (started but not finished)
      {
        id: '70000000-0000-0000-0000-000000000007',
        roomId: generateRoomId(),
        scheduledTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        callStartedAt: new Date(now.getTime() - 25 * 60 * 1000), // Started 25 minutes ago
        callEndedAt: null,
        interviewerId: interviewerId1,
        candidateId: candidateId1,
        jobId: '20000000-0000-0000-0000-000000000003', // Digital Marketing Specialist
        applicationId: '30000000-0000-0000-0000-000000000009', // Umair's application to Financial Analyst (using as proxy)
        status: 'ongoing',
        remarks:
          'Interview currently in progress. Assessing communication and analytical skills.',
        summary: null,
        rating: null,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 25 * 60 * 1000),
      },
    ];

    await queryInterface.bulkInsert('Interviews', interviews, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Interviews', null, {});
  },
};
