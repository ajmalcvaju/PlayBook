import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentConfirmation = () => {
  const navigate = useNavigate();

  const closeModal = () => {
    navigate(-1);
  };
  
  const openRazorpay = async () => {
    const options = {
      key: import.meta.env.VITE_RAZOR_PAY_KEY, // Replace with your Razorpay test key
      amount: 50000, // Amount in paise (50000 = 500 INR)
      currency: "INR",
      name: "Your Company Name",
      description: "Test Transaction",
      image: "https://your-logo-url.com/logo.png", // Optional: Your logo URL
      handler: (response) => {
        console.log("Payment successful!", response);
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        // Redirect or perform post-payment logic here
        navigate("/home");
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };


    // Razorpay integration
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      console.error("Payment failed:", response.error);
      alert("Payment failed. Please try again.");
    });

    rzp.open();
  };

  return (
    <div className="relative">
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-70"
          onClick={closeModal}
        ></div>

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
              onClick={closeModal}
            >
              &times;
            </button>
            <h1 className="text-3xl font-bold text-green-400 mb-4">
              Payment Confirmation
            </h1>
            <p className="text-lg text-gray-300">
              Your payment is being processed. Thank you for your booking!
            </p>
            <button
              className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={openRazorpay} // Call Razorpay integration on button click
            >
              Pay Now
            </button>
          </div>
        </div>
      </>
    </div>
  );
};

export default PaymentConfirmation;
