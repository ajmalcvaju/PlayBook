import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import apiClient from "../../apiClient";
import axios from "axios";

interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  isVerified: number;
  isApproved: number;
  __v: number;
  latitude: number;
  longitude: number;
  locationName: string;
  isOnline: boolean;
  lastSeen: string;
}
type Message = {
  _id: string;
  isUser: boolean;
  type: "text" | "image" | "audio" | "video"; // Adjust this if you have other types
  text: string; // For text, image, and media messages
  createdAt: string; // Or Date depending on how it's stored
};
type GroupedMessages = {
  [date: string]: Message[];
};
interface UserState {
  currentUser: CurrentUser;
}
interface RootState {
  user: UserState;
}

const groupMessagesByDate = (messages: any) => {
  return messages.reduce((grouped: any, message: any) => {
    const date = new Date(message?.createdAt).toLocaleDateString(); // Get the date only
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(message);
    return grouped;
  }, {});
};

const ChatWithTurf = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<
    { text: string | any; isUser: boolean }[]
  >([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [callModel, setCallModel] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messageCancelModel, setMessageCancelModel] = useState(false);
  const [visibleSection, setVisibleSection] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const userId = currentUser._id;
  const turfId = id;
  const location = useLocation(); // Get the location object
  const { videoCallConnection, videoCallDecline } = location.state || {};
  const [showPopup, setShowPopup] = useState(false);
  const socket = io("http://localhost:7000");
  const [declinePopup, setDeclinePopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const videoChunks = useRef<Blob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [online, setOnine] = useState("");

  useEffect(() => {
    if (videoCallConnection) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [videoCallConnection]);

  const toggleMenu = () => {
    setVisibleSection(null);
    setUploaded(false);
    setIsCameraOpen(false);
    setIsVideoOpen(false);
    setVideoBlob(null);
    setImageData(null);
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    socket.emit("user-online", userId);
    socket.on("user-status", (data) => {
      if (data.userId === turfId) {
        setOnine(data.status);
      }
    });

    return () => {
      socket.emit("user-offline", userId);
    };
  }, [userId, messages]);

  useEffect(() => {
    if (videoCallDecline) {
      setDeclinePopup(true);
      const timer = setTimeout(() => {
        setDeclinePopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [videoCallDecline]);

  useEffect(() => {
    socket.emit("joinTurf", { turfId, userId });
    socket.on("message", (data) => {
      console.log(data);
      console.log("hi")
      if (data.receiverId == userId) {
        loadPreviousMessages();
        // setMessages((prev) => [
        //   ...prev,
        //   { text: data.message, isUser: false, createdAt: data.time,type:data.type },
        // ]);
      }
    });
    return () => {
      socket.off("message");
    };
  }, [socket, turfId, userId]);
  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      socket.emit("sendMessage", {
        message: currentMessage,
        senderId: userId,
        recieverId: turfId,
        time: Date.now(),
        type: "text",
      });
      setMessages((prev) => [
        ...prev,
        {
          text: currentMessage,
          isUser: true,
          createdAt: Date.now(),
          type: "text",
        },
      ]);
      setCurrentMessage("");
      loadPreviousMessages();
    }
  };
  const loadPreviousMessages = async () => {
    try {
      setMessages([]);
      const response = await apiClient.get(`/users/get-messages`, {
        params: {
          sender: userId,
          reciever: turfId,
        },
      });
      const messages = response.data.messages;
      console.log(messages);
      for (let msg of messages) {
        if (msg.senderId === userId) {
          setMessages((prev) => [
            ...prev,
            {
              text: msg.message,
              isUser: true,
              _id: msg._id,
              createdAt: msg.createdAt,
              type: msg.type,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: msg.message,
              isUser: false,
              _id: msg._id,
              createdAt: msg.createdAt,
              type: msg.type,
            },
          ]);
        }
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };
  useEffect(() => {
    loadPreviousMessages();
  }, []);
  const handleEmojiClick = (emojiObject: any) => {
    setCurrentMessage((prev) => prev + emojiObject.emoji);
  };
  const cancel = () => {
    navigate(`/turf-page/${id}`);
  };
  const groupedMessages: GroupedMessages = groupMessagesByDate(messages);
  const handleCall = () => {
    console.log("hi");
    setCallModel(true);
    console.log(callModel);
  };
  const audioCall = () => {
    setCallModel(false);
    navigate("audio-call");
  };
  const videoCall = () => {
    setCallModel(false);
    navigate("video-call");
  };
  useEffect(() => {
    socket.on("cancelNotification", ({ turfId }) => {
      console.log(turfId);
      setMessageCancelModel(true);
    });

    return () => {
      socket.off("cancelNotification");
    };
  }, []);
  useEffect(() => {
    if (messagesEndRef.current && !showContextMenu) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" }); // Initial scroll
    }
  }, [groupedMessages]);
  const toggleVisibility = (section: any) => {
    setVisibleSection(visibleSection === section ? null : section);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
    resetRecording();
  };

  // Start recording
  const startRecording = async () => {
    try {
      resetRecording();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        audioChunks.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };

  // Timer logic
  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setIsRecording(false);
    setElapsedTime(0);
    setAudioBlob(null);
    stopTimer();
  };

  // Send audio to backend
  const sendMediaToBackend = async (mediaType: any, mediaData: any) => {
    try {
      let mediaUrl;
      setUploading(true);
      if (mediaType === "image") {
        if (!mediaData) throw new Error("No image data available.");

        const formData = new FormData();
        if (mediaData instanceof Blob) {
          formData.append("file", mediaData);
        } else if (
          typeof mediaData === "string" &&
          mediaData.startsWith("data:image/")
        ) {
          const byteString = atob(mediaData.split(",")[1]);
          const mimeString = mediaData
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], { type: mimeString });
          formData.append("file", blob);
        } else {
          throw new Error("Invalid image data type.");
        }
        formData.append("upload_preset", "playbook_Message");
        formData.append("cloud_name", "diffyfwwy");
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/diffyfwwy/image/upload`,
          formData
        );
        if (!response.data || !response.data.secure_url) {
          setUploading(false);
          throw new Error("Failed to upload image to Cloudinary.");
        }
        mediaUrl = response.data.secure_url;
      } else if (mediaType === "audio" || mediaType === "video") {
        if (!mediaData) throw new Error(`No ${mediaType} data available.`);
        const formData = new FormData();
        formData.append("file", mediaData);
        formData.append("upload_preset", "playbook_Message"); // Your Cloudinary preset
        formData.append("cloud_name", "diffyfwwy"); // Your Cloudinary cloud name
        let cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/diffyfwwy/upload`;
        if (mediaType === "video") {
          formData.append("resource_type", "video");
        } else if (mediaType === "audio") {
          formData.append("resource_type", "raw"); // For audio, it's "raw"
        }
        const response = await axios.post(cloudinaryEndpoint, formData);
        if (!response.data || !response.data.secure_url) {
          throw new Error(`Failed to upload ${mediaType} to Cloudinary.`);
        }
        mediaUrl = response.data.secure_url; // Permanent URL for video/audio
      } else {
        setUploading(false);
        throw new Error("Unsupported media type.");
      }
      setUploaded(true);
      socket.emit("sendMessage", {
        message: mediaUrl,
        senderId: userId,
        recieverId: turfId,
        time: Date.now(),
        type: mediaType,
      });

      setMessages((prev) => [
        ...prev,
        {
          text: mediaUrl,
          isUser: true,
          createdAt: Date.now(),
          type: mediaType,
        },
      ]);
      loadPreviousMessages();
      setCurrentMessage("");
    } catch (error: any) {
      console.error(`Error sending ${mediaType} to backend:`, error.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleCamera = () => {
    if (isCameraOpen) {
      stopCamera();
    } else {
      startCamera();
    }
    setIsCameraOpen(!isCameraOpen);
  };
  const toggleVideo = () => {
    if (isCameraOpen) {
      stopCamera();
    } else {
      startCamera();
    }
    setIsVideoOpen(!isVideoOpen);
  };

  // Start the Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStream(stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Stop the Camera
  const stopCamera = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  // Take Snapshot
  const takeSnapshot = () => {
    setImageData(null);
    const video = videoRef.current;
    if (!video) {
      console.error("Video element is not available");
      return;
    }
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Failed to get canvas context");
      return;
    }
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setImageData(dataUrl);
  };

  const handleRetake = () => {
    setImageData(null);
    startCamera();
  };
  const startVideoRecording = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(videoStream);
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream; // Assign stream to video element
      }

      const mediaRecorder = new MediaRecorder(videoStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunks.current, { type: "video/webm" });
        setVideoBlob(blob);
        videoChunks.current = [];
        videoStream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Stop video recording
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Retake video
  const retakeVideo = () => {
    setVideoBlob(null);
    startVideoRecording();
  };
  const handleMediaUpload = (event: any, mediaType: any) => {
    const file = event.target.files[0];
    sendMediaToBackend(mediaType, file);
  };

  const handleContextMenu = (e: any, messageId: any) => {
    e.preventDefault(); // Prevent the default context menu
    setSelectedMessageId(messageId);
    setShowContextMenu(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    deleteMessage(selectedMessageId);
    setShowContextMenu(false);
  };

  const deleteMessage = (id: any) => {
    socket.emit("delete-message", id);
  };

  const closeContextMenu = () => {
    setSelectedMessageId(null);
    setShowContextMenu(false);
  };
  useEffect(() => {
    socket.on("message-deleted", (deletedMessageId) => {
      console.log(deletedMessageId);
      loadPreviousMessages();
    });
    return () => {
      socket.off("message-deleted");
    };
  }, []);

  return (
    <>
      <Outlet />
      {messageCancelModel && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full md:w-1/2 lg:w-1/3 space-y-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 text-2xl hover:text-gray-700 focus:outline-none"
              onClick={() => setMessageCancelModel(false)} // Close the popup on click
            >
              &times;
            </button>
            <div className="text-center">
              <div className="flex justify-center mb-4"></div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                Turf Owner is Unavailable
              </h1>
              <p className="mt-3 text-gray-600 text-lg">
                The turf owner is currently unavailable. They will get back to
                you as soon as possible. Thank you for your patience!
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setMessageCancelModel(false)} // Close the popup
                className="px-5 py-2 bg-blue-600 text-white text-lg rounded hover:bg-blue-700 focus:outline-none transition"
              >
                Okay, Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-green-600 text-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-semibold">
              Thank you for calling Turf!
            </h2>
            <p className="mt-2 text-lg">
              We hope this call was helpful. If you are not able to connect, Our
              turf owners will get back to you shortly!
            </p>
          </div>
        </div>
      )}
      {declinePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-red-600 text-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-semibold">Turf declined your call</h2>
            <p className="mt-2 text-lg">
              The turf owner is unavailable right now.
            </p>
          </div>
        </div>
      )}
      {callModel && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 ease-out opacity-100">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-4/5 sm:w-3/4 md:w-1/2 text-center transform transition-transform duration-300 ease-out scale-105 hover:scale-105">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Choose Call Type
            </h2>
            <div className="space-x-14 flex justify-center mb-6">
              <button
                onClick={videoCall}
                className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-5 py-2 rounded-2xl shadow-xl hover:scale-110 transition-transform transform"
              >
                Video Call
              </button>
              <button
                onClick={audioCall}
                className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-5 py-2 rounded-2xl shadow-xl hover:scale-110 transition-transform transform"
              >
                Audio Call
              </button>
            </div>
            <button
              onClick={() => setCallModel(false)}
              className="mt-4 bg-gradient-to-r from-red-600 to-red-500 text-white hover:bg-red-700 px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-all ease-in-out duration-300 transform"
            >
              <span className="font-semibold text-lg">Cancel</span>
            </button>
          </div>
        </div>
      )}
      {showContextMenu && (
        <div
          className="fixed bg-white shadow-lg rounded-md p-2 text-sm z-50"
          style={{
            top: `${contextMenuPosition.y}px`,
            left: `${contextMenuPosition.x}px`,
          }}
          onMouseLeave={closeContextMenu}
        >
          <button
            className="text-red-500 hover:text-red-700"
            onClick={handleDelete}
          >
            Delete Message
          </button>
        </div>
      )}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
        <div className="bg-white flex flex-col rounded-lg shadow-2xl w-full md:w-3/4 h-full md:h-5/6">
          {/* Header */}
          <div
            className={`bg-gradient-to-r ${
              online === "online"
                ? "from-green-400 to-teal-500"
                : "from-gray-400 to-gray-500"
            } text-white p-4 rounded-t-lg text-center font-bold text-lg flex justify-between items-center transition-all duration-300`}
          >
            <span>
              Chat with Turf{" "}
              <span
                className={`ml-2 px-2 py-1 text-sm font-medium rounded-full ${
                  online === "online" ? "bg-green-700" : "bg-gray-700"
                }`}
              >
                {online === "online" ? "Online" : "Offline"}
              </span>
            </span>
            <button onClick={cancel} className="text-white hover:text-gray-200">
              &#x2715;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-200">
            <div>
              {Object.entries(groupedMessages).map(
                ([date, messages]: [string, Message[]], index) => (
                  <div key={index}>
                    {/* Show the date */}
                    <div className="text-center text-gray-500 text-sm my-2">
                      {date}
                    </div>

                    {/* Render messages for this date */}
                    {messages.map((message: Message, index: number) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.isUser ? "justify-end" : "justify-start"
                        } mt-2`}
                      >
                        <div
                          className={`relative max-w-xs p-3 rounded-xl shadow-lg text-sm transition-transform transform hover:scale-105 ${
                            message.isUser
                              ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                              : "bg-gradient-to-r from-gray-300 to-gray-400 text-black"
                          }`}
                          {...(message.isUser && {
                            onContextMenu: (e) =>
                              handleContextMenu(e, message._id),
                          })}
                        >
                          {/* Conditional rendering based on message type */}
                          {message.type === "text" ? (
                            <div>{message.text}</div>
                          ) : message.type === "image" ? (
                            <img
                              src={message.text} // Assume the image data is a URL or base64
                              alt="Sent"
                              className="rounded-lg shadow-md max-h-48"
                            />
                          ) : message.type === "audio" ? (
                            <audio
                              controls
                              className="mt-6 w-[280px] max-w-full rounded-md shadow-md"
                            >
                              <source src={message.text} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          ) : message.type === "video" ? (
                            <video
                              controls
                              className="w-full rounded-lg shadow-md max-h-48"
                            >
                              <source src={message.text} type="video/mp4" />
                              Your browser does not support the video element.
                            </video>
                          ) : (
                            <div className="text-gray-500 italic">
                              Unsupported message type
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(message?.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              <div ref={messagesEndRef}></div>
            </div>
          </div>

          <div className="flex items-center p-4 border-t border-gray-300 bg-white relative">
            <button
              className="text-2xl p-2 hover:bg-gray-200 rounded-full focus:outline-none"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              🙂
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 bg-white shadow-lg rounded-lg z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 text-black rounded-full p-3 mx-2 focus:outline-none bg-gray-100 text-sm placeholder-gray-500"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />

            {/* File upload buttons */}
            <div className="relative">
              {/* + Button */}
              <button
                onClick={toggleMenu}
                className={`w-12 h-12 flex items-center justify-center bg-gradient-to-r from-gray-700 via-gray-800 to-black text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 hover:rotate-45 transition-all duration-300 transform ${
                  isOpen && !uploaded ? "rotate-45" : ""
                }`}
              >
                ➕
              </button>

              {/* Hidden content (image, video, audio upload options) */}
              {isOpen && !uploaded && (
                <div className="absolute bottom-8 right-12 flex flex-col items-center space-y-10 bg-gray-700 bg-opacity-90 p-8 rounded-2xl shadow-2xl">
                  {/* Image Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <label
                      className="cursor-pointer"
                      onClick={() => toggleVisibility("image")}
                    >
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-full hover:scale-110 hover:shadow-lg transition-transform flex justify-center items-center">
                        🖼️
                      </span>
                    </label>
                    {visibleSection === "image" && (
                      <div className="flex space-x-4">
                        <button className="relative text-lg bg-blue-500 text-white py-3 px-6 rounded-full hover:bg-blue-600 hover:shadow-md transition-all cursor-pointer">
                          ⬆️
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleMediaUpload(event, "image")
                            }
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </button>
                        <button
                          className="text-lg bg-indigo-500 text-white py-3 px-6 rounded-full hover:bg-indigo-600 hover:shadow-md transition-all"
                          onClick={toggleCamera}
                        >
                          📷
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Camera UI */}
                  {isCameraOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                      <div className="relative bg-gradient-to-tl from-green-400 to-blue-500 rounded-2xl p-12 w-96 shadow-2xl">
                        {/* Close Button */}
                        <button
                          className="absolute top-4 right-4 text-white hover:text-gray-200 text-3xl transition-all"
                          onClick={toggleCamera}
                        >
                          ✖️
                        </button>

                        <h2 className="text-3xl font-semibold text-white mb-6 text-center tracking-wide">
                          Camera
                        </h2>
                        <div className="flex flex-col items-center space-y-6">
                          {/* Camera Video Feed */}
                          {!imageData && (
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full rounded-md shadow-md"
                            ></video>
                          )}

                          {/* Conditional Button: Take Snapshot or Retake */}
                          <button
                            className="text-lg bg-yellow-500 text-white py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                            onClick={imageData ? handleRetake : takeSnapshot}
                          >
                            {imageData ? "🔄 Retake" : "📸 Take Snapshot"}
                          </button>

                          {/* Preview Image */}
                          {imageData && (
                            <div className="mt-6">
                              <img
                                src={imageData}
                                alt="Preview"
                                className="w-full rounded-md shadow-md"
                              />
                            </div>
                          )}

                          {/* Upload Button */}
                          {imageData && (
                            <button
                              className={`text-lg py-3 px-8 rounded-full shadow-lg transition-all ${
                                uploading
                                  ? "bg-indigo-300 text-gray-500 cursor-not-allowed"
                                  : "bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-110 hover:shadow-xl"
                              }`}
                              onClick={() =>
                                sendMediaToBackend("image", imageData)
                              }
                              disabled={uploading}
                            >
                              {uploading ? "Sending..." : "Send"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <label
                      className="cursor-pointer"
                      onClick={() => toggleVisibility("video")}
                    >
                      <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-5 rounded-full hover:scale-110 hover:shadow-lg transition-transform flex justify-center items-center">
                        🎥
                      </span>
                    </label>
                    {visibleSection === "video" && (
                      <div className="flex space-x-4">
                        <button className="relative text-lg bg-purple-500 text-white py-3 px-6 rounded-full hover:bg-purple-600 hover:shadow-md transition-all cursor-pointer">
                          ⬆️
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(event) =>
                              handleMediaUpload(event, "video")
                            }
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </button>
                        <button
                          className="text-lg bg-pink-500 text-white py-3 px-6 rounded-full hover:bg-pink-600 hover:shadow-md transition-all"
                          onClick={toggleVideo}
                        >
                          🎬
                        </button>
                      </div>
                    )}
                  </div>
                  {isVideoOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                      <div className="relative bg-gradient-to-tl from-green-400 to-blue-500 rounded-2xl p-12 w-96 shadow-2xl">
                        {/* Close Button */}
                        <button
                          className="absolute top-4 right-4 text-white hover:text-gray-200 text-3xl transition-all"
                          onClick={toggleVideo}
                        >
                          ✖️
                        </button>

                        <h2 className="text-3xl font-semibold text-white mb-6 text-center tracking-wide">
                          Video
                        </h2>
                        <div className="flex flex-col items-center space-y-6">
                          {/* Camera Video Feed or Recorded Video */}
                          {!videoBlob && (
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full rounded-md shadow-md"
                              muted
                            ></video>
                          )}

                          {videoBlob && (
                            <video
                              src={URL.createObjectURL(videoBlob)}
                              controls
                              className="w-full rounded-md shadow-md"
                            ></video>
                          )}

                          {/* Conditional Button: Start/Stop Recording */}
                          {!videoBlob && (
                            <button
                              className="text-lg bg-yellow-500 text-white py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                              onClick={
                                isRecording
                                  ? stopVideoRecording
                                  : startVideoRecording
                              }
                            >
                              {isRecording
                                ? "⏹ Stop Recording"
                                : "🎥 Start Recording"}
                            </button>
                          )}
                          {/* Retake Button */}
                          {videoBlob && (
                            <button
                              className="text-lg bg-yellow-500 text-white py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                              onClick={retakeVideo}
                            >
                              🔄 Retake
                            </button>
                          )}

                          {/* Upload Button */}
                          {videoBlob && (
                            <button
                              className={`text-lg py-3 px-8 rounded-full shadow-lg transition-all ${
                                uploading
                                  ? "bg-indigo-300 text-gray-500 cursor-not-allowed"
                                  : "bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-110 hover:shadow-xl"
                              }`}
                              onClick={() =>
                                sendMediaToBackend("video", videoBlob)
                              }
                              disabled={uploading}
                            >
                              {uploading ? "Sending..." : "Send"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audio Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <label
                      className="cursor-pointer"
                      onClick={() => toggleVisibility("audio")}
                    >
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-5 rounded-full hover:scale-110 hover:shadow-lg transition-transform flex justify-center items-center">
                        🎵
                      </span>
                    </label>
                    {visibleSection === "audio" && (
                      <div className="flex space-x-4">
                        <button className="text-lg bg-yellow-500 text-white py-3 px-6 rounded-full hover:bg-yellow-600 hover:shadow-md transition-all relative overflow-hidden cursor-pointer">
                          ⬆️
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(event) =>
                              handleMediaUpload(event, "audio")
                            }
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </button>
                        <button
                          className="text-lg bg-orange-500 text-white py-3 px-6 rounded-full hover:bg-orange-600 hover:shadow-md transition-all"
                          onClick={toggleModal}
                        >
                          🎤
                        </button>

                        {/* Modal */}
                        {isModalOpen && (
                          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 transition-all ease-in-out duration-500">
                            <div className="bg-gradient-to-tl from-green-400 to-blue-500 rounded-2xl p-12 w-96 shadow-2xl transform transition-transform duration-500 ease-in-out scale-95 hover:scale-100">
                              <h2 className="text-3xl font-semibold text-white mb-6 text-center tracking-wide">
                                Audio Recorder
                              </h2>
                              <div className="flex flex-col items-center space-y-6">
                                <div className="text-4xl font-mono text-white">
                                  {elapsedTime}s
                                </div>
                                <button
                                  className={`text-lg ${
                                    isRecording ? "bg-red-400" : "bg-green-400"
                                  } text-white py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all`}
                                  onClick={
                                    isRecording ? stopRecording : startRecording
                                  }
                                >
                                  {isRecording ? "⏹️ Stop" : "🎙️ Record"}
                                </button>

                                {/* Audio Player */}
                                {audioBlob && (
                                  <audio
                                    controls
                                    src={URL.createObjectURL(audioBlob)}
                                    className="mt-6 w-full rounded-md shadow-md"
                                  />
                                )}
                                {audioBlob && (
                                  <button
                                    className={`text-lg py-3 px-8 rounded-full shadow-lg transition-all ${
                                      uploading
                                        ? "bg-indigo-300 text-gray-500 cursor-not-allowed"
                                        : "bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-110 hover:shadow-xl"
                                    }`}
                                    onClick={() =>
                                      sendMediaToBackend("audio", audioBlob)
                                    }
                                    disabled={uploading}
                                  >
                                    {uploading ? "Sending..." : "Send"}
                                  </button>
                                )}
                              </div>

                              {/* Close Button */}
                              <button
                                className="absolute top-4 right-4 text-white hover:text-gray-200 text-3xl transition-all"
                                onClick={toggleModal}
                              >
                                ✖️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              className="ml-1 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-full hover:from-green-500 hover:to-teal-600 focus:outline-none transition-transform transform hover:scale-105"
              onClick={handleSendMessage}
            >
              &#x27A4;
            </button>
          </div>

          <div className="flex justify-center">
            <button
              className="bg-gradient-to-r w-1/4 from-green-400 to-teal-500 text-white p-2 mb-2 rounded-full shadow-lg hover:scale-105 transition-transform focus:outline-none"
              onClick={handleCall}
            >
              <span className="text-xl font-semibold sm:w-full">Call Turf</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWithTurf;
