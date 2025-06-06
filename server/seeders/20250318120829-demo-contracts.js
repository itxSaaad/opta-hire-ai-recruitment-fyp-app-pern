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
      throw new Error(
        'Recruiter not found. Ensure that a user with email recruiter@optahire.com and isRecruiter=true exists.'
      );
    }

    const recruiterId = recruiterRows[0].id;

    // Get interviewer user
    const interviewerRows = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'interviewer@optahire.com' AND "isInterviewer" = true LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!interviewerRows || interviewerRows.length === 0) {
      throw new Error(
        'Interviewer not found. Ensure that a user with email interviewer@optahire.com and isInterviewer=true exists.'
      );
    }
    const interviewerId = interviewerRows[0].id;

    // Get job
    const jobRows = await queryInterface.sequelize.query(
      `SELECT id FROM "Jobs" WHERE title = 'Senior Full Stack Developer' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!jobRows || jobRows.length === 0) {
      throw new Error(
        'Job not found. Ensure that a job with title "Software Engineer" exists.'
      );
    }

    const jobId = jobRows[0].id;

    // Get chat room
    const chatRoomRows = await queryInterface.sequelize.query(
      `SELECT id FROM "ChatRooms" WHERE "jobId" = $1 AND "recruiterId" = $2 AND "interviewerId" = $3 LIMIT 1;`,
      {
        bind: [jobId, recruiterId, interviewerId],
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!chatRoomRows || chatRoomRows.length === 0) {
      throw new Error(
        'Chat Room not found for the given job and participants. Ensure that a ChatRoom exists for this recruiter-interviewer-job combination.'
      );
    }

    const roomId = chatRoomRows[0].id;

    const contracts = [
      {
        agreedPrice: 5000.0,
        status: 'pending',
        paymentStatus: 'pending',
        paymentIntentId: null,
        stripeApplicationFee: null,
        stripeTransferId: null,
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
        paymentIntentId: 'pi_1234567890abcdef',
        stripeApplicationFee: 187.5, // 2.5% of 7500
        stripeTransferId: 'tr_1234567890abcdef',
        recruiterId,
        interviewerId,
        jobId,
        roomId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agreedPrice: 3000.0,
        status: 'completed',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_0987654321fedcba',
        stripeApplicationFee: 75.0, // 2.5% of 3000
        stripeTransferId: 'tr_0987654321fedcba',
        recruiterId,
        interviewerId,
        jobId,
        roomId,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Contracts', contracts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Contracts', null, {});
  },
};
