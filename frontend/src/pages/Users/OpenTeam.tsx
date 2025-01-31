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
interface Member {
  userId: string;
}
interface Slot {
  slotId: string;
  vacancy: number;
  members: Member[];
}
interface Team {
  _id: string;
  teamName: string;
  maxMembers: number;
  privacy: "public" | "private";
  secretCode: string;
  members: [{ userId: User; isAdmin: boolean }];
  slots: Slot[];
}

type Booking = {
  _id: string;
  slotId: string;
  date: string;
  turfName: string;
  time: string;
  price: string;
  mobileNumber: string;
  email: string;
  isBooked: boolean;
  turfId: string;
  review: string;
  __v: number;
  slotNumber: number;
  bookingNumber: number;
  status: string;
  userName: string;
  userMobileNumber: string;
};

const OpenTeam = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalRemove, setShowModalRemove] = useState<boolean>(false);
  const userId = currentUser._id;
  const email = currentUser.email;
  const { id } = useParams<string>();
  const teamId = id;
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Members");
  const [team, setTeam] = useState<Team | null>(null);
  const [removeId, setRemoveId] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);
  const [notSoldBookings, setNotSoldBookings] = useState<Booking[]>([]);
  const [boughtBookings, setBoughtBookings] = useState<Booking[]>([]);
  const [joinSlotModal, setJoinSlotModal] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<null | Booking>(null);
  const [activeSlotTab, setActiveSlotTab] = useState<
    "Slots" | "Sell" | "Booked"
  >("Slots");
  const [showSlotModal, setShowSlotModal] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<Booking | null>(null);
  const [vacantMembers, setVacantMembers] = useState<number>(1);

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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiClient.get(`/users/get-slot-sell/${email}`);
        if (res.status !== 200) {
          throw new Error("Failed to fetch bookings");
        }
        const bookings = res.data;
        const filteredBookings = bookings.filter(
          (booking: Booking) => booking.status === "pending"
        );
        setBookings(filteredBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [email]);

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
        if (!team || mode === "left") {
          navigate("/form-team");
        }
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSellSlot = (slot: Booking) => {
    setSelectedSlot(slot);
    setShowSlotModal(true);
  };
  const confirmSell = async () => {
    try {
      const response = await apiClient.patch(
        "/users/sell-slot",
        { teamId, userId, vacancy: vacantMembers, slotId: selectedSlot?._id },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        setTeam(response.data.team);
        // if (!team || mode === "left") {
        //   navigate("/form-team");
        // }
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error", error);
    }
    setShowSlotModal(false);
  };
  const categorizeBookings = (bookings: Booking[], team: Team) => {
    const bought: Booking[] = [];
    const available: Booking[] = [];
    const notSold: Booking[] = [];

    bookings.forEach((booking) => {
      const slot = team.slots.find((slot) => slot.slotId === booking._id);
      if (slot) {
        const isUserFound = slot.members.some(
          (member) => member.userId === userId
        );
        if (isUserFound) {
          bought.push(booking);
        } else {
          available.push(booking);
        }
      } else {
        notSold.push(booking);
      }
    });

    return { bought, available, notSold };
  };

  useEffect(() => {
    const { bought, available, notSold } = categorizeBookings(
      bookings,
      team as Team
    );
    setBoughtBookings(bought);
    setAvailableBookings(available);
    setNotSoldBookings(notSold);
  }, [bookings, team]);
  const handleJoinBooking = async (booking: Booking) => {
    const data={teamId,slotId:booking._id,userId}
    try {
      const response = await apiClient.patch(
        "/users/join-slot",
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        setTeam(response.data.team);
        // if (!team || mode === "left") {
        //   navigate("/form-team");
        // }
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error", error);
    }
    setJoinSlotModal(false);
  };
  const openModal = (booking:Booking) => {
    setSelectedBooking(booking);
    setJoinSlotModal(true);
  };

  const closeModal = () => {
    setJoinSlotModal(false);
    setSelectedBooking(null);
  };
  const confirmJoin = () => {
    if (selectedBooking) {
      handleJoinBooking(selectedBooking);
    }
    closeModal();
  };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex justify-center items-center p-6">
        {joinSlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm z-30">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
              <h3 className="text-xl font-bold text-green-400">
                Confirm Joining
              </h3>
              <p className="text-gray-300 mt-2">
                Are you sure you want to join the team for{" "}
                <span className="text-white font-semibold">
                  {selectedBooking?.turfName}
                </span>
                ?
              </p>

              <div className="mt-4 flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-all"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md transition-all"
                  onClick={confirmJoin}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        {showSlotModal && selectedSlot && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm z-20">
            <div className="bg-gray-100 p-6 rounded-lg shadow-lg text-black max-w-sm w-full transform scale-100 transition-all">
              {/* Modal Header */}
              <h3 className="text-2xl font-bold text-blue-500 text-center mb-4">
                Sell Slot
              </h3>

              {/* Slot Details */}
              <p className="mb-2 text-gray-700">
                <span className="font-semibold">Turf:</span>{" "}
                {selectedSlot.turfName}
              </p>
              <p className="mb-2 text-gray-700">
                <span className="font-semibold">Date:</span> {selectedSlot.date}
              </p>
              <p className="mb-4 text-gray-700">
                <span className="font-semibold">Time:</span> {selectedSlot.time}
              </p>

              {/* Vacant Member Input */}
              <label className="block text-gray-700 font-semibold mb-1">
                Vacant Members Left:
              </label>
              <input
                type="number"
                className="w-full p-2 rounded-md bg-white text-black outline-1 border-2 border-gray-500 focus:border-blue-400 transition-all"
                min={1}
                max={21}
                value={vacantMembers}
                onChange={(e) => setVacantMembers(Number(e.target.value))}
              />

              {/* Action Buttons */}
              <div className="flex justify-end mt-4 space-x-4">
                <button
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-black rounded-md transition-all"
                  onClick={() => setShowSlotModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-all"
                  onClick={() => confirmSell()}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

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
              <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-white">
                {/* Tab Buttons */}
                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    className={`px-5 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${
                      activeSlotTab === "Slots"
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setActiveSlotTab("Slots")}
                  >
                    Available Slots
                  </button>
                  <button
                    className={`px-5 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${
                      activeSlotTab === "Sell"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setActiveSlotTab("Sell")}
                  >
                    Sell Your Slots
                  </button>
                  <button
                    className={`px-5 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${
                      activeSlotTab === "Booked"
                        ? "bg-purple-500 text-white shadow-md"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setActiveSlotTab("Booked")}
                  >
                    Your Booked Slots
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6 border border-gray-700 rounded-lg bg-gray-800">
                  {activeSlotTab === "Slots" && (
                    <div className="text-center">
                      <h3 className="font-bold text-3xl mb-4 text-green-400">
                        Available Slots
                      </h3>
                      <p className="text-gray-300 text-lg mb-6">
                        Explore the available slots and book them before they’re
                        gone!
                      </p>

                      {/* Card Layout for Available Bookings */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
                        {availableBookings.length > 0 ? (
                          availableBookings.map((booking) => (
                            <div
                              key={booking._id}
                              className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-all"
                            >
                              <h4 className="text-xl font-semibold text-green-400">
                                {booking.turfName}
                              </h4>
                              <p className="text-gray-300 mt-2">
                                <span className="font-semibold">Location:</span>{" "}
                                {booking.location}
                              </p>
                              <p className="text-gray-300 mt-1">
                                <span className="font-semibold">Date:</span>{" "}
                                {booking.date}
                              </p>
                              <p className="text-gray-300 mt-1">
                                <span className="font-semibold">Time:</span>{" "}
                                {booking.time}
                              </p>
                              <p className="text-gray-300 mt-1">
                                <span className="font-semibold">Distance:</span>{" "}
                                {booking.distance} km
                              </p>

                              <button
                                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-md transition-all"
                                onClick={() => openModal(booking)}
                              >
                                Join
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="col-span-full text-gray-400 text-center">
                            No available slots at the moment.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSlotTab === "Sell" && (
                    <div className="text-center">
                      <h3 className="font-bold text-3xl mb-4 text-blue-400">
                        Sell Your Slots
                      </h3>
                      <p className="text-gray-300 text-lg mb-6">
                        Have available slots? List them for others to buy and
                        maximize your benefits.
                      </p>

                      {/* Slots List */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg shadow-md">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-center text-lg font-semibold text-green-400">
                                Turf Name
                              </th>
                              <th className="px-4 py-2 text-center text-lg font-semibold text-green-400">
                                Date
                              </th>
                              <th className="px-4 py-2 text-center text-lg font-semibold text-green-400">
                                Time
                              </th>
                              <th className="px-4 py-2 text-center text-lg font-semibold text-green-400">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {notSoldBookings.map((booking) => (
                              <tr
                                key={booking._id}
                                className="border-b border-gray-700"
                              >
                                <td className="px-4 py-2 text-gray-300">
                                  {booking.turfName}
                                </td>
                                <td className="px-4 py-2 text-gray-300">
                                  {booking.date}
                                </td>
                                <td className="px-4 py-2 text-gray-300">
                                  {booking.time}
                                </td>
                                <td className="px-4 py-2">
                                  <button
                                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md transition-all"
                                    onClick={() => handleSellSlot(booking)}
                                  >
                                    Sell Slot
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeSlotTab === "Booked" && (
                    <div className="text-center">
                      <h3 className="font-bold text-3xl mb-4 text-green-400">
                        Your Booked Slots
                      </h3>
                      <p className="text-gray-300 text-lg mb-6">
                        Here are the slots you've booked.
                      </p>

                      {/* Booked Slots Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg shadow-md">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-center text-lg font-semibold text-green-400">
                                Turf Name
                              </th>
                              <th className="px-4 py-2 text-center text-lg font-semibold text-green-400">
                                Date
                              </th>
                              <th className="px-4 py-2 text-center text-lg font-semibold text-green-400">
                                Time
                              </th>
                              <th className="px-4 py-2 text-center text-lg font-semibold text-green-400">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {boughtBookings.length > 0 ? (
                              bookings.map((slot) => (
                                <tr
                                  key={slot._id}
                                  className="border-b border-gray-700"
                                >
                                  <td className="px-4 py-2 text-gray-300">
                                    {slot.turfName}
                                  </td>
                                  <td className="px-4 py-2 text-gray-300">
                                    {slot.date}
                                  </td>
                                  <td className="px-4 py-2 text-gray-300">
                                    {slot.time}
                                  </td>
                                  <td className="px-4 py-2">
                                    <button
                                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-all"
                                      // onClick={() => handleCancelBooking(slot)}
                                    >
                                      Cancel
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="px-4 py-2 text-center text-gray-400"
                                >
                                  You haven't booked any slots yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
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
