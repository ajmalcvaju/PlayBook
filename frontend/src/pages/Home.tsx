import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Turf {
  _id: string;
  turfName: string;
  email: string;
  mobileNumber: string;
  gallery: string[];
  distance:number;
  turfAddress: string;
}

interface Location {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const email = localStorage.getItem('userEmail') ;
  const token = localStorage.getItem('userToken');

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [sortOrder, setSortOrder] = useState('default');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locations, setLocations] = useState<any>([]);
  const [distanceFilter,setDistanceFilter]=useState(50)
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [address, setAddress] = useState<string>('Click on the map to set a location');
  const [currentPage, setCurrentPage] = useState(1);
  const turfsPerPage = 6;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => initMap();
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
  const initMap = () => {
    const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 21.1458, lng: 79.0882 },
      zoom: 8,
    });


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        mapInstance.setCenter(userPosition);

        const userMarker = new window.google.maps.Marker({
          position: userPosition,
          map: mapInstance,
          title: 'Your Current Location',
        });

        getAddressFromCoordinates(userPosition.lat, userPosition.lng);
      });
    }
    
    mapInstance.addListener('click', (event) => {
      addMarker(event.latLng);
      console.log(event.latLng)
    });

    setMap(mapInstance);
  };

  const addMarker = (latLng: google.maps.LatLng) => {
    if (marker) marker.setMap(null);
    console.log("addMark")
    const newMarker = new window.google.maps.Marker({
      position: latLng,
      map: map,
      draggable: true,
    });

    newMarker.addListener('dragend', () => {
      const newPosition = newMarker.getPosition();
        getAddressFromCoordinates(newPosition.lat(), newPosition.lng());
    });
    setMarker(newMarker);
    getAddressFromCoordinates(latLng.lat(), latLng.lng());
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.results[0]) {
        setAddress(response.data.results[0].formatted_address);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`http://localhost:7000/api/users/location?email=${email}`);
      const user=response.data.user
      const location={locationName:user.locationName,latitude:user.latitude,longitude:user.longitude}
      setLocations(location);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };
  const calculateDistance=(lat1:number, lon1, lat2, lon2)=> {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
  
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
    return formattedDistance
  }
  
  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/users/getTurf');
        const turfs=response.data.turfs
        const turfsWithDistance = turfs.map((turf) => {
          const distance = calculateDistance(locations.latitude,locations.longitude, turf.latitude, turf.longitude);
          return { ...turf, distance };
        });
        console.log(turfsWithDistance)
        setTurfs(turfsWithDistance);
      } catch (error) {
        console.error('Failed to fetch turfs:', error);
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
    console.log(locationName,email)
    if (locationName) {
      console.log(locationName,position?.lat(),position?.lng())
      try {
        await axios.post('http://localhost:7000/api/users/add-location', {
          locationName,
          latitude: position.lat(),
          longitude: position.lng(),
          email,
        });
        fetchLocations();
      } catch (error) {
        console.error('Error saving location:', error);
      }
    }
  };
  const filteredTurfs = turfs
    .filter((turf) => turf.distance <= distanceFilter)
    .sort((a, b) => {if (sortOrder === 'distance') {return a.distance - b.distance;}return 0;});
  const startIndex = (currentPage - 1) * turfsPerPage;
  const endIndex = startIndex + turfsPerPage;
  const paginatedTurfs = filteredTurfs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredTurfs.length / turfsPerPage);

  const goToPage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <div className="flex">
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
            <div id="map" style={{ height: "300px", width: "100%" }}></div>
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
      <div className="bg-gray-700 w-64 h-auto p-6">
  {/* Location Section */}
  <div className="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-4">
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
  <div className="mt-6 text-white">
    <h3 className="font-bold mb-2">Filter by Distance (km)</h3>
    <input
      type="range"
      min="0"
      max="50"
      value={distanceFilter}
      onChange={(e) => setDistanceFilter(e.target.value)}
      className="w-full"
    />
    <div className="text-sm mt-2">Up to {distanceFilter} km</div>
  </div>

  {/* Sort by Distance Section */}
  <div className="mt-6 text-white">
    <h3 className="font-bold mb-2">Sort by</h3>
    <select
      onChange={(e) => setSortOrder(e.target.value)}
      value={sortOrder}
      className="w-full p-2 bg-gray-800 text-white rounded shadow"
    >
      <option value="default">Default</option>
      <option value="distance">Distance (Ascending)</option>
    </select>
  </div>
</div>

      <div className="flex-1 p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-center mb-8">
        Score Big with Every Booking – Reserve Your Turf Today
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTurfs.map((turf) => (
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
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{turf.turfName}</h2>
              <p className="text-sm mt-2">Distance: {turf.distance} KM</p>
              <p className="text-sm mt-2">{turf.turfAddress}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600'
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600'
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
