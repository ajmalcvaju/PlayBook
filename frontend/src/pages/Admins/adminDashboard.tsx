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
};

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filter, setFilter] = useState<string>("custom"); // Track the current filter
  let chartInstance: Chart | null = null;
  let revenueChartInstance: Chart | null = null;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await apiClient.get("/admin/get-booking");
        const data = response.data;
        console.log(data);
        setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);
  useEffect(() => {
    const today = new Date();
    let start: Date;

    switch (filter) {
      case "today":
        start = today;
        setStartDate(today.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "1week":
        start = new Date();
        start.setDate(today.getDate() - 7);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "1month":
        start = new Date();
        start.setMonth(today.getMonth() - 1);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      default:
        start = new Date(startDate);
        break;
    }

    const filtered = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= start && bookingDate <= today;
    });

    setFilteredBookings(filtered);
  }, [bookings, filter, startDate]);

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
        labels: labels,
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

    // Create the revenue chart below the bar chart
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
        labels: revenueLabels,
        datasets: [
          {
            label: "Revenue per Day",
            data: revenueValues.reverse(),
            // backgroundColor: "rgba(75, 192, 192, 0.2)",
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
  return (
    <div className="overflow-x-auto bg-gray-900 text-white p-6">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 mb-10 hover:shadow-xl transition-all duration-300">
        {/* Date Range Filter Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-6 space-y-6 lg:space-y-0 lg:space-x-6">
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

          <button
            onClick={handleDateChange}
            className="bg-teal-500 text-white rounded-md py-2 mt-6 lg:mt-0 px-4 font-semibold hover:bg-teal-600 transition duration-300 w-full lg:w-auto"
          >
            Apply Date Range
          </button>
        </div>

        {/* Filter Buttons Section */}
        <div className="flex flex-wrap justify-start space-x-4 mb-6">
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
        </div>

        {/* Booking Chart Section */}
        <div className="mb-6">
          <canvas id="bookingsChart" width="400" height="150"></canvas>
        </div>

        {/* Revenue Chart Section */}
        <div>
          <canvas id="revenueChart" width="400" height="150"></canvas>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
