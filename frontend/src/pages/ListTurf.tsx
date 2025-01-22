import {useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../apiClient";

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
  
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<turfFormData>();
  const [isLoading,setIsLoading]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)
  const submit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.post("/turfs/list", data);
      if (response.status === 200) {
        localStorage.setItem("turfEmail", data.email);
        navigate("/turfOtp");
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to register. Please try again later.");
    } finally {
      setIsLoading(false);
    }
    console.log(data);
  });
  
  return (
    <div
  className="h-screen flex items-center bg-green-400 justify-center bg-cover bg-center relative"
  style={{
    backgroundImage:
      "url('https://cdn-wp.thesportsrush.com/2022/11/b0682d0e-virat-kohli-is-not-playing.jpg?format=auto&w=3840&q=75')",
  }}
>
  <div className="absolute inset-0 bg-black bg-opacity-20"></div>

  <div className="relative bg-white rounded-lg bg-opacity-70 shadow-lg p-10 w-2/5 backdrop-blur-md">
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <h2 className="font-bold text-3xl text-center">List Your Turf with Us</h2>

      <label className="font-bold text-gray-700 text-sm flex-1">
        Turf Name
        <div>
          <input
            className="border border-black rounded w-full py-1 px-2 font-normal"
            {...register("turfName", { required: "This field is required" })}
          />
        </div>
        {errors.turfName && <span className="text-red-500">{errors.turfName.message}</span>}
      </label>

      <label className="font-bold text-gray-700 text-sm">
        Email
        <div>
          <input
            type="email"
            className="border border-black rounded w-full py-1 px-2 font-normal"
            {...register("email", { required: "This field is required" })}
          />
        </div>
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      </label>

      <label className="font-bold text-gray-700 text-sm flex-1">
        Mobile Number
        <div>
          <input
            type="number"
            className="border border-black rounded w-full py-1 px-2 font-normal"
            {...register("mobileNumber", {
              required: "This field is required",
              minLength: { value: 10, message: "Enter a valid mobile number" },
            })}
          />
        </div>
        {errors.mobileNumber && <span className="text-red-500">{errors.mobileNumber.message}</span>}
      </label>

      <label className="font-bold text-gray-700 text-sm flex-1">
        Password
        <div>
          <input
            type="password"
            className="border border-black rounded w-full py-1 px-2 font-normal"
            {...register("password", {
              required: "This field is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
        </div>
        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
      </label>

      <label className="font-bold text-gray-700 text-sm flex-1">
        Confirm Password
        <div>
          <input
            type="password"
            className="border border-black rounded w-full py-1 px-2 font-normal"
            {...register("confirmPassword", {
              validate: (val) => {
                if (!val) {
                  return "This field is required";
                } else if (watch("password") !== val) {
                  return "Passwords do not match";
                }
              },
            })}
          />
        </div>
        {errors.confirmPassword && (
          <span className="text-red-500">{errors.confirmPassword.message}</span>
        )}
      </label>

      {isLoading && <div className="text-blue-500">Listing... Please wait</div>}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-green-600 text-white p-2 w-3/4 rounded-md px-5 font-bold hover:bg-green-500 text-xl"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "List Your Turf"}
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default ListTurf;
