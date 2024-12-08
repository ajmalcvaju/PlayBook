import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const ChatWithTurf = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  const socket = io('http://localhost:7000'); // Replace with your backend URL

  useEffect(() => {
    socket.on('chat message', (msg: string) => {
      setMessages((prev) => [...prev, { text: msg, isUser: false }]);
    });

    // socket.on('offer', async (offer) => {
    //   if (peerConnection) {
    //     await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    //     const answer = await peerConnection.createAnswer();
    //     await peerConnection.setLocalDescription(answer);
    //     socket.emit('answer', answer);
    //   }
    // });

    // socket.on('answer', async (answer) => {
    //   if (peerConnection) {
    //     await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    //   }
    // });

    // socket.on('candidate', async (candidate) => {
    //   if (peerConnection) {
    //     await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    //   }
    // });

    return () => {
      socket.disconnect();
    };
  }, [peerConnection]);

  const startCall = async () => {
    navigate("video-call-turf")
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setIsCallActive(false);
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      socket.emit('chat message', currentMessage);
      setMessages((prev) => [...prev, { text: currentMessage, isUser: true }]);
      setCurrentMessage('');
    }
  };

  const cancel = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex justify-center items-center">
      <div className="bg-white flex flex-col rounded-lg shadow-2xl w-full md:w-1/2 h-full md:h-3/4">
        <div className="bg-gradient-to-r from-green-500 to-teal-400 text-white p-4 rounded-t-lg text-center font-bold text-lg flex justify-between items-center">
          <span>Chat with Turf</span>
          <button onClick={cancel} className="text-white hover:text-gray-200">
            &#x2715;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-200">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mt-2`}>
              <div
                className={`max-w-xs p-3 rounded-xl shadow-lg text-sm transition-transform transform hover:scale-105 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                    : 'bg-gradient-to-r from-gray-300 to-gray-400 text-black'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center p-4 border-t border-gray-300 bg-white">
          {isCallActive ? (
            <button
              onClick={endCall}
              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 focus:outline-none transition-transform transform hover:scale-105"
            >
              End Call
            </button>
          ) : (
            <button
              onClick={startCall}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-full hover:from-blue-500 hover:to-blue-700 focus:outline-none transition-transform transform hover:scale-105"
            >
              Start Call
            </button>
          )}

          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full p-3 mx-2 focus:outline-none bg-gray-100 text-sm placeholder-gray-500"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <button
            className="bg-gradient-to-r from-green-400 to-teal-500 text-white p-3 rounded-full hover:from-green-500 hover:to-teal-600 focus:outline-none transition-transform transform hover:scale-105"
            onClick={handleSendMessage}
          >
            &#x27A4;
          </button>
        </div>

        {/* <div className="flex items-center p-4 bg-gray-50">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 h-40 bg-black rounded-md mr-2" />
          <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 h-40 bg-black rounded-md" />
        </div> */}
      </div>
      <Outlet/>
    </div>
  );
};

export default ChatWithTurf;
