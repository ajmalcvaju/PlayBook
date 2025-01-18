import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess } from "../Redux/turfSlice";
import {logout} from "../Redux/userSlice"
import {signout as adminLogout} from "../Redux/adminSlice"
import apiClient from "../apiClient";
type loginData={
    email:string,
    password:string
}

const TurfLogin = () => {
  let navigate=useNavigate()
  const dispatch = useDispatch()
  let token=localStorage.getItem("turfToken")
  
    const { register, handleSubmit, formState: {errors} } = useForm<loginData>();
    const [isLoading,setIsLoading]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)

  const submit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      localStorage.removeItem("userEmail");
      const response = await apiClient.post('/turfs/login', data, {
        headers: { "Content-Type": "application/json" },
      });
      const result = response.data;
      if (response.status === 200) {
        localStorage.setItem("turfToken", result.token);
        localStorage.setItem('accessToken', result.token);
        localStorage.setItem("turfEmail", data.email);
        dispatch(signInSuccess(result.turf));
        dispatch(adminLogout())
        dispatch(logout())
        navigate("/turf/dashboard");
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Unable to Login. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  });
  return (
    <div
      className="h-screen flex items-center bg-green-400 justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://static.standard.co.uk/2022/12/19/06/1450124714.jpg?crop=8:5,smart&quality=75&auto=webp&width=960')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      <div className="relative bg-white rounded-lg bg-opacity-70 shadow-lg p-10 w-2/3 max-w-md backdrop-blur-md">
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <h2 className="font-bold text-3xl text-center">Login</h2>
          <label className="font-bold text-gray-700 text-sm flex-1">
            Email
            <div>
              <input
                type="email"
                className="border border-black rounded w-full py-1 px-2 font-normal"
                {...register("email", { required: "This field is required" })}
              />
            </div>
            {errors.email && (
              <span className="text-red-500">{errors.email.message}</span>
            )}
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
            {errors.password && (
              <span className="text-red-500">{errors.password.message}</span>
            )}
          </label>
          {isLoading && (
            <div className="text-blue-500">Submitting... Please wait</div>
          )}
          {errorMessage && <div className="text-red-500">{errorMessage}</div>}
          <div className="flex">
            <button
              type="submit"
              className="bg-green-600 text-white p-2 w-full rounded-md px-5 font-bold hover:bg-green-500 text-xl"
              disabled={isLoading}
            >
              {isLoading ? "Logging..." : "Login"}
            </button>
          </div>
        </form>

        {/* Additional Options */}
        <div className="text-center mt-5">
          <p className="text-gray-700 text-sm">
            Don't have an account?{" "}
            <a
              href="/list-turf"
              className="text-green-600 hover:underline font-bold"
            >
              Sign up
            </a>
          </p>
          <p className="text-gray-700 text-sm mt-2">
            <a
              href="/forgot-turf-password"
              className="text-green-600 hover:underline font-bold"
            >
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>

  )
};

export default TurfLogin;
