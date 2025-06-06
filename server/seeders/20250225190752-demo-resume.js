'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, email, phone FROM "Users"
       WHERE email IN (
         'interviewer@optahire.com',
         'interviewer2@optahire.com',
         'candidate@optahire.com',
         'candidate2@optahire.com'
       );`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    // Check if all required users exist
    const requiredEmails = [
      'interviewer@optahire.com',
      'interviewer2@optahire.com',
      'candidate@optahire.com',
      'candidate2@optahire.com',
    ];

    const missingUsers = requiredEmails.filter((email) => !userMap[email]);
    if (missingUsers.length > 0) {
      throw new Error(`Missing users for emails: ${missingUsers.join(', ')}`);
    }

    const resumes = [
      {
        title: 'Expert Technical Interviewer',
        summary:
          'Experienced interviewer specializing in technical assessments with over 5 years of conducting software engineering interviews.',
        headline: 'Senior Technical Interviewer & Assessment Specialist',
        skills: [
          'Technical Interviewing',
          'Candidate Assessment',
          'JavaScript',
          'System Design',
          'Algorithm Review',
        ],
        experience:
          'Led technical interviews for over 300 candidates across various tech roles including full-stack, backend, and frontend positions.',
        education: 'Master of Science in Computer Science',
        industry: 'Technology',
        availability: 'Full-Time',
        company: 'TechInterview Solutions',
        achievements:
          'Successfully assessed and recommended 95% accuracy rate in candidate selection.',
        rating: 4.8,
        portfolio: 'https://interviewer.optahire.com/portfolio',
        userId: userMap['interviewer@optahire.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Full-Stack Software Developer',
        summary:
          'Passionate software developer with 2+ years of experience in modern web technologies and a strong foundation in computer science.',
        headline: 'Full-Stack Developer | React & Node.js Specialist',
        skills: [
          'JavaScript',
          'React',
          'Node.js',
          'Express',
          'PostgreSQL',
          'MongoDB',
          'REST APIs',
        ],
        experience:
          'Developed and maintained multiple full-stack applications using React, Node.js, and various database technologies.',
        education: 'Bachelor of Science in Computer Science',
        industry: 'Technology',
        availability: 'Immediate',
        company: null,
        achievements:
          'Built 5+ production applications, contributed to open-source projects with 500+ GitHub stars.',
        rating: null,
        portfolio: 'https://candidate.optahire.com/portfolio',
        userId: userMap['candidate@optahire.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Senior System Design Interviewer',
        summary:
          'Veteran technical interviewer with deep expertise in system design, architecture, and senior-level technical assessments.',
        headline: 'Principal System Design Interviewer',
        skills: [
          'System Design',
          'Architecture Review',
          'Technical Leadership',
          'Scalability Assessment',
          'Cloud Technologies',
        ],
        experience:
          '8+ years conducting senior-level technical interviews focusing on system design and architecture.',
        education: 'Master of Engineering in Software Engineering',
        industry: 'Technology',
        availability: 'Part-Time',
        company: 'Elite Tech Interviews',
        achievements:
          'Conducted over 600 system design interviews, developed interview frameworks used by top tech companies.',
        rating: 4.9,
        portfolio: 'https://interviewer2.optahire.com/portfolio',
        userId: userMap['interviewer2@optahire.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'DevOps Engineer',
        summary:
          'Experienced DevOps engineer with strong background in cloud infrastructure, containerization, and CI/CD pipelines.',
        headline: 'DevOps Engineer | AWS & Docker Specialist',
        skills: [
          'Python',
          'AWS',
          'Docker',
          'Kubernetes',
          'Terraform',
          'CI/CD',
          'Linux',
          'Monitoring',
        ],
        experience:
          '4+ years in DevOps and cloud infrastructure, specializing in AWS services and containerized applications.',
        education: 'Bachelor of Science in Software Engineering',
        industry: 'Technology',
        availability: 'Two weeks',
        company: null,
        achievements:
          'Reduced deployment time by 70%, managed infrastructure for applications serving 1M+ users.',
        rating: null,
        portfolio: 'https://candidate2.optahire.com/portfolio',
        userId: userMap['candidate2@optahire.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Resumes', resumes, {});
  },

  async down(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users"
       WHERE email IN (
          'interviewer@optahire.com',
          'candidate@optahire.com',
          'interviewer2@optahire.com',
          'candidate2@optahire.com'
       );`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userIds = users.map((user) => user.id);

    await queryInterface.bulkDelete('Resumes', {
      userId: {
        [Sequelize.Op.in]: userIds,
      },
    });
  },
};
