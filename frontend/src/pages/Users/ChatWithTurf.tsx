import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const ChatWithTurf = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const socketConnection = io('http://localhost:7000'); // Connect to the backend server

    socketConnection.on('chat message', (msg: string) => {
      // Append the received message to the messages state
      setMessages((prevMessages) => [...prevMessages, { text: msg, isUser: false }]);
    });

    return () => {
      socketConnection.disconnect(); // Clean up on unmount
    };
  }, []);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const socket = io('http://localhost:7000');
      socket.emit('chat message', currentMessage); // Send message to the server
      setMessages((prevMessages) => [...prevMessages, { text: currentMessage, isUser: true }]); // Display user's message locally
      setCurrentMessage(''); // Clear input field
    }
  };

  const cancel = () => {
    navigate(-1); // Navigate back on cancel
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex justify-center items-center">
      <div className="bg-white flex flex-col rounded-lg shadow-2xl w-full md:w-1/2 h-full md:h-3/4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-400 text-white p-4 rounded-t-lg text-center font-bold text-lg flex justify-between items-center">
          <span>Chat with Turf</span>
          <button onClick={cancel} className="text-white hover:text-gray-200">
            &#x2715;
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-200">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mt-2`}>
              <div
                className={`max-w-xs p-3 rounded-xl shadow-lg text-sm transition-transform transform hover:scale-105 ${
                  message.isUser ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-gray-300 to-gray-400 text-black'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center p-4 border-t border-gray-300 bg-white">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full p-3 mr-2 focus:outline-none bg-gray-100 text-sm placeholder-gray-500"
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
      </div>
    </div>
  );
};

export default ChatWithTurf;
