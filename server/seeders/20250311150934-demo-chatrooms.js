'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get jobs data
    const jobRows = await queryInterface.sequelize.query(
      `SELECT id, title, "recruiterId" FROM "Jobs" WHERE title IN ('Senior Full Stack Developer', 'Data Science Manager', 'Digital Marketing Specialist', 'Financial Analyst') AND "recruiterId" = (SELECT id FROM "Users" WHERE email = 'recruiter@optahire.com')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const jobMap = jobRows.reduce((acc, job) => {
      acc[job.title] = job;
      return acc;
    }, {});

    // Get interviewer users
    const interviewerRows = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE email IN ('interviewer@optahire.com', 'interviewer2@optahire.com') AND "isInterviewer" = true;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const interviewerMap = interviewerRows.reduce((acc, interviewer) => {
      acc[interviewer.email] = interviewer.id;
      return acc;
    }, {});

    // Validate that we have the required data
    if (
      !jobMap['Senior Full Stack Developer'] ||
      !jobMap['Data Science Manager'] ||
      !jobMap['Digital Marketing Specialist'] ||
      !jobMap['Financial Analyst']
    ) {
      throw new Error('Required jobs not found. Please run job seeders first.');
    }

    if (
      !interviewerMap['interviewer@optahire.com'] ||
      !interviewerMap['interviewer2@optahire.com']
    ) {
      throw new Error(
        'Required interviewer users not found. Please run user seeders first.'
      );
    }

    const chatRooms = [
      {
        id: require('crypto').randomUUID(),
        jobId: jobMap['Senior Full Stack Developer'].id,
        interviewerId: interviewerMap['interviewer@optahire.com'],
        recruiterId: jobMap['Senior Full Stack Developer'].recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: require('crypto').randomUUID(),
        jobId: jobMap['Data Science Manager'].id,
        interviewerId: interviewerMap['interviewer2@optahire.com'],
        recruiterId: jobMap['Data Science Manager'].recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: require('crypto').randomUUID(),
        jobId: jobMap['Digital Marketing Specialist'].id,
        interviewerId: interviewerMap['interviewer@optahire.com'],
        recruiterId: jobMap['Digital Marketing Specialist'].recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: require('crypto').randomUUID(),
        jobId: jobMap['Financial Analyst'].id,
        interviewerId: interviewerMap['interviewer2@optahire.com'],
        recruiterId: jobMap['Financial Analyst'].recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Validate chat room data
    chatRooms.forEach((room) => {
      if (!room.jobId || !room.interviewerId || !room.recruiterId) {
        throw new Error('Invalid chat room data - missing required fields');
      }
    });

    await queryInterface.bulkInsert('ChatRooms', chatRooms, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ChatRooms', null, {});
  },
};
