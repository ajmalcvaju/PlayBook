import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type RegisterFormData = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("userToken")
  useEffect(()=>{
   if(token){
    navigate("/home")
   }
  },[])
  const { register, watch, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();

  const [isLoading,setIsLoading]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)

  const submit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("http://localhost:7000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("userEmail", data.email);
        navigate("/otp");
      } else {
        setErrorMessage(result.message)
      }
    } catch (error) {
      setErrorMessage("Unable to register. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div
  className="h-screen flex items-center bg-green-400 justify-center bg-cover bg-center relative"
  style={{
    backgroundImage:
      "url('https://cdn-wp.thesportsrush.com/2022/11/b0682d0e-virat-kohli-is-not-playing.jpg?format=auto&w=3840&q=75')", // Replace with your image URL
  }}
>
  <div className="absolute inset-0 bg-black bg-opacity-50"></div>

  <div className="relative bg-white rounded-lg bg-opacity-70 shadow-lg p-10 w-2/5 backdrop-blur-md">
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <h2 className="font-bold text-3xl text-center">Create an Account</h2>
      <div className="flex flex-col md:flex-row gap-5">
        <label className="font-bold text-gray-700 text-sm flex-1">
          First Name
          <div>
            <input
              className="border border-black rounded md:w-full py-1 px-2 font-normal"
              {...register("firstName", { required: "This field is required" })}
            />
          </div>
          {errors.firstName && <span className="text-red-500">{errors.firstName.message}</span>}
        </label>
        <label className="font-bold text-gray-700 text-sm flex-1">
          Last Name
          <div>
            <input
              className="border rounded border-black md:w-full py-1 px-2 font-normal"
              {...register("lastName", { required: "This field is required" })}
            />
          </div>
          {errors.lastName && <span className="text-red-500">{errors.lastName.message}</span>}
        </label>
      </div>

      <label className="font-bold text-gray-700 text-sm">
        Email
        <div>
          <input
            type="email"
            className="border border-black rounded md:w-1/2 py-1 px-2 font-normal"
            {...register("email", { required: "This field is required" })}
          />
        </div>
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      </label>

      <label className="font-bold text-gray-700 text-sm">
        Mobile Number
        <div>
          <input
            type="number"
            className="border border-black rounded md:w-1/2 py-1 px-2 font-normal"
            {...register("mobileNumber", { required: "This field is required" })}
          />
        </div>
        {errors.mobileNumber && <span className="text-red-500">{errors.mobileNumber.message}</span>}
      </label>

      <label className="font-bold text-gray-700 text-sm">
        Password
        <div>
          <input
            type="password"
            className="border rounded border-black md:w-1/2 py-1 px-2 font-normal"
            {...register("password", {
              required: "This field is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
          />
        </div>
        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
      </label>

      <label className="font-bold text-gray-700 text-sm">
        Confirm Password
        <div>
          <input
            type="password"
            className="border rounded border-black md:w-1/2 py-1 px-2 font-normal"
            {...register("confirmPassword", {
              validate: (val) => {
                if (!val) return "This field is required";
                if (watch("password") !== val) return "Passwords do not match";
              },
            })}
          />
        </div>
        {errors.confirmPassword && (
          <span className="text-red-500">{errors.confirmPassword.message}</span>
        )}
      </label>

      {isLoading && <div className="text-blue-500">Registering....please, Wait</div>}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-green-600 text-white p-2 w-3/4 rounded-md px-5 font-bold hover:bg-green-500 text-xl"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Register"}
        </button>
      </div>
    </form>
  </div>
</div>
  );
};

export default Register;
