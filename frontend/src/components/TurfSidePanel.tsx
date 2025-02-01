import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch} from "react-redux";
import { signout as turfLogout } from "../Redux/turfSlice";

const TurfSidePanel = ({ page }: { page: string }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(turfLogout());
  };

  const pages = [
    { name: "dashboard", label: "Dashboard", link: "/turf/dashboard" },
    {
      name: "slot-management",
      label: "Slot Management",
      link: "/turf/slot-management",
    },
    {
      name: "customer-chat",
      label: "Customer Chat",
      link: "/turf/customer-chat",
    },
    {
      name: "booking-management",
      label: "Booking List",
      link: "/turf/booking-management",
    },
    {
      name: "upgrade-details",
      label: "Upgrade Details",
      link: "/turf/details-update",
    },
  ];

  return (
    <div className="flex">
          <header className="w-full bg-gradient-to-b from-gray-700 to-gray-900 p-4 shadow-md flex justify-between items-center absolute top-0 left-0 z-50">
            <img
              src="https://i.imgur.com/1eyM5kC.png"
              alt="PlayBook Logo"
              className="w-32"
            />
            <button
              className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </header>
    
          {/* Slide-in Sidebar */}
          <div
            className={`absolute left-0 w-64 bg-gradient-to-b from-gray-700 to-gray-900 shadow-2xl p-6 transform transition-transform duration-300 z-40 ${
              showSidebar ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <nav className="flex flex-col gap-4">
              <h1 className="text-white text-lg font-bold">🌟 Turf Panel</h1>
              {pages.map(({ name, label, link }) => (
                <Link key={name} to={link}>
                  <button
                    className={`btn hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white rounded-lg py-3 px-4 transition-all duration-300 w-full text-left font-medium ${
                      page === name
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => setShowSidebar(false)}
                  >
                    {label}
                  </button>
                </Link>
              ))}
              <button
                className="mt-6 bg-red-600 text-white rounded-lg py-3 px-4 w-full text-left font-medium flex items-center gap-2 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300"
                onClick={handleLogout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </nav>
          </div>
    
          {/* Backdrop when sidebar is open */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setShowSidebar(false)}
            />
          )}
        </div>
  );
};

export default TurfSidePanel;
