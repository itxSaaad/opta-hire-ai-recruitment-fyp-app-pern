'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const contractRows = await queryInterface.sequelize.query(
      `SELECT id, "jobId", "recruiterId", "interviewerId" FROM "Contracts" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!contractRows || contractRows.length === 0) {
      throw new Error('No contract found. Please seed Contracts first.');
    }

    const contract = contractRows[0];

    const ratings = [
      {
        rating: 4.5,
        feedback:
          'The interviewer demonstrated exceptional knowledge and professionalism throughout the process.',
        interviewerId: contract.interviewerId,
        recruiterId: contract.recruiterId,
        jobId: contract.jobId,
        contractId: contract.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        rating: 4.0,
        feedback:
          'The interviewer was very knowledgeable and provided clear insights on the role and company culture.',
        interviewerId: contract.interviewerId,
        recruiterId: contract.recruiterId,
        jobId: contract.jobId,
        contractId: contract.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('InterviewerRatings', ratings, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('InterviewerRatings', null, {});
  },
};
