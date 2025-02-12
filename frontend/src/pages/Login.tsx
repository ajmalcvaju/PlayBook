import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useForm } from "react-hook-form";
import { useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess } from "../Redux/userSlice";
import {signout as turfLogout} from "../Redux/turfSlice"
import {signout as adminLogout} from "../Redux/adminSlice"
import apiClient from "../apiClient";

type loginData = {
  email: string;
  password: string;
};

const Login = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginData>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.post("/users/login", data, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
        console.log("hi");
        console.log(response);
        localStorage.setItem("userToken", response.data.accessToken);
        localStorage.setItem("accessToken", response.data.accessToken);
        console.log(response.data.accessToken);
        localStorage.setItem("userEmail", data.email);
        dispatch(signInSuccess(response.data.user));
        dispatch(turfLogout());
        dispatch(adminLogout())
        navigate("/home");
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Invalid email or password. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  });
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const res = await apiClient.post("/users/googleAuth", {
        fullname: result.user.displayName,
        email: result.user.email,
      });
      if (res.status === 200) {
        localStorage.setItem("userToken", res.data.accessToken);
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("userEmail", result?.user?.email as string);
        dispatch(turfLogout());
        dispatch(adminLogout())
        dispatch(signInSuccess(res.data.user));
        navigate("/home");
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Unable to Login. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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

      <div className="relative bg-white rounded-lg bg-opacity-70 shadow-lg p-10 w-full max-w-md mx-5 backdrop-blur-md">
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <h2 className="font-bold text-3xl text-center">Login</h2>

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

          <label className="font-bold text-gray-700 text-sm">
            Password
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
        <div className="mt-4">
          <button
            onClick={googleLogin}
            className="flex items-center justify-center gap-2 w-full bg-gray-800 px-4 py-2 text-sm font-medium text-white border border-gray-300 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Additional Options */}
        <div className="text-center mt-5">
          <p className="text-gray-700 text-sm">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-green-600 hover:underline font-bold"
            >
              Sign up
            </a>
          </p>
          <p className="text-gray-700 text-sm mt-2">
            <a
              href="/forgot-password"
              className="text-green-600 hover:underline font-bold"
            >
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
