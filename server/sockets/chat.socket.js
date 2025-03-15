const { Op } = require('sequelize');

const { ChatRoom, Message, User, Job } = require('../models');

const {
  protectSocket,
  authorizeSocketRoles,
} = require('../middlewares/auth.middleware');

const setupChatSocket = (io) => {
  io.use(protectSocket);
  io.use(authorizeSocketRoles('isRecruiter', 'isInterviewer'));

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}: ${socket.user.firstName}`);

    socket.on('joinRoom', async ({ roomId }) => {
      const chatroom = await ChatRoom.findByPk(roomId, {
        include: [
          { model: User, as: 'recruiter' },
          { model: User, as: 'interviewer' },
          { model: Job, as: 'job' },
          {
            model: Message,
            as: 'messages',
            include: [
              { model: User, as: 'recruiter' },
              { model: User, as: 'interviewer' },
              { model: User, as: 'sender' },
            ],
          },
        ],
      });

      if (!chatroom) {
        socket.emit(
          'error',
          'Chat room not found. Please check the room ID and try again.'
        );
        return;
      }

      socket.join(roomId);
      socket.emit(
        'message',
        "You've successfully joined the chat room. Messages will appear below."
      );
      socket.emit('chatRoomData', chatroom);

      console.log(`User joined room: ${roomId}`);
    });

    socket.on(
      'sendMessage',
      async ({ roomId, content, recruiterId, interviewerId }) => {
        try {
          const chatroom = await ChatRoom.findByPk(roomId);

          if (!chatroom) {
            socket.emit(
              'error',
              'Chat room not found. Please check the room ID and try again.'
            );
            return;
          }

          if (!content || content.trim() === '') {
            socket.emit(
              'error',
              'Cannot send an empty message. Please type something.'
            );
            return;
          }

          const newMessage = await Message.create({
            chatRoomId: roomId,
            recruiterId,
            interviewerId,
            senderId: socket.user.id,
            content,
            isRead: false,
          });

          const messageWithDetails = await Message.findByPk(newMessage.id, {
            include: [
              { model: User, as: 'recruiter' },
              { model: User, as: 'interviewer' },
              { model: User, as: 'sender' },
            ],
          });

          io.to(roomId).emit('message', messageWithDetails);
        } catch (error) {
          socket.emit(
            'error',
            'Unable to send your message. Please try again.'
          );
        }
      }
    );

    socket.on('disconnect', () => {
      console.log(
        `User disconnected: ${socket.user.id}: ${socket.user.firstName}`
      );
    });
  });
};

module.exports = setupChatSocket;
