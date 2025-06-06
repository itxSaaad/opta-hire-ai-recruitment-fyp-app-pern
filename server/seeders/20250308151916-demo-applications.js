'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const candidateRows = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE "isCandidate" = true AND email IN (
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
      `SELECT id FROM "Jobs" WHERE "isClosed" = false;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (jobRows.length === 0) {
      console.log('No open jobs found. Skipping application seeding.');
      return;
    }

    if (candidateRows.length === 0) {
      console.log('No candidate users found. Skipping application seeding.');
      return;
    }

    const applications = [];
    const candidates = Object.keys(candidateMap);
    const statuses = ['applied', 'shortlisted', 'rejected', 'hired'];

    jobRows.forEach((job, index) => {
      const candidateEmail = candidates[index % candidates.length];
      const status = statuses[index % statuses.length];

      applications.push({
        id: require('crypto').randomUUID(),
        status: status,
        applicationDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ), // Random date within last 30 days
        jobId: job.id,
        candidateId: candidateMap[candidateEmail],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Add additional applications for variety
    if (jobRows.length > 1 && candidates.length > 1) {
      for (let i = 0; i < Math.min(5, jobRows.length); i++) {
        applications.push({
          id: require('crypto').randomUUID(),
          status: 'applied',
          applicationDate: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ), // Random date within last 7 days
          jobId: jobRows[i].id,
          candidateId: candidateMap[candidates[1]],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Validation before insertion
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
      if (!app.id) {
        throw new Error('Missing UUID for one of the applications.');
      }
    });

    await queryInterface.bulkInsert('Applications', applications, {});
  },

  async down(queryInterface, Sequelize) {
    const applications = await queryInterface.sequelize.query(
      `SELECT id FROM "Applications"
       WHERE jobId IN (
         SELECT id FROM "Jobs" WHERE "isClosed" = false
       ) AND candidateId IN (
         SELECT id FROM "Users" WHERE "isCandidate" = true AND email IN (
           'candidate@optahire.com',
           'candidate2@optahire.com'
         )
       );`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkDelete(
      'Applications',
      { id: applications.map((app) => app.id) },
      {}
    );
  },
};
