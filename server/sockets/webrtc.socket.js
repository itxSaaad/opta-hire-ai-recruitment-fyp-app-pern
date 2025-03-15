const { Op } = require('sequelize');

const { User, Job, Application, Interview } = require('../models');

const {
  protectSocket,
  authorizeSocketRoles,
} = require('../middlewares/auth.middleware');
const { validateString } = require('../utils/validation.utils');

const setupVideoCallSocket = (io) => {
  io.use(protectSocket);
  io.use(authorizeSocketRoles('isInterviewer', 'isCandidate'));

  io.on('connection', (socket) => {
    console.log(
      `User connected for video call: ${socket.user.id}: ${socket.user.firstName}`
    );

    socket.on('joinCallRoom', async ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit(
            'error',
            'Please provide a valid interview room ID to join the call.'
          );
          return;
        }

        validateString(roomId, 'Room ID', 6, 50);

        const interview = await Interview.findOne({
          where: {
            roomId,
            [Op.or]: [
              { interviewerId: socket.user.id },
              { candidateId: socket.user.id },
            ],
            status: {
              [Op.in]: ['scheduled', 'ongoing'],
            },
            scheduledTime: {
              [Op.between]: [
                new Date(Date.now() - 5 * 60 * 1000), // 5 minutes before
                new Date(Date.now() + 30 * 60 * 1000), // 30 minutes after
              ],
            },
          },
          include: [
            {
              model: User,
              as: 'interviewer',
              attributes: ['firstName', 'lastName'],
            },
            {
              model: User,
              as: 'candidate',
              attributes: ['firstName', 'lastName'],
            },
          ],
        });

        if (!interview) {
          socket.emit(
            'error',
            "Interview session not found or you don't have permission to join this call."
          );
          return;
        }

        const existingParticipants = io.sockets.adapter.rooms.get(roomId);
        if (existingParticipants && existingParticipants.size >= 2) {
          socket.emit(
            'error',
            'This interview room already has two participants. Additional users cannot join.'
          );
          return;
        }

        if (interview.status === 'scheduled') {
          await interview.update({
            status: 'ongoing',
            callStartedAt: new Date(),
          });
        }

        socket.join(roomId);
        socket.interview = interview;

        socket.emit('videoCallMessage', {
          type: 'success',
          message: 'You have successfully joined the interview call.',
          interview: {
            id: interview.id,
            status: interview.status,
            scheduledTime: interview.scheduledTime,
          },
        });

        socket.to(roomId).emit('videoCallMessage', {
          type: 'info',
          message: `${socket.user.firstName} has joined the interview call.`,
          participant: {
            id: socket.user.id,
            name: socket.user.firstName,
          },
        });

        console.log(`User joined video call room: ${roomId}`);
      } catch (error) {
        console.error('Join call room error:', error);
        socket.emit(
          'error',
          error.message || 'Unable to join interview call. Please try again.'
        );
      }
    });

    socket.on('endCall', async ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit(
            'error',
            'Please provide the interview room ID to end the call.'
          );
          return;
        }

        const interview = await Interview.findOne({
          where: {
            roomId,
            [Op.or]: [
              { interviewerId: socket.user.id },
              { candidateId: socket.user.id },
            ],
          },
        });

        if (!interview) {
          socket.emit(
            'error',
            "Interview session not found or you don't have permission to end this call."
          );
          return;
        }

        await interview.update({
          status: 'completed',
          callEndedAt: new Date(),
        });

        io.to(roomId).emit('callEnded', {
          message: `Interview call ended by ${socket.user.firstName}.`,
          timestamp: new Date(),
        });

        // Disconnect all users from the room
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room) {
          for (const clientId of room) {
            io.sockets.sockets.get(clientId).leave(roomId);
          }
        }
      } catch (error) {
        console.error('End call error:', error);
        socket.emit(
          'error',
          error.message || 'Unable to end interview call. Please try again.'
        );
      }
    });

    // WebRTC signaling events
    socket.on('offer', (data) => {
      if (!data.roomId || !data.offer) {
        socket.emit(
          'error',
          'Unable to establish connection: incomplete offer data.'
        );
        return;
      }
      socket.to(data.roomId).emit('offer', data.offer);
    });

    socket.on('answer', (data) => {
      if (!data.roomId || !data.answer) {
        socket.emit(
          'error',
          'Unable to establish connection: incomplete answer data.'
        );
        return;
      }
      socket.to(data.roomId).emit('answer', data.answer);
    });

    socket.on('iceCandidate', (data) => {
      if (!data.roomId || !data.candidate) {
        socket.emit(
          'error',
          'Connection setup failed: invalid connection data received.'
        );
        return;
      }
      socket.to(data.roomId).emit('iceCandidate', data.candidate);
    });

    socket.on('disconnect', async () => {
      try {
        if (socket.interview) {
          const roomParticipants = io.sockets.adapter.rooms.get(
            socket.interview.roomId
          );
          if (!roomParticipants || roomParticipants.size === 0) {
            await socket.interview.update({
              status: 'completed',
              callEndedAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      console.log(`User disconnected: ${socket.user.firstName}`);
    });
  });
};

module.exports = setupVideoCallSocket;
