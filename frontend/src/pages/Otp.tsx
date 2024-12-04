import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
type otpData={
    otp:number
}

const Otp = () => {
  const navigate=useNavigate()
  const { register, handleSubmit, formState: {errors} } = useForm<otpData>();
  const [isLoading,setIsLoading]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)
  const submit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const email = localStorage.getItem("userEmail");
      const updatedData={...data,email}
      console.log(updatedData)
      const response = await fetch("http://localhost:7000/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("userToken",result.token);
        navigate("/home");
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

  <div className="relative bg-white rounded-lg bg-opacity-70 shadow-lg p-10 w-2/3 max-w-md backdrop-blur-md">
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <h2 className="font-bold text-3xl text-center">OTP Verification</h2>
      <div className="flex flex-col md:flex-row gap-5">
        <label className="font-bold text-gray-700 text-sm flex-1">
          OTP
          <div>
            <input
              className="border rounded border-black md:w-full py-1 px-2 font-normal"
              {...register("otp", { required: "This field is required" })}
            ></input>
          </div>
          {errors.otp && (
            <span className="text-red-500">{errors.otp.message}</span>
          )}
        </label>
      </div>
      {isLoading && (
        <div className="text-blue-500">Submitting... Please wait</div>
      )}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-green-600 text-white p-2 w-3/4 rounded-md px-5 font-bold hover:bg-green-500 text-xl"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  </div>
</div>

  )
};

export default Otp;
