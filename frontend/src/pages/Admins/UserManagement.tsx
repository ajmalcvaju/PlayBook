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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const turfsPerPage = 5;

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
        url = `http://localhost:7000/api/admin/block-user/${id}/0`;
      } else {
        url = `http://localhost:7000/api/admin/block-user/${id}/1`;
      }
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to update user status');
          }
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === id ? { ...user, isApproved: !user.isApproved } : user
            )
          );
          setShowModal(false)
        })
        .catch((err) => console.error('Error handling user action:', err));
    }
  };
  

  const handleCancelAction = () => {
    setShowModal(false); // Just close the modal without any action
  };
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobileNumber.includes(searchQuery)
  );
  const indexOfLastUser = currentPage * turfsPerPage;
  const indexOfFirstUser = indexOfLastUser - turfsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  return (
    <div className="bg-gray-950 p-4 min-h-full">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-200">User Management</h1>
        <input
          type="text"
          className="px-4 w-1/3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-yellow-500"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
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
            {currentUsers.length>0?(
              currentUsers.map((user,index) => (
                <tr
                  className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800"
                  key={user.id}
                >
                  <td className="px-6 py-4">{index+1}</td>
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
              ))): (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-6">
                    No users found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredUsers.length / turfsPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-2 rounded-lg font-bold ${currentPage === index + 1 ? 'bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {index + 1}
          </button>
        ))}
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
