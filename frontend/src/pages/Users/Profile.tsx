import React from "react";
import { useState } from "react";
import { useForm} from "react-hook-form";
import { useSelector } from "react-redux";
import apiClient from "../../apiClient";

type RegisterFormData = {
  password: string;
  confirmPassword: string;
};
interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  isVerified: number;
  isApproved: number;
  __v: number;
  latitude: number;
  longitude: number;
  locationName: string;
  isOnline: boolean;
  lastSeen: string;
}
interface UserState {
  currentUser: CurrentUser;
}
interface RootState {
  user: UserState;
}

const Profile = () => {
  const [passwordModal, setPasswordModal] = useState(false);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );

  const changePassword = () => {
    setPasswordModal(true);
  };
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const updatePassword: any = handleSubmit(async (data) => {
    const loginData = {
      id: currentUser._id,
      password: data.password,
    };
  
    try {
      const response = await apiClient.patch("/users/change-password", loginData);
  
      console.log("Password update successful:", response.data);
      setErrorMessage(null);
      setPasswordModal(false);
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error:any) {
      const errorMessage =
        error.response?.data?.message || "An error occurred while updating the password.";
      setErrorMessage(errorMessage);
      console.error("Error during password update:", error);
    }
  });
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <h2 className="text-2xl font-bold text-gray-100">My Profile</h2>
        </div>

        <div className="bg-gray-900 shadow-lg rounded-xl p-8 text-gray-200">
          {/* Profile Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-blue-600 shadow-lg flex items-center justify-center text-4xl font-bold uppercase text-gray-100">
                {currentUser?.firstName?.[0] || "?"}
              </div>
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
            </div>
          </div>

          {/* User Details */}
          <div className="grid gap-6">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-400"
                >
                  First Name
                </label>
                <div
                  id="firstName"
                  className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800 text-gray-100"
                >
                  {currentUser?.firstName || "N/A"}
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-400"
                >
                  Last Name
                </label>
                <div
                  id="lastName"
                  className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800 text-gray-100"
                >
                  {currentUser?.lastName || "N/A"}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400"
              >
                Email
              </label>
              <div
                id="email"
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800 text-gray-100"
              >
                {currentUser?.email || "N/A"}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-400"
              >
                Phone
              </label>
              <div
                id="phone"
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800 text-gray-100"
              >
                {currentUser?.mobileNumber || "N/A"}
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="nation"
                className="block text-sm font-medium text-gray-400"
              >
                Location
              </label>
              <div
                id="nation"
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800 text-gray-100"
              >
                {currentUser?.locationName || "N/A"}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-400"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={changePassword}
                  className="text-blue-500 hover:text-blue-400 font-medium focus:outline-none"
                  aria-label="Change Password"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-6 p-4 bg-green-600 text-white rounded-lg text-center shadow-md">
              {successMessage}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Change Password */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 rounded-2xl shadow-2xl w-[400px] max-w-[90%]">
            <h3 className="text-3xl font-bold mb-6 text-white text-center">
              Change Password
            </h3>
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">
                {errorMessage}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit(updatePassword)}>
              {/* New Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-700 rounded-lg py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter new password"
                  {...register("password", {
                    required: "This field is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-700 rounded-lg py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Confirm your password"
                  {...register("confirmPassword", {
                    validate: (val) => {
                      if (!val) return "This field is required";
                      if (watch("password") !== val)
                        return "Passwords do not match";
                    },
                  })}
                />
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setPasswordModal(false)}
                  className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
