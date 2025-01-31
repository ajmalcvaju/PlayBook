import { useState, FormEvent, useEffect } from "react";
import apiClient from "../../apiClient";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
interface Team {
  _id: string;
  teamName: string;
  maxMembers: number;
  privacy: "public" | "private";
  secretCode?: string;
  members: [{ userId: string; isAdmin: boolean }];
}

const FormTeam = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [createTeamForm, setCreateTeamForm] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [mode, setMode] = useState<string>("");
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [enteredCode, setEnteredCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const rowsPerPage = 5;

  const createTeam = () => {
    setCreateTeamForm(true);
  };
  const handleJoin = async (teamId: string) => {
    console.log(`You joined the team: ${teamId} ${currentUser._id}`);
    try {
      const data = { teamId, userId: currentUser._id };
      const response = await apiClient.patch("/users/join-team", data, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
        setShowPopup(true);
        setSuccessMessage("You Joined successfully in The Team");
      } else {
        setShowPopup(true);
        setErrorMessage("Unable to join Now....Try Again");
      }
    } catch (error) {
      setShowPopup(true);
      setErrorMessage("Unable to join Now....Try Again");
    }
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Team>({
    defaultValues: {
      teamName: "",
      maxMembers: 2,
      privacy: "public",
    },
  });

  const onSubmit: SubmitHandler<Team> = async (data) => {
    console.log(data);
    const updatedData = { ...data, userId: currentUser._id };
    try {
      const response = await apiClient.post("/users/create-team", updatedData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
        setSuccessMessage("Your team was created successfully!");
        setErrorMessage("");
        setCreateTeamForm(false);
        setShowPopup(true);
      } else {
        setSuccessMessage("");
        setErrorMessage(
          "There was an error creating your team. Please try again."
        );
        setCreateTeamForm(false);
      }
      setShowPopup(true);
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(
        "There was an error creating your team. Please try again."
      );
      setCreateTeamForm(false);
      setShowPopup(true);
    }
  };
  useEffect(() => {
    if (showPopup) {
      setTimeout(() => {
        setShowPopup(false);
      }, 6000);
    }
  }, [showPopup]);
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient.get("/users/get-teams", {
          headers: { "Content-Type": "application/json" },
        });
        if (response.status === 200) {
          setTeams(response.data.teams);
        } else {
          console.error("Failed to fetch teams");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, [successMessage,showTable]);
  const table = (mode: "new" | "current") => {
    let userId = currentUser._id;
    if (mode === "new") {
      const currentTeams = teams.filter(
        (team) => !team.members.some((member) => member.userId === userId)
      );
      setFilteredTeams(currentTeams);
    } else {
      const currentTeams = teams.filter((team) =>
        team.members.some((member) => member.userId === userId)
      );
      setFilteredTeams(currentTeams);
    }
    setMode(mode);
    setShowTable(true);
  };
  const totalPages = Math.ceil(filteredTeams.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentTeams = filteredTeams.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const handleOpen = (teamId: string) => {
    setShowTable(false);
    navigate(`open-team/${teamId}`);
  };
  const handleJoinClick = (team: Team) => {
    if (team.privacy === "private") {
      setSelectedTeam(team);
      setShowTable(false);
    } else {
      handleJoin(team._id);
      setShowTable(false);
    }
  };
  const handleCodeSubmit = () => {
    if (enteredCode === selectedTeam?.secretCode) {
      handleJoin(selectedTeam._id);
      setSelectedTeam(null);
      setEnteredCode("");
      setError("");
    } else {
      setError("❌ Your secret code is incorrect!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black text-white flex flex-col items-center justify-center p-6">
      {selectedTeam && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-gray-800 border border-gray-300">
            <h2 className="text-lg font-bold text-center text-blue-600 mb-4">
              Enter Secret Code
            </h2>

            <input
              type="text"
              placeholder="Enter Secret Code"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}

            <div className="mt-4 flex justify-between">
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md transition-all"
                onClick={handleCodeSubmit}
              >
                Submit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-md transition-all"
                onClick={() => {
                  setSelectedTeam(null);
                  setEnteredCode("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showTable && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Available Teams
              </h2>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowTable(false)}
              >
                Close
              </button>
            </div>
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                <tr>
                  <th className="border border-gray-300 px-6 py-4 text-left text-lg font-bold uppercase tracking-wider">
                    Team Name
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-left text-lg font-bold uppercase tracking-wider">
                    Max Members
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-left text-lg font-bold uppercase tracking-wider">
                    Privacy
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-left text-lg font-bold uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTeams.length === 0 ? (
                  <tr>
                    <td className="text-center py-4 text-gray-600 font-semibold">
                      No teams found
                    </td>
                  </tr>
                ) : (
                  currentTeams.map((team, index) => (
                    <tr
                      key={team._id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } hover:bg-yellow-100 transition-colors`}
                    >
                      <td className="border border-gray-300 px-6 py-4 font-semibold text-gray-800">
                        {team.teamName}
                      </td>
                      <td className="border border-gray-300 px-6 py-4 text-center text-gray-600">
                        {team.maxMembers}
                      </td>
                      <td className="border border-gray-300 px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            team.privacy === "public"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {team.privacy}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-6 py-4 text-center">
                        <button
                          className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-4 py-2 rounded-full shadow-md font-medium transform hover:scale-105 transition-all duration-200"
                          onClick={() =>
                            mode === "new"
                              ? handleJoinClick(team)
                              : handleOpen(team._id)
                          }
                        >
                          {mode === "new" ? "Join" : "Open"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-white`}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-white`}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-md mb-4 z-50 ${
            successMessage ? "bg-green-500" : "bg-red-500"
          }`}
          style={{
            minWidth: "200px",
            maxWidth: "400px",
            overflow: "hidden",
          }}
        >
          <div
            className="whitespace-nowrap animate-marquee text-white"
            style={{
              animation: "marquee 6s linear infinite", // scrolling effect
            }}
          >
            {successMessage || errorMessage}
          </div>
        </div>
      )}
      {createTeamForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setCreateTeamForm(false)}
              className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600"
            >
              &times;
            </button>
            <h1 className="text-3xl font-bold text-yellow-500 text-center mb-6">
              Create Your Team
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Team Name Input */}
              <div>
                <label
                  htmlFor="teamName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Team Name
                </label>
                <Controller
                  name="teamName"
                  control={control}
                  rules={{ required: "Team name is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="teamName"
                      type="text"
                      className="w-full p-3 rounded-md bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-yellow-500"
                      placeholder="Enter your team name"
                    />
                  )}
                />
                {errors.teamName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.teamName.message}
                  </p>
                )}
              </div>

              {/* Maximum Members Input */}
              <div>
                <label
                  htmlFor="maxMembers"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Maximum Members
                </label>
                <Controller
                  name="maxMembers"
                  control={control}
                  rules={{
                    required: "Maximum members is required",
                    min: {
                      value: 2,
                      message: "Minimum members should be 2",
                    },
                    max: {
                      value: 100,
                      message: "Maximum members can be up to 100",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="maxMembers"
                      type="number"
                      className="w-full p-3 rounded-md bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-yellow-500"
                      placeholder="Enter the max number of members"
                    />
                  )}
                />
                {errors.maxMembers && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.maxMembers.message}
                  </p>
                )}
              </div>

              {/* Privacy Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Privacy
                </label>
                <div className="flex items-center space-x-4">
                  <Controller
                    name="privacy"
                    control={control}
                    rules={{ required: "Please select privacy option" }}
                    render={({ field }) => (
                      <>
                        <label className="flex items-center">
                          <input
                            {...field}
                            type="radio"
                            value="public"
                            className="mr-2"
                            checked={field.value === "public"}
                          />
                          Public
                        </label>
                        <label className="flex items-center">
                          <input
                            {...field}
                            type="radio"
                            value="private"
                            className="mr-2"
                            checked={field.value === "private"}
                          />
                          Private
                        </label>
                      </>
                    )}
                  />
                </div>
                {errors.privacy && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.privacy.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded-md text-gray-900 font-semibold text-lg"
              >
                Create Team
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-yellow-500 mb-2 drop-shadow-md">
          Form Your Team
        </h1>
        <p className="text-gray-300 text-lg">
          Build your dream team, strategize plays, and dominate the field!
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Team Card */}
        <div className="bg-gradient-to-r from-red-800 to-red-600 p-6 rounded-xl shadow-2xl hover:scale-105 transform transition-all">
          <h2 className="text-2xl font-bold text-center text-yellow-200 mb-4">
            Create Team
          </h2>
          <p className="text-gray-100 mb-6">
            Lead your squad! Start a new team and recruit players to join your
            game.
          </p>
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-lg font-bold text-gray-900"
            onClick={createTeam}
          >
            Create Team
          </button>
        </div>

        {/* Current Teams Card */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-2xl hover:scale-105 transform transition-all">
          <h2 className="text-2xl font-bold text-center text-yellow-200 mb-4">
            Current Teams
          </h2>
          <p className="text-gray-100 mb-6">
            Check out your current team’s roster, stats, and schedule.
          </p>
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-lg font-bold text-gray-900"
            onClick={() => table("current")}
          >
            View Teams
          </button>
        </div>

        {/* Join Team Card */}
        <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-6 rounded-xl shadow-2xl hover:scale-105 transform transition-all">
          <h2 className="text-2xl font-bold text-center text-yellow-200 mb-4">
            Join Teams
          </h2>
          <p className="text-gray-100 mb-6">
            Join an existing team and get ready to compete in the next big game!
          </p>
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-lg font-bold text-gray-900"
            onClick={() => table("new")}
          >
            Join Teams
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormTeam;
