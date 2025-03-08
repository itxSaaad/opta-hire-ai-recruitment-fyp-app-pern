'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const candidateRows = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE email IN (
         'candidate@optahire.com', 
         'candidate2@optahire.com'
      );`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const candidateMap = candidateRows.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    const jobRows = await queryInterface.sequelize.query(
      `SELECT id FROM "Jobs";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const applications = [];
    const candidates = ['candidate@optahire.com', 'candidate2@optahire.com'];

    jobRows.forEach((job, index) => {
      const candidateEmail = candidates[index % candidates.length];

      applications.push({
        status: 'applied',
        applicationDate: new Date(),
        jobId: job.id,
        candidateId: candidateMap[candidateEmail],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    applications.forEach((app) => {
      if (!app.jobId) {
        throw new Error(
          'Missing jobId for one of the applications. Check your Jobs seeder.'
        );
      }
      if (!app.candidateId) {
        throw new Error(
          'Missing candidateId for one of the applications. Check your Users seeder.'
        );
      }
    });

    await queryInterface.bulkInsert('Applications', applications, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Applications', null, {});
  },
};
