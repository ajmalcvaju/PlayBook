import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../apiClient";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { Star, Share2 } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Swiper, SwiperSlide } from "swiper/react";
// import 'swiper/swiper-bundle.min.css';
// import "swiper/css"

type Booking = {
  _id: string;
  turfId:string;
  slotId: string;
  date: string;
  turfName: string;
  time: string;
  price: string;
  mobileNumber: string;
  email: string;
  isBooked: boolean;
  review: string;
  __v: number;
  slotNumber: number;
  bookingNumber: number;
  status: string;
};
interface Turf {
  _id: string;
  turfName: string;
  email: string;
  mobileNumber: string;
  gallery: string[];
  turfAddress: string;
  turfOverview: string;
  facilities: string;
  latitude: number;
  longitude: number;
}
interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  isVerified: number;
  isApproved: number;
  __v: number;
  latitude: number;
  longitude: number;
  locationName: string;
  isOnline: boolean;
  lastSeen: string;
}
interface UserState {
  currentUser: CurrentUser;
}
interface RootState {
  user: UserState;
}

// Type for the weather condition description
interface WeatherCondition {
  description: string;
}

// Type for the main data object
interface MainData {
  temp: number; // Temperature in Celsius
}

interface ForecastEntry {
  dt_txt: string; // Date-time string
  main: MainData; // Main weather data
  weather: WeatherCondition[]; // Array of weather conditions
}

interface Forecast {
  list: ForecastEntry[];
}

interface WeatherCondition {
  description: string;
}

// Type for the main weather data (temperature, humidity, etc.)
interface MainWeatherData {
  temp: number; // Temperature in Celsius
  humidity: number; // Humidity percentage
}

// Type for the full current weather object
interface CurrentWeather {
  main: MainWeatherData; // Main weather data (temperature, humidity)
  weather: WeatherCondition[]; // Array of weather conditions
}

// Type for the user who posted the review
interface User {
  firstName: string;
  lastName: string;
}

// Type for the turf being reviewed
interface Turf {
  turfName: string;
}

interface Review {
  _id: string;
  userId: User;
  turfId: Turf;
  rating: number; // Rating from 1 to 10
  tags: string[]; // List of tags associated with the review
  comment: string; // The review comment
  createdAt: string; // ISO string for the creation date
}



