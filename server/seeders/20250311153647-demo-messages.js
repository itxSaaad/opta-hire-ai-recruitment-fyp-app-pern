'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const chatrooms = await queryInterface.sequelize.query(
      `SELECT id, "recruiterId", "interviewerId", "jobId" FROM "ChatRooms" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!chatrooms || chatrooms.length === 0) {
      throw new Error(
        'No Chat Rooms found. Ensure you have seeded ChatRooms first.'
      );
    }

    const chatroom = chatrooms[0];

    const messages = [
      {
        chatRoomId: chatroom.id,
        recruiterId: chatroom.recruiterId,
        interviewerId: chatroom.interviewerId,
        senderId: chatroom.interviewerId,
        content: 'Hello, this is the first message in the chat room.',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chatRoomId: chatroom.id,
        recruiterId: chatroom.recruiterId,
        interviewerId: chatroom.interviewerId,
        senderId: chatroom.recruiterId,
        content: 'This is the second message in the chat room.',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chatRoomId: chatroom.id,
        recruiterId: chatroom.recruiterId,
        interviewerId: chatroom.interviewerId,
        senderId: chatroom.interviewerId,
        content: 'This is the third message in the chat room.',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Messages', messages, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Messages', null, {});
  },
};
