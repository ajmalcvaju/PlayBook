import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import apiClient from "../apiClient";
import { Star } from "lucide-react";

interface Turf {
  _id: string;
  turfName: string;
  email: string;
  mobileNumber: string;
  gallery: string[];
  distance: number;
  turfAddress: string;
  turfTypes: string[];
  turfSizes:string[]
  rating: number;
  votes: number;
  latitude:number;
  longitude:number
}


const Home: React.FC = () => {
  const navigate = useNavigate();
  const GOOGLE_MAPS_API_KEY = import.meta.env
    .VITE_GOOGLE_MAPS_API_KEY as string;
  const email = localStorage.getItem("userEmail");


  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [sortOrder, setSortOrder] = useState("default");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turfType, setTurfType] = useState<string>("all");
  const [turfSize, setTurfSize] = useState<string>("all");
  const [locations, setLocations] = useState<any>({
    locationName: "Calicut",
    latitude: 11.281680639189076,
    longitude: 75.84906676481862,
  });
  const [distanceFilter, setDistanceFilter] = useState(50);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [address, setAddress] = useState<string>(
    "Click on the map to set a location"
  );
  const [currentPage, setCurrentPage] = useState(1);
  
  const turfsPerPage = 6;
 
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);
    fetchLocations();
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  useEffect(() => {
    if (isModalOpen) {
      initMap();
    }
  }, [isModalOpen]);
  let previousMarker : google.maps.Marker | null= null;
  const initMap = () => {
    const mapInstance = new window.google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        center: { lat: 21.1458, lng: 79.0882 },
        zoom: 8,
      }
    );
    const input = document.getElementById("locationSearch") as HTMLInputElement;
    const autocomplete = new window.google.maps.places.Autocomplete(input);


    autocomplete.setFields(["place_id", "geometry", "name"]);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {  
        if (previousMarker) {
          previousMarker.setMap(null);  // Remove previous marker if exists
        }
        const location = place.geometry.location;
        mapInstance.setCenter(location);
        mapInstance.setZoom(15);
        const userPosition = {
          lat: location.lat(),
          lng: location.lng(),
        };
        mapInstance.setCenter(userPosition);
        const userMarker = new window.google.maps.Marker({
          position: userPosition,
          map: mapInstance,
          title: "Your Current Location",
        });
        previousMarker = userMarker;
        addMarker(location);
      } else {
        // alert('No details available for this location');
      }
    });
    setMap(mapInstance);
  };

  const addMarker = (latLng:any) => {
    console.log("hi", latLng);
    if (marker) marker.setMap(null);
    const newMarker = new window.google.maps.Marker({
      position: latLng,
      map: map,
      draggable: true,
    });
    newMarker.addListener("dragend", () => {
      const newPosition = newMarker.getPosition();
      getAddressFromCoordinates(newPosition?.lat(), newPosition?.lng());
    });
    setMarker(newMarker);
    getAddressFromCoordinates(latLng.lat(), latLng.lng());
  };

  const getAddressFromCoordinates = async (lat:any, lng:any) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.results[0]) {
        setAddress(response.data.results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await apiClient.get(`/users/location?email=${email}`);
      const user = response.data.user;
      console.log(user);
      const location = {
        locationName: user.locationName,
        latitude: user.latitude,
        longitude: user.longitude,
      };
      setLocations(location);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };
  const calculateDistance = (lat1: number, lon1:number, lat2:number, lon2:number) => {
    const toRadians = (degrees:number) => (degrees * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    let formattedDistance = Math.round(distance * 100) / 100;
    return formattedDistance;
  };

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await apiClient.get("/users/getTurf");
        const turfs = response.data.turfs;
        const turfsWithDistance = turfs.map((turf:Turf) => {
          const distance = calculateDistance(
            locations.latitude,
            locations.longitude,
            turf.latitude,
            turf.longitude
          );
          return { ...turf, distance };
        });
        console.log(turfsWithDistance);
        setTurfs(turfsWithDistance);
      } catch (error) {
        console.error("Failed to fetch turfs:", error);
      }
    };

    fetchTurfs();
  }, [locations]);

  const locationFromMap = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const saveLocation = () => {
    openPopup();
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const confirmLocation = async () => {
    setIsPopupOpen(false);
    setIsModalOpen(false);
    const position = marker?.getPosition();
    console.log(locationName, email);
    if (locationName) {
      console.log(locationName, position?.lat(), position?.lng());
      try {
        await apiClient.post("/users/add-location", {
          locationName,
          latitude: position?.lat(),
          longitude: position?.lng(),
          email,
        });
        fetchLocations();
      } catch (error) {
        console.error("Error saving location:", error);
      }
    }
  };
  
  // Combine both filters
  const filteredTurfs = turfs
    .filter((turf) => {
      const matchesType = turfType === "all" || turf.turfTypes?.includes(turfType);
      const matchesSize = turfSize === "all" || turf.turfSizes?.includes(turfSize);
      return matchesType && matchesSize;
    })
    .filter((turf) => turf.distance <= distanceFilter)
    .sort((a, b) => {
      if (sortOrder === "distance") {
        return a.distance - b.distance;
      } else if (sortOrder === "rating") {
        return b.rating - a.rating;
      } else {
        return 0;
      }
    });
  
  const startIndex = (currentPage - 1) * turfsPerPage;
  const endIndex = startIndex + turfsPerPage;
  const paginatedTurfs = filteredTurfs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredTurfs.length / turfsPerPage);

  const goToPage = (page:number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <div className="flex flex-col md:flex-row">
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-3/4 md:w-1/2 lg:w-3/5">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 font-bold text-xl"
            >
              &times;
            </button>
            <h1 className="text-xl font-bold mb-4">
              Choose Your Location From Google Map
            </h1>
            <div>
              <input
                type="text"
                id="locationSearch"
                placeholder="Search for a location"
                className="w-full p-2 text-lg mb-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div id="map" style={{ height: "300px", width: "100%" }}></div>
            </div>
            <button
              onClick={saveLocation}
              className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-500"
            >
              Confirm Marked Location
            </button>
            <h2 className="text-lg font-bold mt-4">Marked Location Address:</h2>
            <p className="text-gray-700">{address}</p>
          </div>
        </div>
      )}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-1/3">
            <h2 className="text-lg font-bold">Enter Location Name</h2>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Location Name"
              className="border border-gray-300 rounded w-full p-2 mt-2"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={closePopup}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmLocation}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-gray-700 lg:w-1/5 md:w-1/4 w-full h-auto p-6 sm:flex sm:flex-col space-y-6">
        {/* Location Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-4 relative">
          <h2 className="text-lg text-white font-bold">Your Location</h2>
          <span
            className="flex items-center text-white text-lg font-light space-x-2 cursor-pointer hover:text-blue-400 transition-all duration-300"
            onClick={locationFromMap}
          >
            <span>{locations.locationName}</span>
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>

        {/* Distance Filter Section */}
        <div className="text-white flex flex-col space-y-6">
          {/* Filter by Distance */}
          <div>
            <h3 className="font-bold mb-2">Filter by Distance (km)</h3>
            <input
              type="range"
              min="0"
              max="50"
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm mt-2">Up to {distanceFilter} km</div>
          </div>

          {/* Sort by Distance Section */}
          <div>
            <h3 className="font-bold mb-2">Sort by</h3>
            <select
              onChange={(e) => setSortOrder(e.target.value)}
              value={sortOrder}
              className="w-full p-2 bg-gray-800 text-white rounded shadow"
            >
              <option value="default">Default</option>
              <option value="distance">Distance (Ascending)</option>
              <option value="rating">Rating (Descending)</option>
            </select>
          </div>

          {/* Filter by Turf Type */}
          <div>
            <h3 className="font-bold mb-2">Select Turf Type</h3>
            <select
              id="turfType"
              name="turfType"
              onChange={(e) => setTurfType(e.target.value)}
              value={turfType}
              className="w-full p-2 bg-gray-800 text-white rounded shadow"
            >
              <option value="all">All</option>
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Hockey">Hockey</option>
              <option value="Badminton">Badminton</option>
              <option value="Tennis">Tennis</option>
            </select>
          </div>
          <div>
            <h3 className="font-bold mb-2">Select Turf Size</h3>
            <select
              id="turfSize"
              name="turfSize"
              onChange={(e) => setTurfSize(e.target.value)}
              value={turfSize}
              className="w-full p-2 bg-gray-800 text-white rounded shadow"
            >
              <option value="all">All</option>
              <option value="11 vs 11">11 vs 11</option>
              <option value="7 vs 7">7 vs 7</option>
              <option value="5 vs 5">5 vs 5</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gray-900 min-h-screen text-white">
        <h1 className="sm:text-md md:text-xl lg:text-2xl font-bold text-center mb-8">
          Score Big with Every Booking – Reserve Your Turf Today
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTurfs.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-6 bg-gray-800 text-gray-300 rounded-lg shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-yellow-500 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9V5.25a2.25 2.25 0 114.5 0V9m5.25 0h.008v.008H19.5V9m-15 0h.008v.008H4.5V9M12 16.5v1.5m-4.5-1.5v1.5m9-1.5v1.5M8.25 9h7.5m-11.25 0A2.25 2.25 0 002.25 11.25v8.25A2.25 2.25 0 004.5 21.75h15a2.25 2.25 0 002.25-2.25v-8.25A2.25 2.25 0 0019.5 9H4.5z"
                />
              </svg>
              <p className="text-lg font-semibold">No Turf Found</p>
              <p className="text-sm mt-2 text-gray-400">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          ) : (
            paginatedTurfs.map((turf) => (
              <div
                onClick={() => navigate(`/turf-page/${turf._id}`)}
                key={turf._id}
                className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={turf.gallery[0]}
                  alt={turf.turfName}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 flex flex-col justify-center">
                  <h2 className="text-xl text-center font-semibold mb-2">
                    {turf.turfName}
                  </h2>
                  <p className="text-sm text-center mt-2">
                    Distance: {turf.distance} KM
                  </p>
                  <p className="text-sm text-center mt-2">{turf.turfAddress}</p>
                </div>
                <div className="p-4">
                  <div className="flex justify-center items-center gap-3 bg-zinc-900 text-white px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-pink-500 stroke-pink-500" />
                      <span className="font-medium">{(turf.rating ?? 0).toFixed(2)}/10</span>
                      <div className="text-zinc-400 text-sm">
                        ({turf.votes ?? 0} Votes)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
