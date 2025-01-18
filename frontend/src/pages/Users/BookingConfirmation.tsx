import React from "react";
import { Outlet } from "react-router-dom";

const BookingConfirmation = ({ }) => {
  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-green-100">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Booking Confirmed!</h2>
        <p className="text-lg text-gray-700 mb-6">
          We are confirming your booking. Thank you for choosing us!
        </p>


        <div className="flex gap-4 mt-6">
          <button
            // onClick={onGoHome}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Go to Home
          </button>
          <button
            // onClick={onViewBookings}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
          >
            View Booking List
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default BookingConfirmation;
