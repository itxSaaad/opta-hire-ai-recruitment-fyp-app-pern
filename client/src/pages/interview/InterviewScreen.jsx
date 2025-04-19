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
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackEvent, trackPageView } from '../../utils/analytics';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const InterviewScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [remoteParticipantName, setRemoteParticipantName] = useState('');
  const [remoteParticipantRole, setRemoteParticipantRole] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingIceCandidates, setPendingIceCandidates] = useState([]);

  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, accessToken } = useSelector((state) => state.auth);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const handleDisconnect = () => {
    setMessage('Call ended by server');
    cleanup();

    navigate(
      userInfo.isInterviewer
        ? '/interviewer/interviews'
        : '/candidate/interviews'
    );
  };

  const initializeMedia = async () => {
    try {
      setIsLoading(true);
      setMessage('Accessing media devices...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Set initial audio state
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });

      // Set initial video state
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOff;
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        // Explicitly play the video to satisfy autoplay policies
        try {
          await localVideoRef.current.play();
        } catch (playError) {
          console.warn('Error playing local video:', playError);
          // Retry play after user interaction if needed
        }
      }
      setIsLoading(false);
      setSuccess('Camera and microphone connected successfully');
      trackEvent(
        'Interview Media',
        'Success',
        'Media devices accessed successfully'
      );
      setTimeout(() => setSuccess(null), 3000);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError(error.message);
      setIsLoading(false);
      trackEvent(
        'Interview Media',
        'Error',
        `Error accessing media devices: ${error.message}`
      );
      throw error;
    }
  };

  const createPeerConnection = () => {
    try {
      setMessage('Setting up connection...');
      const peerConnection = new RTCPeerConnection(iceServers);

      // Register ontrack handler early, before any SDP negotiation
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          // Explicitly play the video to satisfy autoplay policies
          remoteVideoRef.current.play().catch((error) => {
            console.warn('Error playing remote video:', error);
            // You might want to show a UI element requiring user interaction
          });
          setIsConnected(true);
          setSuccess('Connected to remote participant');
          trackEvent(
            'Interview Connection',
            'Success',
            'Remote track received'
          );
          setTimeout(() => setSuccess(null), 3000);
        }
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        switch (peerConnection.connectionState) {
          case 'connected':
            setMessage('Connected to participant');
            setIsConnected(true);
            setIsLoading(false);
            setSuccess('Call connected successfully');
            trackEvent('Interview Connection', 'State Change', 'Connected');
            setTimeout(() => setSuccess(null), 3000);
            break;
          case 'disconnected':
          case 'failed':
            setMessage('Connection lost. Attempting to reconnect...');
            setIsConnected(false);
            setError('Connection lost. Attempting to reconnect...');
            trackEvent(
              'Interview Connection',
              'State Change',
              'Disconnected/Failed'
            );
            break;
          case 'closed':
            setMessage('Call ended');
            setIsConnected(false);
            trackEvent('Interview Connection', 'State Change', 'Closed');
            break;
        }
      };

      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      setError(error.message);
      trackEvent(
        'Interview Connection',
        'Error',
        `Error creating peer connection: ${error.message}`
      );
      return null;
    }
  };

  // Process any pending ICE candidates after setting remote description
  const processPendingIceCandidates = async () => {
    if (peerConnectionRef.current && pendingIceCandidates.length > 0) {
      console.log(
        `Processing ${pendingIceCandidates.length} pending ICE candidates`
      );
      for (const candidate of pendingIceCandidates) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.error('Error adding pending ICE candidate:', err);
        }
      }
      setPendingIceCandidates([]);
    }
  };

  // In the InterviewScreen component

  const handleRoomJoined = async (data) => {
    try {
      console.log('Joined room:', data);
      setMessage(data.message || 'Connected to interview room');
      setInterviewDetails(data.interview);

      // Find other participant if exists
      const otherParticipant = data.participants.find(
        (p) => p.id !== userInfo.id
      );
      if (otherParticipant) {
        setRemoteParticipantName(otherParticipant.name);
        setRemoteParticipantRole(otherParticipant.role);
      }

      setIsLoading(false);
      setSuccess('Successfully joined the interview room');
      trackEvent('Interview Room', 'Joined', `Joined room: ${roomId}`);
      setTimeout(() => setSuccess(null), 3000);

      if (data.isFirstParticipant) {
        setMessage('Waiting for other participant to join...');
        return;
      }

      const stream = localStreamRef.current || (await initializeMedia());
      // Verify we have a valid stream
      if (!stream || stream.getTracks().length === 0) {
        throw new Error('Failed to get local media stream');
      }

      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socketRef.current.emit('offer', {
        roomId,
        offer: peerConnection.localDescription,
      });
    } catch (error) {
      console.error('Error in room joined handler:', error);
      setError(error.message);
      setIsLoading(false);
      trackEvent(
        'Interview Room',
        'Error',
        `Error in room joined handler: ${error.message}`
      );
    }
  };

  const handleReceiveOffer = async (data) => {
    try {
      console.log('Received offer:', data);
      setIsLoading(true);
      setMessage('Connecting to remote participant...');
      if (!localStreamRef.current) {
        await initializeMedia();
      }
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }
      const peerConnection = peerConnectionRef.current;
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      // Process any pending ICE candidates
      await processPendingIceCandidates();

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socketRef.current.emit('answer', {
        roomId,
        answer: peerConnection.localDescription,
      });
      setIsLoading(false);
      trackEvent(
        'Interview Connection',
        'Offer Received',
        'Successfully processed offer'
      );
    } catch (error) {
      console.error('Error handling offer:', error);
      setError(error.message);
      setIsLoading(false);
      trackEvent(
        'Interview Connection',
        'Error',
        `Error handling offer: ${error.message}`
      );
    }
  };

  const handleReceiveAnswer = async (data) => {
    try {
      console.log('Received answer:', data);
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        // Process any pending ICE candidates after setting remote description
        await processPendingIceCandidates();

        setSuccess('Connection established with participant');
        trackEvent(
          'Interview Connection',
          'Answer Received',
          'Successfully processed answer'
        );
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      setError(error.message);
      trackEvent(
        'Interview Connection',
        'Error',
        `Error handling answer: ${error.message}`
      );
    }
  };

  const handleReceiveIceCandidate = async (data) => {
    try {
      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.remoteDescription
      ) {
        // If we have remote description set, add the candidate immediately
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } else {
        // Otherwise, queue the candidate for later processing
        console.log('Queuing ICE candidate until remote description is set');
        setPendingIceCandidates((prev) => [...prev, data.candidate]);
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      setError(error.message);
      trackEvent(
        'Interview Connection',
        'Error',
        `Error adding ICE candidate: ${error.message}`
      );
    }
  };

  const handleParticipantToggleAudio = (data) => {
    console.log('Participant toggled audio:', data);
    // You could update UI to show remote participant's audio status
    if (data.userId !== userInfo.id) {
      setSuccess(
        `${remoteParticipantName} ${data.enabled ? 'unmuted' : 'muted'} their microphone`
      );
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleParticipantToggleVideo = (data) => {
    console.log('Participant toggled video:', data);
    // You could update UI to show remote participant's video status
    if (data.userId !== userInfo.id) {
      setSuccess(
        `${remoteParticipantName} turned ${data.enabled ? 'on' : 'off'} their camera`
      );
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Modify toggleMute to emit the event to the server
  const toggleMute = () => {
    if (localStreamRef.current) {
      const newMuteState = !isMuted;
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
      setIsMuted(newMuteState);

      // Notify server about audio state change
      if (socketRef.current) {
        socketRef.current.emit('toggleAudio', { enabled: !newMuteState });
      }

      trackEvent(
        'Interview Media',
        'Audio Toggle',
        newMuteState ? 'Muted' : 'Unmuted'
      );
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const newVideoState = !isVideoOff;
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !newVideoState;
      });

      if (newVideoState && localVideoRef.current) {
        const currentStream = localVideoRef.current.srcObject;
        localVideoRef.current.srcObject = null;
        setTimeout(() => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = currentStream;
            localVideoRef.current
              .play()
              .catch((err) => console.error('Error playing video:', err));
          }
        }, 150);
      }

      setIsVideoOff(newVideoState);

      // Notify server about video state change
      if (socketRef.current) {
        socketRef.current.emit('toggleVideo', { enabled: !newVideoState });
      }

      trackEvent(
        'Interview Media',
        'Video Toggle',
        newVideoState ? 'Video Off' : 'Video On'
      );
    }
  };

  const handleParticipantJoined = (data) => {
    console.log('Participant joined:', data);
    setRemoteParticipantName(data.participant.name);
    setRemoteParticipantRole(data.participant.role);
    setSuccess(`${data.participant.name} joined the call`);
    trackEvent(
      'Interview Participant',
      'Joined',
      `Participant joined: ${data.participant.name}`
    );
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleParticipantLeft = (data) => {
    console.log('Participant left:', data);
    const leftName = data.name || 'A participant';
    setMessage(`${leftName} left the call`);
    if (isConnected) {
      setIsConnected(false);
      setMessage('Call ended - other participant left');
      trackEvent(
        'Interview Participant',
        'Left',
        `Participant left: ${leftName}`
      );
    }
  };

  const handleCallEnded = (data) => {
    setMessage(data.message || 'Call has been ended');
    trackEvent('Interview Call', 'Ended', `Call ended by: ${data.endedBy}`);
    cleanup();

    navigate(
      userInfo.isInterviewer
        ? '/interviewer/interviews'
        : '/candidate/interviews'
    );
  };

  const endCall = () => {
    setMessage('Ending call...');
    trackEvent('Interview Call', 'User Action', 'User ended call');

    if (socketRef.current) {
      if (userInfo.isInterviewer) {
        // Only interviewers can end call for everyone
        socketRef.current.emit('endCall', { roomId });
      } else {
        // Candidates just leave the call
        socketRef.current.emit('leaveCallRoom');
      }
    }

    cleanup();

    navigate(
      userInfo.isInterviewer
        ? '/interviewer/interviews'
        : '/candidate/interviews'
    );
  };

  useEffect(() => {
    if (!userInfo || (!userInfo.isInterviewer && !userInfo.isCandidate)) {
      setError(
        'Only interviewers and candidates can access this page. Please log in.'
      );
      setIsLoading(false);
      return;
    }
    if (!roomId) {
      setError('Room ID is required to join the interview.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setMessage('Connecting to interview...');
    socketRef.current = io(`${SERVER_URL}/video-interviews`, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current.on('connect', () => {
      console.log('Connected to video socket server');
      setMessage('Connecting to interview room...');
      trackEvent(
        'Interview Socket',
        'Connection',
        'Socket connected successfully'
      );
      socketRef.current.emit('joinCallRoom', { roomId });
    });
    socketRef.current.on('connect_error', (err) => {
      if (err.message === 'Session expired. Please sign in again.') {
        setError('Session expired. Please sign in again.');
        setIsLoading(false);
        return;
      }
      console.error('Socket connection error:', err);
      setError(err.message);
      setIsLoading(false);
      trackEvent(
        'Interview Socket',
        'Error',
        `Socket connection error: ${err.message}`
      );
    });
    socketRef.current.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message || 'Error connecting to interview');
      setIsLoading(false);
      trackEvent('Interview Socket', 'Error', `Socket error: ${data.message}`);
    });
    socketRef.current.on('callRoomJoined', handleRoomJoined);
    socketRef.current.on('participantJoined', handleParticipantJoined);
    socketRef.current.on('offer', handleReceiveOffer);
    socketRef.current.on('answer', handleReceiveAnswer);
    socketRef.current.on('ice-candidate', handleReceiveIceCandidate);
    socketRef.current.on('participantLeft', handleParticipantLeft);
    socketRef.current.on('callEnded', handleCallEnded);
    socketRef.current.on('disconnect', handleDisconnect);
    socketRef.current.on(
      'participantToggleAudio',
      handleParticipantToggleAudio
    );
    socketRef.current.on(
      'participantToggleVideo',
      handleParticipantToggleVideo
    );

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      cleanup();
    };
  }, [roomId, accessToken, userInfo]);

  useEffect(() => {
    if (!userInfo || (!userInfo.isInterviewer && !userInfo.isCandidate)) {
      setError(
        'Only interviewers and candidates can access this page. Please log in.'
      );
      setIsLoading(false);
      return;
    }
    if (!roomId) {
      setError('Room ID is required to join the interview.');
      setIsLoading(false);
      return;
    }
    initializeMedia().catch((err) => {
      console.error('Failed to initialize media:', err);
      setError(err.message);
      setIsLoading(false);
    });
    return () => {
      cleanup();
    };
  }, [roomId, userInfo]);

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
        {isLoading && !localStreamRef.current ? (
          <div className="w-full max-w-sm sm:max-w-md relative flex flex-col items-center justify-center animate-fadeIn">
            <Loader />
            <p className="mt-4 text-light-text dark:text-dark-text">
              {message || 'Setting up interview...'}
            </p>
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

            {error && <Alert message={error} />}
            {success && <Alert isSuccess={true} message={success} />}
            {message && !error && !success && <Alert message={message} />}

            <div className="flex flex-col lg:flex-row gap-5 mb-5">
              <div className="flex-1 bg-light-surface/90 dark:bg-dark-surface/90 rounded-2xl overflow-hidden relative min-h-[350px] md:min-h-[450px] shadow-lg border border-light-border dark:border-dark-border/40 transition-all duration-300 group animate-slideUp">
                {isConnected ? (
                  <>
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-light-background/70 dark:from-dark-background/70 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-light-primary/20 dark:bg-dark-primary/30 flex items-center justify-center border-2 border-light-primary dark:border-dark-primary">
                          <span className="text-sm font-bold text-light-primary dark:text-dark-primary">
                            {remoteParticipantRole === 'interviewer'
                              ? 'I'
                              : 'C'}
                          </span>
                        </div>
                        <div>
                          <p className="text-light-text dark:text-dark-text text-sm font-medium">
                            {remoteParticipantName || 'Participant'}
                          </p>
                          <p className="text-light-text/70 dark:text-dark-text/70 text-xs">
                            {remoteParticipantRole === 'interviewer'
                              ? 'Interviewer'
                              : 'Candidate'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-light-background/70 dark:bg-dark-background/70 backdrop-blur-sm text-light-text dark:text-dark-text px-3 py-1.5 rounded-full flex items-center gap-2 transition-opacity duration-300">
                      <FaMicrophone
                        size={14}
                        className="text-light-primary dark:text-dark-primary"
                      />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 animate-pulse max-w-md">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-light-primary/20 dark:bg-dark-primary/20 flex items-center justify-center shadow-lg">
                        <FaVideo
                          className="text-light-primary dark:text-dark-primary"
                          size={36}
                        />
                      </div>
                      <p className="text-2xl font-medium text-light-text/70 dark:text-dark-text/70 mb-3">
                        Waiting for participant...
                      </p>
                      <p className="text-sm text-light-text/50 dark:text-dark-text/50 max-w-sm mx-auto">
                        The interview will begin once they join. Make sure your
                        camera and microphone are ready.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-1/3 h-72 lg:h-auto bg-light-surface dark:bg-dark-surface rounded-2xl overflow-hidden shadow-lg border border-light-border dark:border-dark-border/40 transition-all duration-300 relative animate-slideUp">
                {isVideoOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-light-surface dark:bg-dark-surface p-6">
                    <div className="w-28 h-28 rounded-full bg-light-primary/10 dark:bg-dark-primary/20 flex items-center justify-center mb-4 shadow-inner border-2 border-light-primary/30 dark:border-dark-primary/30">
                      <span className="text-3xl font-bold text-light-primary dark:text-dark-primary">
                        {userInfo?.firstName?.charAt(0) || ''}
                        {userInfo?.lastName?.charAt(0) || ''}
                        {!userInfo?.firstName && !userInfo?.lastName ? 'U' : ''}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-light-text dark:text-dark-text">
                      {userInfo?.firstName && userInfo?.lastName
                        ? `${userInfo.firstName} ${userInfo.lastName}`
                        : 'You'}
                    </h3>
                    <p className="text-sm text-light-text/70 dark:text-dark-text/70 mt-1 bg-light-primary/10 dark:bg-dark-primary/20 px-3 py-1 rounded-full">
                      {userInfo?.isInterviewer ? 'Interviewer' : 'Candidate'}
                    </p>
                    {isMuted && (
                      <div className="mt-4 bg-red-500/10 text-red-500 dark:text-red-400 px-4 py-2 rounded-full text-sm flex items-center gap-2 animate-pulse">
                        <FaMicrophoneSlash size={14} />
                        <span>Microphone Off</span>
                      </div>
                    )}
                    <div className="mt-5 text-center">
                      <button
                        onClick={toggleVideo}
                        className="text-sm text-light-primary dark:text-dark-primary underline flex items-center justify-center gap-2 mx-auto hover:opacity-80 transition-opacity"
                      >
                        <FaVideo size={14} />
                        Turn camera on
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {isMuted && (
                      <div className="absolute bottom-4 left-4 bg-red-500/80 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 animate-pulse">
                        <FaMicrophoneSlash size={12} />
                        <span>Microphone Off</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-light-background/70 dark:bg-dark-background/70 backdrop-blur-sm text-light-text dark:text-dark-text px-3 py-1.5 rounded-full text-xs">
                      You
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 md:p-6 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-2xl border border-light-border dark:border-dark-border/40 shadow-md animate-slideUp">
              <div className="flex flex-wrap justify-center items-center gap-5 md:gap-8">
                <button
                  onClick={toggleMute}
                  className={`p-4 md:p-5 rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center ${
                    isMuted
                      ? 'bg-red-500 dark:bg-red-600 text-white'
                      : 'bg-light-primary dark:bg-dark-primary text-white'
                  }`}
                  aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? (
                    <FaMicrophoneSlash size={22} />
                  ) : (
                    <FaMicrophone size={22} />
                  )}
                </button>

                <button
                  onClick={endCall}
                  className="p-5 md:p-6 rounded-full bg-red-600 dark:bg-red-700 text-white transition-all duration-300 hover:bg-red-700 dark:hover:bg-red-800 hover:scale-105 shadow-lg"
                  aria-label={
                    userInfo?.isInterviewer
                      ? 'End call for everyone'
                      : 'Leave call'
                  }
                >
                  <FaPhoneSlash size={24} />
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-4 md:p-5 rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center ${
                    isVideoOff
                      ? 'bg-red-500 dark:bg-red-600 text-white'
                      : 'bg-light-primary dark:bg-dark-primary text-white'
                  }`}
                  aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoOff ? (
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

            {interviewDetails && (
              <div className="mt-6 p-5 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-light-border dark:border-dark-border/40 shadow-sm animate-slideUp">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2 flex items-center gap-2">
                  <span className="h-5 w-1 bg-light-primary dark:bg-dark-primary rounded-full"></span>
                  Interview Details
                </h3>
                <p className="text-sm text-light-text/80 dark:text-dark-text/80">
                  {interviewDetails.title || 'Interview Session'}
                </p>
                {interviewDetails.company && (
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60 mt-1">
                    Company: {interviewDetails.company}
                  </p>
                )}
                {interviewDetails.description && (
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60 mt-1">
                    {interviewDetails.description}
                  </p>
                )}
                {interviewDetails.scheduledTime && (
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60 mt-1">
                    Scheduled at:{' '}
                    {new Date(interviewDetails.scheduledTime).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default InterviewScreen;
