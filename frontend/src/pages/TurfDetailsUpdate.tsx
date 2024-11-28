import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

type RegisterFormData = {
  turfAddress: string;
  turfOverview: string;
  facilities: string;
  gallery: string[];
};

const TurfDetailsUpdate = () => {
    let navigate=useNavigate()
  let token=localStorage.getItem("turfToken")
  useEffect(()=>{
   if(!token){
    navigate("/turfLogin")
   }
  },[])
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    let email = localStorage.getItem("turfEmail");
    let updatedData = { ...data, email };

    try {
      const response = await fetch("http://localhost:7000/api/turfs/turfDetailsUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Data updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Unable to update. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <>
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold">Update Your Turf Details</h2>
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <label className="font-bold text-gray-700 text-sm flex-1">
            Turf Address
            <div>
              <input
                className="border border-black rounded md:w-1/2 py-1 px-2 font-normal"
                {...register("turfAddress", { required: "This field is required" })}
              />
            </div>
            {errors.turfAddress && <span className="text-red-500">{errors.turfAddress.message}</span>}
          </label>
          <label className="font-bold text-gray-700 text-sm flex-1">
            Turf Overview
            <div>
              <input
                className="border rounded border-black md:w-1/2 py-1 px-2 font-normal"
                {...register("turfOverview", { required: "This field is required" })}
              />
            </div>
            {errors.turfOverview && <span className="text-red-500">{errors.turfOverview.message}</span>}
          </label>
          <label className="font-bold text-gray-700 text-sm">
            Turf Facilities
            <div>
              <input
                className="border border-black rounded md:w-1/2 py-1 px-2 font-normal"
                {...register("facilities", { required: "This field is required" })}
              />
            </div>
            {errors.facilities && <span className="text-red-500">{errors.facilities.message}</span>}
          </label>
          {isLoading && <div className="text-blue-500">Updating... Please wait</div>}
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
    </>
  );
};

export default TurfDetailsUpdate;
