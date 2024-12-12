import React, { useEffect, useRef, useState } from "react";
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
  latitude:number;
  longitude:number
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
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0); 
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const { id } = useParams<{ id: string }>();
  const mapRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  // const API_KEY = import.meta.env.VITE_API_KEY;
  const API_KEY = 'cc4cb52276bae2c8af66db640565551b';
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
  useEffect(() => {
    if (turf?.latitude && turf?.longitude) {
      const latitude = turf.latitude;
      const longitude = turf.longitude;
  
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => setCurrentWeather(data))
        .catch((error) => console.error("Error fetching current weather:", error));
  
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => setForecast(data))
        .catch((error) => console.error("Error fetching weather forecast:", error));
    }
  }, [turf]);
  

  useEffect(() => {
    // Load the Google Maps script
    const loadGoogleMaps = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => initializeMap();
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      const location = { lat: turf?.latitude, lng: turf?.longitude };

      const map = new google.maps.Map(mapRef.current, {
        center: location,
        zoom: 13,
      });

      new google.maps.Marker({
        position: location,
        map: map,
        title: "Turf Location", 
      });
    };

    if (!window.google || !google.maps) {
      loadGoogleMaps();
    } else {
      initializeMap();
    }
  }, [turf]);

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
  const openChat=()=>{
    navigate("chat-with-turf");
  }
  return (
    <>
    <div className="bg-gray-900 text-gray-200 min-h-screen p-5">
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
            <button onClick={openChat} className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-300">
              Chat With Us
            </button>
          </div>
        </div>
      </div>
      {/* Outlet to render modal */}
      <Outlet />
      
      <div className="flex flex-col mt-20 gap-10 px-5">
  {/* Turf Overview Section */}
  <div className="flex gap-5">
  {/* Turf Overview Section */}
  <div className="w-1/2 p-5 border-2 border-gray-600 rounded-lg bg-gray-800 text-gray-200">
    <h1 className="text-center text-xl mb-5 border-b-2 border-gray-600 pb-2">
      Turf Overview
    </h1>
    <p>
      {turf?.turfOverview}
    </p>
  </div>

  {/* Turf Facilities Section */}
  <div className="w-1/2 p-5 border-2 border-gray-600 rounded-lg bg-gray-800 text-gray-200">
    <h1 className="text-center text-xl mb-5 border-b-2 border-gray-600 pb-2">
      Turf Facilities
    </h1>
    <p>
      {turf?.facilities}
    </p>
  </div>
</div>


  {/* Map and Weather Information Section */}
  <div className="flex justify-between items-start gap-5">
    {/* Map Section */}
    <div className="w-1/2 p-5 border-2 border-gray-600 rounded-lg bg-gray-800">
      <h1 className="text-center mb-5 text-xl border-b-2 border-gray-600 pb-2">
        Location
      </h1>
      <h2 className="mt-7">{turf?.turfAddress || "Address not available."}</h2>
      <div
        ref={mapRef}
        className="h-[500px] mt-7 w-full border-2 border-gray-600 rounded-lg"
      >
        {/* Map content will be rendered here */}
      </div>
    </div>

    {/* Weather Information Section */}
    <div className="w-1/2 p-5 border-2 border-gray-600 rounded-lg bg-gray-800">
      <h1 className="text-center mb-5 text-xl border-b-2 border-gray-600 pb-2">
        Weather Information
      </h1>
      {currentWeather ? (
        <div>
          <h2 className="text-lg mb-3">Current Weather</h2>
          <p>Temperature: {currentWeather.main.temp}°C</p>
          <p>Condition: {currentWeather.weather[0].description}</p>
          <p>Humidity: {currentWeather.main.humidity}%</p>
        </div>
      ) : (
        <p>Loading current weather...</p>
      )}
      {forecast ? (
        <div className="mt-5">
          <h2 className="text-lg mb-3">Today's Expected Weather</h2>
          {forecast.list.slice(2,6).map((entry, index) => (
            <div
              key={index}
              className="mb-3 p-3 bg-gray-900 rounded-md border border-gray-700"
            >
              <p>Date: {new Date(entry.dt_txt).toLocaleString()}</p>
              <p>Temperature: {entry.main.temp}°C</p>
              <p>Condition: {entry.weather[0].description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading forecast...</p>
      )}
    </div>
  </div>
</div>

</div>

    </>
  );
};

export default TurfPages;
