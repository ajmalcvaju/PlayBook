import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Turf = {
  _id: string;
  turfName: string;
  isApproved: boolean;
  email: string;
  mobileNumber: string;
  bookingCount: number;
  isBlocked: boolean;
};

const TurfManagement = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("adminToken")
  useLayoutEffect(()=>{
   if(!token){
    navigate("/adminLogin")
   }
  },[])
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);

  useLayoutEffect(() => {
    const fetchTurfs = async () => {
      const res = await fetch("http://localhost:7000/api/admin/get-turfs");
      if (!res.ok) throw new Error("Failed to fetch turfs");
      const data = await res.json();
      console.log(data.turfs);
      setTurfs(data.turfs);
    };
    fetchTurfs();
  }, []);

  const handleApproveOrBlockClick = (turf: Turf) => {
    setSelectedTurf(turf);
    setShowModal(true); // Show confirmation modal
  };

  const handleConfirmAction = () => {
    if (selectedTurf) {
      console.log(`${selectedTurf.isApproved ? "Blocking" : "Approving"} turf:`, selectedTurf);
      // Call the API to approve or block the turf here
      // Then close the modal
      setShowModal(false);
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
              <th scope="col" className="px-6 py-3">Turf No</th>
              <th scope="col" className="px-6 py-3">Turf Name</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Mobile Number</th>
              <th scope="col" className="px-6 py-3">Count of Booking</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {turfs && turfs.map((turf) => (
              <tr className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800" key={turf._id}>
                <td className="px-6 py-4">{turf._id}</td>
                <td className="px-6 py-4">{turf.turfName}</td>
                <td className="px-6 py-4">{turf.email}</td>
                <td className="px-6 py-4">{turf.mobileNumber}</td>
                <td className="px-6 py-4">{turf.bookingCount}</td>
                <td className="px-6 py-4">
                  <button
                    className={`${
                      turf.isApproved ? "bg-red-600 hover:bg-red-700" : "bg-yellow-500 hover:bg-yellow-600"
                    } text-white font-bold py-2 px-4 rounded-lg`}
                    onClick={() => handleApproveOrBlockClick(turf)}
                  >
                    {turf.isApproved ? "Block" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedTurf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-400 p-8 rounded-xl shadow-xl transform transition-all duration-500 scale-100 hover:scale-105">
            <h2 className="text-2xl text-center font-bold text-white mb-6">Are you sure?</h2>
            <p className="text-lg text-gray-200 mb-6">
              Are you sure you want to {selectedTurf.isApproved ? 'block' : 'approve'}{' '}
              <span className="font-semibold text-yellow-400">{selectedTurf.turfName}</span>?
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
                {selectedTurf.isApproved ? 'Block' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurfManagement;
