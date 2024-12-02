import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Turf {
  _id: string;
  turfName: string;
  email: string;
  mobileNumber: string;
  gallery: string[];
  turfAddress: string;
}

const Home: React.FC = () => {
  let navigate=useNavigate()
  let token=localStorage.getItem("userToken")
  useEffect(()=>{
   if(!token){
    navigate("/login")
   }
  },[])
  const [turfs, setTurfs] = useState<Turf[]>([]);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await fetch("http://localhost:7000/api/users/getTurf");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTurfs(data.turfs);
      } catch (error) {
        console.error("Failed to fetch turfs:", error);
      }
    };

    fetchTurfs();
  }, []);

  return (
    <div className="container mx-auto p-1">
      <h1 className="text-3xl font-bold justify-center text-center mb-8">Score Big with Every Booking – Reserve Your Turf Today</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {turfs.map((turf) => (
          <div onClick={()=>navigate(`/turf-page/${turf._id}`)}
            key={turf._id}
            className="bg-black border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={turf.gallery[0]}
              alt={turf.turfName}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl text-white font-semibold mb-2">{turf.turfName}</h2>
              <p className="text-white text-sm mt-2">{turf.turfAddress}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
