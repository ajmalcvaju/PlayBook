import React from 'react'
import { Link } from 'react-router-dom'


interface HeroProps {
  user: string;
}

const Header = ({ }: HeroProps) => {
  
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 pt-4 shadow-lg transform transition-all duration-300">
      <div className="mx-10 flex justify-between">
        <span className="text-4xl ml-20 text-white font-bold tracking-tight">
          <Link to="/">
            <img
              src="https://i.imgur.com/1eyM5kC.png"
              alt="PlayBook Logo"
              className="w-full h-8"
            />
          </Link>
        </span>
        <span className="flex mx-12 space-x-2">
        </span>
      </div>
    </div>
  );
}

export default Header
