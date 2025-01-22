import "@fortawesome/fontawesome-free/css/all.min.css";
import React, { useEffect, useState } from "react";
import apiClient from "../../apiClient";

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
};

const BookingList = () => {
  const [cancellationConfirmation, SetCancellationConfirmation] =
    useState(false);
  const [slotId, setSlotId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<null | Booking>(
    null
  );
  const [showTicket, setShowTicket] = React.useState<null | boolean>(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 6;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/users/get-booking/${email}`);
        if (res.status !== 200) {
          throw new Error("Failed to fetch bookings");
        }
        console.log(res.data);
        setBookings(res.data);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [email]);
  const cancellBooking = (id: string, bookingId: string) => {
    setSlotId(id);
    console.log(id);
    setBookingId(bookingId);
    SetCancellationConfirmation(true);
  };
  const onConfirmCancellation = async () => {
    try {
      const res = await apiClient.patch(`/users/cancel-booking`, {
        slotId,
        bookingId,
      });
      if (res.data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  status: "cancelled",
                  price: (0.6 * Number(booking.price)).toString(),
                }
              : booking
          )
        );

        console.log("hi", bookings);
        SetCancellationConfirmation(false);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };
  const onClose = () => {
    SetCancellationConfirmation(false);
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-300 min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 mb-4"></div>
        <h1 className="text-xl font-semibold tracking-wider">
          Loading Bookings...
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Please wait a moment while we fetch your data.
        </p>
      </div>
    );
  }
  const closeTicket = () => {
    setShowTicket(false);
  };
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
      {cancellationConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-white w-96 shadow-lg">
            <div className="text-2xl font-semibold mb-6 text-center text-white">
              Cancellation Confirmation
            </div>
            <div className="text-lg mb-6 text-gray-300">
              <p className="mb-4">
                Are you sure you want to cancel? Please note that according to
                our policy, you will receive only 60% of the amount.
              </p>
              <p>
                If you have any concerns regarding the weather or any other
                questions, please feel free to reach out to us through chat.
              </p>
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
      <div className="bg-gray-950 p-4 min-h-screen">
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-xs uppercase text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Booking No
                </th>
                <th scope="col" className="px-6 py-3">
                  Turf Name
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
            <tbody className="min-h-screen">
              {currentBookings.length > 0 ? (
                currentBookings.map((booking) => (
                  <tr
                    className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800"
                    key={booking._id}
                  >
                    <td className="px-6 py-4">{booking.slotNumber}</td>
                    <td className="px-6 py-4">{booking.turfName || " "}</td>
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
                            cancellBooking(booking.slotId, booking._id)
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
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-gradient-to-br bg-black bg-opacity-75 flex items-center justify-center transition-opacity duration-300">
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
                <strong className="font-bold text-gray-900">Turf Name:</strong>{" "}
                {selectedBooking.turfName || "N/A"}
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
                  setShowTicket(true);
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
      {showTicket && (
        <div className="fixed inset-0 bg-gradient-to-br bg-black bg-opacity-75 flex items-center justify-center transition-opacity duration-300">
          <div className="max-w-md mx-auto relative" role="dialog">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-4 bg-gray-100 rounded-r-full" />

              <div className="relative">
                <div className="bg-red-600 text-white text-center py-3">
                  <button
                    className="absolute top-2 right-2 text-black hover:text-gray-600 text-2xl font-bold"
                    onClick={closeTicket}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h1 className="text-3xl font-bold tracking-wider">
                    {selectedBooking?.turfName}
                  </h1>
                </div>

                <div className="p-6 grid grid-cols-[auto,1fr,auto] gap-6 items-center">
                  <div className="w-16 h-16">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-full h-full text-red-600"
                    >
                      <path
                        fill="currentColor"
                        d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,3C13.76,3 15.4,3.53 16.78,4.41L16.5,5H13L12,5L10.28,4.16L10.63,3.13C11.08,3.05 11.53,3 12,3M9.53,3.38L9.19,4.41L6.63,5.69L5.38,5.94C6.5,4.73 7.92,3.84 9.53,3.38M13,6H16L18.69,9.59L17.44,12.16L14.81,12.78L11.53,8.94L13,6M6.16,6.66L7,10L5.78,13.06L3.22,13.94C3.08,13.31 3,12.67 3,12C3,10.1 3.59,8.36 4.59,6.91L6.16,6.66M20.56,9.22C20.85,10.09 21,11.03 21,12C21,13.44 20.63,14.79 20.03,16H19L18.16,12.66L19.66,9.66L20.56,9.22M8,10H11L13.81,13.28L12,16L8.84,16.78L6.53,13.69L8,10M12,17L15,19L14.13,20.72C13.44,20.88 12.73,21 12,21C10.25,21 8.63,20.5 7.25,19.63L8.41,17.91L12,17M19,17H19.5C18.5,18.5 17,19.67 15.31,20.34L16,19L19,17Z"
                      />
                    </svg>
                  </div>

                  <div className="space-y-1 text-gray-800">
                    <div className="grid grid-cols-[4rem,1fr] gap-2">
                      <span className="font-medium">Booking No</span>
                      <span>{selectedBooking?.slotNumber}</span>
                    </div>
                    <div className="grid grid-cols-[4rem,1fr] gap-2">
                      <span className="font-medium">Date</span>
                      <span>{selectedBooking?.date}</span>
                    </div>
                    <div className="grid grid-cols-[4rem,1fr] gap-2">
                      <span className="font-medium">Time</span>
                      <span>{selectedBooking?.time}</span>
                    </div>
                    <div className="grid grid-cols-[4rem,1fr] gap-2">
                      <span className="font-medium">Price</span>
                      <span>{selectedBooking?.price}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingList;
