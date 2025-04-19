import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const VideoInterview = () => {
  const [socket, setSocket] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const { roomId } = useParams();
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const newSocket = io('http://localhost:5000/video-interviews', {
      auth: { token: accessToken },
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to signaling server');
      newSocket.emit('joinCallRoom', { roomId });
    });

    newSocket.on('callRoomJoined', async (data) => {
      console.log('Joined call room:', data);
      await startLocalStream();
    });

    newSocket.on('participantJoined', async ({ participant }) => {
      console.log('Participant joined:', participant);
      await createOffer();
    });

    newSocket.on('offer', async ({ from, offer }) => {
      await handleOffer(from, offer);
    });

    newSocket.on('answer', async ({ answer }) => {
      await handleAnswer(answer);
    });

    newSocket.on('ice-candidate', async ({ candidate }) => {
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    newSocket.on('participantLeft', ({ id }) => {
      console.log('Participant left:', id);
    });

    newSocket.on('callEnded', ({ message }) => {
      console.log('Call ended:', message);
      endCall();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    setPeerConnection(pc);
    return pc;
  };

  const createOffer = async () => {
    const pc = createPeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (socket) {
        socket.emit('offer', { offer });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (from, offer) => {
    const pc = createPeerConnection();
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (socket) {
        socket.emit('answer', { answer });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    } catch (error) {
      console.error('Error setting remote description:', error);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const enabled = !audioEnabled;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
      setAudioEnabled(enabled);
      if (socket) {
        socket.emit('toggleAudio', { enabled });
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const enabled = !videoEnabled;
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
      setVideoEnabled(enabled);
      if (socket) {
        socket.emit('toggleVideo', { enabled });
      }
    }
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }
    if (socket) {
      socket.emit('endCall');
    }
  };

  return (
    <div>
      <h2>Video Interview</h2>
      <div>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '300px' }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '300px' }}
        />
      </div>
      <div>
        <button onClick={toggleAudio}>
          {audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
        </button>
        <button onClick={toggleVideo}>
          {videoEnabled ? 'Stop Video' : 'Start Video'}
        </button>
        <button onClick={endCall}>End Call</button>
      </div>
    </div>
  );
};

export default VideoInterview;
