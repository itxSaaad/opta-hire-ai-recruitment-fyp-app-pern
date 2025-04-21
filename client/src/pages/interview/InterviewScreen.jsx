import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaClock,
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

const InterviewScreen = () => {
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState(null);

  const { roomId } = useParams();
  const navigate = useNavigate();

  const { userInfo, accessToken } = useSelector((state) => state.auth);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const localStreamRef = useRef();
  const peerConnectionRef = useRef();

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    const token = accessToken;

    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    const newSocket = io(`${SERVER_URL}/video-interviews`, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      setSocket(newSocket);
      setIsConnected(true);

      newSocket.emit('join-room', roomId);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setError(`Connection error: ${err.message}`);
    });

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

  useEffect(() => {
    if (!socket) return;

    socket.on(
      'room-joined',
      async ({ participants: roomParticipants, interviewDetails }) => {
        setParticipants(roomParticipants);
        setInterviewDetails(interviewDetails);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

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
      }
    );

    socket.on('participant-joined', ({ participant }) => {
      setParticipants((prev) => [...prev, participant]);

      if (participant.socketId !== socket.id && localStreamRef.current) {
        createPeerConnection(participant.socketId);
        createAndSendOffer(participant.socketId);
      }
    });

    socket.on('participant-left', ({ participantId }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on('room-full', () => {
      setError('This room is full. Maximum of 2 participants allowed.');
    });

    socket.on('offer', async ({ sdp, callerId, roomId }) => {
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
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
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

    socket.on('user-toggle-video', ({ userId, enabled }) => {
      console.log(`User ${userId} ${enabled ? 'enabled' : 'disabled'} video`);
    });

    socket.on('user-toggle-audio', ({ userId, enabled }) => {
      console.log(`User ${userId} ${enabled ? 'enabled' : 'disabled'} audio`);
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

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

  const createPeerConnection = (targetId) => {
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          targetId,
          candidate: event.candidate,
          roomId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

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

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);

        socket.emit('toggle-video', {
          roomId,
          enabled: !isVideoEnabled,
        });
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);

        socket.emit('toggle-audio', {
          roomId,
          enabled: !isAudioEnabled,
        });
      }
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit(userInfo.isInterviewer ? 'end-call' : 'leave-room', roomId);
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

            <div className="relative w-full h-full aspect-video md:aspect-[16/9] grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 p-4 md:p-6 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-2xl border border-light-border dark:border-dark-border/40 shadow-md animate-slideUp overflow-hidden">
              <div className="bg-light-primary/20 dark:bg-dark-primary/20 flex items-center justify-center shadow-lg relative overflow-hidden rounded-xl">
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
                        {userInfo?.isInterviewer ? 'Interviewer' : 'Candidate'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-light-primary/20 dark:bg-dark-primary/20 flex items-center justify-center shadow-lg relative overflow-hidden rounded-xl">
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
                            {participants.find((p) => p.socketId !== socket?.id)
                              ?.isInterviewer
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
                            {participants.find((p) => p.socketId !== socket?.id)
                              ?.isInterviewer
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

            <div className="p-4 md:p-6 mb-6 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-2xl border border-light-border dark:border-dark-border/40 shadow-md animate-slideUp">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {interviewDetails && (
                <div className="md:col-span-2 p-5 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-md rounded-xl border border-light-border dark:border-dark-border/40 shadow-sm">
                  <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3 flex items-center gap-2">
                    <span className="h-5 w-1 bg-light-primary dark:bg-dark-primary rounded-full"></span>
                    Interview Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                      <div className="flex items-center gap-2">
                        <FaBriefcase className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                        <span className="text-sm font-medium text-light-text dark:text-dark-text">
                          Position:
                        </span>
                      </div>
                      <span className="text-sm text-light-text/80 dark:text-dark-text/80">
                        {interviewDetails.job?.title || 'Interview Session'}
                      </span>
                    </div>

                    {interviewDetails.job?.company && (
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                        <div className="flex items-center gap-2">
                          <FaBuilding className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            Company:
                          </span>
                        </div>
                        <span className="text-sm text-light-text/80 dark:text-dark-text/80">
                          {interviewDetails.job.company}
                        </span>
                      </div>
                    )}

                    {interviewDetails.scheduledTime && (
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            Scheduled:
                          </span>
                        </div>
                        <span className="text-sm text-light-text/80 dark:text-dark-text/80">
                          {new Date(
                            interviewDetails.scheduledTime
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {interviewDetails.callStartedAt && (
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                        <div className="flex items-center gap-2">
                          <FaClock className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            Started:
                          </span>
                        </div>
                        <span className="text-sm text-light-text/80 dark:text-dark-text/80">
                          {new Date(
                            interviewDetails.callStartedAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="md:col-span-1 p-5 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-md rounded-xl border border-light-border dark:border-dark-border/40 shadow-sm">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3 flex items-center gap-2">
                  <span className="h-5 w-1 bg-light-primary dark:bg-dark-primary rounded-full"></span>
                  Participants{' '}
                  <span className="text-sm text-light-text/60 dark:text-dark-text/60">
                    ({participants.length}/2)
                  </span>
                </h3>
                <ul className="space-y-2">
                  {participants.map((p) => (
                    <li
                      key={p.id}
                      className="px-4 py-3 bg-light-background/50 dark:bg-dark-background/50 rounded-lg border border-light-border/30 dark:border-dark-border/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 flex items-center justify-center border border-light-primary/30 dark:border-dark-primary/30">
                          <span className="text-xs font-bold text-light-primary dark:text-dark-primary">
                            {p.firstName?.charAt(0) || ''}
                            {p.lastName?.charAt(0) || ''}
                          </span>
                        </div>
                        <span className="font-medium text-sm text-light-text dark:text-dark-text">
                          {p.firstName} {p.lastName}
                          {p.socketId === socket?.id ? ' (You)' : ''}
                        </span>
                      </div>
                      <div>
                        {p.isInterviewer && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100 rounded-full">
                            Interviewer
                          </span>
                        )}
                        {p.isCandidate && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-100 rounded-full">
                            Candidate
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default InterviewScreen;
