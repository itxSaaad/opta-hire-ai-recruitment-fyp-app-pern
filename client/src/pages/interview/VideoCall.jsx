import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import 'webrtc-adapter';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const VideoCallBackup = () => {
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState(null);

  const { roomId } = useParams();
  const navigate = useNavigate();

  const { userInfo, accessToken } = useSelector((state) => state.auth);

  // References
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const localStreamRef = useRef();
  const peerConnectionRef = useRef();

  // WebRTC configuration
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize socket connection
  useEffect(() => {
    const token = accessToken;

    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    // Connect to signaling server with auth token
    const newSocket = io(`${SERVER_URL}/video-call`, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to signaling server');
      setSocket(newSocket);
      setIsConnected(true);

      // Join the room
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setError(`Connection error: ${err.message}`);
    });

    // Clean up on unmount
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      if (newSocket) {
        newSocket.emit('leave-room', roomId);
        newSocket.disconnect();
      }
    };
  }, [roomId, accessToken]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Room joined event
    socket.on('room-joined', async ({ participants: roomParticipants }) => {
      console.log('Room joined', roomParticipants);
      setParticipants(roomParticipants);

      // Initialize local media stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // If there's another participant, initiate connection
        const otherParticipant = roomParticipants.find(
          (p) => p.socketId !== socket.id
        );
        if (otherParticipant) {
          createPeerConnection(otherParticipant.socketId);
          createAndSendOffer(otherParticipant.socketId);
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError(`Could not access camera or microphone: ${err.message}`);
      }
    });

    // New participant joined event
    socket.on('participant-joined', ({ participant }) => {
      console.log('New participant joined', participant);
      setParticipants((prev) => [...prev, participant]);

      // If this is a new participant and we already have our stream
      if (participant.socketId !== socket.id && localStreamRef.current) {
        createPeerConnection(participant.socketId);
        createAndSendOffer(participant.socketId);
      }
    });

    // Participant left event
    socket.on('participant-left', ({ participantId }) => {
      console.log('Participant left', participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));

      // Close peer connection if the remote participant left
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Clear remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    // Room full event
    socket.on('room-full', () => {
      setError('This room is full. Maximum of 2 participants allowed.');
    });

    // WebRTC signaling events
    socket.on('offer', async ({ sdp, callerId, roomId }) => {
      console.log('Received offer from', callerId);
      if (!peerConnectionRef.current) {
        createPeerConnection(callerId);
      }

      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit('answer', {
          targetId: callerId,
          sdp: answer,
          roomId,
        });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socket.on('answer', async ({ sdp }) => {
      console.log('Received answer');
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    socket.on('ice-candidate', async ({ candidate, senderId }) => {
      console.log('Received ICE candidate');
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    // Media control events
    socket.on('user-toggle-video', ({ userId, enabled }) => {
      console.log(`User ${userId} ${enabled ? 'enabled' : 'disabled'} video`);
      // You might want to update the UI to show camera status
    });

    socket.on('user-toggle-audio', ({ userId, enabled }) => {
      console.log(`User ${userId} ${enabled ? 'enabled' : 'disabled'} audio`);
      // You might want to update the UI to show mic status
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    // Clean up event listeners
    return () => {
      socket.off('room-joined');
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('room-full');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-toggle-video');
      socket.off('user-toggle-audio');
      socket.off('error');
    };
  }, [socket, roomId]);

  // Create WebRTC peer connection
  const createPeerConnection = (targetId) => {
    console.log('Creating peer connection for target:', targetId);

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    // Add local tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          targetId,
          candidate: event.candidate,
          roomId,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
    };

    // Handle receiving remote streams
    pc.ontrack = (event) => {
      console.log('Received remote track');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  // Create and send an offer
  const createAndSendOffer = async (targetId) => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit('offer', {
        targetId,
        sdp: offer,
        roomId,
      });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);

        // Notify other participants
        socket.emit('toggle-video', {
          roomId,
          enabled: !isVideoEnabled,
        });
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);

        // Notify other participants
        socket.emit('toggle-audio', {
          roomId,
          enabled: !isAudioEnabled,
        });
      }
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', roomId);
      // Navigate back or to home page
      navigate(
        userInfo.isInterviewer
          ? '/interviewer/feedbacks'
          : '/candidate/interviews'
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Interview Room - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Interview Room - Participate in your scheduled interview session."
        />
        <meta
          name="keywords"
          content="OptaHire, Interview, Video Call, Recruitment"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center p-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {!isConnected ? (
          <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto flex flex-col max-w-7xl w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text">
                Interview
                <span className="text-light-primary dark:text-dark-primary">
                  {' '}
                  Room
                </span>
              </h1>
              <p className="text-sm font-medium text-light-primary dark:text-dark-primary px-4 py-2 bg-light-primary/10 dark:bg-dark-primary/20 rounded-lg shadow-sm backdrop-blur-sm border border-light-primary/20 dark:border-dark-primary/30">
                Room ID: {roomId}
              </p>
            </div>

            {error && <Alert message={error} isSuccess={false} />}

            <div className="relative w-full aspect-video md:aspect-[16/9] mb-8 bg-black/20 rounded-2xl overflow-hidden shadow-lg">
              <div className="video-grid grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="video-item local-video relative overflow-hidden rounded-xl">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-light-background/70 dark:from-dark-background/70 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-light-primary/20 dark:bg-dark-primary/30 flex items-center justify-center border-2 border-light-primary dark:border-dark-primary">
                        <span className="text-sm font-bold text-light-primary dark:text-dark-primary">
                          {userInfo?.isInterviewer ? 'I' : 'C'}
                        </span>
                      </div>
                      <div>
                        <p className="text-light-text dark:text-dark-text text-sm font-medium">
                          {userInfo?.firstName} {userInfo?.lastName} (You)
                        </p>
                        <p className="text-light-text/70 dark:text-dark-text/70 text-xs">
                          {userInfo?.isInterviewer
                            ? 'Interviewer'
                            : 'Candidate'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="video-item remote-video relative overflow-hidden rounded-xl">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-light-background/70 dark:from-dark-background/70 to-transparent">
                    <div className="flex items-center gap-3">
                      {participants.find((p) => p.socketId !== socket?.id) && (
                        <>
                          <div className="h-10 w-10 rounded-full bg-light-primary/20 dark:bg-dark-primary/30 flex items-center justify-center border-2 border-light-primary dark:border-dark-primary">
                            <span className="text-sm font-bold text-light-primary dark:text-dark-primary">
                              {participants.find(
                                (p) => p.socketId !== socket?.id
                              )?.isInterviewer
                                ? 'I'
                                : 'C'}
                            </span>
                          </div>
                          <div>
                            <p className="text-light-text dark:text-dark-text text-sm font-medium">
                              {
                                participants.find(
                                  (p) => p.socketId !== socket?.id
                                )?.firstName
                              }{' '}
                              {
                                participants.find(
                                  (p) => p.socketId !== socket?.id
                                )?.lastName
                              }
                            </p>
                            <p className="text-light-text/70 dark:text-dark-text/70 text-xs">
                              {participants.find(
                                (p) => p.socketId !== socket?.id
                              )?.isInterviewer
                                ? 'Interviewer'
                                : 'Candidate'}
                            </p>
                          </div>
                        </>
                      )}
                      {!participants.find((p) => p.socketId !== socket?.id) && (
                        <p className="text-light-text dark:text-dark-text text-sm font-medium">
                          Waiting for participant...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-2xl border border-light-border dark:border-dark-border/40 shadow-md animate-slideUp">
              <div className="flex flex-wrap justify-center items-center gap-5 md:gap-8">
                <button
                  onClick={toggleAudio}
                  className={`p-4 md:p-5 rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center ${
                    !isAudioEnabled
                      ? 'bg-red-500 dark:bg-red-600 text-white'
                      : 'bg-light-primary dark:bg-dark-primary text-white'
                  }`}
                  aria-label={
                    !isAudioEnabled ? 'Unmute microphone' : 'Mute microphone'
                  }
                >
                  {!isAudioEnabled ? (
                    <FaMicrophoneSlash size={22} />
                  ) : (
                    <FaMicrophone size={22} />
                  )}
                </button>

                <button
                  onClick={leaveRoom}
                  className="p-5 md:p-6 rounded-full bg-red-600 dark:bg-red-700 text-white transition-all duration-300 hover:bg-red-700 dark:hover:bg-red-800 hover:scale-105 shadow-lg"
                  aria-label="Leave call"
                >
                  <FaPhoneSlash size={24} />
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-4 md:p-5 rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center ${
                    !isVideoEnabled
                      ? 'bg-red-500 dark:bg-red-600 text-white'
                      : 'bg-light-primary dark:bg-dark-primary text-white'
                  }`}
                  aria-label={
                    !isVideoEnabled ? 'Turn on camera' : 'Turn off camera'
                  }
                >
                  {!isVideoEnabled ? (
                    <FaVideoSlash size={22} />
                  ) : (
                    <FaVideo size={22} />
                  )}
                </button>
              </div>

              {userInfo?.isInterviewer && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-light-primary dark:text-dark-primary bg-light-primary/10 dark:bg-dark-primary/20 px-3 py-2 rounded-full inline-block">
                    As an interviewer, ending the call will end it for all
                    participants
                  </p>
                </div>
              )}

              <div className="mt-4 text-center md:hidden">
                <p className="text-xs text-light-text/60 dark:text-dark-text/60 bg-light-surface dark:bg-dark-surface px-3 py-2 rounded-full inline-block">
                  Rotate your device horizontally for better view
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-light-surface/80 dark:bg-dark-surface/80 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-medium mb-2 text-light-text dark:text-dark-text">
                Participants ({participants.length}/2)
              </h3>
              <ul className="space-y-2">
                {participants.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-2 bg-light-background/50 dark:bg-dark-background/50 rounded-lg"
                  >
                    <span className="font-medium">
                      {p.firstName} {p.lastName}
                      {p.socketId === socket?.id ? ' (You)' : ''}
                    </span>
                    {p.isInterviewer && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                        Interviewer
                      </span>
                    )}
                    {p.isCandidate && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full">
                        Candidate
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default VideoCallBackup;
