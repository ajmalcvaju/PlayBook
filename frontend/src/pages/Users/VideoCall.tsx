import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io} from "socket.io-client";
import { MicOff } from 'lucide-react'
import { useSelector } from "react-redux";
import apiClient from "../../apiClient";

const socket = io("https://api.play-book.xyz", { transports: ["websocket"] })
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
interface UserState {
  currentUser: CurrentUser;
}
interface RootState {
  user: UserState;
}
const VideoCall = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [muted,setMuted]=useState(false)
  const [turf, setTurf] = useState<any>(null);
 const [isConnected, setIsConnected] = useState<boolean>(false);
 const {id}=useParams()
 const roomId=id
 const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const userId = currentUser._id;
 useEffect(() => {
  socket.on("call-disconnected", ({ roomId, userId }) => {
    console.log(`User ${userId} disconnected from room ${roomId}`);
    // Update UI or handle call disconnection logic
});
 }, []);
  useEffect(() => {
    // Join the room
    socket.emit("join-room", roomId);
    startCall()
    // Listen for offer
    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    // Listen for answer
    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Listen for ICE candidates
    socket.on("ice-candidate", (candidate: RTCIceCandidateInit) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [roomId]);
  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const response = await apiClient.get(`/users/get-turf-details/${id}`);
        const data = response.data;
        setTurf(data.turfDetails.turfName);
      } catch (error) {
        console.error("Failed to fetch turf details:", error);
      }
    };
    fetchTurfDetails();
  }, [id]);
  const createPeerConnection = (): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    return peerConnection;
  };
  useEffect(()=>{
   console.log(isConnected)
  },[])
  const startCall = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    peerConnectionRef.current = createPeerConnection();
    stream.getTracks().forEach((track) => peerConnectionRef.current!.addTrack(track, stream));

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("offer", { roomId,caller:userId, offer });
    socket.emit("offerNotification", { roomId,caller:userId});
    setIsConnected(true);
    window.currentStream = stream;
  };
  const toggleMute = () => {
    const audioTrack = window.currentStream?.getAudioTracks()[0];
    if (audioTrack) {
      setMuted(prev=>!prev)
      audioTrack.enabled = !audioTrack.enabled; // Toggle the enabled state
    }
  };
  const toggleVideo = () => {
    const videoTrack = window.currentStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled; // Toggle the enabled state
    }
  };   
 useEffect(()=>{
     socket.on("call-disconnected", ({ roomId, userId }) => {
       if(roomId===roomId){
        console.log(userId)
         setIsConnected(false);
         navigate(`/turf-page/${roomId}/chat-with-turf`, {
          state: { videoCallConnection: true }
        });
       }
   });
   },[])
   useEffect(()=>{
    socket.on("call-decline", ({ roomId, userId }) => {
      if(roomId===roomId){
        console.log(userId)
        setIsConnected(false);
        navigate(`/turf-page/${roomId}/chat-with-turf`, {
         state: { videoCallDecline: true }
       });
      }
  });
  },[])
  const navigate = useNavigate();
  const cancel = () => {
    navigate(`/turf-page/${roomId}/chat-with-turf`, {
      state: { videoCallConnection: true }
    });
    socket.emit("leave-room", roomId);
  };
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 space-y-6 relative">
          {/* Close Button */}
          <button
            onClick={cancel}
            className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-200 ease-in-out"
          >
            Cancel
          </button>
          {/* Header */}
          <h2 className="text-3xl font-semibold text-white text-center mb-4">
            Video Call
          </h2>

          <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-x-8 md:space-y-0">
            {/* Local Video */}
            <div className="relative w-full md:w-1/2 flex justify-center items-center rounded-lg overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "5px solid #fff",
                }}
                className="rounded-lg shadow-md"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm">
                You
              </div>
              {muted&&(
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-lg text-sm">
              <MicOff className="w-6 h-6" />
              </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative w-full md:w-1/2 flex justify-center items-center rounded-lg overflow-hidden shadow-lg">
              <video
                ref={remoteVideoRef}
                autoPlay
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "5px solid #fff",
                }}
                className="rounded-lg shadow-md"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm">
                {turf}
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center items-center space-x-8">
            <button
              onClick={toggleMute}
              className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              Mute
            </button>
            <button
              onClick={cancel}
              className="bg-red-600 text-white px-6 py-4 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={toggleVideo}
              className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              Video Off
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoCall;
