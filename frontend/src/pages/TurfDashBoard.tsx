import React, { useEffect } from 'react'
import TurfSidePanel from '../components/TurfSidePanel'
import { useNavigate } from 'react-router-dom'

const TurfDashBoard = () => {
    let navigate=useNavigate()
  let token=localStorage.getItem("turfToken")
  useEffect(()=>{
   if(!token){
    navigate("/turfLogin")
   }
  },[])
  return (
    <>
      <div className="flex-1 p-6">
    <h2 className="text-2xl font-bold">Welcome to the Turf Panel</h2>
    <p className="mt-4 text-gray-700">Select an option from the side menu.</p>
  </div>
    </>
  )
}

export default TurfDashBoard
