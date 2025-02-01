import { useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import apiClient from "../../apiClient";

type Booking = {
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
  turfName: string;
};
type Turf = {
  _id: string;
  turfName: string;
  isApproved: boolean;
  email: string;
  mobileNumber: string;
  bookingsCount: number;
  isBlocked: boolean;
  reports: string[];
  paid: number;
  history: { amount: number; date: Date }[];
};
declare global {
  interface Window {
    Razorpay: any;
  }
}


const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filter, setFilter] = useState<string>("custom");
  const [turfName, setTurfName] = useState<string>("all");
  const [uniqueTurfs, setUniqueTurfs] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [history, setHistory] = useState<{ amount: number; date: Date }[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [turf, setTurf] = useState<Turf|null>(null);
  let chartInstance: Chart | null = null;
  let revenueChartInstance: Chart | null = null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await apiClient.get("/admin/get-booking");
        const data = response.data;
        console.log(data);
        setBookings(data.bookings);

        // Extract unique turf names
        const turfs = Array.from(
          new Set(data.bookings.map((b: Booking) => b.turfName))
        );
        setUniqueTurfs(["all", ...turfs as string[]]);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    const filterBookings = () => {
      console.log("hi")
      let filtered = bookings;
      if (filter !== "custom") {
        const today = new Date();
        let start: Date;

        switch (filter) {
          case "today":
            start = today; 
            break;
          case "1week":
            start = new Date();
            start.setDate(today.getDate() - 7);
            break;
          case "1month":
            start = new Date();
            start.setMonth(today.getMonth() - 1);
            break;
          default:
            start = new Date(0);
            break;
        }

        const end = new Date();
        filtered = filtered.filter((booking) => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= start && bookingDate <= end;
        });
      }
      if (turfName !== "all") {
        filtered = filtered.filter((booking) => booking.turfName === turfName);
      }

      setFilteredBookings(filtered);
    };

    filterBookings();
  }, [bookings, filter, turfName]);

  useEffect(() => {
    if (!filteredBookings.length) return;

    const bookingCounts = filteredBookings.reduce(
      (acc: Record<string, number>, booking) => {
        acc[booking.date] = (acc[booking.date] || 0) + 1;
        return acc;
      },
      {}
    );

    const labels = Object.keys(bookingCounts);
    const data = Object.values(bookingCounts);

    const canvas = document.getElementById(
      "bookingsChart"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels.reverse(),
        datasets: [
          {
            label: "Number of Bookings",
            data: data.reverse(),
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    const revenueData = filteredBookings.reduce(
      (acc: Record<string, number>, booking) => {
        const bookingDate = booking.date;
        acc[bookingDate] = (acc[bookingDate] || 0) + booking.price;
        return acc;
      },
      {}
    );

    const revenueLabels = Object.keys(revenueData);
    const revenueValues = Object.values(revenueData);

    const revenueCanvas = document.getElementById(
      "revenueChart"
    ) as HTMLCanvasElement;
    if (!revenueCanvas) return;

    const revenueCtx = revenueCanvas.getContext("2d");
    if (!revenueCtx) return;

    if (revenueChartInstance) {
      revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(revenueCtx, {
      type: "line",
      data: {
        labels: revenueLabels.reverse(),
        datasets: [
          {
            label: "Revenue per Day",
            data: revenueValues.reverse(),
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      if (revenueChartInstance) {
        revenueChartInstance.destroy();
        revenueChartInstance = null;
      }
    };
  }, [filteredBookings]);

  const handleDateChange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filtered = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= start && bookingDate <= end;
    });
    setFilteredBookings(filtered);
  };

  const handleFilter = () => {
    const filteredBookings = bookings.filter((booking) => {
      const isTurfMatch = turfName ? booking.turfName === turfName : "all";
      return isTurfMatch;
    });

    const priceSum = filteredBookings.reduce(
      (sum, booking) => sum + booking.price,
      0
    );
    setTotalPrice(priceSum);

    // Set total paid for the selected turf
    if (turfName && turfName !== "all") {
      const selectedTurf = turfs.find((turf) => turf.turfName === turfName);
      setTurf(selectedTurf as Turf);
      if (selectedTurf) {
        setTotalPaid(turf?.paid as number);
        console.log(turf?.history);
        setHistory(turf?.history as { amount: number; date: Date }[]);
      }
    }
  };

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await apiClient.get("/admin/get-turfs");
        if (response.status === 200) {
          console.log(response.data);
          const { turfs } = response.data;
          setTurfs(turfs);
        } else {
          throw new Error("Failed to fetch turfs");
        }
      } catch (error) {
        console.error("Error fetching turfs:", error);
      }
    };
    fetchTurfs();
  }, []);

  useEffect(() => {
    if (filter === "custom" && turfName !== "all") {
      handleFilter();
    }
  }, [turfName, filter, turf]);
  useEffect(() => {
    setBalance((totalPrice ?? 0) - (totalPaid ?? 0));
  }, [totalPrice, totalPaid]);

  const openRazorpay = async () => {
    if (!window.Razorpay) {
      console.error("Razorpay SDK not loaded");
      alert("Payment gateway is not available. Please try again later.");
      // setIsBookingFailed(true);
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZOR_PAY_KEY,
      amount: balance * 100,
      currency: "INR",
      name: "PlayBook",
      description: "Turf Balance Payment",
      image: "https://i.imgur.com/1eyM5kC.png",
      handler: async (response:Response) => {
        console.log("Payment successful:", response);
        try {
          const res = await apiClient.post("/admin/pay-balance", {
            turfId: turf?._id,
            balance,
          });
          console.log("Balance paid:", res.data.turf);
          const paidTurf: Turf = res.data.turf;
          setTotalPaid(paidTurf.paid);
          // const notificationData = {
          //   turfId: turf._id,
          //   balance,
          // };
          // socket.emit("send-notification", notificationData);
          // setIsBookingSuccess(true);
        } catch (error:any) {
          console.error("Error confirming booking:", error);
          // setIsBookingFailed(true);
          throw new Error(
            `HTTP error! Status: ${error.response?.status || error.message}`
          );
        }
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", async (response:Response) => {
      try {
        const response = await apiClient.post("/admin/pay-balance", {
          turfId: turf?._id,
          balance,
        });
        console.log("Booking confirmed:", res.data);
      } catch (error) {
        console.error("Error confirming booking:", error);
      }
    });
    rzp.open();
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistory = history?.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="overflow-x-auto bg-gray-900 text-white p-6">
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-3/4 lg:w-1/2 max-w-4xl shadow-lg transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
            <h2 className="text-3xl font-semibold text-teal-600 mb-6">
              Payment History
            </h2>

            {/* Table for History */}
            <table className="min-w-full table-auto mb-6 shadow-lg rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentHistory.map((entry, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 hover:bg-teal-50 transition-all duration-300"
                  >
                    <td className="px-6 py-4 text-lg font-semibold text-teal-600">
                      {entry.amount.toFixed(2)}{" "}
                      {/* Formatting for better display */}
                    </td>
                    <td className="px-6 py-4 text-lg text-gray-800">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {/* Formatted Date */}
                    </td>
                    <td className="px-6 py-4 text-lg text-gray-800">
                      {new Date(entry.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}{" "}
                      {/* Formatted Time */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-3 mt-4">
              {Array.from(
                { length: Math.ceil(history.length / itemsPerPage) },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-full transition-all duration-300 ease-in-out ${
                      currentPage === index + 1
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-teal-100 text-teal-500 hover:bg-teal-500 hover:text-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>

            <button
              onClick={closeModal}
              className="mt-6 w-full py-3 bg-red-500 text-white font-semibold rounded-md transition-all duration-300 ease-in-out hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 mb-10 hover:shadow-xl transition-all duration-300">
        {/* Date Range and Turf Name Filter Section */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mb-6 space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="flex flex-col space-y-2 w-full lg:w-1/3">
            <label className="text-lg font-semibold">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-md p-2"
            />
          </div>

          <div className="flex flex-col space-y-2 w-full lg:w-1/3">
            <label className="text-lg font-semibold">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-md p-2"
            />
          </div>

          <div className="flex flex-col space-y-2 w-full lg:w-1/3">
            <label className="text-lg font-semibold">Turf Name:</label>
            <select
              value={turfName}
              onChange={(e) => setTurfName(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-md p-2"
            >
              {uniqueTurfs.map((turf) => (
                <option key={turf} value={turf}>
                  {turf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-start space-x-4 mb-6">
          <button
            onClick={handleDateChange}
            className="bg-teal-500 text-white rounded-md py-2 mt-6 lg:mt-0 px-4 font-semibold hover:bg-teal-600 transition duration-300 w-full lg:w-auto"
          >
            {" "}
            Apply Date Range{" "}
          </button>
          <button
            onClick={() => setFilter("today")}
            className="bg-teal-500 text-white rounded-md py-2 px-4 font-semibold hover:bg-teal-600 transition duration-300 mb-2 lg:mb-0"
          >
            Today
          </button>

          <button
            onClick={() => setFilter("1week")}
            className="bg-teal-500 text-white rounded-md py-2 px-4 font-semibold hover:bg-teal-600 transition duration-300 mb-2 lg:mb-0"
          >
            1 Week
          </button>
          <button
            onClick={() => setFilter("1month")}
            className="bg-teal-500 text-white rounded-md py-2 px-4 font-semibold hover:bg-teal-600 transition duration-300 mb-2 lg:mb-0"
          >
            1 Month
          </button>
          <button
            onClick={() => setFilter("custom")}
            className="bg-teal-500 text-white rounded-md py-2 px-4 font-semibold hover:bg-teal-600 transition duration-300 mb-2 lg:mb-0"
          >
            All bookings
          </button>
        </div>
        {turfName !== "all" && (
          <div className="bg-gray-800 p-6 rounded-xl text-lg font-semibold shadow-lg flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-6">
            {/* Total Price and Paid Section */}
            <div className="space-y-2 lg:space-y-0 flex flex-col lg:flex-row lg:items-center lg:space-x-6">
              <p className="text-teal-400 text-2xl">
                Total Price: <span className="text-white">{totalPrice}</span>
              </p>
              <p className="text-teal-400 text-2xl">
                Total Paid:{" "}
                <span className="text-white">{totalPaid ?? "0"}</span>
              </p>
              <p className="text-teal-400 text-2xl">
                Balance: <span className="text-white">{balance}</span>
              </p>
              <button
                onClick={openModal}
                className="text-xl bg-gradient-to-r from-teal-400 to-teal-600 text-white p-3 rounded-md shadow-md hover:scale-105 transform transition-all duration-300 ease-in-out hover:from-teal-500 hover:to-teal-700 hover:shadow-xl focus:outline-none"
              >
                Payment History
              </button>
            </div>

            {/* Pay Balance Button */}
            {balance !== 0 && (
              <button
                onClick={openRazorpay} // Add your payment handler function
                className="bg-green-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Pay Balance
              </button>
            )}
          </div>
        )}

        {/* Charts Section */}
        <div className="mb-6">
          <canvas id="bookingsChart" width="400" height="150"></canvas>
        </div>
        <div>
          <canvas id="revenueChart" width="400" height="150"></canvas>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
