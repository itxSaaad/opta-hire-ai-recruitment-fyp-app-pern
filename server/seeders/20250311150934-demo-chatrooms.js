'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const jobRows = await queryInterface.sequelize.query(
      `SELECT id, title, "recruiterId" FROM "Jobs" WHERE title IN ('Software Engineer', 'Data Analyst');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const jobMap = jobRows.reduce((acc, job) => {
      acc[job.title] = job;
      return acc;
    }, {});

    const interviewerRows = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE email IN ('interviewer@optahire.com', 'interviewer2@optahire.com');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const interviewerMap = interviewerRows.reduce((acc, interviewer) => {
      acc[interviewer.email] = interviewer.id;
      return acc;
    }, {});

    const chatRooms = [
      {
        jobId: jobMap['Software Engineer']?.id,
        interviewerId: interviewerMap['interviewer@optahire.com'],
        recruiterId: jobMap['Software Engineer']?.recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        jobId: jobMap['Data Analyst']?.id,
        interviewerId: interviewerMap['interviewer2@optahire.com'],
        recruiterId: jobMap['Data Analyst']?.recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    chatRooms.forEach((room) => {
      if (!room.jobId || !room.interviewerId || !room.recruiterId) {
        throw new Error('Invalid chat room data');
      }
    });

    await queryInterface.bulkInsert('ChatRooms', chatRooms, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ChatRooms', null, {});
  },
};
