const { Op } = require('sequelize');

const { Interview } = require('../models');

const {
  protectSocket,
  authorizeSocketRoles,
} = require('../middlewares/auth.middleware');

const setupVideoCallSocket = (io) => {
  io.use(protectSocket);
  io.use(authorizeSocketRoles('isInterviewer', 'isCandidate'));

  io.on('connection', (socket) => {
    console.log(
      `User connected for video call: ${socket.user.id}: ${socket.user.firstName}`
    );

    socket.on('joinCallRoom', async ({ roomId }) => {
      try {
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
              [Op.lte]: new Date(Date.now() + 5 * 60 * 1000),
            },
          },
        });

        if (!interview) {
          socket.emit('error', 'Interview not found or not authorized');
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
        socket.emit('videoCallMessage', 'Joined video call room successfully');
        socket
          .to(roomId)
          .emit(
            'videoCallMessage',
            `${socket.user.firstName} has joined the call`
          );
        console.log(`User joined video call room: ${roomId}`);
      } catch (error) {
        socket.emit('error', 'Failed to join call room');
        console.error(error);
      }
    });

    socket.on('endCall', async ({ roomId }) => {
      try {
        const interview = await Interview.findOne({ where: { roomId } });
        if (interview) {
          await interview.update({
            status: 'completed',
            callEndedAt: new Date(),
          });
        }
        io.to(roomId).emit('callEnded');
      } catch (error) {
        console.error('Error ending call:', error);
      }
    });

    socket.on('offer', (data) => {
      socket.to(data.roomId).emit('offer', data.offer);
    });

    socket.on('answer', (data) => {
      socket.to(data.roomId).emit('answer', data.answer);
    });

    socket.on('iceCandidate', (data) => {
      socket.to(data.roomId).emit('iceCandidate', data.candidate);
    });

    socket.on('disconnect', async () => {
      if (socket.interview) {
        try {
          const roomParticipants = io.sockets.adapter.rooms.get(
            socket.interview.roomId
          );
          if (!roomParticipants || roomParticipants.size === 0) {
            await socket.interview.update({
              status: 'completed',
              callEndedAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
      console.log(`User disconnected: ${socket.user.firstName}`);
    });
  });
};

module.exports = setupVideoCallSocket;
