import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../apiClient";
import { io } from "socket.io-client";
interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  otp?: string;
  otpExpiresAt?: Date;
  isVerified?: number;
  isApproved?: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}
interface RootState {
  user: {
    currentUser: CurrentUser;
  };
}
type Slot = {
  date: string;
  time: string;
  price: number;
  id: string;
};

type GroupedSlots = {
  [date: string]: {
    slots: Slot[];
    ids: string[];
    totalPrice: number;
  };
};

type GroupedSlotsState = GroupedSlots;
type TotalPriceState = number;

const PaymentConfirmation = () => {
  const socket = io("http://localhost:7000");
  const location = useLocation();
  const { selectedSlots = [] } = location.state ?? {};
  const navigate = useNavigate();
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [isBookingFailed, setIsBookingFailed] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlotsState>({});
  const [totalPrice, setTotalPrice] = useState<TotalPriceState>(0);
  const email = currentUser.email;
  useEffect(() => {
    const ids = selectedSlots.map((slot) => slot.id);
    const total = selectedSlots.reduce((sum, { price }) => sum + price, 0);
    setGroupedSlots(ids)
    setTotalPrice(total)
  }, [selectedSlots]);
  useEffect(()=>{
    console.log(groupedSlots)
  },[])

  const { id } = useParams();
  const closeModal = () => {
    navigate(`/turf-page/${id}/book-ticket`);
  };
  const openRazorpay = async () => {
    if (!window.Razorpay) {
      console.error("Razorpay SDK not loaded");
      alert("Payment gateway is not available. Please try again later.");
      setIsBookingFailed(true);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZOR_PAY_KEY,
      amount: totalPrice * 100, // Amount in paise
      currency: "INR",
      name: "PlayBook",
      description: "Test Transaction",
      image: "https://i.imgur.com/1eyM5kC.png",
      handler: async (response) => {
        console.log("Payment successful:", response);
        try {
          const res = await apiClient.post("/users/confirm-booking", {
            slotId:groupedSlots,
            turfId: id,
            email,
          });
          console.log("Booking confirmed:", res.data);
          const notificationData = {
            turfId: id,
            firstName: currentUser?.firstName,
          };

          socket.emit("send-notification", notificationData);
          setIsBookingSuccess(true);
        } catch (error) {
          console.error("Error confirming booking:", error);
          setIsBookingFailed(true);
          throw new Error(
            `HTTP error! Status: ${error.response?.status || error.message}`
          );
        }
      },
      prefill: {
        name: currentUser?.firstName,
        email: currentUser?.email,
        contact: currentUser?.mobileNumber,
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", async (response) => {
      try {
        const res = await apiClient.post("/users/confirm-booking", {
          slotId,
          email,
        });
        console.log("Booking confirmed:", res.data);
      } catch (error) {
        console.error("Error confirming booking:", error);
        setIsBookingFailed(true);
      }
    });
    rzp.open();
  };

  return (
    <div className="relative">
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-80 transition-opacity duration-300"
          onClick={closeModal}
        ></div>

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-gray-900 p-8 rounded-lg shadow-2xl relative transform transition-transform duration-300 scale-100 hover:scale-105 w-[400px]">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h1 className="text-2xl font-extrabold text-gray-100 mb-6 tracking-wide text-center drop-shadow-lg">
              Payment Confirmation
            </h1>

            <div className="mb-4">
              <p className="text-lg text-gray-300 font-semibold mb-2">
                <span className="text-blue-400">Booked Slots:</span>
              </p>

              <ul className="text-gray-300 space-y-2">
                {Object.entries(
                  selectedSlots.reduce((acc, { date, time, price, id }) => {
                    if (!acc[date]) acc[date] = [];
                    acc[date].push({ time, price, id });
                    return acc;
                  }, {})
                ).map(([date, slots]) => (
                  <li key={date} className="border-b border-gray-600 pb-2">
                    📅 <strong>Date:</strong>{" "}
                    {new Date(date).toLocaleDateString()}
                    <div className="mt-2 flex flex-wrap gap-4">
                      {slots.map(({ time, price, id }) => (
                        <div key={id} className="flex items-center gap-2">
                          ⏰ <span>{time}</span> 💰 ₹{price}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-lg text-gray-300">
              <strong className="font-semibold text-green-400">
                Total Price:
              </strong>{" "}
              ₹{selectedSlots.reduce((sum, slot) => sum + slot.price, 0)}
            </p>

            <div className="flex justify-between w-full gap-4 mt-6">
              <button
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                onClick={openRazorpay}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>

        {/* Booking Success Modal */}
        {isBookingSuccess && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center w-full"
            role="dialog"
          >
            {/* Fullscreen Overlay with complete black background */}
            <div className="fixed inset-0 bg-black z-40"></div>

            {/* Modal Content */}
            <div className="bg-gray-700 p-8 rounded-lg shadow-2xl w-3/4 md:w-1/3 transform transition-transform duration-300 hover:scale-105 z-50">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-green-400 mb-4 animate-bounce">
                  🎉 Booking Successful!
                </h2>
                <p className="text-lg text-gray-300 mb-6 font-medium">
                  Thank you for booking with us! Your slot has been confirmed.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
                  <button
                    className="bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-800 transition-transform transform hover:scale-110"
                    onClick={() => {
                      setIsBookingSuccess(false);
                      navigate("/home");
                    }}
                  >
                    Go to Home
                  </button>
                  <button
                    className="bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-800 transition-transform transform hover:scale-110"
                    onClick={() => {
                      setIsBookingSuccess(false);
                      navigate("/booking-list");
                    }}
                  >
                    Show Booking List
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isBookingFailed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full">
            {/* Fullscreen Overlay with complete black background */}
            <div className="fixed inset-0 bg-black z-40"></div>

            {/* Modal Content */}
            <div className="bg-red-700 p-8 rounded-lg shadow-2xl w-3/4 md:w-1/3 transform transition-transform duration-300 hover:scale-105 z-50">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4 animate-bounce">
                  ⚠️ Booking Failed
                </h2>
                <p className="text-lg text-gray-100 mb-6 font-medium">
                  Unfortunately, there was an error while processing your
                  booking. Please try again later.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
                  <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
                    <button
                      className="bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-800 transition-all duration-300 transform hover:scale-105"
                      onClick={openRazorpay}
                    >
                      Repay
                    </button>
                    <button
                      className="bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                      onClick={() => {
                        setIsBookingSuccess(false);
                        navigate("/booking-list");
                      }}
                    >
                      View My Bookings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default PaymentConfirmation;
