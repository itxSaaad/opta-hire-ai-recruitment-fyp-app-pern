'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get completed interviews to create ratings for
    const interviews = await queryInterface.sequelize.query(
      `SELECT id, "interviewerId", "candidateId", "jobId", status 
       FROM "Interviews" 
       WHERE status = 'completed'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!interviews || interviews.length === 0) {
      console.log('No completed interviews found. Skipping rating seeding.');
      return;
    }

    // Get contracts to link ratings
    const contracts = await queryInterface.sequelize.query(
      `SELECT id, "recruiterId", "interviewerId", "jobId"
       FROM "Contracts" 
       WHERE status IN ('active', 'completed')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!contracts || contracts.length === 0) {
      console.log(
        'No active/completed contracts found. Skipping rating seeding.'
      );
      return;
    }

    const ratings = [];
    const feedbackOptions = [
      'Excellent interviewer with strong technical knowledge. Asked relevant questions and provided comprehensive feedback.',
      'Very professional approach. The interviewer created a comfortable environment while thoroughly assessing candidate skills.',
      'Good technical assessment but could improve on providing more detailed explanations to candidates.',
      'Highly skilled interviewer who effectively evaluated both technical abilities and cultural fit.',
      'Balanced technical and behavioral questions. Provided clear insights about candidate performance.',
    ];

    // Match interviews with corresponding contracts
    interviews.forEach((interview) => {
      const matchingContract = contracts.find(
        (contract) =>
          contract.interviewerId === interview.interviewerId &&
          contract.jobId === interview.jobId
      );

      if (matchingContract) {
        const ratingValue = (3.5 + Math.random() * 1.5).toFixed(1);

        ratings.push({
          rating: parseFloat(ratingValue),
          feedback:
            feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)],
          interviewerId: interview.interviewerId,
          recruiterId: matchingContract.recruiterId,
          jobId: interview.jobId,
          contractId: matchingContract.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    // Add a few more ratings to ensure diversity
    contracts.slice(0, Math.min(3, contracts.length)).forEach((contract) => {
      const ratingValue = (3.0 + Math.random() * 2.0).toFixed(1);

      ratings.push({
        rating: parseFloat(ratingValue),
        feedback:
          'Follow-up rating: Good collaboration throughout the interviewing process. Provided timely updates and helpful insights.',
        interviewerId: contract.interviewerId,
        recruiterId: contract.recruiterId,
        jobId: contract.jobId,
        contractId: contract.id,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      });
    });

    if (ratings.length > 0) {
      await queryInterface.bulkInsert('InterviewerRatings', ratings, {});
      console.log(`Created ${ratings.length} interviewer ratings`);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('InterviewerRatings', null, {});
  },
};
