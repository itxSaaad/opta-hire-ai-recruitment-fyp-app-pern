'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE email IN (
        'interviewer@optahire.com', 
        'candidate@optahire.com',
        'interviewer2@optahire.com', 
        'candidate2@optahire.com'
      );`
    );

    const userMap = users[0].reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    const resumes = [
      {
        title: 'Interviewer Title',
        summary: 'Profile summary for the interviewer.',
        headline: 'Expert Interviewer',
        skills: ['Interviewing', 'Candidate Assessment'],
        experience: '5+ years conducting interviews and assessments.',
        education: 'Bachelor in Psychology',
        industry: 'Human Resources',
        availability: 'Part-Time',
        company: 'Interview Solutions',
        achievements: 'Conducted over 300 interviews successfully.',
        rating: 4.0,
        portfolio: 'https://interviewer.optahire.com/portfolio',
        userId: userMap['interviewer@optahire.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Candidate Title',
        summary: 'Profile summary for the candidate.',
        headline: 'Aspiring Professional',
        skills: ['JavaScript', 'Node.js', 'React'],
        experience: '2+ years in software development.',
        education: 'Bachelor in Computer Science',
        industry: 'Technology',
        availability: 'Full-Time',
        company: null,
        achievements: 'Completed multiple innovative projects.',
        rating: null,
        portfolio: 'https://candidate.optahire.com/portfolio',
        userId: userMap['candidate@optahire.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Interviewer 2 Title',
        summary: 'Profile summary for the second interviewer.',
        headline: 'Senior Interviewer',
        skills: ['Technical Interviews', 'Team Leadership'],
        experience: '7+ years in technical interviewing.',
        education: 'Master in Computer Science',
        industry: 'Technology',
        availability: 'Full-Time',
        company: 'Tech Interviews Ltd',
        achievements: 'Led over 500 technical interviews.',
        rating: 4.5,
        portfolio: 'https://interviewer2.optahire.com/portfolio',
        userId: userMap['interviewer2@optahire.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Candidate 2 Title',
        summary: 'Profile summary for the second candidate.',
        headline: 'Software Developer',
        skills: ['Python', 'AWS', 'Docker'],
        experience: '3+ years in cloud development.',
        education: 'Bachelor in Software Engineering',
        industry: 'Technology',
        availability: 'Full-Time',
        company: null,
        achievements: 'Developed several cloud-based applications.',
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
      `SELECT id, email FROM "Users" WHERE email IN (
        'interviewer@optahire.com', 
        'candidate@optahire.com',
        'interviewer2@optahire.com', 
        'candidate2@optahire.com'
      );`
    );

    const userMap = users[0].reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    await queryInterface.bulkDelete('Resumes', {
      userId: {
        [Sequelize.Op.in]: Object.values(userMap),
      },
    });
  },
};
