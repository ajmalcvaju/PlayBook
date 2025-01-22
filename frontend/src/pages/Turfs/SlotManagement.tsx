import React, { useEffect, useLayoutEffect, useState } from "react";

import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";

interface Slot {
  _id: string;
  date: string;
  time: string;
  isBooked: boolean;
  price: string;
}

interface FormData {
  [key: string]: any;
  startDate?: string;
  endDate?: string;
}


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("turfToken");
  useEffect(() => {
    if (!token) {
      navigate("/turf-login");
    }
  }, [token]);
  const [slots,setSlots]=useState<Slot[]>([])
  const [currentSlots, setCurrentSlots] = useState<Slot[]>([]);
  const [fiteredSlots, setFiteredSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [creatingSlot, setCreatingSlot] = useState(false);

  const slotsPerPage = 6;
  const totalSlots = fiteredSlots.length;
  const totalPages = Math.ceil(totalSlots / slotsPerPage);
  const paginatedSlots = fiteredSlots.slice(
    (currentPage - 1) * slotsPerPage,
    currentPage * slotsPerPage
  );
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const email = localStorage.getItem("turfEmail");
  useLayoutEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await apiClient.get(`/turfs/slots/${email}`);
        const currentSlot = response.data;
        const slot=currentSlot.slots;
        console.log(slots);
        setCurrentSlots(slots);
        setFiteredSlots(slots);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };
    fetchSlots();
  }, []);

  const handleCloseError = () => setShowError(false);
  const handleDeleteSlotWithConfirmation = (slot: any) => {
    setSlotToDelete(slot);
    setShowModal(true);
  };
  const handleCancel = () => {
    setShowModal(false);
  };
  const handleDeleteSlot = async (currentSlot: any) => {
    try {
      const response = await apiClient.delete(
        `/turfs/delete-slots/${currentSlot._id}`
      );
      console.log(response)
      const updatedSlots = fiteredSlots.filter(
        (slot) => slot._id !== currentSlot._id
      );
      setFiteredSlots(updatedSlots);
    } catch (error) {
      console.error("Error deleting slot:", error);
    } finally {
      setShowModal(false);
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: any) => {
    console.log("Form Data:", data);
    try {
      setCreatingSlot(true);
      const response = await apiClient.post(`/turfs/slots`, {
        email: email,
        data,
      });
      if (response.status === 200) {
        setCreatingSlot(false);
        const slotResponse = response.data;
        const currentSlot = slotResponse.slots;
        const newSlots = [...currentSlots, ...currentSlot];
        setFiteredSlots(newSlots);
        console.log(newSlots);
        navigate("/turf/slot-management");
      } else {
        setCreatingSlot(false);
        setShowError(true);
      }
    } catch (error) {
      setCreatingSlot(false);
      console.error("Error submitting data:", error);
      setShowError(true);
    } finally {
      setCreatingSlot(false);
    }
  };
  useEffect(() => {}, [fiteredSlots]);
  const getFilteredSot = (date:any) => {
    const filtered = currentSlots.filter((slot) => slot.date === date);
    console.log(filtered);
    setFiteredSlots(filtered);
  };

  return (
    <div className="pt-5 mx-auto px-6 bg-gray-950 min-h-full overflow-x-auto">
      {creatingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <div className="flex flex-col items-center space-y-4">
              {/* Animated Loader */}
              <div className="relative">
                <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
              </div>
              {/* Message */}
              <h2 className="text-xl font-semibold text-center">
                Creating Slot...
              </h2>
              <p className="text-sm text-gray-300 text-center">
                Please wait while we prepare everything for you.
              </p>
              {/* Additional Loading Progress */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full animate-pulse"
                  style={{ width: "50%" }} // Simulated progress
                ></div>
              </div>
              {/* Cancel Button */}
              <button
                onClick={() => setCreatingSlot(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showError && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 relative transform transition-transform duration-300 scale-105">
            {/* Error Icon */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 rounded-full p-3 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.707a1 1 0 10-1.414 1.414L9.586 10l-.293.293a1 1 0 101.414 1.414L10 11.414l.293.293a1 1 0 001.414-1.414L10.414 10l.293-.293a1 1 0 00-1.414-1.414L10 8.586l-.293-.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {/* Modal Content */}
            <h2 className="text-2xl font-semibold text-gray-800 text-center mt-4">
              Error Occurred
            </h2>
            <p className="text-gray-600 text-center mt-3">
              Some Fields are empty or You have given already allocated slots
            </p>
            {/* Close Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleCloseError}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-transform transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Slots Section */}
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 mb-10 hover:shadow-xl transition-all duration-300">
        <h3 className="text-3xl text-center font-semibold text-gray-300 mb-6">
          Update Price Per Slots
        </h3>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-800 shadow-lg rounded-lg p-8 mb-10 space-y-10"
        >
          {/* Weekdays Section */}
          <div>
            <h4 className="text-3xl text-center font-semibold text-gray-300 mb-6">
              Week Days
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                "00:00 to 05:00",
                "06:00 to 10:00",
                "11:00 to 17:00",
                "18:00 to 23:00",
              ].map((label, idx) => (
                <div className="w-full" key={idx}>
                  <h4 className="text-lg font-medium text-gray-300 mb-2">
                    {label}
                  </h4>
                  <input
                    defaultValue={1000}
                    type="number"
                    {...register(`slot${idx + 1}`, {
                      required: "Price is required",
                    })}
                    className="w-full p-3 border-2 border-indigo-300 rounded-md"
                  />
                  {errors[`slot${idx + 1}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`slot${idx + 1}`]?.message as string}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Saturday Section */}
          <div>
            <h3 className="text-3xl text-center font-semibold text-gray-300 mb-6">
              Saturday
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                "00:00 to 05:00",
                "06:00 to 10:00",
                "11:00 to 17:00",
                "18:00 to 23:00",
              ].map((label, idx) => (
                <div className="w-full" key={idx}>
                  <h4 className="text-lg font-medium text-gray-300 mb-2">
                    {label}
                  </h4>
                  <input
                    defaultValue={1000}
                    type="number"
                    {...register(`slot${idx + 5}`, {
                      required: "Price is required",
                    })}
                    className="w-full p-3 border-2 border-indigo-300 rounded-md"
                  />
                  {errors[`slot${idx + 5}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`slot${idx + 5}`]?.message as string}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sunday Section */}
          <div>
            <h3 className="text-3xl text-center font-semibold text-gray-300 mb-6">
              Sunday
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                "00:00 to 05:00",
                "06:00 to 10:00",
                "11:00 to 17:00",
                "18:00 to 23:00",
              ].map((label, idx) => (
                <div className="w-full" key={idx}>
                  <h4 className="text-lg font-medium text-gray-300 mb-2">
                    {label}
                  </h4>
                  <input
                    defaultValue={1000}
                    type="number"
                    {...register(`slot${idx + 9}`, {
                      required: "Price is required",
                    })}
                    className="w-full p-3 border-2 border-indigo-300 rounded-md"
                  />
                  {errors[`slot${idx + 9}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`slot${idx + 9}`]?.message as string}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <h3 className="text-3xl text-center font-semibold text-gray-300 mb-6">
              Select Date
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="w-full">
                <h4 className="text-lg font-medium text-gray-300 mb-2">
                  Start Date
                </h4>
                <input
                  type="date"
                  {...register("startDate", {
                    required: "Start Date is required",
                  })}
                  className="w-full p-3 border-2 border-indigo-300 rounded-md"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="w-full">
                <h4 className="text-lg font-medium text-gray-300 mb-2">
                  End Date
                </h4>
                <input
                  type="date"
                  {...register("endDate", { required: "End Date is required" })}
                  className="w-full p-3 border-2 border-indigo-300 rounded-md"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-3 px-8 rounded-md mt-6"
            >
              Add Slot
            </button>
          </div>
        </form>

        {/* Slot List */}
        <div className="overflow-x-auto rounded-md shadow-sm">
          <ul className="space-y-4">
            {slots.map((slot, index) => (
              <li
                key={index}
                className={`p-4 flex justify-between items-center rounded-lg ${
                  slot.isBooked ? "bg-red-200" : "bg-green-200"
                } transition-all duration-200`}
              >
                <span className="text-lg font-medium">
                  {slot.date} | {slot.time}
                </span>
                <span
                  className={`px-4 py-1 rounded-full ${
                    slot.isBooked ? "bg-red-500" : "bg-green-500"
                  } text-white text-sm font-semibold`}
                >
                  {slot.isBooked ? "Booked" : "Available"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gray-800 shadow-lg rounded-lg p-8 flex flex-col justify-center items-center hover:shadow-xl transition-all duration-300">
        <h3 className="text-2xl font-semibold text-center text-gray-300">
          Select Date
        </h3>
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              const date = e.target.value;
              setSelectedDate(date);
              getFilteredSot(date); // Pass the selected date to the function
            }}
            placeholder="Select a date"
            className="p-2 border mt-3 rounded w-full text-center bg-gray-800 text-white"
          />
        </div>
        <div className="mt-5 rounded-md shadow-lg bg-white p-6">
          {totalSlots === 0 ? (
            <h1 className="text-3xl text-center text-gray-700">
              No Slot allocated
            </h1>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-800 table-auto border-collapse border border-gray-300 shadow-sm rounded-lg">
                  <thead className="bg-yellow-600 text-white">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Time
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Booked
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSlots.map((currentSlot, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 hover:bg-gray-100 transition duration-200 ${
                          currentSlot.isBooked ? "bg-red-100" : "bg-green-100"
                        }`}
                      >
                        <td className="px-4 py-2 text-gray-700">
                          {currentSlot.date}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {currentSlot.time}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {currentSlot.price}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
                              currentSlot.isBooked
                                ? "bg-red-500 text-white"
                                : "bg-green-500 text-white"
                            }`}
                          >
                            {currentSlot.isBooked ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <button
                              onClick={() =>
                                handleDeleteSlotWithConfirmation(currentSlot)
                              }
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 transition duration-200"
                            >
                              Delete
                            </button>
                            {showModal && (
                              <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50">
                                <div className="bg-white p-8 rounded-xl shadow-2xl w-96 border-t-4 border-red-600">
                                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                    Are you sure?
                                  </h2>
                                  <p className="text-sm text-gray-600 mb-6 text-center">
                                    This action cannot be undone. Do you still
                                    want to delete this slot?
                                  </p>
                                  <div className="flex justify-between gap-4">
                                    {/* Cancel button */}
                                    <button
                                      onClick={handleCancel}
                                      className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-200 font-medium shadow-sm"
                                    >
                                      Cancel
                                    </button>
                                    {/* Confirm button */}
                                    <button
                                      onClick={() =>
                                        handleDeleteSlot(slotToDelete)
                                      } // Proceed with deletion
                                      className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200 font-medium shadow-sm"
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
