'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie } from '../utils/cookies';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function Header() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCookie('currentUser');
    const userRole = getCookie('userRole');
    const userId = getCookie('userId');
    const username = getCookie('username');

    if (!currentUser || userRole === 'customer' || !userRole) {
      router.push('/error');
      return;
    }

    if (userRole === 'seller') {
      setIsAuthorized(true);
      setUserId(userId);
      setUsername(username);
    } else {
      router.push('/error');
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetch(`https://api.bettabeal.my.id/api/sellers/${userId}`)
        .then(response => response.json())
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [userId]);

  const handleLogout = () => {
    const exp = new Date(0);
    setCookie('currentUser', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('userRole', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('userId', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('username', '', { expires: exp, secure: true, sameSite: 'Strict' });
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center bg-white p-4 z-10 shadow-md">
      <div className="flex items-center">
        <a href='/dashboard'>
          <Image src="/logoBB.png" alt="Logo" width={150} height={200} />
        </a>
        <div className="relative search-bar ml-8">
          <Icon icon="mynaui:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 icon" width={20} height={20} />
          <input
            type="text"
            className="block w-full pl-10 md:pr-24 lg:pr-96 xl:pr-[40rem] py-2 border border-blue-600 rounded-3xl shadow-sm placeholder-gray-400 sm:text-sm"
            placeholder="Search"
          />
        </div>
      </div>
      <div>
        <span className="ml-4 text-gray-700">{username}</span>
      </div>
      <div>
        <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">Logout</button>
      </div>
    </header>
  );
}