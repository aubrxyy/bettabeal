'use client'
import { Icon } from '@iconify/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const Navbar = () => {
  const pathname = usePathname();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex">
      {isSidebarVisible && (
        <div className="h-screen bg-white pr-4 text-[#38B6FF] pt-24 relative flex flex-col">
          <nav className="flex-1 ">
            <ul className='flex flex-col'>
              <li>
                <a
                  href="/dashboard"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname === '/dashboard' ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                <Icon icon="line-md:home" className='mr-4 size-5' />
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/profile"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname === '/profile' ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="line-md:list" className='mr-4 size-5' />
                  Order
                </a>
              </li>
              <li>
                <a
                  href="/settings"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname === '/settings' ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="tdesign:tag" className='mr-4 size-5' />
                  Product
                </a>
              </li>
              <li>
                <a
                  href="/settings"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname === '/settings' ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="tabler:article" className='mr-4 size-5' />
                  Article
                </a>
              </li>
              <li>
                <a
                  href="/settings"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname === '/settings' ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="bxs:chat" className='mr-4 size-5' />
                  Chat
                </a>
              </li>
              <li>
                <a
                  href="/settings"
                  className={`items-center flex flex-row py-4 px-16 hover:bg-gradient-to-b hover:bg-gray-100 rounded-r-3xl transition-all ${pathname === '/settings' ? 'bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] text-white' : ''}`}
                >
                  <Icon icon="mingcute:settings-6-line" className='mr-4 size-5' />
                  Settings
                </a>
              </li>
              
            </ul>
          </nav>
          <button
            onClick={toggleSidebar}
            className="block py-4 pr-8 hover:bg-gray-700"
          >
            Hide Sidebar
          </button>
        </div>
      )}
      {!isSidebarVisible && (
        <button
          onClick={toggleSidebar}
          className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center fixed bottom-4 left-4"
        >
          →
        </button>
      )}
    </div>
  );
};

export default Navbar;