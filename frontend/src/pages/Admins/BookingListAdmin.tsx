import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";
interface Booking {
  _id: string;
  price: number;
  status: string;
  slotId: string;
  time: string;
  date: string;
  slotNumber: number;
  turfName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
}

const BookingListAdmin = () => {
  let navigate = useNavigate();
  let token = localStorage.getItem("adminToken");
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<null | Booking>(null);
    const bookingsPerPage = 6;
  const email = localStorage.getItem("adminMail");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/admin/get-booking");
        const data = response.data;
        console.log(data);
        setBookings(data.bookings);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  if (loading) {
    return(<div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-300 min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 mb-4"></div>
        <h1 className="text-xl font-semibold tracking-wider">Loading Bookings...</h1>
        <p className="text-gray-400 text-sm mt-2">Please wait a moment while we fetch your data.</p>
      </div>)
  }

  return (
    <>{isModalOpen && selectedBooking && (
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
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-md shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Close
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
                Booking Number
              </th>
              <th scope="col" className="px-6 py-3">
                User Name
              </th>
              <th scope="col" className="px-6 py-3">
                Turf Name
              </th>
              <th scope="col" className="px-6 py-3">
                User Email
              </th>
              <th scope="col" className="px-6 py-3">
                User Mobile Number
              </th>
              <th scope="col" className="px-6 py-3">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Booking Details
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
                  <td className="px-6 py-4">
                    {booking.turfName} 
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

export default BookingListAdmin;
