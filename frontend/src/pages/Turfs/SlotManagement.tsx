import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Slot {
  date: string;
  time: string;
  isBooked: boolean;
}

interface Booking {
  user: string;
  time: string;
  date: string;
}

const AdminDashboard: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newSlotDate, setNewSlotDate] = useState<Date | null>(null);
  const [newSlotTime, setNewSlotTime] = useState<string>('');
  const [newInterval, setNewInterval] = useState<string>('');
  const [numberOfSlot, setNumberOfSlot] = useState<string>('');

  const email=localStorage.getItem("turfEmail")
  useEffect(() => {
    const fetchSlotsAndBookings = async () => {
      try {
        // const slotResponse = await fetch(`/api/admin/turf/slots`);
        // const slotData = await slotResponse.json();
        // setSlots(slotData.slots);

        const bookingResponse = await fetch(`/api/turfs/slots/${email}`);
        // const bookingData = await bookingResponse.json();
        // setBookings(bookingData.bookings);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSlotsAndBookings();
  }, [email]);

  // Handle adding a new slot with date and time
  const handleAddSlot = async () => {
    console.log(newSlotDate,newSlotTime,email)
    if (!newSlotDate || !newSlotTime) {
      alert('Please select both a date and time.');
      return;
    }
    // const slotDate = newSlotDate.toISOString().split('T')[0]; // Extract date (yyyy-mm-dd)
    try {
      const response = await fetch(`http://localhost:7000/api/turfs/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ slots: [{ date: slotDate, time: newSlotTime, isBooked: false }] }),
        body: JSON.stringify({email:email,date: newSlotDate, time: newSlotTime,interval:newInterval,noOfSlots:numberOfSlot})
      });

      if (response.ok) {
        alert("hi")
        // let message=response.json()
        // alert(message);
        // setNewSlotDate(null);
        // setNewSlotTime('');
        // // Refresh the slots list
        // const slotResponse = await fetch(`/api/turf/slots`);
        // const slotData = await slotResponse.json();
        // setSlots(slotData.slots);
      }
    } catch (error) {
      // console.error('Error adding slot:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8">Admin Dashboard</h2>

      {/* Manage Slots Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Manage Slots</h3>
        <div className="flex gap-4 mb-4">
          {/* Date Picker */}
          <div className="w-full">
          <h3>Start Date</h3>
            <DatePicker
              selected={newSlotDate}
              onChange={(date: Date|null) => setNewSlotDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 border border-black rounded-md"
              placeholderText="Select Date"
            />
          </div>

          {/* Time Picker */}
          <div className="w-full">
          <h3>Start Time</h3>
            <input
              type="time" 
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="w-2/3 p-2 border border-black rounded-md"
            />
          </div>
          <div className="w-full">
          <h3>Interval</h3>
            <input
              type="time" 
              value={newInterval}
              onChange={(e) => setNewInterval(e.target.value)}
              className="w-2/3 p-2 border border-black rounded-md"
            />
          </div>
          <div className="w-full">
          <h3>No Of Slots</h3>
            <input
              type="number" 
              value={numberOfSlot}
              onChange={(e) => setNumberOfSlot(e.target.value)}
              className="w-2/3 p-2 border border-black rounded-md"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleAddSlot}
            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Add Slot
          </button>
        </div>

        <div className="overflow-x-auto">
          <ul className="space-y-3">
            {slots.map((slot, index) => (
              <li
                key={index}
                className={`p-4 flex justify-between items-center rounded-md ${slot.isBooked ? 'bg-red-200' : 'bg-green-200'}`}
              >
                <span className="text-lg font-medium">{slot.date} | {slot.time}</span>
                <span className={`px-4 py-1 rounded-md ${slot.isBooked ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                  {slot.isBooked ? 'Booked' : 'Available'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Current Bookings Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Current Bookings</h3>
        <div className="overflow-x-auto">
          <ul className="space-y-3">
            {bookings.map((booking, index) => (
              <li
                key={index}
                className="p-4 flex justify-between items-center rounded-md bg-blue-100"
              >
                <span className="text-lg font-medium">{booking.user}</span>
                <span className="text-sm text-gray-600">{booking.date} | {booking.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
