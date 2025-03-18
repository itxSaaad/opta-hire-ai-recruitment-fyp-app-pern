'use strict';

const generateRoomId = (length = 12) => {
  const timestamp = Date.now().toString(36);
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from({ length: 6 }, () =>
    randomChars.charAt(Math.floor(Math.random() * randomChars.length))
  ).join('');
  return `${timestamp.slice(-4)}-${randomPart.slice(0, 4)}-${randomPart.slice(
    4
  )}`;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const candidates = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE email IN ('candidate@optahire.com', 'candidate2@optahire.com');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!candidates || candidates.length < 2) {
      throw new Error(
        'Candidate records not found. Ensure Users seeder has been run.'
      );
    }

    const candidateMap = candidates.reduce((acc, candidate) => {
      acc[candidate.email] = candidate.id;
      return acc;
    }, {});

    const interviewers = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE email IN ('interviewer@optahire.com', 'interviewer2@optahire.com');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!interviewers || interviewers.length < 2) {
      throw new Error(
        'Interviewer records not found. Ensure Users seeder has been run.'
      );
    }

    const interviewerMap = interviewers.reduce((acc, interviewer) => {
      acc[interviewer.email] = interviewer.id;
      return acc;
    }, {});

    const application1 = await queryInterface.sequelize.query(
      `SELECT id, "jobId" FROM "Applications" WHERE "candidateId" = '${candidateMap['candidate@optahire.com']}' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!application1 || application1.length === 0) {
      throw new Error('Application for candidate@optahire.com not found.');
    }

    const application2 = await queryInterface.sequelize.query(
      `SELECT id, "jobId" FROM "Applications" WHERE "candidateId" = '${candidateMap['candidate2@optahire.com']}' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!application2 || application2.length === 0) {
      throw new Error('Application for candidate2@optahire.com not found.');
    }

    const scheduledTime1 = new Date(Date.now() + 3600 * 1000);

    const interview1 = {
      roomId: generateRoomId(),
      scheduledTime: scheduledTime1,
      callStartedAt: null,
      callEndedAt: null,
      interviewerId: interviewerMap['interviewer@optahire.com'],
      candidateId: candidateMap['candidate@optahire.com'],
      jobId: application1[0].jobId,
      applicationId: application1[0].id,
      status: 'scheduled',
      remarks: 'Interview scheduled and pending.',
      summary: null,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const scheduledTime2 = new Date(Date.now() - 2 * 3600 * 1000);
    const callStartedAt2 = new Date(scheduledTime2.getTime() + 5 * 60 * 1000);
    const callEndedAt2 = new Date(callStartedAt2.getTime() + 30 * 60 * 1000);

    const interview2 = {
      roomId: generateRoomId(),
      scheduledTime: scheduledTime2,
      callStartedAt: callStartedAt2,
      callEndedAt: callEndedAt2,
      interviewerId: interviewerMap['interviewer2@optahire.com'],
      candidateId: candidateMap['candidate2@optahire.com'],
      jobId: application2[0].jobId,
      applicationId: application2[0].id,
      status: 'completed',
      remarks:
        'Interview completed successfully. Candidate showed strong skills.',
      summary:
        'Detailed feedback: candidate demonstrated excellent technical ability.',
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const interviews = [interview1, interview2];

    await queryInterface.bulkInsert('Interviews', interviews, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Interviews', null, {});
  },
};
