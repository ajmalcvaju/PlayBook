import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

const TicketBookingModal = ({}) => {
  const [selectedTime, setSelectedTime] = useState("");
  const [activeDate, setActiveDate] = useState(new Date());
  // useEffect(()=>{
  //   fetch(``)
  // },[])
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

  const handleTimeSelect = (time: any) => {
    setSelectedTime(time);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="bg-white flex flex-col items-center justify-center p-6 rounded-lg shadow-lg w-3/4 md:w-1/2">
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          Book Ticket
        </h2>

        {/* Date Picker */}
        <div className="mb-4 w-full">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Date:
          </label>
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

        <div className="grid grid-cols-3 gap-4 w-full mb-4">
          {["10:40 AM", "01:15 PM", "05:50 PM", "07:40 PM"].map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`py-2 px-4 rounded-md border ${
                selectedTime === time
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        <div className="flex justify-between w-full mt-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
            Close
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketBookingModal;
