import React from 'react';
import { Link } from 'react-router-dom';

const TurfSidePanel = ({ page }: { page: string }) => {
  const buttonStyles =
    'btn hover:bg-blue-300 rounded-lg p-2 transition-colors duration-300';
  const getButtonClass = (buttonPage: string) => {
    return page === buttonPage
      ? `${buttonStyles} bg-yellow-500 text-black`
      : `${buttonStyles} bg-white text-black`;
  };

  return (
    <div className="flex">
      <div className="bg-green-300 h-full w-64 p-4 shadow-md flex flex-col">
        <h1 className="text-center text-lg font-bold text-green-700 mb-5">Turf Panel</h1>
        <div className="flex flex-col gap-3">
          <button className={getButtonClass('dashboard')}><Link to="/turf/dashboard">Dashboard</Link></button>
          <button className={getButtonClass('slot-management')}><Link to="/turf/slot-management">Slot Management</Link></button>
          <button className={getButtonClass('customer-chat')}>Customer Chat</button>
          <button className={getButtonClass('booking-list')}>Booking List</button>
          <button className={getButtonClass('upgrade-details')}><Link to="/turf/details-update">Upgrade Details</Link></button>
        </div>
      </div>
    </div>
  );
};

export default TurfSidePanel;
