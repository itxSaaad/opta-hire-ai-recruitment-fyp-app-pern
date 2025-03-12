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
        socket.emit('error', 'Chat Room not found');
        return;
      }

      socket.join(roomId);
      socket.emit('message', 'Welcome to the chat room!');
      socket.emit('chatRoomData', chatroom);

      console.log(`User joined room: ${roomId}`);
    });

    socket.on(
      'sendMessage',
      async ({ roomId, content, recruiterId, interviewerId }) => {
        try {
          const chatroom = await ChatRoom.findByPk(roomId);

          if (!chatroom) {
            socket.emit('error', 'Chat Room not found');
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
          socket.emit('error', error.message);
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
