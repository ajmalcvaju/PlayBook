import React, { useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
    let navigate=useNavigate()
  let token=localStorage.getItem("adminToken")
  useLayoutEffect(()=>{
   if(!token){
    navigate("/adminLogin")
   }
  },[])
  return (
    <>
    <div className="flex-1 p-6">
    <h2 className="text-2xl font-bold">Welcome to the Admin Panel</h2>
    <p className="mt-4 text-gray-700">Select an option from the side menu.</p>
    </div>
    </>
  )
}

export default AdminDashboard
