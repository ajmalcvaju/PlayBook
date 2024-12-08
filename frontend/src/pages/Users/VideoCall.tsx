import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { start } from 'repl';
import { io } from 'socket.io-client';

const VideoCall = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();
  const socket = io('http://localhost:7000'); // Replace with your backend URL

  useEffect(() => {
     const pc = new RTCPeerConnection();
        setPeerConnection(pc); // Set the peer connection

        // Get local media stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
            setStream(mediaStream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = mediaStream;
            }
            mediaStream.getTracks().forEach((track) => {
                if (pc.signalingState !== "closed") {
                    pc.addTrack(track, mediaStream);
                }
            });
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", { roomId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
    socket.on('offer', async (offer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
      }
    });

    socket.on('answer', async (answer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('candidate', async (candidate) => {
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [peerConnection]);

  const startCall = async () => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', offer);

    setPeerConnection(pc);
    setIsCallActive(true);
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setIsCallActive(false);
  };
  const handleClose=()=>{
    navigate(-1)
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-4xl w-full relative">
    <button 
      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      onClick={handleClose} // Replace with your function to close the popup
    >
      &times;
    </button>
    <h1 className="text-2xl font-bold mb-4">Hi</h1>
    <div className="flex items-center p-4 bg-gray-50 rounded-md">
      <video 
        ref={localVideoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-1/2 h-40 bg-black rounded-md mr-2" 
      />
      <video 
        ref={remoteVideoRef} 
        autoPlay 
        playsInline 
        className="w-1/2 h-40 bg-black rounded-md" 
      />
    </div>
    <button onClick={startCall}>Start</button>
  </div>
</div>

  )
}

export default VideoCall
