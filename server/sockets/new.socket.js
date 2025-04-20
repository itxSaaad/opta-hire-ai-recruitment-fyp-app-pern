const colors = require('colors');
const { Op } = require('sequelize');

const {
  protectSocket,
  authorizeSocketRoles,
} = require('../middlewares/auth.middleware');

const setupVideoCallSocket = (io) => {
  console.log('Setting up video call socket namespace'.green.bold);
  const videoCallNamespace = io.of('/video-call');

  // Apply authentication middleware
  videoCallNamespace.use(protectSocket);
  videoCallNamespace.use(authorizeSocketRoles('isCandidate', 'isInterviewer'));
  console.log(
    'Socket middleware applied: authentication and authorization'.cyan
  );

  // Store rooms in memorys
  const rooms = new Map();
  console.log('In-memory room storage initialized'.yellow);

  videoCallNamespace.on('connection', (socket) => {
    console.log(
      `User connected: ${socket.user.id} (${socket.user.firstName} ${socket.user.lastName})`
        .green
    );
    console.log(`Socket ID: ${socket.id}`.gray);

    // Join a room
    socket.on('join-room', async (roomId) => {
      console.log(`Join room request received for room: ${roomId}`.cyan);
      try {
        // Get or create room
        if (!rooms.has(roomId)) {
          console.log(`Creating new room with ID: ${roomId}`.yellow);
          rooms.set(roomId, new Set());
        } else {
          console.log(
            `Room ${roomId} already exists with ${rooms.get(roomId).size} participants`
              .yellow
          );
        }

        const room = rooms.get(roomId);

        // Check if room is full (max 2 participants)
        if (room.size >= 2) {
          console.log(`Room ${roomId} is full, rejecting join request`.red);
          socket.emit('room-full', { roomId });
          return;
        }

        // Join room
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`.green);

        // Add user to room participants
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
          `Added user to room participants: ${JSON.stringify(participant)}`
            .yellow
        );

        // Get all participants in the room
        const participants = Array.from(room);
        console.log(
          `Current participants in room ${roomId}: ${participants.length}`.cyan
        );

        // Notify everyone in the room about the new participant
        videoCallNamespace.to(roomId).emit('participant-joined', {
          roomId,
          participant,
          participants,
        });
        console.log(
          `Notified room of new participant: ${participant.id}`.green
        );

        // Send existing participants to the new user
        socket.emit('room-joined', {
          roomId,
          participants,
        });
        console.log(
          `Sent existing participants to new user: ${socket.user.id}`.green
        );

        console.log(
          `User ${socket.user.id} joined room ${roomId} successfully`.green.bold
        );
      } catch (error) {
        console.error(`Error joining room ${roomId}:`.red, error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      console.log(`Leave room request received for room: ${roomId}`.cyan);
      leaveRoom(socket, roomId);
    });

    // WebRTC signaling
    socket.on('offer', ({ targetId, sdp, roomId }) => {
      console.log(
        `Offer received from ${socket.id} to ${targetId} in room ${roomId}`.cyan
      );
      videoCallNamespace.to(targetId).emit('offer', {
        sdp,
        callerId: socket.id,
        callerInfo: {
          id: socket.user.id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
        },
        roomId,
      });
      console.log(`Offer forwarded to ${targetId}`.green);
    });

    socket.on('answer', ({ targetId, sdp, roomId }) => {
      console.log(
        `Answer received from ${socket.id} to ${targetId} in room ${roomId}`
          .cyan
      );
      videoCallNamespace.to(targetId).emit('answer', {
        sdp,
        calleeId: socket.id,
        roomId,
      });
      console.log(`Answer forwarded to ${targetId}`.green);
    });

    socket.on('ice-candidate', ({ targetId, candidate, roomId }) => {
      console.log(
        `ICE candidate from ${socket.id} to ${targetId} in room ${roomId}`.cyan
      );
      videoCallNamespace.to(targetId).emit('ice-candidate', {
        candidate,
        senderId: socket.id,
        roomId,
      });
      console.log(`ICE candidate forwarded to ${targetId}`.green);
    });

    // Media controls
    socket.on('toggle-video', ({ roomId, enabled }) => {
      console.log(
        `User ${socket.user.id} toggled video: ${enabled ? 'ON' : 'OFF'} in room ${roomId}`
          .yellow
      );
      socket.to(roomId).emit('user-toggle-video', {
        userId: socket.user.id,
        enabled,
      });
      console.log(`Video toggle event broadcasted to room ${roomId}`.green);
    });

    socket.on('toggle-audio', ({ roomId, enabled }) => {
      console.log(
        `User ${socket.user.id} toggled audio: ${enabled ? 'ON' : 'OFF'} in room ${roomId}`
          .yellow
      );
      socket.to(roomId).emit('user-toggle-audio', {
        userId: socket.user.id,
        enabled,
      });
      console.log(`Audio toggle event broadcasted to room ${roomId}`.green);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(
        `User disconnected: ${socket.user.id} (Socket ID: ${socket.id})`.red
      );

      // Find and leave all rooms this user is in
      for (const [roomId, participants] of rooms.entries()) {
        console.log(`Checking if user was in room ${roomId}`.yellow);
        const participantArray = Array.from(participants);
        const userParticipant = participantArray.find(
          (p) => p.socketId === socket.id
        );

        if (userParticipant) {
          console.log(`Found user in room ${roomId}, cleaning up`.cyan);
          leaveRoom(socket, roomId);
        }
      }
      console.log(
        `Disconnect cleanup completed for user ${socket.user.id}`.green
      );
    });

    // Helper function to handle leaving a room
    function leaveRoom(socket, roomId) {
      console.log(
        `Processing room leave for user ${socket.user.id} from room ${roomId}`
          .yellow
      );
      try {
        if (!rooms.has(roomId)) {
          console.log(`Room ${roomId} not found, nothing to leave`.red);
          return;
        }

        const room = rooms.get(roomId);
        console.log(
          `Room ${roomId} has ${room.size} participants before leaving`.cyan
        );

        // Find and remove the participant
        const participantArray = Array.from(room);
        const participant = participantArray.find(
          (p) => p.socketId === socket.id
        );

        if (participant) {
          console.log(
            `Found participant to remove: ${JSON.stringify(participant)}`.yellow
          );
          room.delete(participant);

          // Leave the socket.io room
          socket.leave(roomId);
          console.log(`Socket ${socket.id} left room ${roomId}`.green);

          // Notify others in the room
          socket.to(roomId).emit('participant-left', {
            roomId,
            participantId: socket.user.id,
          });
          console.log(
            `Notified others about participant leaving room ${roomId}`.green
          );

          console.log(`User ${socket.user.id} left room ${roomId}`.green.bold);

          // Delete the room if empty
          if (room.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (empty)`.red.bold);
          } else {
            console.log(
              `Room ${roomId} still has ${room.size} participants`.yellow
            );
          }
        } else {
          console.log(
            `Participant with socket ID ${socket.id} not found in room ${roomId}`
              .red
          );
        }
      } catch (error) {
        console.error(`Error leaving room ${roomId}:`.red, error);
      }
    }
  });

  console.log('Video call socket setup complete'.green.bold);
};

module.exports = setupVideoCallSocket;
