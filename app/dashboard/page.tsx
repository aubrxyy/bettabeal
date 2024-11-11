'use client'

import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { getCookie } from '../_utils/cookies';
import Header from './Header';
import Navbar from './Navbar';

interface Seller {
  email: string;
}

const interB = Inter({
  subsets: ['latin'],
  weight: '600',
})

export default function Dashboard() {
  const [, setUserData] = useState<Seller | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = getCookie('userId');
    setUserId(id);
  }, []);

  useEffect(() => {
    if (userId) {
      fetch(`https://api.bettabeal.my.id/api/sellers/${userId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setUserData(data.seller);
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [userId]);

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4.63rem]">
          <h1 className={`text-white text-2xl mt-2 mb-4 ${interB.className}`}>Dashboard</h1>
          <div className="grid grid-cols-5 gap-2 md:gap-4 xl:gap-8 mb-8">
            <div className='h-16 bg-white rounded-md'></div>
            <div className='h-16 bg-white rounded-md'></div>
            <div className='h-16 bg-white rounded-md'></div>
            <div className='h-16 bg-white rounded-md'></div>
            <div className='h-16 bg-white rounded-md'></div>
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-4 xl:gap-8 mb-8">
            <div className='h-96 bg-white rounded-md col-span-5'></div>
            <div className='h-96 bg-white rounded-md col-span-2'></div>
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-4 xl:gap-8 mb-8">
            <div className='h-96 bg-white rounded-md col-span-5'></div>
            <div className='h-96 bg-white rounded-md col-span-2'></div>
          </div>
          
          {/* Dashboard */}
          {/* {userData && (
            <span className="ml-4 text-gray-700">
              {userData.email}
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
}