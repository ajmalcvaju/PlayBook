import React, { useEffect, useLayoutEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

interface Slot {
  _id:string;
  date: string;
  time: string;
  isBooked: boolean;
  price:string
}


const AdminDashboard: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentSlots, setCurrentSlots] = useState<Slot[]>([]);
  const [priceOfSlot, setPriceOfSlot] = useState<string>('');
  const [newSlotDate, setNewSlotDate] = useState<Date | null>(new Date());
  const [newSlotTime, setNewSlotTime] = useState<string>('00:00');
  const [newInterval, setNewInterval] = useState<string>('01:00');
  const [numberOfSlot, setNumberOfSlot] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const navigate=useNavigate()
  const slotsPerPage = 6;
  const totalSlots = currentSlots.length;
  const totalPages = Math.ceil(totalSlots / slotsPerPage);
  const paginatedSlots = currentSlots.slice(
    (currentPage - 1) * slotsPerPage,
    currentPage * slotsPerPage
  );
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const email=localStorage.getItem("turfEmail")
  useLayoutEffect(() => {
    const currentDate=newSlotDate?.toISOString().split('T')[0]
    const fetchSlots = async () => {
      try {
        const slotResponse = await fetch(`/api/turfs/slots/${email}/${currentDate}`);
        const currentSlot= await slotResponse.json();
        console.log(currentSlot)
        setCurrentSlots(currentSlot.slots);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSlots();
  }, [email,newSlotDate]);

  const handleAddSlot = async () => {
    console.log(newSlotDate,newSlotTime,email)
    if (!newSlotDate || !newSlotTime) {
      setShowError(true)
      return;
    }
    const slotDate = newSlotDate?.toISOString().split('T')[0];
try {
  const response = await fetch(`http://localhost:7000/api/turfs/slots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      date: slotDate,
      time: newSlotTime,
      interval: newInterval,
      noOfSlots: numberOfSlot,
      price: priceOfSlot
    })
  });

  if (response.ok) {
    const slotResponse = await response.json();
    const currentSlot = slotResponse.slots;
    const newSlots = [...currentSlots, ...currentSlot];
    setCurrentSlots(newSlots);
    console.log(newSlots);
    navigate('/turf/slot-management');
  } else {
    setShowError(true);
  }
} catch (error) {
  setShowError(true); 
}

    
  };
  const handleCloseError = () => setShowError(false);
  const handleDeleteSlotWithConfirmation = (slot:any) => {
    setSlotToDelete(slot); 
    setShowModal(true); 
  };
  const handleCancel = () => {
    setShowModal(false); 
  };
  const handleDeleteSlot = async(currentSlot:any) => {
    try {
      const response = await fetch(`http://localhost:7000/api/turfs/delete-slots/${currentSlot._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete slot');
      }
      const updatedSlots = currentSlots.filter((slot) => slot._id !== currentSlot._id);
      setCurrentSlots(updatedSlots);
      navigate('/turf/slot-management');
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
    setShowModal(false);  // Close the modal after deletion
  };
  return (
    <div className="container pt-5 mx-auto px-6 bg-gray-950 min-h-full">
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
          Update Slots
        </h3>
        <div className="flex gap-6 mb-6">
          {/* Date Picker */}
          <div className="w-full max-w-xs">
            <h4 className="text-lg font-medium text-gray-300 mb-2">
              Date
            </h4>
            <DatePicker
              selected={newSlotDate}
              onChange={(date: Date | null) => setNewSlotDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full p-3 border-2 border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 transition duration-200"
              placeholderText="Select Date"
            />
          </div>

          {/* Time Picker */}
          <div className="w-full max-w-xs">
            <h4 className="text-lg font-medium text-gray-300 mb-2">
              Start Time
            </h4>
            <input
              type="time"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="w-full p-3 border-2 border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
          </div>

          {/* Interval Picker */}
          <div className="w-full max-w-xs">
            <h4 className="text-lg font-medium text-gray-300 mb-2">Interval</h4>
            <input
              type="time"
              value={newInterval}
              onChange={(e) => setNewInterval(e.target.value)}
              className="w-full p-3 border-2 border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
          </div>

          {/* Number of Slots */}
          <div className="w-full max-w-xs">
            <h4 className="text-lg font-medium text-gray-300 mb-2">
              No. of Slots
            </h4>
            <input
              type="number"
              value={numberOfSlot}
              onChange={(e) => setNumberOfSlot(e.target.value)}
              className="w-full p-3 border-2 border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
          </div>
          <div className="w-full max-w-xs">
            <h4 className="text-lg font-medium text-gray-300 mb-2">
              Price Of Slot
            </h4>
            <input
              type="number"
              value={priceOfSlot}
              onChange={(e) => setPriceOfSlot(e.target.value)}
              className="w-full p-3 border-2 border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={handleAddSlot}
            className="bg-indigo-600 text-white py-3 px-8 rounded-md hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            Add Slot
          </button>
        </div>

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
      <h3 className="text-3xl font-semibold text-center text-gray-300">
        Current Slots
      </h3>

      <div className="mt-10 rounded-md shadow-lg bg-white p-6">
  {totalSlots === 0 ? (
    <h1 className="text-3xl text-center text-gray-700">
      No Slot allocated
    </h1>
  ) : (
    <div>
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[800px] table-auto border-collapse border border-gray-300 shadow-sm rounded-lg">
          <thead className="bg-yellow-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Date</th>
              <th className="px-4 py-2 text-left font-semibold">Time</th>
              <th className="px-4 py-2 text-left font-semibold">Price</th>
              <th className="px-4 py-2 text-left font-semibold">Booked</th>
              <th className="px-4 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSlots.map((currentSlot, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 hover:bg-gray-100 transition duration-200 ${
                  currentSlot.isBooked ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                <td className="px-4 py-2 text-gray-700">{currentSlot.date}</td>
                <td className="px-4 py-2 text-gray-700">{currentSlot.time}</td>
                <td className="px-4 py-2 text-gray-700">{currentSlot.price}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
                      currentSlot.isBooked
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {currentSlot.isBooked ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-2">
                <div>
      <button
        onClick={() => handleDeleteSlotWithConfirmation(currentSlot)} 
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
            This action cannot be undone. Do you still want to delete this slot?
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
              onClick={() => handleDeleteSlot(slotToDelete)} // Proceed with deletion
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

      <div className="flex justify-between items-center mt-4">
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
