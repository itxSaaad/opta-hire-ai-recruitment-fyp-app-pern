const colors = require('colors');
const { Op } = require('sequelize');

const { Application, Job, Interview, User } = require('../models');

const {
  protectSocket,
  authorizeSocketRoles,
} = require('../middlewares/auth.middleware');

const { validateString } = require('../utils/validation.utils');
const { generateRemarks } = require('../utils/interview.utils');

const setupVideoCallSocket = (io) => {
  // Create a namespace for video calls
  const videoIO = io.of('/video-interviews');

  videoIO.use(protectSocket);
  videoIO.use(authorizeSocketRoles('isInterviewer', 'isCandidate'));

  // Track active rooms and participants
  const activeRooms = new Map(); // roomId -> { participants, interview, startTime, etc }

  console.log('\n' + '='.repeat(86).cyan);
  console.log(`🎥 VIDEO SOCKET INITIALIZED`.bold.cyan);
  console.log('='.repeat(86).cyan);
  console.log(`✅ Status:      Video interview socket namespace created`.green);
  console.log(
    `🔒 Security:    Auth middleware and role validation active`.green
  );
  console.log(`⏰ Timestamp:   ${new Date().toLocaleString()}`.magenta);
  console.log('='.repeat(86).cyan);

  // Helper function when a user leaves a room
  function leaveRoom(socket, roomId) {
    const room = activeRooms.get(roomId);
    if (room) {
      room.participants.delete(socket.user.id);
      // Notify remaining participants that the user left
      socket.to(roomId).emit('participantLeft', {
        success: true,
        message: 'A participant has left the call.',
        id: socket.user.id,
      });
      // Leave socket.io room
      socket.leave(roomId);
    }
  }

  videoIO.on('connection', (socket) => {
    console.log('\n' + '-'.repeat(86).green);
    console.log(`👤 USER CONNECTED TO VIDEO CALL`.bold.green);
    console.log('-'.repeat(86).green);
    console.log(`🆔 User ID:     ${socket.user.id}`.cyan);
    console.log(
      `👋 Name:        ${socket.user.firstName} ${socket.user.lastName || ''}`
        .cyan
    );
    console.log(`⏰ Connected:   ${new Date().toLocaleString()}`.magenta);
    console.log('-'.repeat(86).green);

    let currentRoom = null;
    let userRole = null;

    socket.on('offer', (data) => {
      if (!currentRoom) return;
      console.log(`🔄 Received offer from ${socket.user.id}`.cyan);
      socket.to(currentRoom).emit('offer', {
        from: socket.user.id,
        offer: data.offer,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('answer', (data) => {
      if (!currentRoom) return;
      console.log(`🔄 Received answer from ${socket.user.id}`.cyan);
      socket.to(currentRoom).emit('answer', {
        from: socket.user.id,
        answer: data.answer,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('ice-candidate', (data) => {
      if (!currentRoom) return;
      console.log(`🔄 Received ICE candidate from ${socket.user.id}`.cyan);
      socket.to(currentRoom).emit('ice-candidate', {
        from: socket.user.id,
        candidate: data.candidate,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('joinCallRoom', async ({ roomId }) => {
      try {
        if (!roomId) {
          console.error(`❌ Missing roomId for user ${socket.user.id}`.red);
          socket.emit('error', {
            success: false,
            message:
              'Room ID is required to join the interview call. Please provide a valid Room ID.',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        validateString(roomId, 'Room ID', 6, 50);

        console.log('\n' + '-'.repeat(86).blue);
        console.log(`🚪 JOIN CALL ATTEMPT`.bold.blue);
        console.log('-'.repeat(86).blue);
        console.log(`🆔 User ID:     ${socket.user.id}`.cyan);
        console.log(`🏢 Room ID:     ${roomId}`.cyan);
        console.log(`⏰ Timestamp:   ${new Date().toLocaleString()}`.magenta);

        // Allow users to join up to 5 minutes early
        const interview = await Interview.findOne({
          where: {
            roomId,
            [Op.and]: [
              { status: { [Op.in]: ['scheduled', 'ongoing'] } },
              {
                [Op.or]: [
                  { status: 'ongoing' },
                  {
                    status: 'scheduled',
                    scheduledTime: {
                      [Op.between]: [
                        new Date(Date.now() - 5 * 60 * 1000),
                        new Date(Date.now() + 60 * 60 * 1000),
                      ],
                    },
                  },
                ],
              },
              {
                [Op.or]: [
                  { interviewerId: socket.user.id },
                  { candidateId: socket.user.id },
                ],
              },
            ],
          },
          include: [
            {
              model: User,
              as: 'interviewer',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: User,
              as: 'candidate',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: Job,
              as: 'job',
              attributes: ['id', 'title', 'company', 'description'],
            },
            {
              model: Application,
              as: 'application',
              attributes: ['id', 'status'],
            },
          ],
        });

        if (!interview) {
          console.error(`❌ Interview not found for room ${roomId}`.red);
          socket.emit('error', {
            success: false,
            message:
              'The interview session was not found. Please verify your invitation or try again.',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        if (
          socket.user.id !== interview.interviewerId &&
          socket.user.id !== interview.candidateId
        ) {
          console.error(
            `❌ Unauthorized user ${socket.user.id} attempted to join room ${roomId}`
              .red
          );
          socket.emit('error', {
            success: false,
            message: 'You are not authorized to join this interview call.',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        userRole =
          socket.user.id === interview.interviewerId
            ? 'interviewer'
            : 'candidate';

        // Initialize room if it does not exist
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, {
            participants: new Map(),
            interview: interview,
            startTime: new Date(),
          });
          console.log(`🆕 Created new room: ${roomId}`.yellow);
        }

        const room = activeRooms.get(roomId);

        if (
          room.participants.size >= 2 &&
          !room.participants.has(socket.user.id)
        ) {
          console.error(
            `❌ Room full for room ${roomId}. User ${socket.user.id} cannot join.`
              .red
          );
          socket.emit('error', {
            success: false,
            message:
              'The interview room is full. Please try again later or contact support.',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const now = new Date();
        if (interview.status === 'scheduled') {
          const scheduledTime = new Date(interview.scheduledTime);
          if (now >= scheduledTime) {
            const remarks = generateRemarks(
              'ongoing',
              `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
              `${interview.candidate.firstName} ${interview.candidate.lastName}`,
              interview.job.title
            );
            await interview.update({
              status: 'ongoing',
              callStartedAt: now,
              remarks,
            });
            console.log(
              `🔄 Interview status updated to "ongoing" for interview ID: ${interview.id}`
                .yellow
            );
          } else {
            console.log(
              `ℹ️ Interview scheduled at ${scheduledTime.toLocaleString()}. Waiting until scheduled time.`
                .blue
            );
          }
        }

        // Join socket room and add participant
        socket.join(roomId);
        currentRoom = roomId;
        const participantData = {
          id: socket.user.id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          email: socket.user.email,
          role: userRole,
          audioEnabled: true,
          videoEnabled: true,
          joinedAt: new Date(),
        };
        room.participants.set(socket.user.id, participantData);

        console.log(`✅ User joined successfully as ${userRole}`.green);
        console.log(
          `👥 Current participants in room: ${room.participants.size}`.cyan
        );

        // Send success response to the user
        socket.emit('callRoomJoined', {
          success: true,
          message:
            now < new Date(interview.scheduledTime)
              ? 'You have successfully joined the interview call. It will start at the scheduled time.'
              : 'You have successfully joined the interview call.',
          interview: {
            id: interview.id,
            roomId: interview.roomId,
            title: interview.job.title,
            company: interview.job.company,
            description: interview.job.description,
            status: interview.status,
            scheduledTime: interview.scheduledTime,
          },
          participants: Array.from(room.participants.values()),
          isFirstParticipant: room.participants.size === 1,
          timestamp: new Date().toISOString(),
        });

        // Notify other participant(s)
        socket.to(roomId).emit('participantJoined', {
          success: true,
          message: 'A new participant has joined the call.',
          participant: participantData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(
          `❌ JOIN ROOM ERROR for user ${socket.user.id}: ${error.message}`.red
        );
        socket.emit('error', {
          success: false,
          message:
            'Unable to join the interview call at this time. Please try again later.',
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('endCall', async () => {
      if (!currentRoom) return;

      const room = activeRooms.get(currentRoom);
      if (!room) return;

      if (userRole === 'interviewer') {
        console.log(
          `🔴 Interviewer ${socket.user.id} ended the call for room ${currentRoom}`
            .yellow
        );

        videoIO.to(currentRoom).emit('callEnded', {
          success: true,
          message: 'The call has been ended by the interviewer.',
          endedBy: socket.user.id,
          timestamp: new Date().toISOString(),
        });

        try {
          const interviewInstance = await Interview.findOne({
            where: { roomId: currentRoom },
            include: [
              { model: User, as: 'interviewer' },
              { model: User, as: 'candidate' },
              { model: Job, as: 'job' },
            ],
          });

          if (interviewInstance && interviewInstance.status === 'ongoing') {
            const remarks = generateRemarks(
              'completed',
              `${interviewInstance.interviewer.firstName} ${interviewInstance.interviewer.lastName}`,
              `${interviewInstance.candidate.firstName} ${interviewInstance.candidate.lastName}`,
              interviewInstance.job.title
            );
            await interviewInstance.update({
              status: 'completed',
              callEndedAt: new Date(),
              remarks,
            });
            console.log(
              `🔄 Interview status updated to "completed" for interview ID: ${interviewInstance.id}`
                .yellow
            );
          }
          if (activeRooms.has(currentRoom)) {
            activeRooms.delete(currentRoom);
            console.log(
              `🗑️ Room ${currentRoom} removed after call ended.`.yellow
            );
          }
        } catch (error) {
          console.error(`❌ Error ending call: ${error.message}`.red);
        }
      } else {
        socket.emit('error', {
          success: false,
          message:
            'Only the interviewer can end the call. Please wait for the interviewer to conclude the call.',
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('leaveCallRoom', () => {
      if (currentRoom) {
        console.log(
          `👋 User ${socket.user.id} is voluntarily leaving room ${currentRoom}`
            .cyan
        );
        leaveRoom(socket, currentRoom);
        currentRoom = null;
      }
    });

    socket.on('toggleAudio', (data) => {
      if (!currentRoom) return;
      const room = activeRooms.get(currentRoom);
      if (!room) return;

      const participant = room.participants.get(socket.user.id);
      if (participant) {
        console.log(
          `🔊 User ${socket.user.id} toggled audio: ${data.enabled}`.cyan
        );
        participant.audioEnabled = data.enabled;
        room.participants.set(socket.user.id, participant);

        // Notify other participants about the audio status change
        // This way the other participant can update UI to show mute status
        socket.to(currentRoom).emit('participantToggleAudio', {
          success: true,
          userId: socket.user.id,
          enabled: data.enabled,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('toggleVideo', (data) => {
      if (!currentRoom) return;
      const room = activeRooms.get(currentRoom);
      if (!room) return;

      const participant = room.participants.get(socket.user.id);
      if (participant) {
        console.log(
          `📹 User ${socket.user.id} toggled video: ${data.enabled}`.cyan
        );
        participant.videoEnabled = data.enabled;
        room.participants.set(socket.user.id, participant);

        socket.to(currentRoom).emit('participantToggleVideo', {
          success: true,
          userId: socket.user.id,
          enabled: data.enabled,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', async () => {
      try {
        console.log('\n' + '-'.repeat(86).yellow);
        console.log(`👋 USER DISCONNECTED`.bold.yellow);
        console.log('-'.repeat(86).yellow);
        console.log(`🆔 User ID:     ${socket.user.id}`.cyan);
        console.log(
          `👤 User:        ${socket.user.firstName} ${socket.user.lastName || ''}`
            .cyan
        );
        console.log(`🏢 Room:        ${currentRoom || 'None'}`.cyan);
        console.log(`⏰ Timestamp:   ${new Date().toLocaleString()}`.magenta);

        // Leave current room if any
        if (currentRoom) {
          leaveRoom(socket, currentRoom);

          // If the interviewer disconnects, update the interview status and notify
          if (userRole === 'interviewer') {
            const interviewInstance = await Interview.findOne({
              where: { roomId: currentRoom },
              include: [
                { model: User, as: 'interviewer' },
                { model: User, as: 'candidate' },
                { model: Job, as: 'job' },
              ],
            });

            if (interviewInstance && interviewInstance.status === 'ongoing') {
              const remarks = generateRemarks(
                'completed',
                `${interviewInstance.interviewer.firstName} ${interviewInstance.interviewer.lastName}`,
                `${interviewInstance.candidate.firstName} ${interviewInstance.candidate.lastName}`,
                interviewInstance.job.title
              );
              await interviewInstance.update({
                status: 'completed',
                callEndedAt: new Date(),
                remarks,
              });
              console.log(
                `🔄 Interview status updated to "completed" due to interviewer disconnect (ID: ${interviewInstance.id}).`
                  .yellow
              );

              videoIO.to(currentRoom).emit('callEnded', {
                success: true,
                message:
                  'The interviewer has left the call. The call has now ended.',
                endedBy: socket.user.id,
                timestamp: new Date().toISOString(),
              });
            }
            if (activeRooms.has(currentRoom)) {
              activeRooms.delete(currentRoom);
              console.log(
                `🗑️ Room ${currentRoom} removed after interviewer disconnected.`
                  .yellow
              );
            }
          }
        }
        console.log('-'.repeat(86).yellow);
      } catch (error) {
        console.error(
          `❌ DISCONNECT ERROR for user ${socket.user.id}: ${error.message}`.red
        );
      }
    });
  });
};

module.exports = setupVideoCallSocket;
