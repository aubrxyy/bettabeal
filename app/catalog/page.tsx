'use client'

import Image from 'next/image';
import { Rating } from '@mui/material';
import { Poppins } from 'next/font/google';
import React, { useEffect, useState } from 'react';

interface Category {
  category_id: number;
  category_name: string;
  description: string;
  icon: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


const poppinsB = Poppins({
    subsets: ['latin'],
    weight: '700',
    })

const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
})

const poppinsR = Poppins({
    subsets: ['latin'],
    weight: '400',
    })

export default function Catalog() {
    const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('https://api.bettabeal.my.id/api/categories')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const activeCategories = data.data.filter((category: Category) => category.is_active);
          setCategories(activeCategories);
        }
      })
      .catch(error => console.error('Error fetching categories:', error));
  }, []);
    
    return (
        <>
            <div className="flex mt-12 mx-40 h-screen">
                <div className="w-1/4 p-4">
                    <h2 className="text-xl font-bold mb-4">Jenis</h2>
                    <div className="flex flex-col space-y-2">
                     {categories.map(category => (
                        <label key={category.category_id} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        {category.category_name}
                        </label>
                    ))}
                    </div>
                </div>

                <div className="w-full p-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className='bg-gray-200 w-64 h-96 rounded-lg'>
                            <Image src="/produkfish1.png" alt='Produk 1' width={135} height={200} className='mx-auto mt-6'/>
                            <h1 className={`${poppins.className} ml-4 text-base`}>
                                Halfmoon
                            </h1>
                            <Rating name="read-only" value={5} precision={0.5} size='small' className='ml-3' readOnly />
                            <h2 className={`${poppins.className} ml-4 text-xs`}>
                                Price range
                            </h2>
                            <p className={`${poppinsR.className} ml-4 text-xs mt-1 text-[#0F4A99]`}>
                                Rp 2.000 - 3.000 / ekor
                            </p>
                            <button className={`${poppinsB.className} text-nowrap text-white bg-[#0F4A99] mt-2 flex rounded-lg px-16 py-2 text-xs mx-auto transition-all hover:bg-[#0a356e]`}>
                                Beli Sekarang
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </>
    );
}