import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../apiClient";

type Slot = {
  _id: string;
  date: string;
  time: string;
  price: string;
  turfId: string;
  isBooked: boolean;
  turfSizes: string;
};

const TicketBookingModal = ({}) => {
  const [activeDate, setActiveDate] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const navigate = useNavigate();;
  const [selectedTurfSize, setSelectedTurfSize] = useState<string|null>(null);
  const { id } = useParams<string>();
  const [selectedSlots, setSelectedSlots] = useState<
    { date:string,time: string; price: number; id: string }[]
  >([]);
  const dateForm = activeDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        console.log(id, dateForm);
        const response = await apiClient.get(`/users/get-slots`, {
          params: { id, date: dateForm },
        });
        const slotArray = response.data.slots;
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

  const handleTimeSelect = (date:string,time: string, price: number, id: string) => {
    setSelectedSlots((prevSlots) => {
      const isSelected = prevSlots.some((slot) => slot.id === id);
      return isSelected
        ? prevSlots.filter((slot) => slot.id !== id)
        : [...prevSlots, {date,time, price, id }];
    });
  };

  const isSlotSelected = (id: string) =>
    selectedSlots.some((slot) => slot.id === id);

  const times = slots.map((item) => ({
    date: item?.date,
    time: item?.time,
    price: item?.price,
    id: item?._id,
    isBooked: item?.isBooked,
    turfSizes: item?.turfSizes,
  }));
  const turfSizes = [...new Set(times.map((item) => item.turfSizes))];

  const filteredTimes = selectedTurfSize
    ? times.filter((item) => 
        item.turfSizes === selectedTurfSize &&
        item.date === activeDate.toISOString().split("T")[0]
      )
    : [];


    const bookNow = () => {
      if (selectedSlots.length === 0) return; 
      navigate("payment-confirmation", { state: { selectedSlots } });
    };

  const close = () => {
    navigate(`/turf-page/${id}`);
  };

  return (
    <div>
      {/* Main Booking Modal */}
      <Outlet />
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center max-h-screen z-20"
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="bg-white flex flex-col items-center justify-center p-6 rounded-lg shadow-lg w-3/4 md:w-1/2">
          <h2 id="modal-title" className="text-xl text-black font-bold mb-4">
            Book Ticket
          </h2>

          {/* Date Picker */}
          <div className="mb-4 w-full">
            <label
              htmlFor="date"
              className="block text-md font-medium text-gray-700 mb-2"
            >
              Select Date:
            </label>
            <div className="flex gap-4 mb-4 justify-between flex-wrap text-center">
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
          <div className="w-full">
            {/* Turf Size Selector */}
            <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
              {turfSizes.map((turfSize) => (
                <button
                  key={turfSize}
                  onClick={() => setSelectedTurfSize(turfSize)}
                  className={`py-2 px-6 rounded-lg border-2 transition-all duration-300 ease-in-out transform 
                  ${
                    selectedTurfSize === turfSize
                      ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-indigo-700 shadow-lg scale-105"
                      : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-green-500 hover:text-white shadow-sm"
                  }`}
                >
                  {turfSize}
                </button>
              ))}
            </div>

            {/* Slots */}
            <div className="grid gap-4 w-full mb-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
              {!filteredTimes.length && (
                <div className="flex justify-center items-center col-span-8 h-40">
                  <h1>No slots available for this turf size</h1>
                </div>
              )}
              {filteredTimes
                .sort((a, b) => {
                  const [aHours, aMinutes] = a.time.split(":").map(Number);
                  const [bHours, bMinutes] = b.time.split(":").map(Number);
                  return aHours - bHours || aMinutes - bMinutes;
                })
                .map(({ date, time, price, id, isBooked }) => {
                  const currentDate = new Date();
                  const currentDateString = currentDate
                    .toISOString()
                    .split("T")[0];
                  const currentTime =
                    currentDate.getHours() * 60 + currentDate.getMinutes();
                  const [hours, minutes] = time.split(":").map(Number);
                  const slotTime = hours * 60 + minutes;
                  const isDisabled =
                    date === currentDateString && slotTime < currentTime;

                  return (
                    <button
                      key={id}
                      onClick={() =>
                        handleTimeSelect(date, time, Number(price), id)
                      }
                      className={`py-2 px-4 rounded-md border ${
                        isBooked || isDisabled
                          ? "opacity-60 cursor-not-allowed bg-gray-500 border-gray-400"
                          : isSlotSelected(id)
                          ? "bg-red-600 text-white"
                          : "text-black border-gray-400"
                      }`}
                      disabled={isBooked || isDisabled}
                    >
                      {time}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="flex justify-between w-full mt-4">
            <button
              onClick={close}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Close
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                selectedSlots.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={bookNow}
              disabled={selectedSlots.length === 0}
            >
              {selectedSlots.length === 0
                ? "Select a Slot"
                : `Book Now (${selectedSlots.length} Slots)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketBookingModal;
