import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Outlet, useNavigate, useParams } from "react-router-dom";

interface Turf {
  _id: string;
  turfName: string;
  email: string;
  mobileNumber: string;
  gallery: string[];
  turfAddress: string;
  turfOverview: string;
  facilities: string;
}

const TurfPages: React.FC = () => {
  const navigate = useNavigate();
  let token=localStorage.getItem("userToken")
  useEffect(()=>{
   if(!token){
    navigate("/login")
   }
  },[])
  const [turf, setTurf] = useState<Turf | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0); // Track the index of the active image
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:7000/api/users/get-turf-details/${id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setTurf(data.turfDetails);

        if (data.turfDetails.gallery?.length > 0) {
          setActiveImageIndex(0);
        }
      } catch (error) {
        console.error("Failed to fetch turf details:", error);
      }
    };

    fetchTurfDetails();
  }, [id]);

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) =>
      Math.min((turf?.gallery?.length || 1) - 1, prevIndex + 1)
    );
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const openModal = () => {
    navigate("book-ticket"); // Navigate to the modal route
  };

  return (
    <>
      <div
        className="bg-black text-white rounded-2xl shadow-xl w-full hover:shadow-2xl transition-shadow duration-300 flex flex-col md:flex-row relative bg-cover bg-center"
        style={{
          backgroundImage: turf?.gallery?.[activeImageIndex]
            ? `url(${turf.gallery[activeImageIndex]})`
            : "none",
        }}
      >
        <div className="w-full bg-black md:w-1/4 flex justify-center items-center relative">
          <img
            src={turf?.gallery?.[activeImageIndex] || "/default-poster.jpg"}
            alt={turf?.turfName || "Turf"}
            className="rounded-2xl max-w-full h-auto"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
            <button
              onClick={handlePrevImage}
              className="bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition duration-300"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={handleNextImage}
              className="bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition duration-300"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div className="bg-black bg-opacity-90 p-6 w-1/3 flex flex-col">
          <h2 className="text-3xl font-semibold mb-4">
            {turf?.turfName || "Turf Name"}
          </h2>
          <div className="flex items-center space-x-4 text-lg text-yellow-400 mb-4">
            <span className="flex items-center">
              <FaChevronLeft />
              <p className="ml-2">6.7/10 (167.4K Votes)</p>
              <FaChevronRight />
            </span>
          </div>
          <p>
            <strong>Address:</strong> {turf?.turfAddress || "Not available"}
          </p>
          <p>
            <strong>Mobile Number:</strong>{" "}
            {turf?.mobileNumber || "Not available"}
          </p>
          <p>
            <strong>Email:</strong> {turf?.email || "Not available"}
          </p>
          <div className="flex justify-between items-center mt-7">
            <button className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-300">
              Rate Now
            </button>
            <button
              onClick={openModal}
              className="bg-green-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-600 transition duration-300"
            >
              Book Now
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white mb-2">Contact Us</h3>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-300">
              Chat With Us
            </button>
          </div>
        </div>
      </div>
      {/* Outlet to render modal */}
      <Outlet />
    </>
  );
};

export default TurfPages;
