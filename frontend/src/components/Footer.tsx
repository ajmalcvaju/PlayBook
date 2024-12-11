import React from 'react'

const Footer = () => {
  return (
    <div className='bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 py-6 shadow-lg rounded-lg transform transition-all duration-300'>
      <div className='container mx-auto flex justify-between items-center'>
          <span className='text-1xl text-white font-semibold tracking-tight'>
              PlayBook.com
          </span>
          <span className='text-white font-bold tracking-tight flex gap-4'>
             <p className='cursor-pointer'>Privacy Policy</p>
             <p className='cursor-pointer'>Terms of Service</p>
          </span>
      </div>
    </div>
  )
}

export default Footer
