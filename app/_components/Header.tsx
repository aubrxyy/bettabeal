"use client"

import { useState, useEffect, useCallback } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Inter } from 'next/font/google';
import { Icon } from '@iconify/react';

const interM = Inter({
  subsets: ['latin'],
  weight: '500',
});

const interR = Inter({
  subsets: ['latin'],
  weight: '400',
});

const navigation = [
  { name: "Home", href: "/" },
  { name: "Catalog", href: "/catalog" },
  { name: "Article", href: "/article" },
  { name: "Discuss", href: "/discuss" },
  { name: "Favorites", href: "/favorites" },
  { name: "Cart", href: "/cart" },
  { name: "Profile", href: "/profile" }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const controlHeader = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(window.scrollY);
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);

      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [controlHeader]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      router.push(`/catalog?search=${searchTerm}`);
    }
  };

  return (
    <Disclosure as="nav" className={`z-[1000] sticky top-0 bg-white transition-transform duration-300 shadow-md ${interM.className} ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
      {({ open }) => (
        <>
          <div className="z-100 mx-auto max-w-[95%] px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center xl:hidden">
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-[#38B6FF] hover:text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0F4A99]">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
              <div className="flex flex-1 items-center justify-center xl:items-stretch xl:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <a href="/">
                    <Image src="/logoBB.jpg" alt="Logo" width={150} height={500} className="ml-12 my-4" />
                  </a>
                </div>
                <div className="hidden lg:ml-auto mr-8 xl:block my-auto">
                  <div className="flex space-x-12">
                    <div className="relative search-bar">
                      <Icon icon="mynaui:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 icon" width={20} height={20} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchKeyPress}
                        className={`block w-full pl-10 xl:pr-12 py-3 border border-blue-600 rounded-3xl shadow-sm placeholder-gray-400 sm:text-sm ${interR.className}`}
                        placeholder="Search"
                      />
                    </div>
                    {navigation.map((item) => {
                      const isActive = pathname.endsWith(item.href);
                      if (item.name === "Favorites") {
                        return (
                          <Link key={item.name} href={item.href} className="relative flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-dgreen rounded-full text-blue-800">
                              <Icon icon="material-symbols-light:favorite-outline" width={28} height={28}/>
                            </div>
                          </Link>
                        );
                      }
                      if (item.name === "Cart") {
                        return (
                          <Link key={item.name} href={item.href} className="relative flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-dgreen rounded-full text-blue-800">
                              <Icon icon="ion:cart-outline" width={28} height={28}/>
                            </div>
                          </Link>
                        );
                      }
                      if (item.name === "Profile") {
                        return (
                          <Link key={item.name} href={item.href} className="relative flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-dgreen rounded-full text-blue-800">
                              <Icon icon="carbon:user" width={28} height={28}/>
                            </div>
                          </Link>
                        );
                      }
                      return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`${isActive ? "opacity-100 " : "opacity-30 hover:opacity-100 text-nowrap"} text-[#0F4A99] text-base block mx-3 transition-all my-auto link-underline`}
                            >
                              {item.name}
                            </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DisclosurePanel className="xl:hidden">
            <div className="mt-2">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={`${
                    pathname.endsWith(item.href)
                      ? "bg-[#0F4A99] text-white"
                      : "text-gray-500 hover:text-white hover:bg-gray-400 max-lg:active:text-black text-nowrap"
                  } text-xl block py-2 px-8 ${interM.className}`}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
            <div className="w-full bg-[#38B6FF] h-1"></div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}