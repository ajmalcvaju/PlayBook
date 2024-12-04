import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type RegisterFormData = {
  turfAddress: string;
  turfOverview: string;
  facilities: string;
  email: string;
};

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
  const [manualAddress, setManualAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGallery(e.target.files);
    }
  };
  const handleManualLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualAddress(event.target.value);
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

  return (
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold">Update Your Turf Details</h2>
      <form className="flex flex-col gap-5" onSubmit={submit}>
        <label className="font-bold text-gray-700 text-sm flex-1">
          Turf Address
          <div>
            <input
              className="border border-black rounded md:w-1/2 py-1 px-2 font-normal"
              {...register("turfAddress", {
                required: "This field is required",
              })}
            />
          </div>
          {errors.turfAddress && (
            <span className="text-red-500">{errors.turfAddress.message}</span>
          )}
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
