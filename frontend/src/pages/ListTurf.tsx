import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
type turfFormData = {
  turfName: string;
  username: string;
  location: string;
  email: string;
  mobileNumber: number;
  password: string;
  confirmPassword: string;
};

const ListTurf = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("turfToken")
  useEffect(()=>{
   if(token){
    navigate("/turf/dashboard")
   }
  },[])
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<turfFormData>();
  const [isLoading,setIsLoading]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)
  const submit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("http://localhost:7000/api/turfs/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("turfEmail", data.email);
        navigate("/turfOtp");
      } else {
        setErrorMessage(result.message)
      }
    } catch (error) {
      setErrorMessage("Unable to register. Please try again later.");
    }finally{
      setIsLoading(false);
    }
    console.log(data);
  });
  return (
    <form className="flex  flex-col gap-5" onSubmit={submit}>
      <h2 className="font-bold text-3xl">List Your Turf with Us</h2>
        <label className="font-bold text-gray-700 text-sm flex-1">
          Turf Name
          <div>
            <input
              className="border border-black rounded w-1/2 py-1 px-2 font-normal"
              {...register("turfName", { required: "This field is required" })}
            ></input>
          </div>
          {errors.turfName && (
            <span className="text-red-500">{errors.turfName.message}</span>
          )}
        </label>

      <label className="font-bold text-gray-700 text-sm">
        Email
        <div>
          <input
            type="email"
            className="border border-black rounded w-1/2 py-1 px-2 font-normal"
            {...register("email", { required: "This field is required" })}
          ></input>
        </div>
        {errors.email && (
          <span className="text-red-500">{errors.email.message}</span>
        )}
      </label>
      <label className="font-bold text-gray-700 text-sm flex-1">
        Mobile Number
        <div>
          <input
            type="number"
            className="border border-black rounded w-1/2 py-1 px-2 font-normal"
            {...register("mobileNumber", {
              required: "This field is required",
              minLength: { value: 10, message: "Enter a valid mobile number" },
            })}
          ></input>
        </div>
        {errors.mobileNumber && (
          <span className="text-red-500">{errors.mobileNumber.message}</span>
        )}
      </label>
      <label className="font-bold text-gray-700 text-sm flex-1">
        Password
        <div>
          <input
            type="password"
            className="border border-black rounded w-1/2 py-1 px-2 font-normal"
            {...register("password", {
              required: "This field is required",
              minLength: {
                value: 6,
                message: "Password must be ateast 6 character",
              },
            })}
          ></input>
        </div>
        {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
      </label>
      <label className="font-bold text-gray-700 text-sm flex-1">
        Confirm Password
        <div>
          <input
            type="password"
            className="border border-black rounded w-1/2 py-1 px-2 font-normal"
            {...register("confirmPassword", {
              validate: (val) => {
                if (!val) {
                  return "This field is Required";
                } else if (watch("password") !== val) {
                  return "Your Password do not match";
                }
              },
            })}
          ></input>
        </div>
        {errors.confirmPassword && (
          <span className="text-red-500">{errors.confirmPassword.message}</span>
        )}
      </label>
      {isLoading&&<div className="text-blue-500">Listing....pease,Wait</div>}
      {errorMessage&&<div className="text-red-500">{errorMessage}</div>}
      <div className="flex">
      <button
        type="submit"
        className="bg-green-600 text-white p-2 w-2/4 rounded-md px-5 font-bold hover:bg-green-500 text-xl"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "List Your Turf"}
      </button>
      </div>
    </form>
  );
};

export default ListTurf;