const TurfPages: React.FC = () => {
  const navigate = useNavigate();
  let token = localStorage.getItem("userToken");
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [ratingFailure, setRatingFailure] = useState(false);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportFailure, setReportFailure] = useState(false);
  const [reportModel, setReportModel] = useState<boolean>(false);
  const [isBooked,setIsBooked]=useState<boolean>(false)
  const email = localStorage.getItem("userEmail");

  const tags = [
    "#StunningVibe",
    "#BestTurf",
    "#ProTurfExperience",
    "#OkExperience",
    "#UltimatePlay",
    "#PlayLikePros",
  ];
  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  const [turf, setTurf] = useState<Turf | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather|null>(null);
  const [forecast, setForecast] = useState<Forecast|null>(null);
  const [ratingModel, setRatingModel] = useState(false);
  const [reviews, setReviews] = useState<Review[]|[]>([]);
  const [ratings, setRatings] = useState<number>(0);
  const [votes, setVotes] = useState<number>(0);
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const issues = [
    "Turf staff is unresponsive or unhelpful",
    "Turf is in poor condition",
    "Lighting issues",
    "Unsafe playing conditions",
    "Turf does not match the description/photos",
  ];
  const { id } = useParams<{ id: string }>();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  // const API_KEY = import.meta.env.VITE_API_KEY;
  const API_KEY = "cc4cb52276bae2c8af66db640565551b";
  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const response = await apiClient.get(`/users/get-turf-details/${id}`);
        const data = response.data;
        setTurf(data.turfDetails);
        if (data.turfDetails?.gallery?.length > 0) {
          setActiveImageIndex(0);
        }
      } catch (error) {
        console.error("Failed to fetch turf details:", error);
      }
    };
    fetchTurfDetails();
  }, [id]);
  
  useEffect(() => {
    const fetchTurfReview = async () => {
      try {
        const response = await apiClient.get(`/users/get-ratings/${id}`);
        const data = response.data;
        setReviews(data.Review);
        setRatings(data.rating);
        setVotes(data.votes);
      } catch (error) {
        console.error("Failed to fetch turf details:", error);
      }
    };
    fetchTurfReview();
  }, [id, ratingSuccess]);
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiClient.get(`/users/get-booking/${email}`);
        if (res.status !== 200) {
          throw new Error("Failed to fetch bookings");
        }
        res.data;
        const isBookingMatch = (bookings: Booking[], turfId: string | undefined) =>
          bookings.some(booking => booking.turfId === turfId);
  
        setIsBooked(isBookingMatch(res.data, id));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, [email, id]); 
  
  useEffect(() => {
    if (turf?.latitude && turf?.longitude) {
      const latitude = turf.latitude;
      const longitude = turf.longitude;

      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => setCurrentWeather(data))
        .catch((error) =>
          console.error("Error fetching current weather:", error)
        );

      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      )
        .then((response) => response.json())
        .then((data) =>{ 
          console.log(data)
          setForecast(data)
        })
        .catch((error) =>
          console.error("Error fetching weather forecast:", error)
        );
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
      const latitude = turf?.latitude;
      const longitude = turf?.longitude;
      if (latitude && longitude) {
        const location = { lat: latitude, lng: longitude };
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: location,
            zoom: 13,
          });
    
          new google.maps.Marker({
            position: location,
            map: map,
            title: "Turf Location",
          });
        } else {
          console.error("mapRef is not set or is null");
        }
      } else {
        console.error("Invalid latitude or longitude");
      }
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
    console.log("hi");
    navigate("book-ticket");
  };
  const openChat = () => {
    navigate("chat-with-turf");
  };
  const rateTurf = () => {
    setRatingModel(true);
  };
  const changeComment = (e:any) => {
    const value = e.target.value;
    const tagsPart = `${selectedTags.join(", ")}`;
    if (value.startsWith(tagsPart)) {
      setComment(value.slice(tagsPart.length).trimStart());
    } else {
      setComment(value);
    }
  };
  const submitRating = async () => {
    const payload = {
      turfId: id,
      userId: currentUser._id,
      rating: rating,
      comment: comment.trim(),
      tags: selectedTags,
    };
    console.log(payload);
    try {
      const response = await apiClient.post("/users/give-ratings", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        const result = response.data;
        console.log("Rating submitted successfully:", result);
        setRatingModel(false);
        setRatingSuccess(true);
        setTimeout(() => {
          setRatingSuccess(false);
        }, 3000);
      } else {
        const error = response.data;
        setRatingFailure(true);
        console.error("Failed to submit rating:", error);
        setTimeout(() => {
          setRatingFailure(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setRatingFailure(true);
      setTimeout(() => {
        setRatingFailure(false);
      }, 3000);
    }
  };
  const reportTurf = () => {
    setReportModel(true);
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        issue: selectedIssue,
        turfId: id,
        userId: currentUser._id,
      };
      const response = await apiClient.post("/users/report", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setReportModel(false);
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
        }, 3000);
      }
    } catch (error) {
      setReportModel(false);
      setReportFailure(true);
      setTimeout(() => {
        setReportFailure(false);
      }, 3000);
    }
  };
  
  return (
    <>
      {reportSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-300 rounded-md">
            Your report was submitted successfully!
          </div>
        </div>
      )}
      {reportFailure && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
            Your report submission failed. Try again!
          </div>
        </div>
      )}
      {reportModel && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 border rounded-lg shadow-lg w-96 relative">
            <h2 className="text-lg font-bold mb-4">Report Turf Issue</h2>
            <button
              onClick={() => setReportModel(false)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Close
            </button>
            <form onSubmit={handleSubmit}>
              {issues.map((issue, index) => (
                <div key={index} className="mb-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="issue"
                      value={issue}
                      checked={selectedIssue === issue}
                      onChange={() => setSelectedIssue(issue)}
                      className="form-radio text-blue-600"
                    />
                    <span>{issue}</span>
                  </label>
                </div>
              ))}
              <button
                type="submit"
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
      {ratingFailure && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg rounded-lg z-50 text-center">
          <p className="text-xl font-semibold text-red-600">
            Your rating failed... Try again later
          </p>
          <button
            onClick={() => setRatingFailure(false)}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      )}
      {ratingSuccess && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-300 p-6 shadow-lg rounded-lg z-50 text-center">
          <p className="text-xl font-semibold text-green-600">
            Your rating updated successfully
          </p>
          <button
            onClick={() => setRatingSuccess(false)}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Close
          </button>
        </div>
      )}
      {ratingModel && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
        >
          <div
            className="max-w-sm mx-auto bg-gradient-to-r from-white to-gray-50 p-6 md:p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105"
            style={{ width: "90%", height: "auto" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  How was the Turf?
                </h2>
                <p className="text-gray-500 text-sm italic">
                  Turf Name: {turf?.turfName}{" "}
                </p>
              </div>
              <button
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                onClick={() => setRatingModel(false)} // Close the modal
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Rating Slider */}
            <div className="mb-6">
              <h3 className="text-base   font-medium mb-4 text-gray-700">
                How would you rate the Turf?
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  {/* Star Above the Slider */}
                  <div
                    className="absolute -top-6 left-0 transform -translate-x-1/2 text-red-500 text-xl font-bold"
                    style={{
                      left: `${(rating / 10) * 100}%`, // Position dynamically based on rating
                    }}
                  >
                    ★
                  </div>

                  {/* Slider Input */}
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <span className="text-gray-800 font-medium text-sm">
                  {rating}/10
                </span>
              </div>
            </div>

            {/* Show hashtags and comment section only if rating >= 1 */}
            {rating > 0 && (
              <>
                {/* Tags Section */}
                <div className="mb-6">
                  <h3 className="text-base font-medium mb-3 text-gray-700">
                    What do you think about the turf?
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Express yourself with hashtags!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shadow-md ${
                          selectedTags.includes(tag)
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-red-100 hover:text-red-500"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text Area */}
                <div className="mb-6">
                  <h3 className="text-base font-medium mb-3 text-gray-700">
                    Express more, write a review
                  </h3>
                  <textarea
                    placeholder="Optional"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
                    value={`${selectedTags.join(", ")} ${comment}`}
                    onChange={changeComment}
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              onClick={submitRating}
              disabled={rating === 0} // Disable if rating is 0
              className={`w-full py-2.5 rounded-lg font-medium text-base shadow-lg transition-transform transform hover:scale-105 ${
                rating === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" // Disabled state styles
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
              }`}
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
      <div className="bg-gray-900 text-gray-200 min-h-screen p-5">
        <div
          className="bg-black text-white rounded-2xl shadow-xl w-full hover:shadow-2xl transition-shadow duration-300 flex flex-col md:flex-row relative bg-cover bg-center"
          style={{
            backgroundImage: turf?.gallery?.[activeImageIndex]
              ? `url(${turf.gallery[activeImageIndex]})`
              : "none",
          }}
        >
          {/* Left Image Section */}
          <div className="w-full bg-black md:w-1/3 flex justify-center items-center relative overflow-hidden md:rounded-l-2xl">
            <img
              src={turf?.gallery?.[activeImageIndex] || "/default-poster.jpg"}
              alt={turf?.turfName || "Turf"}
              className="rounded-2xl max-w-full h-auto transition-transform transform hover:scale-110 duration-500"
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

          {/* Right Content Section */}
          <div className="bg-black bg-opacity-80 p-6 md:w-2/3 flex flex-col justify-between">
            <h2 className="text-3xl font-semibold mb-4">
              {turf?.turfName || "Turf Name"}
            </h2>

            {/* Rating and Button Section */}
            <div className="flex justify-between items-center gap-3 bg-zinc-900 text-white px-4 py-2 rounded-lg shadow-md sm:w-full lg:w-1/2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-pink-500 stroke-pink-500" />
                <span className="font-medium">{ratings}/10</span>
                <div className="text-zinc-400 text-sm">({votes} Votes)</div>
              </div>
              {isBooked&&(
              <button
                onClick={rateTurf}
                className="ml-2 bg-white text-black hover:bg-zinc-200 hover:text-black border-2 border-gray-300 shadow-lg rounded-lg px-3 py-1 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Rate now
              </button>)}
            </div>

            {/* Turf Details */}
            <div className="space-y-3 mt-4">
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-7 lg:w-1/2">
              <button
                onClick={reportTurf}
                className="bg-red-700 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-300"
              >
                Report
              </button>
              <button
                onClick={openModal}
                className="bg-green-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-600 transition duration-300"
              >
                Book Now
              </button>
            </div>

            {/* Contact Section */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Contact Us
              </h3>
              <button
                onClick={openChat}
                className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-300"
              >
                Chat With Us
              </button>
            </div>
          </div>
        </div>

        {/* Outlet to render modal */}
        <Outlet />

        <div className="flex flex-col mt-20 gap-10 px-5">
          {/* Turf Overview Section */}
          <div className="flex flex-col md:flex-row gap-5">
            {/* Turf Overview Section */}
            <div className="w-full md:w-1/2 p-5 border-2 border-gray-600 rounded-lg bg-gray-800 text-gray-200">
              <h1 className="text-center text-xl mb-5 border-b-2 border-gray-600 pb-2">
                Turf Overview
              </h1>
              <p>{turf?.turfOverview}</p>
            </div>

            {/* Turf Facilities Section */}
            <div className="w-full md:w-1/2 p-5 border-2 border-gray-600 rounded-lg bg-gray-800 text-gray-200">
              <h1 className="text-center text-xl mb-5 border-b-2 border-gray-600 pb-2">
                Turf Facilities
              </h1>
              <p>{turf?.facilities}</p>
            </div>
          </div>

          {/* Map and Weather Information Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-5">
            {/* Map Section */}
            <div className="w-full md:w-1/2 p-5 border-2 border-gray-600 rounded-lg bg-gray-800">
              <h1 className="text-center mb-5 text-xl border-b-2 border-gray-600 pb-2">
                Location
              </h1>
              <h2 className="mt-7">
                {turf?.turfAddress || "Address not available."}
              </h2>
              <div
                ref={mapRef}
                className="h-[300px] md:h-[500px] mt-7 w-full border-2 border-gray-600 rounded-lg"
              >
                {/* Map content will be rendered here */}
              </div>
            </div>

            {/* Weather Information Section */}
            <div className="w-full md:w-1/2 p-5 border-2 border-gray-600 rounded-lg bg-gray-800">
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
                  {forecast.list.slice(2, 6).map((entry, index) => (
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

          <div className="flex flex-col gap-5">
            {/* Reviews Section */}
            <div className="w-full p-5 border-2 border-gray-600 rounded-lg bg-gray-800">
              <h1 className="text-center mb-5 text-3xl border-b-2 border-gray-600 pb-2">
                Reviews
              </h1>
              <div className="w-full max-w-7xl mx-auto py-6">
                {/* Reviews Carousel */}
                <Swiper
                  spaceBetween={30}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 1 }, // 1 review per view on mobile
                    768: { slidesPerView: 2 }, // 2 reviews per view on tablets
                    1024: { slidesPerView: 3 }, // 3 reviews per view on desktops
                  }}
                  loop={true} // Optional: makes the carousel loop infinitely
                  pagination={{ clickable: true }} // Optional: adds pagination controls
                  navigation={{ enabled: true }} // Optional: adds navigation arrows
                >
                  {reviews.map((review) => (
                    <SwiperSlide key={review._id}>
                      <div className="w-full max-w-xl p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                {/* Placeholder for user avatar */}
                              </div>
                              <div>
                                <div className="text-sm text-gray-900">
                                  {review.userId.firstName}{" "}
                                  {review.userId.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Rated {review.turfId.turfName}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-rose-400 stroke-rose-400" />
                            <span className="text-sm text-gray-900">
                              {review.rating}/10
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-blue-600 text-sm">
                            {review.tags.join(", ")}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {review.comment}
                          </p>

                          <div className="flex items-center gap-6 pt-2">
                            <span className="text-gray-400 text-sm">
                              {formatDistanceToNow(parseISO(review.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <button className="ml-auto">
                              <Share2 className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TurfPages;
