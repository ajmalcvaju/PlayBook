import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidePanel = ({ page }: { page: string }) => {
  const buttonStyles =
    'btn hover:bg-blue-300 rounded-lg p-2 transition-colors duration-300';
  const getButtonClass = (buttonPage: string) => {
    return page === buttonPage
      ? `${buttonStyles} bg-yellow-500 text-black`
      : `${buttonStyles} bg-white text-black`;
  };

  return (
    <div className="flex">
      <div className="bg-gray-600 h-full w-64 p-4 shadow-md flex flex-col">
        <h1 className="text-center text-lg font-bold text-gray-300 mb-5">Admin Panel</h1>
        <div className="flex flex-col gap-3">
          <button className={getButtonClass('dashboard')}><Link to="/admin/dashboard">Dashboard</Link></button>
          <button className={getButtonClass('user-management')}><Link to="/admin/user-management">User Management</Link></button>
          <button className={getButtonClass('turf-management')}><Link to="/admin/turf-management">Turf Management</Link></button>
          <button className={getButtonClass('booking-list')}><Link to="/admin/booking-list">Booking List</Link></button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidePanel;
