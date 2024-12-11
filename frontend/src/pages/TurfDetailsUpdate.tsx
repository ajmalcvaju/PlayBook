import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

type RegisterFormData = {
  turfAddress: string;
  turfOverview: string;
  facilities: string;
  email: string;
};
const GOOGLE_MAPS_API_KEY = 'AIzaSyAfew-4pbm7e88NH-V_t5eboujt_LKKESI';
const TurfDetailsUpdate = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("turfToken");

  useEffect(() => {
    if (!token) {
      navigate("/turf-login");
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<FileList | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null); 
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [overView,setOverView]=useState<string>('')
  const [facilities,setFacilities]=useState<string>('')
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [locationName,setLocationName]=useState<string>('');
  const [address, setAddress] = useState<string>('Click on the map to set a location');
  const email=localStorage.getItem("turfEmail")
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGallery(e.target.files);
    }
  };
  const locationFromMap = () => {
    setIsModalOpen(true)
  };
  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const response = await axios.post('http://localhost:7000/api/turfs/get-turfDetails', {
          email: email,
        });
        const data=response.data
        setOverView(data.turfOverview)
        setFacilities(data.facilities)
        setAddress(data.turfAddress)
      } catch (error) {
        console.error('Error fetching turf details:', error);
      }
    };
    fetchTurfDetails();
  }, [email]);
  useEffect(() => {
    if (isModalOpen) {
      initMap();
    }
  }, [isModalOpen]);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => initMap();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);


  const initMap = () => {
    const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 21.1458, lng: 79.0882 },
      zoom: 8,
    });

    // Auto-locate user's position
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

  const addMarker = (latLng) => {
    if (marker) marker.setMap(null); // Remove previous marker

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

  const getAddressFromCoordinates = async (lat, lng) => {
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
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const saveLocation = () => {
    openPopup();
  };
  const confirmLocation=async()=>{
    setIsPopupOpen(false)
    setIsModalOpen(false)
    const position = marker?.getPosition();
    if (locationName) {
      console.log(locationName,position?.lat(),position?.lng())
      try {
        const response = await axios.post('http://localhost:7000/api/turfs/add-location', {
          locationName,
          latitude: position?.lat(),
          longitude: position?.lng(),
          email
        });
        console.log(response.data);
        fetchLocations();
      } catch (error) {
        console.error('Error saving location:', error);
      }
    }
  }
 
  const submit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formDataToSend = new FormData();
      let turfEmail: string | null = localStorage.getItem("turfEmail");

      if (turfEmail === null) {
        turfEmail = "";
      }
      formDataToSend.append("turfAddress", data.turfAddress);
      formDataToSend.append("turfOverview", data.turfOverview);
      formDataToSend.append("facilities", data.facilities);
      formDataToSend.append("email", turfEmail);

      if (gallery) {
        for (let i = 0; i < gallery.length; i++) {
          formDataToSend.append("image", gallery[i]);
        }
      }

      const response = await fetch(
        "http://localhost:7000/api/turfs/turfDetailsUpdate",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Data updated successfully!");
        console.log(result.fileUrls); // Log file URLs if returned
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.message || "An error occurred!");
      }
    } catch (error) {
      setErrorMessage("Unable to update. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  });
  const closeModal=()=>{
    setIsModalOpen(false)
  }
  
  return (
    <div className="flex-1 p-6">
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-3/4 md:w-1/2 lg:w-3/5">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 font-bold text-xl"
            >
              &times;
            </button>
            <h1 className="text-xl font-bold mb-4">Choose Your Location From Google Map</h1>
            <div id="map" style={{ height: '300px', width: '100%' }}></div>
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
      <h2 className="text-2xl font-bold">Update Your Turf Details</h2>
      <form className="flex flex-col gap-5" onSubmit={submit}>
      <label className="font-bold text-gray-700 text-sm flex-1 space-y-2">
  <span className="block text-lg">Turf Address</span>
  
  <div className="relative">
    <input value={address}
      className="border border-gray-300 rounded-md md:w-1/2 py-2 px-3 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...register("turfAddress", {
        required: "This field is required",
      })}
      placeholder="Enter turf address here"
    />
    {errors.turfAddress && (
      <span className="absolute text-xs text-red-500 top-full left-0 mt-1">
        {errors.turfAddress.message}
      </span>
    )}
  </div>

  <div className="flex items-center justify-between space-x-2 mt-2">
    <span 
      onClick={locationFromMap}
      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-blue-500 transition"
    >
      Get Location
    </span>
  </div>
</label>
        <label className="font-bold text-gray-700 text-sm flex-1">
          Turf Overview
          <div>
            <input
              className="border rounded border-black md:w-1/2 py-1 px-2 font-normal"
              {...register("turfOverview", {
                required: "This field is required",
              })}
            />
          </div>
          {errors.turfOverview && (
            <span className="text-red-500">{errors.turfOverview.message}</span>
          )}
        </label>
        <label className="font-bold text-gray-700 text-sm">
          Turf Facilities
          <div>
            <input
              className="border border-black rounded md:w-1/2 py-1 px-2 font-normal"
              {...register("facilities", {
                required: "This field is required",
              })}
            />
          </div>
          {errors.facilities && (
            <span className="text-red-500">{errors.facilities.message}</span>
          )}
        </label>
        <label className="font-bold text-gray-700 text-sm">Turf Gallery</label>
        <input
          type="file"
          onChange={handleFileChange}
          id="gallery"
          multiple
          className="border border-black rounded md:w-1/2 py-1 px-2 font-normal"
        />
        
        {isLoading && (
          <div className="text-blue-500">Updating... Please wait</div>
        )}
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        {successMessage && (
          <div className="text-green-500 bg-green-100 border border-green-400 p-2 rounded">
            {successMessage}
          </div>
        )}
        <div className="flex w-1/2">
          <button
            type="submit"
            className="bg-green-600 text-white p-2 w-3/4 rounded-md px-5 font-bold hover:bg-green-500 text-xl"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TurfDetailsUpdate;
