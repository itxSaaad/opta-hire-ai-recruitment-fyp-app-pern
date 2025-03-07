'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const recruiters = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE email = 'recruiter@optahire.com';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!recruiters || recruiters.length === 0) {
      throw new Error(
        'No recruiter found with the email recruiter@optahire.com'
      );
    }

    const recruiterId = recruiters[0].id;

    const jobs = [
      {
        title: 'Software Engineer',
        description:
          'Develop and maintain web applications using modern frameworks and tools.',
        requirements: JSON.stringify(['JavaScript', 'Node.js', 'React']),
        salaryRange: '$60k - $80k',
        category: 'Technology',
        location: 'Remote',
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Data Analyst',
        description:
          'Analyze datasets to provide business insights and support decision-making.',
        requirements: JSON.stringify(['SQL', 'Excel', 'Python']),
        salaryRange: '$50k - $70k',
        category: 'Analytics',
        location: 'New York',
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Product Manager',
        description:
          'Lead product development from ideation to launch, ensuring market success.',
        requirements: JSON.stringify(['Leadership', 'Communication', 'Agile']),
        salaryRange: '$70k - $90k',
        category: 'Management',
        location: 'San Francisco',
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Jobs', jobs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Jobs',
      {
        title: {
          [Sequelize.Op.in]: [
            'Software Engineer',
            'Data Analyst',
            'Product Manager',
          ],
        },
      },
      {}
    );
  },
};
