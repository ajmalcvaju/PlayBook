import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import apiClient from "../../apiClient";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  isOnline: boolean;
  lastSeen: string;
};

const ChatUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [messagedUser,setMessagedUser]=useState('')
  const [currentPage, setCurrentPage] = useState(1);
  const [shoModel,setShowModel]=useState(false)
  const navigate = useNavigate();
  const usersPerPage = 5;
  // const socket = io('http://localhost:7000');
  // useEffect(() => {
  //      socket.emit("joinTurf", { turfId, userId });
  //      socket.on("message", (data) => {
  //       console.log(data)
  //       //  if (data.recieverId === turfId) {
  //       //    setMessages((prev) => [
  //       //      ...prev,
  //       //      { text: data.message, isUser: false,createdAt:data.time},
  //       //    ]);
  //       //  }
  //      });
  //      return () => {
  //        socket.off("message");
  //      };
  //    }, [socket]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await apiClient.get("/turfs/get-users-chat");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getUser();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };
  const makeChat=(userId:string)=>{
    navigate("chat", { state: { userId } });
  }
  return (
    <div>
      {shoModel&&<div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">New Message</h2>
        <p className="text-sm">You have a message from a user</p>
        <div className="mt-4">
          <button
            // onClick={onNavigateToMessages}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-400"
          >
            Go to Messages
          </button>
          <button
            // onClick={onClose}
            className="ml-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>}
    <div className="bg-gray-950 min-h-screen flex flex-col items-center py-10">
      <div className="p-6 w-full max-w-3xl bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-white text-center tracking-wider">
          Chat Users
        </h1>

        {currentUsers && currentUsers.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {currentUsers.map((user) => (
              <li
                key={user._id}
                className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 p-4 rounded-lg transition transform hover:scale-105 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 shadow-lg"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      user.isOnline
                        ? "bg-green-500 border-green-300 shadow-lg animate-pulse"
                        : "bg-gray-600 border-gray-500"
                    }`}
                  ></div>
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {user.isOnline ? (
                        <span className="text-green-400 font-medium">
                          Online
                        </span>
                      ) : (
                        `Last seen: ${new Date(user.lastSeen).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}`
                      )}
                    </p>
                  </div>
                </div>
                <button onClick={()=>makeChat(user._id)} className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium transition">
                  Message
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No users found.</p>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            className={`px-4 py-2 rounded-md bg-gray-700 text-white ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <p className="text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <button
            className={`px-4 py-2 rounded-md bg-gray-700 text-white ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      <Outlet/>
    </div>
    </div>
  );
};

export default ChatUserList;
