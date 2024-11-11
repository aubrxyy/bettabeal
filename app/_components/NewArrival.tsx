'use client';

import Image from 'next/image';
import { Rating } from '@mui/material';
import { Poppins } from 'next/font/google';
import React, { useEffect, useState } from 'react';

interface Product {
  product_id: number;
  seller_id: number;
  category_id: number;
  product_name: string;
  description: string;
  price: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  main_image: {
    image_url: string;
  } | null;
}

const poppinsB = Poppins({
  subsets: ['latin'],
  weight: '700',
});

export function NewArrival() {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setFade] = useState(false);

  useEffect(() => {
    setFade(true);
    fetch('https://api.bettabeal.my.id/api/products?per_page=12')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const activeProducts = data.data.data.filter((product: Product) => product.is_active);
          setProducts(activeProducts.slice(0, 5)); // Limit to 5 products
        }
        setTimeout(() => setFade(false), 500);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setFade(false);
      });
  }, []);

  return (
    <div className='max-sm:mx-4 sm:mx-8 md:mx-12 lg:mx-36 my-6 flex justify-center flex-col'>
        <div className='mt-12'>
          <h4 className='text-xl text-blue-800 underline underline-offset-8'>
            New Arrival
          </h4>
            <div className='flex flex-wrap mt-12 justify-center gap-12'>
            {products.map(product => (
              <div key={product.product_id} className='bg-gray-200 w-full max-sm:w-[90%] md:w-[36%] lg:w-[28%] xl:w-[16%] min-h-96 max-h-fit rounded-lg'>
                <Image src={product.main_image ? product.main_image.image_url : '/placeholder.png'} alt={product.product_name} width={135} height={200} className='mx-auto mt-6 w-40 h-48'/>
                <h1 className={`${poppinsB.className} ml-4 my-2 text-base break-words`}>{product.product_name}</h1>
                <Rating name="read-only" value={5} precision={0.5} size="small" className="ml-3" readOnly />
                <h2 className={`${poppinsB.className} ml-4 mt-2 text-xs`}>Price range</h2>
                  <p className={`ml-4 mt-2 text-xs text-[#0F4A99]`}>
                        Rp {product.price} / ekor
                      </p>
                <button className={`${poppinsB.className} text-nowrap text-white bg-[#0F4A99] my-3 flex rounded-lg px-7 py-[6px] text-sm mx-auto transition-all hover:bg-[#0a356e]`}>
                    Beli Sekarang
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}