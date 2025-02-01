import { useState } from "react";
import { useForm } from "react-hook-form";
import apiClient from "../../apiClient";
import { signInSuccess } from "../../Redux/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {signout as turfLogout} from "../../Redux/turfSlice"
import {signout as adminLogout} from "../../Redux/turfSlice"

type forgotPasswordData = {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
};

const ForgotPassword = () => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<forgotPasswordData>();
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState(true);
  const [otpModal, setOtpModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const submit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.post("/users/forgotpassword", data, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
        localStorage.setItem("userEmail",data.email as string);
        setEmailModal(false);
        setOtpModal(true);
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Verify your email and try again later.");
    } finally {
      setIsLoading(false);
    }
  });
  const OtpSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.post("/users/verify-otp-forgotpassword", data, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
        setOtpModal(false);
        setPasswordModal(true);
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Check your OTP and Please try again later.");
    } finally {
      setIsLoading(false);
    }
  });
  const passwordSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
        const email = localStorage.getItem("userEmail");
        data.email = email as string;
      const response = await apiClient.post("/users/change-forgotpassword", data, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
          console.log("hi");
          console.log(response);
          localStorage.setItem("userToken", response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          console.log(response.data.accessToken);
          dispatch(signInSuccess(response.data.user));
          dispatch(adminLogout())
          dispatch(turfLogout())
          navigate("/home");
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Please try again later.");
    } finally {
      setIsLoading(false);
    }
  });
  const resendOtp = async () => {
    const email = localStorage.getItem("userEmail");
    const response = await fetch("http://localhost:7000/api/users/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setResendMessage(data.message);
  };
  return (
    <div
      className="h-screen flex items-center bg-green-400 justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://static.standard.co.uk/2022/12/19/06/1450124714.jpg?crop=8:5,smart&quality=75&auto=webp&width=960')", // Replace with your image URL
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      {emailModal && (
        <div className="relative bg-white rounded-lg bg-opacity-70 shadow-lg p-10 w-full max-w-md mx-5 backdrop-blur-md">
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <h2 className="font-bold text-3xl text-center">Enter Your Email</h2>
            <label className="font-bold text-gray-700 text-sm">
              Email
              <input
                type="email"
                className="border border-black rounded w-full py-1 px-2 font-normal"
                {...register("email", { required: "This field is required" })}
              />
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
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
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
      {otpModal && (
        <div className="relative bg-white rounded-lg bg-opacity-70 shadow-lg p-10 w-2/3 max-w-md backdrop-blur-md">
          <form className="flex flex-col gap-5" onSubmit={OtpSubmit}>
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
            {resendMessage && (
              <div className="text-blue-500">{resendMessage}</div>
            )}
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
          <div className="text-center mt-5">
            <p className="text-gray-700 text-sm">
              Didn't receive the OTP?{" "}
              <button
                onClick={resendOtp}
                className="text-green-600 hover:underline font-bold"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      )}
      {passwordModal && (
          <div className="relative bg-white rounded-lg bg-opacity-70 shadow-lg p-10 w-full max-w-md backdrop-blur-md">
            <form className="flex flex-col gap-5" onSubmit={passwordSubmit}>
              <h2 className="font-bold text-3xl text-center text-gray-800">
                Enter Your New Password
              </h2>

              <div className="flex flex-col gap-5">
                {/* Password Field */}
                <label className="font-bold text-gray-700 text-sm">
                  Password
                  <div>
                    <input
                      type="password"
                      className="border border-black rounded w-full py-2 px-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <span className="text-red-500 text-xs">
                      {errors.password.message}
                    </span>
                  )}
                </label>

                {/* Confirm Password Field */}
                <label className="font-bold text-gray-700 text-sm">
                  Confirm Password
                  <div>
                    <input
                      type="password"
                      className="border rounded border-black w-full py-2 px-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-green-500"
                      {...register("confirmPassword", {
                        validate: (val) => {
                          if (!val) return "This field is required";
                          if (watch("password") !== val)
                            return "Passwords do not match";
                        },
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-xs">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </label>
              </div>

              {/* Loading and Error Messages */}
              {isLoading && (
                <div className="text-blue-500 text-center text-sm">
                  Registering... please wait
                </div>
              )}
              {errorMessage && (
                <div className="text-red-500 text-center text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-green-600 text-white py-2 px-5 w-full rounded-md font-bold hover:bg-green-500 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
      )}
    </div>
  );
};

export default ForgotPassword;
