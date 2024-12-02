import React, {useLayoutEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface HeroProps {
  user: string;
}

const Header = ({ user }: HeroProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate=useNavigate()
  useLayoutEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const turfToken = localStorage.getItem('turfToken');
    const adminToken = localStorage.getItem('adminToken');
    const token=userToken||turfToken||adminToken
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  const signOut=()=>{
    console.log("hi")
    localStorage.removeItem('userToken')
    localStorage.removeItem('turfToken')
    localStorage.removeItem('adminToken')
    if(user==="user"){
      navigate("/login")
      setIsLoggedIn(false);
    }else if(user==="turf"){
      navigate("/turfLogin")
      setIsLoggedIn(false);
    }else if(user==="admin"){
      navigate("/adminLogin")
      setIsLoggedIn(false);
    }
  }
  return (
    <div className='bg-green-800 py-2'>
      <div className='container mx-auto flex justify-between'>
        <span className='text-2xl text-white font-bold tracking-tight'>
        <Link to="/">PlayBook.com</Link>
        </span>
        <span className='flex space-x-2'>
          {isLoggedIn&&
        <button onClick={signOut} className="flex bg-white items-center text-blue-600 px-3 font-bold hover:bg-gray-100">Sign Out</button>}
        </span>
      </div>
    </div>
  )
}

export default Header
