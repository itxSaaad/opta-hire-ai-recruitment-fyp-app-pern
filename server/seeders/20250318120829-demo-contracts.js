'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const recruiterRows = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'recruiter@optahire.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!recruiterRows || recruiterRows.length === 0) {
      throw new Error(
        'Recruiter not found. Ensure that a user with email recruiter@optahire.com exists.'
      );
    }

    const recruiterId = recruiterRows[0].id;

    const interviewerRows = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'interviewer@optahire.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!interviewerRows || interviewerRows.length === 0) {
      throw new Error(
        'Interviewer not found. Ensure that a user with email interviewer@optahire.com exists.'
      );
    }
    const interviewerId = interviewerRows[0].id;

    const jobRows = await queryInterface.sequelize.query(
      `SELECT id FROM "Jobs" WHERE title = 'Software Engineer' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!jobRows || jobRows.length === 0) {
      throw new Error(
        'Job not found. Ensure that a job with title "Software Engineer" exists.'
      );
    }

    const jobId = jobRows[0].id;

    const chatRoomRows = await queryInterface.sequelize.query(
      `SELECT id FROM "ChatRooms" WHERE "jobId" = '${jobId}' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!chatRoomRows || chatRoomRows.length === 0) {
      throw new Error(
        'Chat Room not found for the given job. Ensure that a ChatRoom for the job exists.'
      );
    }

    const roomId = chatRoomRows[0].id;

    const contracts = [
      {
        agreedPrice: 5000.0,
        status: 'pending',
        paymentStatus: 'pending',
        recruiterId,
        interviewerId,
        jobId,
        roomId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agreedPrice: 7500.0,
        status: 'active',
        paymentStatus: 'paid',
        recruiterId,
        interviewerId,
        jobId,
        roomId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Contracts', contracts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Contracts', null, {});
  },
};
