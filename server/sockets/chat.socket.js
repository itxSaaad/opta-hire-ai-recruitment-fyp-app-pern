const colors = require('colors');
const { Op } = require('sequelize');

const { ChatRoom, Message, User, Contract } = require('../models');

const {
  protectSocket,
  authorizeSocketRoles,
} = require('../middlewares/auth.middleware');

const setupChatSocket = (io) => {
  console.log('\n' + '='.repeat(86).cyan);
  console.log(`💬 CHAT SOCKET INITIALIZATION`.bold.cyan);
  console.log('='.repeat(86).cyan);
  console.log(`🚀 Setting up chat socket...`.green);

  const chatNamespace = io.of('/chat');
  console.log(`🌐 Chat namespace created: ${chatNamespace.name}`.green);

  chatNamespace.use(protectSocket);
  chatNamespace.use(authorizeSocketRoles('isRecruiter', 'isInterviewer'));
  console.log(`🔒 Socket authentication middleware applied`.green);

  // Track active users by room
  const activeRooms = new Map();

  chatNamespace.on('connection', async (socket) => {
    console.log('-'.repeat(86).green);
    console.log(
      `👤 User connected: ${socket.user.id} (${socket.user.firstName} ${socket.user.lastName})`
        .green
    );
    console.log(`🔌 Socket ID: ${socket.id}`.gray);

    // Join chat room
    socket.on('join-room', async (roomId) => {
      console.log(`🚪 Join room request received for room: ${roomId}`.cyan);

      if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
        socket.emit('error', {
          success: false,
          message: 'Invalid room ID provided',
        });
        return;
      }

      try {
        const chatRoom = await ChatRoom.findByPk(roomId, {
          include: [
            {
              model: User,
              as: 'interviewer',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: User,
              as: 'recruiter',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        });

        if (!chatRoom) {
          socket.emit('error', {
            success: false,
            message: 'Chat room not found',
          });
          return;
        }

        // Ensure user is part of this chat room
        if (
          socket.user.id !== chatRoom.recruiterId &&
          socket.user.id !== chatRoom.interviewerId
        ) {
          socket.emit('error', {
            success: false,
            message: 'You are not authorized to join this chat room',
          });
          return;
        }

        // Join the room
        socket.join(roomId);
        console.log(`✅ Socket ${socket.id} joined room ${roomId}`.green);

        // Track user in room
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, new Set());
        }

        activeRooms.get(roomId).add({
          socketId: socket.id,
          userId: socket.user.id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          isRecruiter: socket.user.isRecruiter,
          isInterviewer: socket.user.isInterviewer,
        });

        // Get number of active participants in room
        const participants = Array.from(activeRooms.get(roomId));

        // Mark all unread messages as read for this user
        if (socket.user.isRecruiter || socket.user.isInterviewer) {
          try {
            await Message.update(
              { isRead: true },
              {
                where: {
                  chatRoomId: roomId,
                  senderId: {
                    [Op.ne]: socket.user.id,
                  },
                  isRead: false,
                },
              }
            );
            console.log(
              `✅ Marked messages as read for user ${socket.user.id} in room ${roomId}`
                .green
            );
          } catch (error) {
            console.error(
              `❌ Error marking messages as read: ${error.message}`.red
            );
          }
        }

        // Notify room of new participant
        socket.to(roomId).emit('user-joined', {
          success: true,
          message: `${socket.user.firstName} ${socket.user.lastName} joined the room`,
          data: {
            userId: socket.user.id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            socketId: socket.id,
            activeUsers: participants.length,
          },
        });

        // Confirm successful join to the user
        socket.emit('room-joined', {
          success: true,
          message: 'Successfully joined the chat room',
          data: {
            roomId,
            participants,
          },
        });
      } catch (error) {
        console.error('\n' + '='.repeat(86).red);
        console.error(`❌ ERROR JOINING ROOM ${roomId}`.red.bold);
        console.error('='.repeat(86).red);
        console.error(`📌 Error Type: ${error.name || 'Unknown Error'}`.red);
        console.error(`💬 Message: ${error.message}`.red);
        console.error(`⏰ Time: ${new Date().toLocaleString()}`.red);
        console.error('='.repeat(86).red);

        socket.emit('error', {
          success: false,
          message: 'Failed to join room',
          error: error.message,
        });
      }
    });

    // Leave chat room
    socket.on('leave-room', (roomId) => {
      leaveRoom(socket, roomId);
    });

    // Send a message
    socket.on('send-message', async ({ roomId, content }) => {
      console.log(`💬 New message in room ${roomId}`.cyan);

      if (
        !roomId ||
        !content ||
        typeof content !== 'string' ||
        content.trim() === ''
      ) {
        socket.emit('error', {
          success: false,
          message: 'Invalid message format',
        });
        return;
      }

      try {
        const chatRoom = await ChatRoom.findByPk(roomId);

        if (!chatRoom) {
          socket.emit('error', {
            success: false,
            message: 'Chat room not found',
          });
          return;
        }

        // Determine user roles based on chat room
        const isRecruiter = socket.user.id === chatRoom.recruiterId;
        const isInterviewer = socket.user.id === chatRoom.interviewerId;

        // Ensure user is part of this chat
        if (!isRecruiter && !isInterviewer) {
          socket.emit('error', {
            success: false,
            message:
              'You are not authorized to send messages in this chat room',
          });
          return;
        }

        // Create new message in database
        const message = await Message.create({
          chatRoomId: roomId,
          senderId: socket.user.id,
          content: content.trim(),
          recruiterId: chatRoom.recruiterId,
          interviewerId: chatRoom.interviewerId,
          isRead: false, // Initially unread for the recipient
        });

        // Get user info
        const user = await User.findByPk(socket.user.id, {
          attributes: ['id', 'firstName', 'lastName', 'email'],
        });

        // Broadcast to room
        chatNamespace.to(roomId).emit('new-message', {
          success: true,
          message: 'New message received',
          data: {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            sender: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              isRecruiter: isRecruiter,
              isInterviewer: isInterviewer,
            },
            chatRoomId: message.chatRoomId,
            createdAt: message.createdAt,
            isRead: message.isRead,
          },
        });

        console.log(`✅ Message sent successfully in room ${roomId}`.green);
      } catch (error) {
        console.error('\n' + '='.repeat(86).red);
        console.error(`❌ ERROR SENDING MESSAGE`.red.bold);
        console.error('='.repeat(86).red);
        console.error(`📌 Error Type: ${error.name || 'Unknown Error'}`.red);
        console.error(`💬 Message: ${error.message}`.red);
        console.error(`🔑 Room ID: ${roomId}`.red);
        console.error('='.repeat(86).red);

        socket.emit('error', {
          success: false,
          message: 'Failed to send message',
          error: error.message,
        });
      }
    });

    // Mark messages as read
    socket.on('mark-read', async ({ roomId }) => {
      try {
        await Message.update(
          { isRead: true },
          {
            where: {
              chatRoomId: roomId,
              senderId: {
                [Op.ne]: socket.user.id,
              },
              isRead: false,
            },
          }
        );

        console.log(
          `✅ Marked messages as read for user ${socket.user.id} in room ${roomId}`
            .green
        );

        // Notify room that messages were read
        socket.to(roomId).emit('messages-read', {
          success: true,
          message: 'Messages marked as read',
          data: {
            roomId,
            userId: socket.user.id,
          },
        });
      } catch (error) {
        console.error(
          `❌ Error marking messages as read: ${error.message}`.red
        );
        socket.emit('error', {
          success: false,
          message: 'Failed to mark messages as read',
          error: error.message,
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('user-typing', {
        success: true,
        data: {
          userId: socket.user.id,
          firstName: socket.user.firstName,
          isTyping: !!isTyping,
        },
      });
    });

    // Create contract
    socket.on('create-contract', async ({ roomId, agreedPrice }) => {
      console.log(`📝 Contract creation request for room ${roomId}`.cyan);

      if (
        !roomId ||
        !agreedPrice ||
        isNaN(parseFloat(agreedPrice)) ||
        parseFloat(agreedPrice) <= 0
      ) {
        socket.emit('error', {
          success: false,
          message: 'Invalid contract data',
        });
        return;
      }

      try {
        const chatRoom = await ChatRoom.findByPk(roomId, {
          include: [
            {
              model: User,
              as: 'interviewer',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: User,
              as: 'recruiter',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        });

        if (!chatRoom) {
          socket.emit('error', {
            success: false,
            message: 'Chat room not found',
          });
          return;
        }

        // Ensure the user is the recruiter
        if (socket.user.id !== chatRoom.recruiterId) {
          socket.emit('error', {
            success: false,
            message: 'Only recruiters can create contracts',
          });
          return;
        }

        // Create the contract
        const contract = await Contract.create({
          jobId: chatRoom.jobId,
          interviewerId: chatRoom.interviewerId,
          recruiterId: chatRoom.recruiterId,
          agreedPrice: parseFloat(agreedPrice),
          roomId: chatRoom.id,
          status: 'pending',
          paymentStatus: 'pending',
        });

        // Create a system message for the contract
        const message = await Message.create({
          chatRoomId: roomId,
          senderId: socket.user.id,
          content: `Contract created with agreed price: $${parseFloat(agreedPrice).toFixed(2)}`,
          recruiterId: chatRoom.recruiterId,
          interviewerId: chatRoom.interviewerId,
          isRead: false,
          messageType: 'contract',
        });

        // Broadcast the message
        chatNamespace.to(roomId).emit('new-message', {
          success: true,
          message: 'Contract created',
          data: {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            sender: {
              id: socket.user.id,
              firstName: socket.user.firstName,
              lastName: socket.user.lastName,
              email: socket.user.email,
              isRecruiter: true,
            },
            chatRoomId: message.chatRoomId,
            createdAt: message.createdAt,
            isRead: message.isRead,
            messageType: 'contract',
            contract: {
              id: contract.id,
              agreedPrice: contract.agreedPrice,
              status: contract.status,
              paymentStatus: contract.paymentStatus,
            },
          },
        });

        // Emit a separate event for contract creation
        chatNamespace.to(roomId).emit('contract-created', {
          success: true,
          message: 'Contract created successfully',
          data: {
            contract,
            roomId,
          },
        });

        console.log(
          `✅ Contract created successfully for room ${roomId}`.green
        );
      } catch (error) {
        console.error('\n' + '='.repeat(86).red);
        console.error(`❌ ERROR CREATING CONTRACT`.red.bold);
        console.error('='.repeat(86).red);
        console.error(`📌 Error Type: ${error.name || 'Unknown Error'}`.red);
        console.error(`💬 Message: ${error.message}`.red);
        console.error(`🔑 Room ID: ${roomId}`.red);
        console.error('='.repeat(86).red);

        socket.emit('error', {
          success: false,
          message: 'Failed to create contract',
          error: error.message,
        });
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('-'.repeat(86).red);
      console.log(
        `👋 User disconnected: ${socket.user.id} (Socket ID: ${socket.id})`.red
      );

      // Clean up all rooms this user was in
      for (const [roomId, participants] of activeRooms.entries()) {
        const participantArray = Array.from(participants);
        const userParticipant = participantArray.find(
          (p) => p.socketId === socket.id
        );

        if (userParticipant) {
          leaveRoom(socket, roomId);
        }
      }
    });

    // Helper function to handle leaving a room
    function leaveRoom(socket, roomId) {
      console.log(`🚪 User ${socket.user.id} leaving room ${roomId}`.yellow);

      if (!activeRooms.has(roomId)) {
        console.log(`❌ Room ${roomId} not found, nothing to leave`.red);
        return;
      }

      const participants = activeRooms.get(roomId);
      const participantArray = Array.from(participants);
      const participant = participantArray.find(
        (p) => p.socketId === socket.id
      );

      if (participant) {
        // Remove from tracking
        participants.delete(participant);
        socket.leave(roomId);
        console.log(`✅ Socket ${socket.id} left room ${roomId}`.green);

        // Notify others in room
        socket.to(roomId).emit('user-left', {
          success: true,
          message: `${participant.firstName} ${participant.lastName} left the room`,
          data: {
            userId: participant.userId,
            activeUsers: participants.size,
          },
        });

        // Clean up empty rooms
        if (participants.size === 0) {
          activeRooms.delete(roomId);
          console.log(`🗑️ Room ${roomId} deleted (empty)`.red);
        }
      }
    }
  });

  console.log('-'.repeat(86).cyan);
  console.log(`✅ Chat socket setup complete`.green.bold);
  console.log('='.repeat(86).cyan);

  return chatNamespace;
};

module.exports = setupChatSocket;
