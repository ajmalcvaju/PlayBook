import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
type loginData={
    email:string,
    password:string
}

const TurfLogin = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("turfToken")
  useEffect(()=>{
   if(token){
    navigate("/turf/dashboard")
   }
  },[])
    const { register, handleSubmit, formState: {errors} } = useForm<loginData>();
    const [isLoading,setIsLoading]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)

  const submit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("http://localhost:7000/api/turfs/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("turfToken",result.token);
        localStorage.setItem("userEmail", data.email);
        navigate("/turf/dashboard");
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
    <div className="flex justify-center items-center">
  <form className="flex flex-col gap-5 w-1/2" onSubmit={submit}>
    <h2 className="font-bold text-3xl">Login</h2>
    <label className="font-bold text-gray-700 text-sm flex-1">
      Email
      <div>
        <input
          type="email"
          className="border border-black rounded w-1/2 py-1 px-2 font-normal"
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
          className="border border-black rounded w-1/2 py-1 px-2 font-normal"
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
    {isLoading && <div className="text-blue-500">Submitting... Please wait</div>}
    {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    <div className="flex">
      <button
        type="submit"
        className="bg-green-600 text-white p-2 w-2/4 rounded-md px-5 font-bold hover:bg-green-500 text-xl"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Login"}
      </button>
    </div>
  </form>

  {/* Image Section */}
  <div className="w-1/2">
    <img
      src="https://turftown.in/_next/image?url=https%3A%2F%2Fturftown.s3.ap-south-1.amazonaws.com%2Fsuper_admin%2Ftt-1724315654347.webp&w=3840&q=75"
      alt="Login illustration"
      className="rounded-lg shadow-lg"
    />
  </div>
</div>

  )
};

export default TurfLogin;
