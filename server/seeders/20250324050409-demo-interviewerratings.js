'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Get completed interviews to create ratings for
    const interviews = await queryInterface.sequelize.query(
      `SELECT id, "interviewerId", "candidateId", "jobId", status, "createdAt"
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
      `SELECT id, "recruiterId", "interviewerId", "jobId", status, "createdAt"
       FROM "Contracts" 
       WHERE status = 'completed'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!contracts || contracts.length === 0) {
      console.log('No completed contracts found. Skipping rating seeding.');
      return;
    }

    const ratings = [];
    const positiveRatingFeedback = [
      'Excellent interviewer with strong technical knowledge. Asked relevant questions and provided comprehensive feedback.',
      'Very professional approach. The interviewer created a comfortable environment while thoroughly assessing candidate skills.',
      'Outstanding technical assessment skills. Provided detailed feedback that helped us make the right hiring decision.',
      'Highly skilled interviewer who effectively evaluated both technical abilities and cultural fit.',
      'Balanced technical and behavioral questions. Provided clear insights about candidate performance.',
      'Exceptional interviewer who identified strengths and weaknesses that other interviewers missed. Highly recommended.',
      'Professional and thorough in assessment approach. Candidates reported positive interview experience.',
      'Asked challenging but relevant questions that revealed candidate capabilities. Great technical depth.',
      'Strong understanding of the role requirements. Assessment was perfectly aligned with our needs.',
      'Clear communication throughout the process. Reports were detailed and delivered promptly.',
    ];

    const neutralRatingFeedback = [
      'Good technical assessment but could improve on providing more detailed explanations to candidates.',
      'Solid interviewer with adequate skills. Assessment was satisfactory but lacked some depth.',
      'Assessment covered the basics well, but could benefit from more role-specific questions.',
      'Competent interviewer who met expectations. Reports were timely but could be more detailed.',
      'Interview process was efficient, though feedback could be more actionable.',
    ];

    const constructiveRatingFeedback = [
      'Interviewer was knowledgeable but communication could be improved. Some candidates found questions unclear.',
      'Technical assessment was good but reports lacked detail needed for decision making.',
      'Adequate interviewing skills but needs to better align questions with our specific job requirements.',
      'Interview coverage was somewhat narrow. Would prefer broader skill assessment in future sessions.',
    ];

    // Match interviews with corresponding contracts
    interviews.forEach((interview) => {
      const matchingContract = contracts.find(
        (contract) =>
          contract.interviewerId === interview.interviewerId &&
          contract.jobId === interview.jobId
      );

      if (matchingContract) {
        // Create date 1-3 days after interview completion
        const interviewDate = new Date(interview.createdAt);
        const ratingDate = new Date(interviewDate);
        ratingDate.setDate(
          interviewDate.getDate() + Math.floor(Math.random() * 3) + 1
        );

        // Generate rating with a distribution favoring higher scores (realistic for review systems)
        let ratingValue;
        const ratingDistribution = Math.random() * 100;

        if (ratingDistribution < 65) {
          // 65% of ratings are excellent (4.5-5.0)
          ratingValue = (4.5 + Math.random() * 0.5).toFixed(1);
          const feedback =
            positiveRatingFeedback[
              Math.floor(Math.random() * positiveRatingFeedback.length)
            ];

          ratings.push({
            rating: parseFloat(ratingValue),
            feedback,
            interviewerId: interview.interviewerId,
            recruiterId: matchingContract.recruiterId,
            jobId: interview.jobId,
            contractId: matchingContract.id,
            createdAt: ratingDate,
            updatedAt: ratingDate,
          });
        } else if (ratingDistribution < 90) {
          // 25% of ratings are good (3.8-4.4)
          ratingValue = (3.8 + Math.random() * 0.6).toFixed(1);
          const feedback =
            neutralRatingFeedback[
              Math.floor(Math.random() * neutralRatingFeedback.length)
            ];

          ratings.push({
            rating: parseFloat(ratingValue),
            feedback,
            interviewerId: interview.interviewerId,
            recruiterId: matchingContract.recruiterId,
            jobId: interview.jobId,
            contractId: matchingContract.id,
            createdAt: ratingDate,
            updatedAt: ratingDate,
          });
        } else {
          // 10% of ratings are average/below (3.0-3.7)
          ratingValue = (3.0 + Math.random() * 0.7).toFixed(1);
          const feedback =
            constructiveRatingFeedback[
              Math.floor(Math.random() * constructiveRatingFeedback.length)
            ];

          ratings.push({
            rating: parseFloat(ratingValue),
            feedback,
            interviewerId: interview.interviewerId,
            recruiterId: matchingContract.recruiterId,
            jobId: interview.jobId,
            contractId: matchingContract.id,
            createdAt: ratingDate,
            updatedAt: ratingDate,
          });
        }
      }
    });

    // Add follow-up ratings for top interviewers (showing recurring relationship)
    const activeContracts = contracts.filter(
      (contract) =>
        contract.status === 'active' || contract.status === 'completed'
    );

    if (activeContracts.length > 0) {
      const followUpFeedback = [
        'Follow-up rating: This interviewer continues to impress with consistent quality and professionalism. Their detailed assessments have helped us make several successful hires.',
        'Ongoing collaboration has been excellent. The interviewer has maintained high standards across multiple sessions.',
        "Second engagement with this interviewer was even better than the first. They've clearly incorporated our feedback and customized the process.",
        'Consistently delivers high-quality technical assessments. A valuable partner in our hiring process.',
        'After multiple interviews, I can confidently say this is one of the best technical interviewers on the platform.',
      ];

      activeContracts
        .slice(0, Math.min(5, activeContracts.length))
        .forEach((contract, index) => {
          // Create date more recently than the contract creation
          const contractDate = new Date(contract.createdAt);
          const followUpDate = new Date(contractDate);
          followUpDate.setDate(
            contractDate.getDate() + Math.floor(Math.random() * 14) + 7
          ); // 7-21 days after contract

          // Follow-up ratings are generally higher
          const ratingValue = (4.7 + Math.random() * 0.3).toFixed(1);

          ratings.push({
            rating: parseFloat(ratingValue),
            feedback: followUpFeedback[index % followUpFeedback.length],
            interviewerId: contract.interviewerId,
            recruiterId: contract.recruiterId,
            jobId: contract.jobId,
            contractId: contract.id,
            createdAt: followUpDate,
            updatedAt: followUpDate,
          });
        });
    }

    // Add a few lower ratings to show diversity in feedback (important for realism)
    if (contracts.length >= 3) {
      const lowerRatingContracts = contracts.slice(0, 3);

      lowerRatingContracts.forEach((contract, index) => {
        // Create older ratings (showing improvement over time)
        const contractDate = new Date(contract.createdAt);
        const olderRatingDate = new Date(contractDate);
        olderRatingDate.setDate(
          contractDate.getDate() + Math.floor(Math.random() * 5) + 1
        );

        // Lower initial ratings
        const ratingValue = (2.5 + Math.random() * 1.0).toFixed(1);

        const earlyFeedback = [
          "Initial interview sessions had some room for improvement. Questions were sometimes too generic and didn't probe deeply enough into technical skills.",
          'Our first experience with this interviewer was mixed. While technically knowledgeable, the interview structure could be more organized.',
          'Early interviews showed potential but lacked the depth we needed. The interviewer has since improved significantly.',
        ];

        ratings.push({
          rating: parseFloat(ratingValue),
          feedback: earlyFeedback[index % earlyFeedback.length],
          interviewerId: contract.interviewerId,
          recruiterId: contract.recruiterId,
          jobId: contract.jobId,
          contractId: contract.id,
          createdAt: olderRatingDate,
          updatedAt: olderRatingDate,
        });
      });
    }

    await queryInterface.bulkInsert('InterviewerRatings', ratings, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('InterviewerRatings', null, {});
  },
};
