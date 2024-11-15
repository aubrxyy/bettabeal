'use client'

import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { getCookie } from '../_utils/cookies';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Navbar from './Navbar';

const interB = Inter({
  subsets: ['latin'],
  weight: '600',
})

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getCookie('USR');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentication`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.code === '000' && data.role === 'seller') {
            setIsAuthenticated(true);
          } else if (data.code === '403') {
            router.push('/error');
          } else {
            setIsAuthenticated(false);
          }
        })
        .catch(error => {
          console.error('Error during authentication:', error);
          setIsAuthenticated(false);
        });
    } else {
      router.push('/login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated === false) {
    return null;
  }

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
        </div>
      </div>
    </div>
  );
}