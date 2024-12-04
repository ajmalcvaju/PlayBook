import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


type Booking = {
  _id: string;
  date: string;
  turfName: string;
  firstName:string;
  lastName:string;
  time: string;
  price: string;
  mobileNumber:string;
  email:string;
  isBooked: boolean;
  turfId: string;
  review: string;
  __v: number;
};

const BookingListAdmin = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("adminToken")
  useLayoutEffect(()=>{
   if(!token){
    navigate("/adminLogin")
   }
  },[])
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("adminMail");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:7000/api/admin/get-booking")
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await res.json();
        console.log(data)
        setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-300">Loading bookings...</div>;
  }

  return (
    <div className="bg-gray-950 p-4 min-h-screen">
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-800 text-xs uppercase text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">User No</th>
              <th scope="col" className="px-6 py-3">Turf Name</th>
              <th scope="col" className="px-6 py-3">User Name</th>
              <th scope="col" className="px-6 py-3">Date & Time</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <tr
                  className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800"
                  key={booking._id}
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    {booking.turfName
                      ? `${booking.turfName}`
                      : " "}
                  </td>
                  <td className="px-6 py-4">{booking.firstName || " "} {booking.lastName || " "}</td>
                  <td className="px-6 py-4">{`${booking.date} ${booking.time}`}</td>
                  <td className="px-6 py-4">
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800">
                <td colSpan={7} className="px-6 py-4 text-center">No bookings available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingListAdmin;
