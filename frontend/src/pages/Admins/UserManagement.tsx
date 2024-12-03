import React, { useEffect, useLayoutEffect, useState } from 'react'

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    bookingCount: number;
    isBlocked: boolean;
  };

const UserManagement = () => {
    const [users,setUsers]=useState<User[]>([])
    useLayoutEffect(()=>{
    const users=async()=>{
        const res = await fetch("http://localhost:7000/api/admin/get-users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        console.log(data.users)
        setUsers(data.users)
    }
     users()
    },[])
  return (
    <div className="bg-gray-950 p-4 min-h-full">
  <div className="overflow-x-auto rounded-lg shadow-lg">
    <table className="min-w-full text-left text-sm text-gray-300">
      <thead className="bg-gray-800 text-xs uppercase text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">User No</th>
          <th scope="col" className="px-6 py-3">Name</th>
          <th scope="col" className="px-6 py-3">Email</th>
          <th scope="col" className="px-6 py-3">Mobile Number</th>
          <th scope="col" className="px-6 py-3">Count of Booking</th>
          <th scope="col" className="px-6 py-3">Blocking</th>
        </tr>
      </thead>
      <tbody>
        {users&&users.map((user)=>(
        <tr className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800">
          <td className="px-6 py-4">1</td>
          <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
          <td className="px-6 py-4">{user.email}</td>
          <td className="px-6 py-4">{user.mobileNumber}</td>
          <td className="px-6 py-4">5</td>
          <td className="px-6 py-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
              Block
            </button>
          </td>
        </tr>
        ))}
        <tr className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800">
          <td className="px-6 py-4">2</td>
          <td className="px-6 py-4">Jane Smith</td>
          <td className="px-6 py-4">jane.smith@example.com</td>
          <td className="px-6 py-4">+987654321</td>
          <td className="px-6 py-4">2</td>
          <td className="px-6 py-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
              Block
            </button>
          </td>
        </tr>
        {/* Add more rows as needed */}
      </tbody>
    </table>
  </div>
</div>
  )
}

export default UserManagement
