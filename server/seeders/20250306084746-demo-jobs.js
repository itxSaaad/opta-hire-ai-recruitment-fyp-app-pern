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
        title: 'Senior Full Stack Developer',
        description:
          'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern frameworks and technologies. The ideal candidate should have strong problem-solving skills and experience with both frontend and backend development.',
        requirements: JSON.stringify([
          "Bachelor's degree in Computer Science or related field",
          '5+ years of experience in full-stack development',
          'Proficiency in JavaScript, Node.js, React, and database technologies',
          'Experience with cloud platforms and DevOps practices',
          'Strong communication and teamwork skills',
        ]),
        salaryRange: '$80k - $120k',
        category: 'IT',
        location: 'San Francisco, CA',
        recruiterId: recruiterId,
        company: 'TechInnovate Solutions',
        benefits: JSON.stringify([
          'Comprehensive health insurance, dental and vision coverage',
          '401(k) with company matching',
          'Flexible work arrangements and remote work options',
          'Professional development budget',
          'Unlimited PTO policy',
          'Stock options and performance bonuses',
        ]),
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Data Science Manager',
        description:
          'Lead our data science team in developing innovative analytics solutions that drive business decisions. You will oversee data mining, statistical analysis, and machine learning projects while mentoring junior data scientists and collaborating with cross-functional teams.',
        requirements: JSON.stringify([
          "Master's degree in Data Science, Statistics, or related field",
          '7+ years of experience in data science with 3+ years in management',
          'Expertise in Python, R, SQL, and machine learning frameworks',
          'Experience with big data technologies and cloud platforms',
          'Strong leadership and project management skills',
        ]),
        salaryRange: '$120k - $160k',
        category: 'Engineering',
        location: 'New York, NY',
        recruiterId: recruiterId,
        company: 'DataDriven Analytics',
        benefits: JSON.stringify([
          'Premium health insurance coverage',
          'Flexible spending accounts',
          'Professional development opportunities',
          'Conference attendance budget',
          'Collaborative work environment',
          'Equity participation program',
        ]),
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Digital Marketing Specialist',
        description:
          'Drive our digital marketing initiatives across multiple channels including social media, email marketing, and content creation. You will develop and execute marketing campaigns, analyze performance metrics, and optimize our online presence to increase brand awareness and lead generation.',
        requirements: JSON.stringify([
          "Bachelor's degree in Marketing, Communications, or related field",
          '3+ years of digital marketing experience',
          'Proficiency in Google Analytics, social media platforms, and marketing automation tools',
          'Strong analytical skills and creative thinking',
          'Experience with SEO/SEM and content marketing strategies',
        ]),
        salaryRange: '$55k - $75k',
        category: 'Marketing',
        location: 'Remote',
        recruiterId: recruiterId,
        company: 'GrowthHub Marketing',
        benefits: JSON.stringify([
          'Health and wellness programs',
          'Remote work flexibility',
          'Professional development stipend',
          'Team building events',
          'Performance-based bonuses',
          'Comprehensive insurance coverage',
        ]),
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Financial Analyst',
        description:
          'Join our finance team as a Financial Analyst where you will analyze financial data, prepare reports, and assist in budgeting and forecasting. You will work closely with management to provide insights that support strategic decision-making.',
        requirements: JSON.stringify([
          "Bachelor's degree in Finance, Accounting, or related field",
          '3+ years of experience in financial analysis or related roles',
          'Strong proficiency in Excel and financial modeling',
          'Experience with financial software and ERP systems',
          'Excellent analytical and problem-solving skills',
        ]),
        salaryRange: '$70k - $90k',
        category: 'Finance',
        location: 'Chicago, IL',
        recruiterId: recruiterId,
        company: 'FinTech Solutions',
        benefits: JSON.stringify([
          'Competitive salary with performance bonuses',
          'Health insurance and retirement plans',
          'Professional development opportunities',
          'Work-life balance initiatives',
          'Collaborative team environment',
        ]),
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Sales Development Representative',
        description:
          'As a Sales Development Representative, you will be the first point of contact for potential customers. Your role will involve prospecting, qualifying leads, and setting appointments for the sales team. You should have excellent communication skills and a passion for sales.',
        requirements: JSON.stringify([
          "Bachelor's degree in Business, Marketing, or related field",
          '1+ years of experience in sales or customer service',
          'Strong interpersonal and communication skills',
          'Ability to work independently and as part of a team',
          'Familiarity with CRM software is a plus',
        ]),
        salaryRange: '$40k - $60k + commission',
        category: 'Sales',
        location: 'Los Angeles, CA',
        recruiterId: recruiterId,
        company: 'SalesForce Pros',
        benefits: JSON.stringify([
          'Base salary plus commission structure',
          'Health benefits and retirement plans',
          'Ongoing training and development programs',
          'Team outings and incentives for top performers',
          'Flexible working hours and remote options available',
        ]),
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'UX/UI Designer',
        description:
          'We are seeking a creative UX/UI Designer to enhance user experience across our digital products. You will collaborate with product managers and developers to create intuitive and visually appealing interfaces. A strong portfolio showcasing your design skills is required.',
        requirements: JSON.stringify([
          "Bachelor's degree in Design, Human-Computer Interaction, or related field",
          '3+ years of experience in UX/UI design',
          'Proficiency in design tools such as Sketch, Figma, or Adobe XD',
          'Strong understanding of user-centered design principles',
          'Excellent communication and collaboration skills',
        ]),
        salaryRange: '$65k - $85k',
        category: 'Design',
        location: 'Austin, TX',
        recruiterId: recruiterId,
        company: 'Creative Minds Agency',
        benefits: JSON.stringify([
          'Health and wellness benefits',
          'Flexible work hours and remote work options',
          'Professional development budget',
          'Collaborative and creative work environment',
          'Annual team retreats and workshops',
        ]),
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Jobs', jobs, {});
  },

  async down(queryInterface, Sequelize) {
    const jobs = await queryInterface.sequelize.query(
      `SELECT id FROM "Jobs"
       WHERE title IN (
         'Senior Full Stack Developer',
         'Data Science Manager',
         'Digital Marketing Specialist',
         'Financial Analyst',
         'Sales Development Representative',
         'UX/UI Designer'
       ) AND userId = (
         SELECT id FROM "Users" WHERE email = 'recruiter@optahire.com'
       )`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkDelete(
      'Jobs',
      {
        id: jobs.map((job) => job.id),
      },
      {}
    );
  },
};
