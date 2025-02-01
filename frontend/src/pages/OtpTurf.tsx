import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../Redux/turfSlice";
import {logout} from "../Redux/userSlice"
import {signout as adminLogout} from "../Redux/adminSlice"
import apiClient from "../apiClient";

type otpData={
    otp:number
}

const OtpTurf = () => {
  const [isLoading,setIsLoading]=useState(false)
  const [resendMessage,setResendMessage]=useState<string|null>(null)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)
  const navigate=useNavigate()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: {errors} } = useForm<otpData>();
  const submit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const email = localStorage.getItem("turfEmail");
      console.log(email);
      const updatedData = { ...data, email };
      console.log(updatedData);
      const response = await apiClient.post("/turfs/verify-otp", updatedData);
      const result = response.data;
      console.log(result);
      if (response.status === 200) {
        localStorage.setItem("turfToken", result.token);
        localStorage.setItem("accessToken", result.token);
        dispatch(signInSuccess(result.turf));
        dispatch(adminLogout());
        dispatch(logout());
        navigate("/turf/dashboard");
      } else {
        setErrorMessage(result.message);
      }
    } catch (error:any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to register. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
    console.log(data);
  });

  const resendOtp = async () => {
    try {
      const email = localStorage.getItem("turfEmail");
      const response = await apiClient.post("/turfs/resend-otp", { email });
      setResendMessage(response.data.message);
    } catch (error:any) {
      setResendMessage(
        error.response?.data?.message ||
          "Unable to resend OTP. Please try again later."
      );
    }
  };
  
  return (
    <div
  className="h-screen flex items-center bg-cover bg-center justify-center relative"
  style={{
    backgroundImage:
      "url('https://cdn-wp.thesportsrush.com/2022/11/b0682d0e-virat-kohli-is-not-playing.jpg?format=auto&w=3840&q=75')", // Replace with your image URL
  }}
>
  <div className="absolute inset-0 bg-black bg-opacity-20"></div> {/* Overlay for darkening the background */}

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
            />
          </div>
          {errors.otp && (
            <span className="text-red-500">{errors.otp.message}</span>
          )}
        </label>
      </div>
      
      {isLoading && <div className="text-blue-500">Submitting... Please wait</div>}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      {resendMessage && <div className="text-blue-500">{resendMessage}</div>}

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

    {/* Resend OTP Option */}
    <div className="text-center mt-5">
      <p className="text-gray-700 text-sm">
        Didn't receive the OTP?{" "}
        <button
          onClick={resendOtp} // Add your resend OTP handler function
          className="text-green-600 hover:underline font-bold"
        >
          Resend OTP
        </button>
      </p>
    </div>
  </div>
</div>
  );
};

export default OtpTurf;
