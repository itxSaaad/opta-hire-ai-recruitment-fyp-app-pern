const colors = require('colors');
const { Op } = require('sequelize');

const { Application, Job, Interview, User } = require('../models');

const {
  protectSocket,
  authorizeSocketRoles,
} = require('../middlewares/auth.middleware');

const { formatResponse, generateRemarks } = require('../utils/interview.utils');

const setupVideoCallSocket = (io) => {
  console.log('\n' + '='.repeat(86).cyan);
  console.log(`🎥 VIDEO CALL SOCKET INITIALIZATION`.bold.cyan);
  console.log('='.repeat(86).cyan);
  console.log(`🚀 Setting up video call socket...`.green);

  const videoCallNamespace = io.of('/video-interviews');
  console.log(
    `🌐 Video call namespace created: ${videoCallNamespace.name}`.green
  );

  videoCallNamespace.use(protectSocket);
  videoCallNamespace.use(authorizeSocketRoles('isCandidate', 'isInterviewer'));
  console.log(`🔒 Socket authentication middleware applied`.green);

  const rooms = new Map();
  console.log(`🗄️  In-memory room storage initialized`.yellow);

  videoCallNamespace.on('connection', (socket) => {
    console.log('-'.repeat(86).green);
    console.log(
      `👤 User connected: ${socket.user.id} (${socket.user.firstName} ${socket.user.lastName})`
        .green
    );
    console.log(`🔌 Socket ID: ${socket.id}`.gray);

    socket.on('join-room', async (roomId) => {
      console.log(`🚪 Join room request received for room: ${roomId}`.cyan);

      if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
        socket.emit('error', formatResponse(false, 'Invalid room ID provided'));
        return;
      }

      try {
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

        console.log(`🔍 Interview found: ${JSON.stringify(interview)}`.yellow);

        if (!interview) {
          console.log(`❌ Interview not found for room ID: ${roomId}`.red);
          socket.emit(
            'error',
            formatResponse(false, 'Interview room not found')
          );
          return;
        }

        if (
          socket.user.id !== interview.interviewerId &&
          socket.user.id !== interview.candidateId
        ) {
          socket.emit(
            'error',
            formatResponse(
              false,
              'You are not authorized to join this interview'
            )
          );
          return;
        }

        if (!rooms.has(roomId)) {
          console.log(`🆕 Creating new room with ID: ${roomId}`.yellow);
          rooms.set(roomId, new Set());
        } else {
          console.log(
            `📊 Room ${roomId} already exists with ${rooms.get(roomId).size} participants`
              .yellow
          );
        }

        const room = rooms.get(roomId);

        if (room.size >= 2) {
          console.log(`❌ Room ${roomId} is full, rejecting join request`.red);
          socket.emit(
            'room-full',
            formatResponse(
              false,
              'This interview room is full. Maximum of 2 participants allowed.'
            )
          );
          return;
        }

        socket.join(roomId);
        console.log(`✅ Socket ${socket.id} joined room ${roomId}`.green);

        const participant = {
          id: socket.user.id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          isCandidate: socket.user.isCandidate,
          isInterviewer: socket.user.isInterviewer,
          socketId: socket.id,
        };

        room.add(participant);
        console.log(
          `👤 Added user to room participants: ${JSON.stringify(participant)}`
            .yellow
        );

        if (room.size === 1 && interview.status === 'scheduled') {
          await interview.update({
            callStartedAt: new Date(),
            status: 'ongoing',
            remarks: generateRemarks(
              'ongoing',
              `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
              `${interview.candidate.firstName} ${interview.candidate.lastName}`,
              interview.job.title
            ),
          });
          console.log(`🔄 Updated interview status to "ongoing"`.cyan);
        }

        const participants = Array.from(room);
        console.log(
          `👥 Current participants in room ${roomId}: ${participants.length}`
            .cyan
        );

        const interviewDetails = {
          id: interview.id,
          roomId: interview.roomId,
          scheduledTime: interview.scheduledTime,
          callStartedAt: interview.callStartedAt,
          status: interview.status,
          job: {
            id: interview.job.id,
            title: interview.job.title,
            company: interview.job.company,
          },
          interviewer: {
            id: interview.interviewer.id,
            name: `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
          },
          candidate: {
            id: interview.candidate.id,
            name: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
          },
        };

        videoCallNamespace.to(roomId).emit(
          'participant-joined',
          formatResponse(
            true,
            `${participant.firstName} ${participant.lastName} joined the room`,
            {
              roomId,
              participant,
              participants,
              interviewDetails,
            }
          )
        );
        console.log(
          `📢 Notified room of new participant: ${participant.id}`.green
        );

        socket.emit(
          'room-joined',
          formatResponse(true, 'Successfully joined interview room', {
            roomId,
            participants,
            interviewDetails,
          })
        );
        console.log(
          `📤 Sent existing participants to new user: ${socket.user.id}`.green
        );

        console.log(
          `✅ User ${socket.user.id} joined room ${roomId} successfully`.green
            .bold
        );
      } catch (error) {
        console.error('\n' + '='.repeat(86).red);
        console.error(`❌ ERROR JOINING ROOM ${roomId}`.red.bold);
        console.error('='.repeat(86).red);
        console.error(`📌 Error Type: ${error.name || 'Unknown Error'}`.red);
        console.error(`💬 Message: ${error.message}`.red);
        console.error(`⏰ Time: ${new Date().toLocaleString()}`.red);
        console.error('='.repeat(86).red);
        socket.emit(
          'error',
          formatResponse(false, 'Failed to join room', {
            details: error.message,
          })
        );
      }
    });

    socket.on('leave-room', (roomId) => {
      console.log(`🚪 Leave room request received for room: ${roomId}`.cyan);
      leaveRoom(socket, roomId, false);
    });

    socket.on('end-call', async (roomId) => {
      console.log(
        `📞 End call request received for room: ${roomId} from user ${socket.user.id}`
          .cyan
      );

      if (!socket.user.isInterviewer) {
        socket.emit(
          'error',
          formatResponse(
            false,
            'Only interviewers can end the call for everyone'
          )
        );
        return;
      }

      try {
        const interview = await Interview.findOne({
          where: {
            roomId,
            status: { [Op.in]: ['scheduled', 'ongoing'] },
            interviewerId: socket.user.id,
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
          socket.emit('error', formatResponse(false, 'Interview not found'));
          return;
        }

        await interview.update({
          callEndedAt: new Date(),
          status: 'completed',
          remarks: generateRemarks(
            'completed',
            `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
            `${interview.candidate.firstName} ${interview.candidate.lastName}`,
            interview.job.title
          ),
        });

        videoCallNamespace.to(roomId).emit(
          'call-ended',
          formatResponse(true, 'The interviewer has ended the call', {
            roomId,
          })
        );

        const room = rooms.get(roomId);
        if (room) {
          const participants = Array.from(room);
          participants.forEach((participant) => {
            const participantSocket = videoCallNamespace.sockets.get(
              participant.socketId
            );
            if (participantSocket && participantSocket.id !== socket.id) {
              leaveRoom(participantSocket, roomId, true);
            }
          });
        }

        leaveRoom(socket, roomId, true);

        console.log(
          `✅ Interview in room ${roomId} marked as completed`.green.bold
        );
      } catch (error) {
        console.error('\n' + '='.repeat(86).red);
        console.error(`❌ ERROR ENDING CALL FOR ROOM ${roomId}`.red.bold);
        console.error('='.repeat(86).red);
        console.error(`📌 Error Type: ${error.name || 'Unknown Error'}`.red);
        console.error(`💬 Message: ${error.message}`.red);
        console.error(`⏰ Time: ${new Date().toLocaleString()}`.red);
        console.error('='.repeat(86).red);
        socket.emit(
          'error',
          formatResponse(false, 'Failed to end the call', {
            details: error.message,
          })
        );
      }
    });

    socket.on('offer', ({ targetId, sdp, roomId }) => {
      console.log(
        `🔄 Offer received from ${socket.id} to ${targetId} in room ${roomId}`
          .cyan
      );

      if (!validateMessageParams({ targetId, sdp, roomId }, socket)) return;

      videoCallNamespace.to(targetId).emit(
        'offer',
        formatResponse(true, 'Received WebRTC offer', {
          sdp,
          callerId: socket.id,
          callerInfo: {
            id: socket.user.id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
          },
          roomId,
        })
      );
      console.log(`📤 Offer forwarded to ${targetId}`.green);
    });

    socket.on('answer', ({ targetId, sdp, roomId }) => {
      console.log(
        `🔄 Answer received from ${socket.id} to ${targetId} in room ${roomId}`
          .cyan
      );

      if (!validateMessageParams({ targetId, sdp, roomId }, socket)) return;

      videoCallNamespace.to(targetId).emit(
        'answer',
        formatResponse(true, 'Received WebRTC answer', {
          sdp,
          calleeId: socket.id,
          roomId,
        })
      );
      console.log(`📤 Answer forwarded to ${targetId}`.green);
    });

    socket.on('ice-candidate', ({ targetId, candidate, roomId }) => {
      console.log(
        `🧊 ICE candidate from ${socket.id} to ${targetId} in room ${roomId}`
          .cyan
      );

      if (!validateMessageParams({ targetId, candidate, roomId }, socket))
        return;

      videoCallNamespace.to(targetId).emit(
        'ice-candidate',
        formatResponse(true, 'Received ICE candidate', {
          candidate,
          senderId: socket.id,
          roomId,
        })
      );
      console.log(`📤 ICE candidate forwarded to ${targetId}`.green);
    });

    socket.on('toggle-video', ({ roomId, enabled }) => {
      console.log(
        `🎥 User ${socket.user.id} toggled video: ${enabled ? 'ON' : 'OFF'} in room ${roomId}`
          .yellow
      );

      if (!validateRoomId(roomId, socket)) return;
      if (typeof enabled !== 'boolean') {
        socket.emit(
          'error',
          formatResponse(false, 'Invalid enabled parameter')
        );
        return;
      }

      socket.to(roomId).emit(
        'user-toggle-video',
        formatResponse(
          true,
          `${socket.user.firstName} ${socket.user.lastName} ${enabled ? 'enabled' : 'disabled'} their video`,
          {
            userId: socket.user.id,
            enabled,
          }
        )
      );
      console.log(`📢 Video toggle event broadcasted to room ${roomId}`.green);
    });

    socket.on('toggle-audio', ({ roomId, enabled }) => {
      console.log(
        `🎤 User ${socket.user.id} toggled audio: ${enabled ? 'ON' : 'OFF'} in room ${roomId}`
          .yellow
      );

      if (!validateRoomId(roomId, socket)) return;
      if (typeof enabled !== 'boolean') {
        socket.emit(
          'error',
          formatResponse(false, 'Invalid enabled parameter')
        );
        return;
      }

      socket.to(roomId).emit(
        'user-toggle-audio',
        formatResponse(
          true,
          `${socket.user.firstName} ${socket.user.lastName} ${enabled ? 'enabled' : 'disabled'} their audio`,
          {
            userId: socket.user.id,
            enabled,
          }
        )
      );
      console.log(`📢 Audio toggle event broadcasted to room ${roomId}`.green);
    });

    socket.on('disconnect', () => {
      console.log('-'.repeat(86).red);
      console.log(
        `👋 User disconnected: ${socket.user.id} (Socket ID: ${socket.id})`.red
      );

      for (const [roomId, participants] of rooms.entries()) {
        console.log(`🔍 Checking if user was in room ${roomId}`.yellow);
        const participantArray = Array.from(participants);
        const userParticipant = participantArray.find(
          (p) => p.socketId === socket.id
        );

        if (userParticipant) {
          console.log(`✅ Found user in room ${roomId}, cleaning up`.cyan);
          leaveRoom(socket, roomId, false);

          if (userParticipant.isInterviewer) {
            handleInterviewerDisconnect(socket, roomId);
          }
        }
      }
      console.log(
        `✅ Disconnect cleanup completed for user ${socket.user.id}`.green
      );
    });

    function validateMessageParams(params, socket) {
      const { targetId, roomId } = params;

      if (!targetId || typeof targetId !== 'string') {
        socket.emit('error', formatResponse(false, 'Invalid target ID'));
        return false;
      }

      return validateRoomId(roomId, socket);
    }

    function validateRoomId(roomId, socket) {
      if (!roomId || typeof roomId !== 'string') {
        socket.emit('error', formatResponse(false, 'Invalid room ID'));
        return false;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', formatResponse(false, 'Room does not exist'));
        return false;
      }

      const participants = Array.from(room);
      const isParticipant = participants.some((p) => p.socketId === socket.id);

      if (!isParticipant) {
        socket.emit(
          'error',
          formatResponse(false, 'You are not a participant in this room')
        );
        return false;
      }

      return true;
    }

    async function handleInterviewerDisconnect(socket, roomId) {
      try {
        const room = rooms.get(roomId);
        if (!room) return;

        const participants = Array.from(room);

        participants.forEach((participant) => {
          if (participant.socketId !== socket.id) {
            const participantSocket = videoCallNamespace.sockets.get(
              participant.socketId
            );
            if (participantSocket) {
              participantSocket.emit(
                'interviewer-disconnected',
                formatResponse(
                  true,
                  'The interviewer has disconnected from the call',
                  { roomId }
                )
              );
            }
          }
        });

        const interview = await Interview.findOne({
          where: { roomId },
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
        if (interview && interview.status === 'ongoing') {
          await interview.update({
            callEndedAt: new Date(),
            status: 'completed',
            remarks: generateRemarks(
              'completed',
              `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
              `${interview.candidate.firstName} ${interview.candidate.lastName}`,
              interview.job.title
            ),
          });
          console.log(
            `⚠️ Interview in room ${roomId} marked as completed due to interviewer disconnect`
              .yellow.bold
          );
        }
      } catch (error) {
        console.error('\n' + '='.repeat(86).red);
        console.error(`❌ ERROR HANDLING INTERVIEWER DISCONNECT`.red.bold);
        console.error('='.repeat(86).red);
        console.error(`📌 Error Type: ${error.name || 'Unknown Error'}`.red);
        console.error(`💬 Message: ${error.message}`.red);
        console.error(`🔑 Room ID: ${roomId}`.red);
        console.error(`⏰ Time: ${new Date().toLocaleString()}`.red);
        console.error('='.repeat(86).red);
      }
    }

    async function leaveRoom(socket, roomId, isCallEnded = false) {
      console.log(
        `🚪 Processing room leave for user ${socket.user.id} from room ${roomId}`
          .yellow
      );
      try {
        if (!rooms.has(roomId)) {
          console.log(`❌ Room ${roomId} not found, nothing to leave`.red);
          return;
        }

        const room = rooms.get(roomId);
        console.log(
          `📊 Room ${roomId} has ${room.size} participants before leaving`.cyan
        );

        const participantArray = Array.from(room);
        const participant = participantArray.find(
          (p) => p.socketId === socket.id
        );

        if (participant) {
          console.log(
            `🔍 Found participant to remove: ${JSON.stringify(participant)}`
              .yellow
          );
          room.delete(participant);

          socket.leave(roomId);
          console.log(`🚪 Socket ${socket.id} left room ${roomId}`.green);

          socket.to(roomId).emit(
            'participant-left',
            formatResponse(
              true,
              `${participant.firstName} ${participant.lastName} left the room`,
              {
                roomId,
                participantId: socket.user.id,
              }
            )
          );
          console.log(
            `📢 Notified others about participant leaving room ${roomId}`.green
          );

          console.log(
            `✅ User ${socket.user.id} left room ${roomId}`.green.bold
          );

          if (room.size === 0) {
            try {
              const interview = await Interview.findOne({
                where: { roomId },
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
              if (interview && interview.status === 'ongoing' && !isCallEnded) {
                await interview.update({
                  callEndedAt: new Date(),
                  status: 'completed',
                  remarks: generateRemarks(
                    'completed',
                    `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
                    `${interview.candidate.firstName} ${interview.candidate.lastName}`,
                    interview.job.title
                  ),
                });
                console.log(
                  `✅ Interview in room ${roomId} marked as completed (all participants left)`
                    .cyan.bold
                );
              }
            } catch (dbError) {
              console.error('\n' + '='.repeat(86).red);
              console.error(`❌ ERROR UPDATING INTERVIEW STATUS`.red.bold);
              console.error('='.repeat(86).red);
              console.error(
                `📌 Error Type: ${dbError.name || 'Unknown Error'}`.red
              );
              console.error(`💬 Message: ${dbError.message}`.red);
              console.error(`🔑 Room ID: ${roomId}`.red);
              console.error(`⏰ Time: ${new Date().toLocaleString()}`.red);
              console.error('='.repeat(86).red);
            }

            rooms.delete(roomId);
            console.log(`🗑️ Room ${roomId} deleted (empty)`.red.bold);
          } else {
            console.log(
              `📊 Room ${roomId} still has ${room.size} participants`.yellow
            );
          }
        } else {
          console.log(
            `❓ Participant with socket ID ${socket.id} not found in room ${roomId}`
              .red
          );
        }
      } catch (error) {
        console.error('\n' + '='.repeat(86).red);
        console.error(`❌ ERROR LEAVING ROOM`.red.bold);
        console.error('='.repeat(86).red);
        console.error(`📌 Error Type: ${error.name || 'Unknown Error'}`.red);
        console.error(`💬 Message: ${error.message}`.red);
        console.error(`🔑 Room ID: ${roomId}`.red);
        console.error(`👤 User ID: ${socket.user.id}`.red);
        console.error(`⏰ Time: ${new Date().toLocaleString()}`.red);
        console.error('='.repeat(86).red);
        socket.emit(
          'error',
          formatResponse(false, 'Error leaving room', {
            details: error.message,
          })
        );
      }
    }
  });

  console.log('-'.repeat(86).cyan);
  console.log(`✅ Video call socket setup complete`.green.bold);
  console.log('='.repeat(86).cyan);
};

module.exports = setupVideoCallSocket;
