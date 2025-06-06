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
    // Get candidates
    const candidates = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE "isCandidate" = true AND email IN ('candidate@optahire.com', 'candidate2@optahire.com');`,
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

    // Get interviewers
    const interviewers = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE "isInterviewer" = true AND email IN ('interviewer@optahire.com', 'interviewer2@optahire.com');`,
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

    // Get applications for the candidates
    const applications = await queryInterface.sequelize.query(
      `SELECT id, "jobId", "candidateId" FROM "Applications" 
       WHERE "candidateId" IN ('${candidateMap['candidate@optahire.com']}', '${candidateMap['candidate2@optahire.com']}')
       ORDER BY "applicationDate" DESC;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!applications || applications.length === 0) {
      throw new Error(
        'No applications found. Ensure Applications seeder has been run.'
      );
    }

    // Create interviews
    const interviews = [];

    // Scheduled interview for first candidate
    const scheduledTime1 = new Date(Date.now() + 3600 * 1000); // 1 hour in future
    interviews.push({
      roomId: generateRoomId(),
      scheduledTime: scheduledTime1,
      callStartedAt: null,
      callEndedAt: null,
      interviewerId: interviewerMap['interviewer@optahire.com'],
      candidateId: candidateMap['candidate@optahire.com'],
      jobId: applications[0].jobId,
      applicationId: applications[0].id,
      status: 'scheduled',
      remarks: 'Interview scheduled and pending.',
      summary: null,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Completed interview for second candidate
    const scheduledTime2 = new Date(Date.now() - 2 * 3600 * 1000); // 2 hours in past
    const callStartedAt2 = new Date(scheduledTime2.getTime() + 5 * 60 * 1000);
    const callEndedAt2 = new Date(callStartedAt2.getTime() + 30 * 60 * 1000);
    interviews.push({
      roomId: generateRoomId(),
      scheduledTime: scheduledTime2,
      callStartedAt: callStartedAt2,
      callEndedAt: callEndedAt2,
      interviewerId: interviewerMap['interviewer2@optahire.com'],
      candidateId: candidateMap['candidate2@optahire.com'],
      jobId: applications[1].jobId,
      applicationId: applications[1].id,
      status: 'completed',
      remarks:
        'Interview completed successfully. Candidate showed strong skills.',
      summary:
        'Detailed feedback: candidate demonstrated excellent technical ability.',
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Canceled interview
    const scheduledTime3 = new Date(Date.now() - 48 * 3600 * 1000); // 2 days ago
    interviews.push({
      roomId: generateRoomId(),
      scheduledTime: scheduledTime3,
      callStartedAt: null,
      callEndedAt: null,
      interviewerId: interviewerMap['interviewer@optahire.com'],
      candidateId: candidateMap['candidate2@optahire.com'],
      jobId: applications[1].jobId,
      applicationId: applications[1].id,
      status: 'canceled',
      remarks: 'Interview canceled due to scheduling conflict.',
      summary: null,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await queryInterface.bulkInsert('Interviews', interviews, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Interviews', null, {});
  },
};
