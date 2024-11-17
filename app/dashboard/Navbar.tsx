'use client'
import { Icon } from '@iconify/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className="flex">
        <div className="h-screen bg-white pr-2 text-[#38B6FF] pt-24 relative flex flex-col">
          <nav className="flex-1 ">
            <ul className='flex flex-col'>
              <li>
                <Link
                  href="/dashboard"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname === '/dashboard' ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                <Icon icon="line-md:home" className='mr-4 size-5' />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/orders"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname.startsWith('/dashboard/orders') ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="line-md:list" className='mr-4 size-5' />
                  Order
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/products"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname.startsWith ('/dashboard/products') ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="tdesign:tag" className='mr-4 size-5' />
                  Product
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/articles"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname.startsWith('/dashboard/articles') ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="line-md:text-box-multiple" className='mr-4 size-5' />
                  Article
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/chat"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname.startsWith('/dashboard/chat') ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="line-md:chat" className='mr-4 size-5' />
                  Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/profile"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b text-nowrap hover:bg-gray-100 rounded-r-3xl transition-all ${pathname.startsWith('/dashboard/profile') ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="line-md:person" className='mr-4 size-5' />
                  Profile settings
                </Link>
              </li>
              
            </ul>
          </nav>
      </div>
    </div>
  );
};

export default Navbar;