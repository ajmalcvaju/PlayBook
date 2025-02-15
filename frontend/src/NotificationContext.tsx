// NotificationContext.tsx
import { useEffect, useState } from "react";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
type NotificationProviderProps = {
  children: ReactNode;
};
interface TurfType {
  [key: string]: any;
}
interface GalleryItem {
  [key: string]: any; 
}

interface CurrentTurf {
  _id: string;
  turfName: string;
  email: string;
  mobileNumber: string;
  password: string;
  isVerified: number;
  isApproved: number;
  gallery: GalleryItem[]; // Array of gallery items
  __v: number;
  facilities: string;
  turfAddress: string;
  turfOverview: string;
  latitude: number;
  locationName: string;
  longitude: number;
  turfTypes: TurfType[]; // Array of turf types
  rating: number;
  votes: number;
}

interface TurfState {
  currentTurf: CurrentTurf | null;
  loading: boolean;
  error: boolean;
}
const socket = io("https://api.play-book.xyz")
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [caller, setCaller] = useState<string | null>(null);
  const [callType, setCallType] = useState<string | null>(null);
  const [callModel, setCallModel] = useState(false);
  const [calldeclineModel, setCalldeclineModel] = useState(true);
  const [messageModel, setMessageModel] = useState(false);
  const { currentTurf } = useSelector((state: { turf: TurfState }) => state.turf);
  const [userId, setUserId] = useState<string | null>(null);
  const [showBookingNotification, setShowBookingNotification] = useState(false);
  const [bookingData, setBookingData] = useState<Partial<{ firstName: string }>>({});
  const location = useLocation();
  const turfId = currentTurf?._id;
  const roomId = turfId;
  useEffect(() => {
    socket.emit("join-room", roomId);
    socket.on("offerNotification", ({ roomId, userName, caller, callType }) => {
      if (caller == turfId) setJoinedRoomId(roomId);
      setCallType(callType);
      setCaller(userName);
      setCallModel(true);
    });
    return () => {
      socket.off("join-room");
      socket.off("offerNotification");
    };
  }, [callModel]);
  useEffect(()=>{
   console.log(joinedRoomId,calldeclineModel,)
  },[])

  useEffect(() => {
    socket.on("receive-notification", (data) => {
      if (turfId === data.turfId) {
        setShowBookingNotification(true);
        setBookingData(data);
      }
    });
    return () => {
      socket.off("receive-notification");
    };
  }, [turfId]);

  const acceptCall = async () => {
    try {
      setCallModel(false);
      console.log("Call Accepted");
      if (callType === "Video") {
        await navigate("/turf/customer-chat/chat/video-call", {
          state: { caller },
        });
      } else if (callType === "Audio") {
        await navigate("/turf/customer-chat/chat/audio-call", {
          state: { caller },
        });
      }
    } catch (error) {
      console.error("Error while accepting the call:", error);
    }
  };

  const declineCall = () => {
    socket.emit("leave-room-decline", roomId);
    setCalldeclineModel(false);
    setCallModel(false);
  };
  useEffect(() => {
    socket.on("newMessageNotification", (data) => {
      console.log("New message notification:", data);
      setCaller(data.userName);
      setUserId(data.senderId);
      setMessageModel(true);
    });
    return () => {
      socket.off("newMessageNotification");
    };
  }, []);

  const replay = () => {
    setMessageModel(false);
    console.log(userId);
    navigate("/turf/customer-chat/chat", { state: { userId: userId } });
  };
  const cancelMessage = () => {
    socket.emit("cancel", { turfId });
  };
  const excludedRoute = "/turf/customer-chat/chat";
  return (
    <>
      {showBookingNotification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full animate-slide-in-up relative"
            style={{
              animation: "slide-in-up 0.5s ease-out",
            }}
          >
            <button
              onClick={() => setShowBookingNotification(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              &#x2715;
            </button>
            <h2 className="text-2xl font-bold text-center text-green-600">
              New Booking Notification!
            </h2>
            <p className="mt-4 text-center text-gray-700">
              <span className="font-semibold">{bookingData?.firstName}</span> has
              booked your turf
            </p>
            <div className="flex justify-center mt-6">
              <button
                onClick={() =>{ 
                  setShowBookingNotification(false)
                  navigate("/turf/booking-management")
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded hover:opacity-90 transition duration-200"
              >
                Check Bookings
              </button>
            </div>
          </div>
        </div>
      )}
      {callModel && ( // Only render modal if callModel is true
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 space-y-6 relative">
            <button
              onClick={declineCall} // Decline button action
              className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-200 ease-in-out"
            >
              Decline
            </button>
            <h2 className="text-3xl font-semibold text-white text-center mb-4">
              Incoming {callType} Call
            </h2>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex justify-center items-center overflow-hidden shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-16 h-16 text-gray-700"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 12c-3.333 0-6 2.667-6 6s2.667 6 6 6 6-2.667 6-6-2.667-6-6-6z"
                  />
                </svg>
              </div>
              {/* Display the roomId instead of John Doe */}
              <p className="text-lg text-white font-medium">{caller}</p>
              <p className="text-sm text-white opacity-80">Calling...</p>
            </div>
            <div className="flex justify-center items-center space-x-8">
              <button
                onClick={acceptCall} // Accept button action
                className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all"
              >
                Accept
              </button>
              <button
                onClick={declineCall} // Decline button action
                className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
      {messageModel && location.pathname !== excludedRoute && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/3 space-y-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 text-2xl hover:text-gray-700"
              onClick={() => setMessageModel(false)} // Close the popup on click
            >
              &times;
            </button>
            <div className="text-gray-800">
              <h1 className="font-bold text-xl md:text-2xl lg:text-2xl text-center">
                You have a message from: {caller}
              </h1>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={replay}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  cancelMessage();
                  setMessageModel(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};
