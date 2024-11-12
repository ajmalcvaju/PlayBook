import React from "react";
import { useForm } from "react-hook-form";

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const { register,watch,handleSubmit,formState:{errors} } = useForm<RegisterFormData>();
  const submit=handleSubmit((data)=>{
    console.log(data)
  })
  return (
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <h2 className="font-bold text-3xl">Create an Account</h2>
      <div className="flex flex-col md:flex-row gap-5">
        <label className="font-bold text-gray-700 text-sm flex-1">
          First Name
          <input
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("firstName", { required: "This field is required" })}
          ></input>
          {errors.firstName&&(
            <span className="text-red-500">{errors.firstName.message}</span>
          )}
        </label>
        <label className="font-bold text-gray-700 text-sm flex-1">
          Last Name
          <input
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("lastName", { required: "This field is required" })}
          ></input>
          {errors.lastName&&(
            <span className="text-red-500">{errors.lastName.message}</span>
          )}
        </label>
      </div>
      <label className="font-bold text-gray-700 text-sm flex-1">
        Email
        <input type="email"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("email", { required: "This field is required" })}
        ></input>
        {errors.email&&(
            <span className="text-red-500">{errors.email.message}</span>
          )}
      </label>
      <label className="font-bold text-gray-700 text-sm flex-1">
        Password
        <input type="password"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("password", { required: "This field is required",minLength:
            {value:6,message:"password must be ateast 6 character"} })}
        ></input>
        {errors.password&&(
            <span className="text-red-500">{errors.password.message}</span>
          )}
      </label>
      <label className="font-bold text-gray-700 text-sm flex-1">
        Confirm Password
        <input type="password"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("confirmPassword", {
            validate:(val)=>{
               if(!val){
                  return "This field is Required"
               }else if(watch("password") !==val){
                  return "Your Password do not match"
               }
            }
          })}
        ></input>
        {errors.confirmPassword&&(
            <span className="text-red-500">{errors.confirmPassword.message}</span>
          )}
      </label>
      <span>
        <button type="submit" className="bg-green-600 text-white p-2 font-bold hover:bg-green-500 text-xl">
            Create Button
        </button>
      </span>
    </form>
  );
};

export default Register;
