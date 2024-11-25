'use client'
import { Icon } from '@iconify/react';
import { Poppins } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCookie, setCookie } from '../_utils/cookies';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  fullName: string;
  profilePicture?: string;
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: '400',
});

const poppinsB = Poppins({
  subsets: ['latin'],
  weight: '600',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
          if (data.code === '000') {
            const uid = getCookie('UID');
            if (uid) {
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${uid}`)
                .then(response => response.json())
                .then(data => {
                  if (data.code === '000') {
                    setUser({
                      fullName: data.customer.full_name,
                      profilePicture: data.customer.profile_image ? `${process.env.NEXT_PUBLIC_API_URL}${data.customer.profile_image}` : undefined,
                    });
                  } else {
                    console.error('Failed to fetch user data');
                  }
                })
                .catch(error => {
                  console.error('Error fetching user data:', error);
                });
            }
          } else {
            router.push('/login'); 
          }
        })
        
    } else {
      router.push('/login');
    }
  }, [router]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return names[0].charAt(0).toUpperCase();
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1);
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    setCookie('USR', '', { expires: new Date(0), secure: true, sameSite: 'Strict' });
    setCookie('UID', '', { expires: new Date(0), secure: true, sameSite: 'Strict' });
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex flex-row justify-center items-center h-[91vh] mx-auto gap-4" style={{ background: 'linear-gradient(to top, #1DACFE 45%, #7ec9f2 94%)' }}>
      <div className='flex flex-col space-y-4 h-4/5'>
        <div className="h-1/5 bg-white rounded-t-xl my-auto text-[#38B6FF] relative flex flex-row items-center justify-start shadow-xl">
          <div className="rounded-full bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] w-16 h-16 flex items-center justify-center text-2xl ml-8 text-white">
            {user?.profilePicture ? (
              <Image src={user.profilePicture} width={100} height={100} alt="Profile" className="rounded-full w-full h-full object-cover" />
            ) : (
              user && getInitials(user.fullName)
            )}
          </div>
          <div className="ml-6 text-left text-black">
            <div className={`${poppins.className} text-base leading-tight`}>Hello,</div>
            <div className={`${poppinsB.className} text-2xl leading-tight`}>{user && getFirstName(user.fullName)}</div>
          </div>
       </div>
          <div className="h-4/5 bg-white rounded-b-xl my-auto relative flex flex-col text-nowrap shadow-xl">
            <nav className="flex-1 ">
              <ul className='flex flex-col'>
                <li>
                  <div className='bg-gradient-to-b from-[#0F4A99] to-[#38B6FF]'>
                    <Link
                      href="/user"
                      className={`items-center flex flex-row py-4 pl-8 pr-28 hover:bg-gray-100 transition-all ${pathname === '/user' ? 'ml-2 bg-gray-200 hover:bg-gray-200' : 'bg-white'}`}
                    >
                    <Icon icon="ant-design:idcard-outlined" className='mr-4 size-5' />
                      Profile
                    </Link>
                  </div>
                </li>
                <li>
                  <div className='bg-gradient-to-b from-[#0F4A99] to-[#38B6FF]'>
                    <Link
                      href="/user/orders"
                      className={`items-center flex flex-row py-4 pl-8 pr-28 hover:bg-gray-100 transition-all ${pathname === '/user/orders' ? 'ml-2 bg-gray-200 hover:bg-gray-200' : 'bg-white'}`}
                    >
                      <Icon icon="ph:package-duotone" className='mr-4 size-5' />
                      My Orders
                    </Link>
                  </div>
                </li>
                <li>
                  <div className='bg-gradient-to-b from-[#0F4A99] to-[#38B6FF]'>
                    <Link
                      href="/user/address"
                      className={`items-center flex flex-row py-4 pl-8 pr-28 hover:bg-gray-100 transition-all ${pathname.startsWith('/user/address') ? 'ml-2 bg-gray-200 hover:bg-gray-200' : 'bg-white'}`}
                    >
                      <Icon icon="solar:home-linear" className='mr-4 size-5' />
                      My Address
                    </Link>
                  </div>
                </li>
                <li>
                 <div className='bg-gradient-to-b from-[#0F4A99] to-[#38B6FF]'>
                    <Link
                      href="/user/reviews"
                      className={`items-center flex flex-row py-4 pl-8 pr-28 hover:bg-gray-100 transition-all ${pathname === '/user/reviews' ? 'ml-2 bg-gray-200 hover:bg-gray-200' : 'bg-white'}`}
                    >
                      <Icon icon="ic:baseline-star" className='mr-4 size-5'/>
                      My Reviews
                    </Link>
                 </div>
                </li>
                <li>
                  <Link
                    href="/logout"
                    onClick={handleLogoutClick}
                    className={`border-t-2 absolute bottom-0 items-center flex flex-row py-4 pl-8 pr-16 hover:bg-gray-100 rounded-bl-xl transition-all text-red-500`}
                  >
                    <Icon icon="gg:log-out" className='mr-4 size-5' />
                    Sign out
                  </Link>
                </li>
              </ul>
            </nav>
        </div>
        </div>
      <div className='h-4/5 w-3/5 bg-white rounded-xl shadow-xl'>
        {children}
      </div>
      {showLogoutDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl mb-4">Are you sure you want to logout?</h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={handleCancelLogout}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};