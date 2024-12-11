import React from 'react'


interface HeroProps {
  user: string;
}

const Hero = ({ user }: HeroProps) => {
  let title = "Find Your Turf";
  let description = "Find Your Dream Turf For Your Dream Game...";

  if (user === "turf") {
    title = "Manage Your Turf";
    description = "View, update, and manage your turf efficiently.";
  } else if (user === "admin") {
    title = "Admin Dashboard";
    description = "Monitor and manage users,turfs, bookings, and more.";
  } else if (user === "user") {
    title = "Welcome User";
    description = "Explore and book your favorite turfs!";
  }

  return (
    <div className='bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 shadow-lg py-4 transform transition-all duration-300'>
      <div className="container mx-auto flex flex-col gap-1">
        <h1 className="text-3xl text-white font-bold">{title}</h1>
        <p className="text-1.5xl text-white">{description}</p>
      </div>
    </div>
  );
};

export default Hero;


