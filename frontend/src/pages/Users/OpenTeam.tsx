import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "../../apiClient";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
};

interface Team {
  _id: string;
  teamName: string;
  maxMembers: number;
  privacy: "public" | "private";
  secretCode: string;
  members: [{ userId: User; isAdmin: boolean }];
}

const OpenTeam = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalRemove, setShowModalRemove] = useState<boolean>(false);
  const userId = currentUser._id;
  const { id } = useParams<string>();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Members");
  const [team, setTeam] = useState<Team | null>(null);
  const [removeId, setRemoveId] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await apiClient.get(`/users/get-team/${id}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (response.status === 200) {
          console.log(response.data.team);
          setTeam(response.data.team);
          const isAdmin = team?.members.some(
            (member) => member.userId._id === userId && member.isAdmin
          ) as boolean;
          setIsAdmin(isAdmin);
        } else {
          console.error("Failed to fetch team");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeam();
  }, []);
  const handleRemoveMember = async (userId: string, mode: string) => {
    try {
      const response = await apiClient.patch(
        "/users/left-remove-team",
        { teamId: id, userId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        setTeam(response.data.team);
        if(!team||mode==="left"){
          navigate("/form-team")
        }
      } else {
        console.log("error")
      }
    } catch (error) {
      console.log("error",error)
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex justify-center items-center p-6">
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">
                Are you sure you want to leave the team?
              </h2>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    handleRemoveMember(userId, "left");
                    setShowModal(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  Yes, Leave
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showModalRemove && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">
                Are you sure you want to remove The member?
              </h2>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    handleRemoveMember(removeId, "remove");
                    setShowModalRemove(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  Yes, Remove
                </button>
                <button
                  onClick={() => setShowModalRemove(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800/80 backdrop-blur-lg w-full max-w-4xl rounded-xl shadow-2xl p-6 border border-gray-700">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-center mb-6 text-white drop-shadow-md">
            {team?.teamName}
          </h1>
          {isAdmin && team?.secretCode && (
            <p className="text-center text-lg text-yellow-400 font-semibold mt-2">
              Secret Code:{" "}
              <span className="font-mono bg-gray-800 px-2 py-1 rounded">
                {team.secretCode}
              </span>
            </p>
          )}
          {/* Tabs */}
          <div className="flex justify-around border-b border-gray-600 pb-2 mb-4">
            {["Members", "Slots", "Messages"].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2 text-lg font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? "border-b-4 border-blue-400 text-blue-300"
                    : "text-gray-400 hover:text-blue-300"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content with Animation */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-[250px] text-gray-300 px-4"
          >
            {activeTab === "Members" && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-bold text-2xl mb-4 text-blue-400 text-center drop-shadow-lg">
                  Team Members
                </h3>

                {team && team.members.length > 0 ? (
                  <ul className="list-none space-y-4">
                    {team.members.map((member) => (
                      <li
                        key={member.userId._id}
                        className="bg-gray-700 p-4 rounded-lg flex justify-between items-center shadow-md transition hover:scale-105 hover:bg-gray-600"
                      >
                        {/* Member Name */}
                        <span className="text-white font-medium flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          {`${member.userId.firstName} ${
                            member.userId.lastName ? member.userId.lastName : ""
                          }`}
                        </span>

                        {/* Admin Badge & Delete Button */}
                        <div className="flex items-center gap-3">
                          {member.isAdmin && (
                            <span className="text-xs font-semibold text-yellow-300 bg-gray-900 px-3 py-1 rounded-lg shadow-md">
                              Admin
                            </span>
                          )}

                          {/* Show Remove Button if Current User is Admin */}
                          {!member.isAdmin && (
                            <button
                              onClick={() => {
                                setShowModalRemove(true);
                                setRemoveId(member.userId._id);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded-lg shadow-md transition-all hover:scale-105"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-center mt-4">
                    No members yet.
                  </p>
                )}

                {/* Leave Team Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      setShowModal(true);
                      console.log(showModal);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-md transition-all hover:scale-105"
                  >
                    Leave Team
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Slots" && (
              <div>
                <h3 className="font-bold text-2xl mb-2 text-green-300">
                  Available Slots
                </h3>
                <p>Available slots information goes here...</p>
              </div>
            )}

            {activeTab === "Messages" && (
              <div>
                <h3 className="font-bold text-2xl mb-2 text-purple-300">
                  Messages
                </h3>
                <p>Chat feature coming soon...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OpenTeam;
