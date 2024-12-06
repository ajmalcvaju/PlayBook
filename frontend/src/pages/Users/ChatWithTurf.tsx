import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

const VideoCall = () => {
  const [socket, setSocket] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  useEffect(() => {
    const socketInstance = io('http://localhost:5000');
    setSocket(socketInstance);

    socketInstance.on('receiveCall', async ({ offer, from }) => {
      setRemoteSocketId(from);
      peerConnectionRef.current = createPeerConnection(socketInstance, from);

      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketInstance.emit('answerCall', { answer, to: from });
    });

    socketInstance.on('callAnswered', async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(answer);
    });

    socketInstance.on('iceCandidate', ({ candidate }) => {
      peerConnectionRef.current.addIceCandidate(candidate);
    });

    return () => socketInstance.disconnect();
  }, []);

  const createPeerConnection = (socket, remoteSocketId) => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('iceCandidate', { candidate, to: remoteSocketId });
      }
    };

    peerConnection.ontrack = (event) => {
      remoteStreamRef.current.srcObject = event.streams[0];
    };

    localStreamRef.current.srcObject.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current.srcObject);
    });

    return peerConnection;
  };

  const startCall = async () => {
    if (!remoteSocketId) return;

    peerConnectionRef.current = createPeerConnection(socket, remoteSocketId);
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    socket.emit('callUser', { offer, to: remoteSocketId });
    setIsCalling(true);
  };

  const setupLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current.srcObject = stream;
  };

  useEffect(() => {
    setupLocalStream();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
      <h1 className="text-4xl font-extrabold mb-6">Video Call</h1>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex flex-col items-center">
          <video
            ref={localStreamRef}
            autoPlay
            muted
            className="w-64 h-48 md:w-80 md:h-60 rounded-lg border-4 border-gray-700 shadow-lg"
          />
          <p className="mt-2 text-sm italic text-gray-400">Your Video</p>
        </div>

        <div className="flex flex-col items-center">
          <video
            ref={remoteStreamRef}
            autoPlay
            className="w-64 h-48 md:w-80 md:h-60 rounded-lg border-4 border-gray-700 shadow-lg"
          />
          <p className="mt-2 text-sm italic text-gray-400">Remote Video</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Enter remote socket ID"
          value={remoteSocketId}
          onChange={(e) => setRemoteSocketId(e.target.value)}
          className="w-64 md:w-80 p-2 rounded-lg border-2 border-gray-700 bg-gray-800 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={startCall}
          className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 px-6 rounded-lg shadow-lg"
        >
          Start Call
        </button>
      </div>

      {isCalling && (
        <p className="mt-4 text-lg font-medium text-green-400 animate-pulse">
          Calling...
        </p>
      )}
    </div>
  );
};

export default VideoCall;