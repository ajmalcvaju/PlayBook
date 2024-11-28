import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
type loginData = {
  email: string;
  password: string;
};

const Login = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("userToken")
  useEffect(()=>{
   if(token){
    navigate("/home")
   }
  },[])
  const {register,handleSubmit,formState: { errors },} = useForm<loginData>();
  const [isLoading,setIsLoading]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)

  const submit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("http://localhost:7000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("userToken",result.token);
        localStorage.setItem("userEmail", data.email);
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
      backgroundImage: "url('https://cdn-wp.thesportsrush.com/2022/11/b0682d0e-virat-kohli-is-not-playing.jpg?format=auto&w=3840&q=75')", // Replace with your image URL
    }}
  >

    <div className="absolute inset-0 bg-black bg-opacity-50"></div>

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
    </div>
  </div>

  );
};

export default Login;
