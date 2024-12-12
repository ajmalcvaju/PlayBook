import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Outlet, useNavigate, useParams } from "react-router-dom";

type Slot = {
  _id: string;
  date: string;
  time: string;
  price: string;
  turfId: string;
  isBooked: boolean;
};

const TicketBookingModal = ({}) => {
  const [selectedTime, setSelectedTime] = useState("");
  const [activeDate, setActiveDate] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState('')
  const navigate=useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [price, setPrice] = useState("");
  const { id } = useParams();
  const dateForm = activeDate.toISOString().split("T")[0];
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false); 

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        console.log(id, dateForm);
        const res = await fetch(
          `http://localhost:7000/api/users/get-slots?id=${id}&date=${dateForm}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const response = await res.json();
        let slotArray = response.slots;
        console.log(slotArray);
        setSlots(slotArray);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };
    fetchSlots();
  }, [id, activeDate]);

  const today = new Date();
  const datesArray: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const newDate: Date = new Date();
    newDate.setDate(today.getDate() + i);
    datesArray.push(newDate);
  }

  const handleDateClick = (date: Date) => {
    setActiveDate(date);
  };

  const handleTimeSelect = (time: any, price: any,id:any) => {
    setSlotId(id);
    setSelectedTime(time);
    setPrice(price);
  };

  const times = slots.map((item) => ({
    time: item?.time,
    price: item?.price,
    id:item?._id,
    isBooked:item?.isBooked
  }));

  const bookNow = () => {
    setShowConfirmation(true);
  };

  const handleCloseModal = () => {
    setShowConfirmation(false); 
  };

  const handleConfirmBooking = async() => {
    
    
    const email=localStorage.getItem("userEmail")
    console.log("Booking confirmed", { selectedTime, activeDate, price,slotId,email });
    const response = await fetch("http://localhost:7000/api/users/confirm-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slotId: slotId,email }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    setShowConfirmation(false);
    setIsBookingSuccess(true); 
    const result = await response.json();
  };
  const close=()=>{
    navigate(-1)
  }
  const bookingTest=()=>{
    // fetch("http://localhost:7000/api/users/test")
    navigate("payment-confirmation")
  }
  return (
    
    <div>
      
      {/* Main Booking Modal */}
      <Outlet/>
      <div
      
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="bg-white flex flex-col items-center justify-center p-6 rounded-lg shadow-lg w-3/4 md:w-1/2">
          <h2 id="modal-title" className="text-xl font-bold mb-4">Book Ticket</h2>

          {/* Date Picker */}
          <div className="mb-4 w-full">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Date:
            </label>
            <button className="text-black" onClick={bookingTest}>Booking Test by ajmal</button>
            <div className="flex gap-4 justify-between flex-wrap text-center">
              {datesArray.map((date, index) => (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`flex flex-col items-center px-4 py-2 rounded-lg shadow-md cursor-pointer ${
                    activeDate.toDateString() === date.toDateString()
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white"
                  } hover:bg-red-500`}
                >
                  <span className="font-semibold text-xs uppercase">
                    {date.toLocaleDateString("en-GB", { weekday: "short" })}
                  </span>
                  <span className="font-bold text-sm">
                    {date.toLocaleDateString("en-GB", { day: "2-digit" })}
                  </span>
                  <span className="font-semibold text-xs uppercase">
                    {date.toLocaleDateString("en-GB", { month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Times */}
          <div className="grid grid-cols-8 gap-4 w-full mb-4">
            {!times.length && (
              <div className="flex justify-center items-center col-span-8 h-40">
                <h1>No slots available on this date</h1>
              </div>
            )}
            {times.map(({ time, price, id, isBooked }) => (
              <button
                key={id}
                onClick={() => handleTimeSelect(time, price, id)}
                className={`py-2 px-4 rounded-md border ${
                  isBooked
                    ? "opacity-60 cursor-not-allowed bg-gray-500 border-gray-400"
                    : selectedTime === time
                    ? "bg-red-600 text-white"
                    : "text-black border-gray-400"
                }`}
                disabled={isBooked}
              >
                {time}
              </button>
              
            ))}
          </div>
          
          <div className="flex justify-between w-full mt-4">
            <button onClick={close} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
              Close
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={bookNow}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-300"
          role="dialog"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="bg-purple-800 flex flex-col items-center justify-center p-8 rounded-lg shadow-xl w-4/5 md:w-1/3 transform transition-transform duration-300 ease-in-out scale-100 hover:scale-105">
            <h2 id="modal-title" className="text-3xl font-bold text-white mb-6">
              Confirm Your Booking
            </h2>

            <p className="mb-6 text-lg text-white">
              <strong className="font-medium">Selected Time:</strong>{" "}
              {selectedTime}
            </p>
            <p className="mb-6 text-lg text-white">
              <strong className="font-medium">Selected Date:</strong>{" "}
              {activeDate.toLocaleDateString()}
            </p>
            <p className="mb-6 text-lg text-white">
              <strong className="font-medium">Price:</strong> {price}
            </p>

            <div className="flex justify-between w-full mt-6 gap-4">
              <button
                className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-500 transition-all duration-200 transform hover:scale-105"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-400 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition-all duration-200 transform hover:scale-105"
                onClick={handleConfirmBooking}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isBookingSuccess && (
  <div
    className="fixed inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-black bg-opacity-95 flex justify-center items-center"
    role="dialog"
    aria-labelledby="success-title"
    aria-describedby="success-description"
  >
    <div className="bg-gray-600 p-8 rounded-lg shadow-2xl w-3/4 md:w-1/3 transform transition-transform duration-300 hover:scale-105">
      <div className="text-center">
        <h2
          id="success-title"
          className="text-3xl font-bold text-green-400 mb-4 animate-bounce"
        >
          🎉 Booking Successful!
        </h2>
        <p
          id="success-description"
          className="text-lg text-gray-300 mb-6 font-medium"
        >
          Thank you for booking with us! Your slot has been confirmed.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
          <button
            className="bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-800 transition-transform transform hover:scale-110"
            onClick={() => {
              setIsBookingSuccess(false);
              // Navigate to home
              window.location.href = "/home";
            }}
          >
            Go to Home
          </button>
          <button
            className="bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-800 transition-transform transform hover:scale-110"
            onClick={() => {
              setIsBookingSuccess(false);
              // Show booking list
              window.location.href = "/booking-list";
            }}
          >
            Show Booking List
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
    

export default TicketBookingModal;
