import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import apiClient from "../apiClient";

type RegisterFormData = {
  turfAddress: string;
  turfOverview: string;
  facilities: string;
  email: string;
};
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const TurfDetailsUpdate = () => {
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
  const [turftypes, setTurfTypes] = useState<string[] | null>([]);
  const [turfSizes, setTurfSizes] = useState<string[] | null>([]);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedTurfTypes, setSelectedTurfTypes] = useState<string[]>([]);
  const [selectedTurfSizes, setSelectedTurfSizes] = useState<string[]>([]);
  const [overView, setOverView] = useState<string>("");
  const [facilities, setFacilities] = useState<string>("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [locationName, setLocationName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const email = localStorage.getItem("turfEmail");
  const [isLocationErrorModel, setIsLocationErrorModel] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGallery(e.target.files);
    }
  };

  const locationFromMap = () => {
    setIsModalOpen(true);
  };
  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const response = await apiClient.get(`/turfs/get-turfDetails/${email}`);
        const data = response.data;
        console.log(data);
        setOverView(data.turfOverview);
        setFacilities(data.facilities);
        setAddress(data.turfAddress);
        setTurfSizes(data.turfSizes);
        setTurfTypes(data.turfTypes);
      } catch (error) {
        console.error("Error fetching turf details:", error);
      }
    };
    if (email) {
      fetchTurfDetails();
    }
  }, [email]);
  useEffect(() => {
    if (isModalOpen) {
      initMap();
    }
  }, [isModalOpen]);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => initMap();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  let previousMarker: google.maps.Marker | null = null;
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
          previousMarker.setMap(null); // Remove previous marker if exists
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
        setIsLocationErrorModel(true);
      }
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords.latitude, position.coords.longitude);
        const userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        mapInstance.setCenter(userPosition);

        const userMarker = new window.google.maps.Marker({
          position: userPosition,
          map: mapInstance,
          title: "Your Current Location",
        });
        previousMarker = userMarker;
        getAddressFromCoordinates(userPosition.lat, userPosition.lng);
      });
    }

    mapInstance.addListener("click", (event: any) => {
      if (previousMarker) {
        previousMarker.setMap(null);
      }
      addMarker(event.latLng);
      const newMarker = new window.google.maps.Marker({
        position: event.latLng,
        map: map,
        draggable: true,
      });
      const newPosition = newMarker.getPosition();
      const userPosition = {
        lat: newPosition?.lat() as number,
        lng: newPosition?.lng() as number,
      };
      mapInstance.setCenter(userPosition);
      const userMarker = new window.google.maps.Marker({
        position: userPosition,
        map: mapInstance,
        title: "Your Current Location",
      });
      previousMarker = userMarker;
      console.log(userPosition);
      console.log(event.latLng);
    });
    setMap(mapInstance);
  };

  const addMarker = (latLng: any) => {
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
    console.log(marker);
    getAddressFromCoordinates(latLng.lat(), latLng.lng());
  };

  const getAddressFromCoordinates = async (lat: any, lng: any) => {
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
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const saveLocation = () => {
    openPopup();
  };
  const confirmLocation = async () => {
    setIsPopupOpen(false);
    setIsModalOpen(false);
    const position = marker?.getPosition();
    if (locationName) {
      console.log(locationName, position?.lat(), position?.lng());
      try {
        const response = await apiClient.patch("/turfs/add-location", {
          locationName,
          latitude: position?.lat(),
          longitude: position?.lng(),
          email,
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error saving location:", error);
      }
    }
  };
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
      if (selectedTurfTypes) {
        for (let i = 0; i < selectedTurfTypes.length; i++) {
          formDataToSend.append("turfTypes", selectedTurfTypes[i]);
        }
      }
      if (selectedTurfSizes) {
        for (let i = 0; i < selectedTurfSizes.length; i++) {
          formDataToSend.append("turfSizes", selectedTurfSizes[i]);
        }
      }
      const response = await apiClient.patch(
        "/turfs/turfDetailsUpdate",
        formDataToSend
      );
      const result = response.data;
      if (response.status === 200) {
        setSuccessMessage("Data updated successfully!");
        console.log(result.fileUrls);
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
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCheckboxChange = (e: any) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedTurfTypes((prev) => [...prev, value]);
    } else {
      setSelectedTurfTypes((prev) => prev.filter((type) => type !== value));
    }
  };
  const handleSizeCheckboxChange = (e: any) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedTurfSizes((prev) => [...prev, value]);
    } else {
      setSelectedTurfSizes((prev) => prev.filter((size) => size !== value));
    }
  };

  const handleCloseModal = () => {
    setIsLocationErrorModel(false);
  };
  return (
    <div className="flex-1 p-6 bg-gray-900">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95">
          <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center animate-fadeIn">
            <div className="loader mb-6 h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-bold text-gray-200 animate-pulse">
              Your turf details are getting updated
            </h2>
            <p className="mt-2 text-gray-400 text-sm animate-fadeInSlow">
              Please wait while we update your information...
            </p>
          </div>
        </div>
      )}
      <div>
        {isLocationErrorModel && (
          <div className="modal-overlay z-50">
            <div className="modal-content">
              <span className="close-btn" onClick={handleCloseModal}></span>
              <p>No details available for this location</p>
            </div>
          </div>
        )}
      </div>

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
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">
          Update Your Turf Details
        </h2>
        <form className="flex flex-col gap-6" onSubmit={submit}>
          <label className="font-semibold text-lg text-gray-300">
            <span className="block mb-2">Turf Address</span>
            <div className="relative">
              <input
                defaultValue={address}
                className="border border-gray-700 rounded-md w-full py-3 px-4 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("turfAddress", {
                  required: "This field is required",
                })}
                placeholder="Click on the map to set a location"
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
                className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm cursor-pointer hover:bg-blue-500 transition duration-200"
              >
                Get Location
              </span>
            </div>
          </label>

          <label className="font-semibold text-lg text-gray-300">
            Turf Overview
            <div>
              <input
                defaultValue={overView}
                className="border border-gray-700 rounded-md w-full py-3 px-4 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("turfOverview", {
                  required: "This field is required",
                })}
              />
            </div>
            {errors.turfOverview && (
              <span className="text-red-500">
                {errors.turfOverview.message}
              </span>
            )}
          </label>

          <label className="font-semibold text-lg text-gray-300">
            Turf Facilities
            <div>
              <input
                defaultValue={facilities}
                className="border border-gray-700 rounded-md w-full py-3 px-4 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("facilities", {
                  required: "This field is required",
                })}
              />
            </div>
            {errors.facilities && (
              <span className="text-red-500">{errors.facilities.message}</span>
            )}
          </label>

          <label className="font-semibold text-lg text-gray-300">
            Turf Gallery
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            id="gallery"
            multiple
            className="border border-gray-700 rounded-md w-full py-3 px-4 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mb-6">
            <label className="font-semibold text-lg text-gray-300 mb-2">
              Turf Type
            </label>
            <div className="flex flex-wrap gap-6">
              {[
                "Football",
                "Cricket",
                "Hockey",
                "Tennis",
                "Badminton",
                "Other",
              ].map((turf) => (
                <div key={turf} className="flex items-center">
                  <input
                    type="checkbox"
                    id={turf.toLowerCase()}
                    name="turfType"
                    value={turf}
                    onChange={handleCheckboxChange}
                    checked={turftypes?.includes(turf)}
                    className="mr-2"
                  />
                  <label htmlFor={turf.toLowerCase()} className="text-gray-300">
                    {turf}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="font-semibold text-lg text-gray-300 mb-2">
              Turf Size
            </label>
            <div className="flex flex-wrap gap-6">
              {["5 vs 5", "7 vs 7", "11 vs 11"].map((size) => (
                <div key={size} className="flex items-center">
                  <input
                    type="checkbox"
                    id={size.replace(/\s+/g, "").toLowerCase()} // Create a unique ID
                    name="turfSize"
                    value={size}
                    onChange={handleSizeCheckboxChange}
                    checked={turfSizes?.includes(size)} // Pre-check if size exists in turfSizes
                    className="mr-2"
                  />
                  <label
                    htmlFor={size.replace(/\s+/g, "").toLowerCase()}
                    className="text-gray-300"
                  >
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-center">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="text-green-500 bg-green-100 border border-green-400 p-2 rounded-lg text-center">
              {successMessage}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-green-600 text-white p-3 rounded-md w-full md:w-3/4 font-bold hover:bg-green-500 transition duration-200 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TurfDetailsUpdate;
