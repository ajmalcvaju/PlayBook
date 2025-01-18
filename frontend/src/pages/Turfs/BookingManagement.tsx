import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";

type Booking ={
  _id: string;
  price: number;
  slotId: string;
  status: string;
  time: string;
  date: string;
  slotNumber: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
};

const BookingManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("turfToken");

  useEffect(() => {
    if (!token) {
      navigate("/turf-login");
    }
  }, [token]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancellationConfirmation, SetCancellationConfirmation] =
    useState(false);
  const [slotId, setSlotId] = useState<string>("");
  const [loading, setLoading] = useState(true); // State to manage loading
  const email = localStorage.getItem("turfEmail");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [bookingId,setBookingId]=useState<string>("");
  const [selectedBooking, setSelectedBooking] = React.useState<null | Booking>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 6;
  const cancellBooking = (slotId: string,bookingId:string) => {
    setSlotId(slotId);
    setBookingId(bookingId);
    SetCancellationConfirmation(true);
  };
  useEffect(() => {
    const fetchBookings = async () => {
      console.log("hello")
      try {
        const response = await apiClient.get(`/turfs/get-booking/${email}`);
        if (response.status !== 200) {
          throw new Error("Failed to fetch bookings");
        }
        const data = response.data;
        setBookings(data);
        console.log(data)
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [email]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-300 min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 mb-4"></div>
        <h1 className="text-xl font-semibold tracking-wider">Loading Bookings...</h1>
        <p className="text-gray-400 text-sm mt-2">Please wait a moment while we fetch your data.</p>
      </div>
    );
    
  }
  const onClose = () => {
    SetCancellationConfirmation(false);
  };
  const onConfirmCancellation=async ()=>{
    try {
      const res = await apiClient.patch(`/turfs/cancel-booking`, {slotId,bookingId});
      if (res.data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: 'cancelled',price:0 }
              : booking
          )
        ); 
        SetCancellationConfirmation(false);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
 }
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);
  const paginate = (pageNumber:number) => setCurrentPage(pageNumber);
  return (
    <>
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-800 to-gray-900 bg-opacity-75 flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full sm:w-1/2 md:w-1/3 lg:w-1/4 relative space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center border-b pb-4">
              Booking Details
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong className="font-bold text-gray-900">
                  Slot Number:
                </strong>{" "}
                {selectedBooking.slotNumber}
              </p>
              <p>
                <strong className="font-bold text-gray-900">Customer Name:</strong>{" "}
                {selectedBooking.firstName || "N/A"} {selectedBooking.lastName || "N/A"}
              </p>
              <p>
                <strong className="font-bold text-gray-900">Email:</strong>{" "}
                {selectedBooking.email || "N/A"}
              </p>
              <p>
                <strong className="font-bold text-gray-900">
                  Mobile Number:
                </strong>{" "}
                {selectedBooking.mobileNumber || "N/A"}
              </p>
              <p>
                <strong className="font-bold text-gray-900">
                  Date and Time:
                </strong>{" "}
                {`${selectedBooking.date} ${selectedBooking.time}`}
              </p>
              <p>
                <strong className="font-bold text-gray-900">Price:</strong>{" "}
                {`${selectedBooking.price}`}
              </p>
              <p>
                <strong className="font-bold text-gray-900">Time:</strong>{" "}
                {selectedBooking.time}
              </p>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Ticket
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-md shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {cancellationConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-white w-96 shadow-lg">
            <div className="text-2xl font-semibold mb-6 text-center text-white">
              Cancellation Confirmation
            </div>
            <div className="text-lg mb-6 text-gray-300">
              <h2 className="mb-4 text-center">
                Are you sure you want to cancel? Once You done,You can not
                retrieve this.
              </h2>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none"
                onClick={onClose}
              >
                No, Go Back
              </button>
              <button
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none"
                onClick={onConfirmCancellation}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-gray-950 p-4 min-h-full">
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-xs uppercase text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Booking No
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Mobile Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Booking Details
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.length > 0 ? (
                currentBookings.map((booking) => (
                  <tr
                    className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800"
                    key={booking._id}
                  >
                    <td className="px-6 py-4">{booking.slotNumber}</td>
                    <td className="px-6 py-4">
                      {booking.firstName} {booking.lastName}
                    </td>
                    <td className="px-6 py-4">{booking.email || " "}</td>
                    <td className="px-6 py-4">{booking.mobileNumber || " "}</td>
                    <td className="px-6 py-4">{`${booking.date} ${booking.time}`}</td>
                    <td className="px-6 py-4">{`${booking.price}`}</td>
                    <td className="px-6 py-4">{`${booking.status}`}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsModalOpen(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded-lg"
                      >
                        Booking Details
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === "pending" && (
                        <button
                          onClick={() =>
                            cancellBooking(booking.slotId,booking._id)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800">
                  <td colSpan={9} className="px-6 py-4 text-center">
                    No bookings available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md mr-2 disabled:opacity-50"
          >
            Prev
          </button>

          {/* Display page numbers */}
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 mx-1 rounded-md ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md ml-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingManagement;
