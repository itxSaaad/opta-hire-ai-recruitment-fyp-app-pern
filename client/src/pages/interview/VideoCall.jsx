import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'webrtc-adapter';
import {
  FaVideoSlash,
  FaVideo,
  FaMicrophoneSlash,
  FaMicrophone,
} from 'react-icons/fa';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [peerConn] = useState(
    () =>
      new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })
  );

  const [joined, setJoined] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // Hooks
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { userInfo: user, accessToken } = useSelector((state) => state.auth);

  const socket = io(`${SERVER_URL}/video-interviews`, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'], // Add polling as fallback
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000, // Increase timeout
    withCredentials: true,
  });

  useEffect(() => {
    // When server confirms you've joined
    socket.on('callRoomJoined', () => {
      setJoined(true);
    });

    // When another participant arrives
    socket.on('participantJoined', () => {
      // The second peer triggers offer/answer cycle
      doOffer();
    });

    socket.on('offer', async ({ offer }) => {
      if (peerConn.signalingState !== 'stable') {
        console.warn('Unexpected offer in state', peerConn.signalingState);
        return;
      }
      await peerConn.setRemoteDescription(offer);
      const answer = await peerConn.createAnswer();
      await peerConn.setLocalDescription(answer);
      socket.emit('answer', { roomId: roomId, answer });
      setCallActive(true);
    });

    socket.on('answer', async ({ from, answer }) => {
      await peerConn.setRemoteDescription(answer);
      setCallActive(true);
    });

    socket.on('ice-candidate', ({ candidate }) => {
      peerConn.addIceCandidate(candidate).catch(console.error);
    });

    // When peer leaves
    socket.on('participantLeft', () => {
      remoteVideoRef.current.srcObject = null;
      setCallActive(false);
    });

    socket.on('participantToggleVideo', ({ enabled }) => {
      const stream = remoteVideoRef.current?.srcObject;
      stream?.getVideoTracks().forEach((t) => (t.enabled = enabled));
    });
    socket.on('participantToggleAudio', ({ enabled }) => {
      const stream = remoteVideoRef.current?.srcObject;
      stream?.getAudioTracks().forEach((t) => (t.enabled = enabled));
    });

    return () => {
      socket.off('participantToggleVideo');
      socket.off('participantToggleAudio');
    };
  }, [peerConn]);

  useEffect(() => {
    async function startMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => peerConn.addTrack(track, stream));
    }
    startMedia();
  }, [peerConn]);

  useEffect(() => {
    peerConn.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('ice-candidate', { roomId: roomId, candidate });
      }
    };
  }, [peerConn]);

  useEffect(() => {
    peerConn.ontrack = ({ streams: [stream] }) => {
      remoteVideoRef.current.srcObject = stream;
    };
  }, [peerConn]);

  async function doOffer() {
    const offer = await peerConn.createOffer();
    await peerConn.setLocalDescription(offer);
    socket.emit('offer', { roomId: roomId, offer });
  }

  const joinCall = () => socket.emit('joinCallRoom', { roomId: roomId });
  const leaveCall = () => {
    socket.emit('leaveCallRoom');
    setJoined(false);
    setCallActive(false);
  };

  const toggleMic = () => {
    const track = localVideoRef.current.srcObject.getAudioTracks()[0];
    track.enabled = !micOn;
    setMicOn(!micOn);
    socket.emit('toggleAudio', { enabled: !micOn });
  };

  const toggleCam = () => {
    const track = localVideoRef.current.srcObject.getVideoTracks()[0];
    track.enabled = !camOn;
    setCamOn(!camOn);
    socket.emit('toggleVideo', { enabled: !camOn });
  };

  return (
    <section className="min-h-screen flex flex-col items-center p-4 bg-light-background dark:bg-dark-background animate-fadeIn">
      <h3>Video Interview</h3>
      <video ref={localVideoRef} autoPlay muted style={{ width: '40%' }} />
      <video ref={remoteVideoRef} autoPlay style={{ width: '40%' }} />
      <div className="p-4 md:p-6 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-2xl border border-light-border dark:border-dark-border/40 shadow-md animate-slideUp">
        <div className="flex flex-wrap justify-center items-center gap-5 md:gap-8">
          <button
            onClick={toggleMic}
            className={`p-4 md:p-5 rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center ${
              micOn
                ? 'bg-red-500 dark:bg-red-600 text-white'
                : 'bg-light-primary dark:bg-dark-primary text-white'
            }`}
            aria-label={micOn ? 'Unmute microphone' : 'Mute microphone'}
          >
            {micOn ? (
              <FaMicrophoneSlash size={22} />
            ) : (
              <FaMicrophone size={22} />
            )}
          </button>
          {!joined ? (
            <button onClick={joinCall}>Join Call</button>
          ) : (
            <button onClick={leaveCall}>Leave Call</button>
          )}
          <button
            onClick={toggleCam}
            className={`p-4 md:p-5 rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center ${
              camOn
                ? 'bg-red-500 dark:bg-red-600 text-white'
                : 'bg-light-primary dark:bg-dark-primary text-white'
            }`}
            aria-label={camOn ? 'Turn on camera' : 'Turn off camera'}
          >
            {camOn ? <FaVideoSlash size={22} /> : <FaVideo size={22} />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default VideoCall;
