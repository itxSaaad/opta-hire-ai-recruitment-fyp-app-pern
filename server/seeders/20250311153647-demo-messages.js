'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const chatrooms = await queryInterface.sequelize.query(
      `SELECT id, "recruiterId", "interviewerId", "jobId" FROM "ChatRooms";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!chatrooms || chatrooms.length === 0) {
      throw new Error(
        'No Chat Rooms found. Ensure you have seeded ChatRooms first.'
      );
    }

    // Get job titles for more realistic messages
    const jobs = await queryInterface.sequelize.query(
      `SELECT id, title FROM "Jobs";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const jobTitleMap = jobs.reduce((acc, job) => {
      acc[job.id] = job.title;
      return acc;
    }, {});

    const messages = [];

    // Create messages for each chat room
    chatrooms.forEach((chatroom, index) => {
      const jobTitle = jobTitleMap[chatroom.jobId] || 'the position';
      const now = new Date();

      // Message 1: Recruiter initiates contact
      messages.push({
        chatRoomId: chatroom.id,
        recruiterId: chatroom.recruiterId,
        interviewerId: chatroom.interviewerId,
        senderId: chatroom.recruiterId,
        content: `Hi! I came across your profile and I'm impressed with your experience. I'd like to discuss a potential opportunity for ${jobTitle}. Are you interested in conducting interviews for this position?`,
        isRead: true,
        createdAt: new Date(now.getTime() - 60000 * 120), // 2 hours ago
        updatedAt: new Date(now.getTime() - 60000 * 120),
      });

      // Message 2: Interviewer responds positively
      messages.push({
        chatRoomId: chatroom.id,
        recruiterId: chatroom.recruiterId,
        interviewerId: chatroom.interviewerId,
        senderId: chatroom.interviewerId,
        content: `Hello! Thank you for reaching out. Yes, I'm definitely interested in learning more about this opportunity. Could you share more details about the role and what you're looking for in candidates?`,
        isRead: true,
        createdAt: new Date(now.getTime() - 60000 * 90), // 1.5 hours ago
        updatedAt: new Date(now.getTime() - 60000 * 90),
      });

      // Message 3: Recruiter provides details
      messages.push({
        chatRoomId: chatroom.id,
        recruiterId: chatroom.recruiterId,
        interviewerId: chatroom.interviewerId,
        senderId: chatroom.recruiterId,
        content: `Great! For the ${jobTitle} role, we're looking for someone with strong technical skills and communication abilities. The interviews would be conducted remotely, and we typically need 45-60 minute sessions. What's your availability like this week?`,
        isRead: true,
        createdAt: new Date(now.getTime() - 60000 * 60), // 1 hour ago
        updatedAt: new Date(now.getTime() - 60000 * 60),
      });

      // Message 4: Interviewer discusses availability
      messages.push({
        chatRoomId: chatroom.id,
        recruiterId: chatroom.recruiterId,
        interviewerId: chatroom.interviewerId,
        senderId: chatroom.interviewerId,
        content: `Perfect! I have experience with similar roles and I'm comfortable with remote interviews. I'm available Tuesday through Thursday this week, preferably in the afternoon. Should we discuss the compensation structure and next steps?`,
        isRead: false,
        createdAt: new Date(now.getTime() - 60000 * 30), // 30 minutes ago
        updatedAt: new Date(now.getTime() - 60000 * 30),
      });

      // Message 5: Recruiter ready to formalize
      messages.push({
        chatRoomId: chatroom.id,
        recruiterId: chatroom.recruiterId,
        interviewerId: chatroom.interviewerId,
        senderId: chatroom.recruiterId,
        content: `Excellent! Your background looks perfect for this. I'll send over a contract with the details including compensation. Once that's signed, we can schedule the first interview session. Looking forward to working with you!`,
        isRead: false,
        createdAt: new Date(now.getTime() - 60000 * 10), // 10 minutes ago
        updatedAt: new Date(now.getTime() - 60000 * 10),
      });
    });

    await queryInterface.bulkInsert('Messages', messages, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Messages', null, {});
  },
};
