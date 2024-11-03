'use client'

import { useEffect, useState } from 'react';
import { getCookie } from '../utils/cookies';
import Header from './Header';
import Navbar from './Navbar';

interface Seller {
  email: string;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<Seller | null>(null);
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
        <div className="p-4 mt-[4.63rem]">
          Dashboard
          {userData && (
            <span className="ml-4 text-gray-700">
              {userData.email}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}