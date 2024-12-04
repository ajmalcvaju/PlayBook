import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  _id: string;
  isApproved: boolean;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  bookingCount: number;
  isBlocked: boolean;
};

const UserManagement = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("adminToken")
  useLayoutEffect(()=>{
   if(!token){
    navigate("/adminLogin")
   }
  },[])
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useLayoutEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('http://localhost:7000/api/admin/get-users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      console.log(data.users);
      setUsers(data.users);
    };
    fetchUsers();
  }, []);

  const handleApproveOrBlockClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedUser) {
      const id = selectedUser._id;
      let url = '';
      if (selectedUser.isApproved) {
        // Block the user
        url = `http://localhost:7000/api/admin/block-user/${id}/0`;
      } else {
        // Approve the user
        url = `http://localhost:7000/api/admin/approve-user/${id}/1`;
      }

      fetch(url)
        .then(() => {
          // After the action (block or approve), we refetch the user data
          setShowModal(false);
          const updatedUsers = users.map((user) =>
            user._id === selectedUser._id
              ? {
                  ...user,
                  isApproved: !user.isApproved,
                  isBlocked: !user.isApproved ? true : user.isBlocked, // Block if approving, unblock if blocking
                }
              : user
          );
          setUsers(updatedUsers);
        })
        .catch((err) => console.error('Error handling user action:', err));
    }
  };

  const handleCancelAction = () => {
    setShowModal(false); // Just close the modal without any action
  };

  return (
    <div className="bg-gray-950 p-4 min-h-full">
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-800 text-xs uppercase text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                User No
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Mobile Number
              </th>
              <th scope="col" className="px-6 py-3">
                Count of Booking
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((user) => (
                <tr
                  className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800"
                  key={user.id}
                >
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.mobileNumber}</td>
                  <td className="px-6 py-4">{user.bookingCount}</td>
                  <td className="px-6 py-4">
                    <button
                      className={`${
                        user.isApproved
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white font-bold py-2 px-4 rounded-lg`}
                      onClick={() => handleApproveOrBlockClick(user)}
                    >
                      {user.isApproved ? 'Block' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-400 p-8 rounded-xl shadow-xl transform transition-all duration-500 scale-100 hover:scale-105">
            <h2 className="text-2xl text-center font-bold text-white mb-6">
              Are you sure?
            </h2>
            <p className="text-lg text-gray-200 mb-6">
              Are you sure you want to {selectedUser.isApproved ? 'block' : 'approve'}{' '}
              <span className="font-semibold text-yellow-400">
                {selectedUser.firstName} {selectedUser.lastName}
              </span>?
            </p>
            <div className="flex justify-center space-x-6">
              <button
                className="bg-yellow-300 hover:bg-gray-500 text-black font-semibold py-2 px-6 rounded-lg transform transition-all duration-300"
                onClick={handleCancelAction}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transform transition-all duration-300"
                onClick={handleConfirmAction}
              >
                {selectedUser.isApproved ? 'Block' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
