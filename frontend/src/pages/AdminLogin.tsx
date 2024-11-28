import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
type loginDta={
    email:string,
    password:string
}

const AdminLogin = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("adminToken")
  useEffect(()=>{
   if(token){
    navigate("/admin/dashboard")
   }
  },[])
  const { register, handleSubmit, formState: {errors} } = useForm<loginDta>();
  const [isLoading,setIsLoading]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string|null>(null)
  const submit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("http://localhost:7000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("adminToken",result.token);
        localStorage.setItem("userEmail", data.email);
        navigate("/admin/dashboard");
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
    <form className="flex flex-col gap-5" onSubmit={submit}>
    <h2 className="font-bold text-3xl">Login</h2>
    <label className="font-bold text-gray-700 text-sm flex-1">
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
      Password
      <div>
        <input
          type="password"
          className="border border-black rounded w-1/2 py-1 px-2 font-normal"
          {...register("password", {
            required: "This field is required",
            minLength: {
              value: 6,
              message: "password must be ateast 6 character",
            },
          })}
        ></input>
      </div>
      {errors.password && (
        <span className="text-red-500">{errors.password.message}</span>
      )}
    </label>
    {isLoading&&<div className="text-blue-500">Submitting....pease,Wait</div>}
      {errorMessage&&<div className="text-red-500">{errorMessage}</div>}
      <div className="flex">
      <button
        type="submit"
        className="bg-green-600 text-white p-2 w-1/2 rounded-md px-5 font-bold hover:bg-green-500 text-xl"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Login"}
      </button>
      </div>
  </form>
  )
};

export default AdminLogin;
