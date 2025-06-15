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

      if (userInfo.isInterviewer) {
        navigate(`/interview/${roomId}/feedback`);
      } else {
        navigate('/candidate/interviews');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Live Interview - OptaHire | Video Interview Platform</title>
        <meta
          name="description"
          content="Join your live video interview on OptaHire. Professional interview experience with real-time communication and feedback tools."
        />
        <meta
          name="keywords"
          content="OptaHire Live Interview, Video Interview, Online Interview, Interview Platform, Remote Interview"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background p-4 dark:bg-dark-background">
        {!isConnected ? (
          <div className="flex w-full max-w-sm animate-fadeIn flex-col items-center justify-center sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-7xl flex-col">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex flex-col items-center md:items-start">
                <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
                  Live{' '}
                  <span className="text-light-primary dark:text-dark-primary">
                    Interview
                  </span>
                </h1>
                <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
                  Welcome to your professional video interview experience. Good
                  luck with your session!
                </p>
              </div>
              <p className="rounded-lg border border-light-primary/20 bg-light-primary/10 px-4 py-2 text-sm font-medium text-light-primary shadow-sm backdrop-blur-sm dark:border-dark-primary/30 dark:bg-dark-primary/20 dark:text-dark-primary">
                Room ID: {roomId}
              </p>
            </div>

            {error && <Alert message={error} isSuccess={false} />}

            <div className="relative mb-5 grid aspect-video h-full w-full animate-slideUp grid-cols-1 gap-5 overflow-hidden rounded-2xl border border-light-border bg-light-surface/90 p-4 shadow-md backdrop-blur-sm dark:border-dark-border/40 dark:bg-dark-surface/90 md:aspect-[16/9] md:grid-cols-2 md:p-6">
              <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-light-primary/20 shadow-lg dark:bg-dark-primary/20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-light-background/70 to-transparent p-4 dark:from-dark-background/70">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-light-primary bg-light-primary/20 dark:border-dark-primary dark:bg-dark-primary/30">
                      <span className="text-sm font-bold text-light-primary dark:text-dark-primary">
                        {userInfo?.isInterviewer ? 'I' : 'C'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-light-text dark:text-dark-text">
                        {userInfo?.firstName} {userInfo?.lastName} (You)
                      </p>
                      <p className="text-xs text-light-text/70 dark:text-dark-text/70">
                        {userInfo?.isInterviewer ? 'Interviewer' : 'Candidate'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-light-primary/20 shadow-lg dark:bg-dark-primary/20">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-light-background/70 to-transparent p-4 dark:from-dark-background/70">
                  <div className="flex items-center gap-3">
                    {participants.find((p) => p.socketId !== socket?.id) && (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-light-primary bg-light-primary/20 dark:border-dark-primary dark:bg-dark-primary/30">
                          <span className="text-sm font-bold text-light-primary dark:text-dark-primary">
                            {participants.find((p) => p.socketId !== socket?.id)
                              ?.isInterviewer
                              ? 'I'
                              : 'C'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-light-text dark:text-dark-text">
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
                          <p className="text-xs text-light-text/70 dark:text-dark-text/70">
                            {participants.find((p) => p.socketId !== socket?.id)
                              ?.isInterviewer
                              ? 'Interviewer'
                              : 'Candidate'}
                          </p>
                        </div>
                      </>
                    )}
                    {!participants.find((p) => p.socketId !== socket?.id) && (
                      <p className="text-sm font-medium text-light-text dark:text-dark-text">
                        Waiting for participant...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 animate-slideUp rounded-2xl border border-light-border bg-light-surface/90 p-4 shadow-md backdrop-blur-sm dark:border-dark-border/40 dark:bg-dark-surface/90 md:p-6">
              <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
                <button
                  onClick={toggleAudio}
                  className={`flex items-center justify-center rounded-full p-4 shadow-md transition-all duration-300 hover:scale-105 md:p-5 ${
                    !isAudioEnabled
                      ? 'bg-red-500 text-white dark:bg-red-600'
                      : 'bg-light-primary text-white dark:bg-dark-primary'
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
                  className="rounded-full bg-red-600 p-5 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 md:p-6"
                  aria-label="Leave call"
                >
                  <FaPhoneSlash size={24} />
                </button>

                <button
                  onClick={toggleVideo}
                  className={`flex items-center justify-center rounded-full p-4 shadow-md transition-all duration-300 hover:scale-105 md:p-5 ${
                    !isVideoEnabled
                      ? 'bg-red-500 text-white dark:bg-red-600'
                      : 'bg-light-primary text-white dark:bg-dark-primary'
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
                  <p className="inline-block rounded-full bg-light-primary/10 px-3 py-2 text-xs text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                    As an interviewer, ending the call will end it for all
                    participants
                  </p>
                </div>
              )}

              <div className="mt-4 text-center md:hidden">
                <p className="inline-block rounded-full bg-light-surface px-3 py-2 text-xs text-light-text/60 dark:bg-dark-surface dark:text-dark-text/60">
                  Rotate your device horizontally for better view
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              {interviewDetails && (
                <div className="rounded-xl border border-light-border bg-light-surface/80 p-5 shadow-sm backdrop-blur-md dark:border-dark-border/40 dark:bg-dark-surface/80 md:col-span-2">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-light-text dark:text-dark-text">
                    <span className="h-5 w-1 rounded-full bg-light-primary dark:bg-dark-primary"></span>
                    Interview Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                      <div className="flex items-center gap-2">
                        <FaBriefcase className="h-4 w-4 text-light-primary dark:text-dark-primary" />
                        <span className="text-sm font-medium text-light-text dark:text-dark-text">
                          Position:
                        </span>
                      </div>
                      <span className="text-sm text-light-text/80 dark:text-dark-text/80">
                        {interviewDetails.job?.title || 'Interview Session'}
                      </span>
                    </div>

                    {interviewDetails.job?.company && (
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                        <div className="flex items-center gap-2">
                          <FaBuilding className="h-4 w-4 text-light-primary dark:text-dark-primary" />
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
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="h-4 w-4 text-light-primary dark:text-dark-primary" />
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
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                        <div className="flex items-center gap-2">
                          <FaClock className="h-4 w-4 text-light-primary dark:text-dark-primary" />
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

              <div className="rounded-xl border border-light-border bg-light-surface/80 p-5 shadow-sm backdrop-blur-md dark:border-dark-border/40 dark:bg-dark-surface/80 md:col-span-1">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-light-text dark:text-dark-text">
                  <span className="h-5 w-1 rounded-full bg-light-primary dark:bg-dark-primary"></span>
                  Participants{' '}
                  <span className="text-sm text-light-text/60 dark:text-dark-text/60">
                    ({participants.length}/2)
                  </span>
                </h3>
                <ul className="space-y-2">
                  {participants.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-light-border/30 bg-light-background/50 px-4 py-3 dark:border-dark-border/20 dark:bg-dark-background/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-light-primary/30 bg-light-primary/10 dark:border-dark-primary/30 dark:bg-dark-primary/10">
                          <span className="text-xs font-bold text-light-primary dark:text-dark-primary">
                            {p.firstName?.charAt(0) || ''}
                            {p.lastName?.charAt(0) || ''}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-light-text dark:text-dark-text">
                          {p.firstName} {p.lastName}
                          {p.socketId === socket?.id ? ' (You)' : ''}
                        </span>
                      </div>
                      <div>
                        {p.isInterviewer && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-100">
                            Interviewer
                          </span>
                        )}
                        {p.isCandidate && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/40 dark:text-green-100">
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
