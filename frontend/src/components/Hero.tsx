import { useState, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../Redux/userSlice";
import { signout as turfLogout } from "../Redux/turfSlice";
import { signout as adminLogout } from "../Redux/adminSlice";

interface HeroProps {
  user: string;
}

const Hero = ({ user }: HeroProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { currentUser } = useSelector((state: any) => state.user);
  const { currentTurf } = useSelector((state: any) => state.turf);
  const { admin } = useSelector((state: any) => state.admin);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    if (currentUser || currentTurf || admin) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    if (user === "user") dispatch(logout());
    else if (user === "turf") dispatch(turfLogout());
    else if (user === "admin") dispatch(adminLogout());
  };

  return (
    <>
      {user === "user" && (
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold tracking-wide">
              <img
                src="https://i.imgur.com/1eyM5kC.png"
                alt="PlayBook Logo"
                className="w-32"
              />
            </Link>

            {/* Navigation Links for Desktop */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="hover:text-teal-400 transition duration-300"
              >
                Home
              </Link>
              {isLoggedIn && user === "user" && (
                <>
                  <Link
                    to="/profile"
                    className="hover:text-teal-400 transition duration-300"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/form-team"
                    className="hover:text-teal-400 transition duration-300"
                  >
                    Form Team
                  </Link>
                  <Link
                    to="/booking-list"
                    className="hover:text-teal-400 transition duration-300"
                  >
                    Bookings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hover:text-red-400 transition duration-300"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>

            {/* Mobile Menu Icon */}
            <div className="md:hidden">
              <button
                className="p-2 text-gray-400 hover:text-white"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
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
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div className="fixed top-0 left-0 h-full w-3/4 bg-gray-900 text-white z-50 shadow-lg transition-transform transform duration-300 ease-in-out">
              <div className="flex flex-col space-y-4 p-6">
                <button
                  className="self-end p-2 text-gray-400 hover:text-white"
                  onClick={() => setShowMobileMenu(false)}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <Link
                  to="/"
                  className="hover:text-teal-400 transition duration-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Home
                </Link>
                {isLoggedIn && user === "user" && (
                  <>
                    <Link
                      to="/profile"
                      className="hover:text-teal-400 transition duration-300"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/form-team"
                      className="hover:text-teal-400 transition duration-300"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Form-Team
                    </Link>
                    <Link
                      to="/booking-list"
                      className="hover:text-teal-400 transition duration-300"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Bookings
                    </Link>
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="hover:text-red-400 transition duration-300 cursor-pointer"
                    >
                      Logout
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      {/* Logout for Turf or Admin */}
      {(user === "turf" || user === "admin") && (
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <img
              src="https://i.imgur.com/1eyM5kC.png"
              alt="PlayBook Logo"
              className="w-32"
            />

            <nav className="hidden md:flex space-x-8">
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="hover:text-red-400 transition duration-300"
                >
                  Logout
                </button>
              )}
            </nav>

            {/* Mobile Menu Icon */}
            <div className="md:hidden">
              <button
                className="p-2 text-gray-400 hover:text-white"
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
            </div>
          </div>
        </header>
      )}
    </>
  );
  
  
};

export default Hero;
