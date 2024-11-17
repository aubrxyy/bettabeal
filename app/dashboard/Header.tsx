  'use client';

  import { Icon } from '@iconify/react';
  import Image from 'next/image';
  import { useRouter } from 'next/navigation';
  import { useEffect, useState } from 'react';
  import { getCookie, setCookie } from '../_utils/cookies';

  export default function Header() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
      const uid = getCookie('UID');

      const fetchUserInformation = async (uid: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers/${uid}`);
          const data = await response.json();
          if (data.code === '000') {
            setIsAuthorized(true);
            setUsername(data.seller.store_name);
          } else {
            router.push('/error');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          router.push('/error');
        }
      };
      
      if (uid) {
        fetchUserInformation(uid);
      } else {
        router.push('/error');
      }
    }, [router]);


    const handleLogout = () => {
      const exp = new Date(0);
      setCookie('USR', '', { expires: exp, secure: true, sameSite: 'Strict' });
      setCookie('UID', '', { expires: exp, secure: true, sameSite: 'Strict' });
      localStorage.removeItem('token');
      router.push('/login');
    };

    if (!isAuthorized) {
      return null;
    }

    return (
      <header className="px-10 fixed top-0 left-0 right-0 flex justify-between items-center bg-white p-4 z-10 shadow-sm">
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
        <div className='flex flex-row'>
          <div className="rounded-full size-8 bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-center text-white mt-1 ">
            <p className='mt-1'>{username ? username.charAt(0).toUpperCase() : ''}</p>
          </div>
          <span className="ml-4 text-gray-700 items-center flex justify-center">{username}</span>
        </div>
        <div>
          <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">Logout</button>
        </div>
      </header>
    );
  }