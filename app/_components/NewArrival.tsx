'use client';

import Image from 'next/image';
import { Poppins, Inter } from 'next/font/google';
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface Product {
  product_id: number;
  seller_id: number;
  category_id: number;
  product_name: string;
  description: string;
  average_rating: number | null;
  price: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  main_image: {
    image_url: string;
  } | null;
  rating: number;
  category: {
    category_name: string;
  };
  total_sales: number;
}

const poppinsB = Poppins({
  subsets: ['latin'],
  weight: '700',
});

const interSB = Inter({
  subsets: ['latin'],
  weight: '600',
});

export function NewArrival() {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setFade] = useState(false);

  useEffect(() => {
    setFade(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?per_page=12`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const activeProducts = data.data.data.filter((product: Product) => product.is_active);
            const sortedProducts: Product[] = activeProducts.sort((a: Product, b: Product) => b.total_sales - a.total_sales);
          setProducts(sortedProducts.slice(0, 5));
        }
        setTimeout(() => setFade(false), 500);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setFade(false);
      });
  }, []);

  const formatPrice = (price: string) => {
    const number = parseInt(price, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${number}`;
  };

  const isNewProduct = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className='max-sm:px-4 sm:px-8 md:px-12 lg:px-36 flex justify-center flex-col bg-white'>
        <div className='mt-16'>
          <h4 className={`${poppinsB.className} text-4xl text-[#0F4A99] flex flex-row text-nowrap`}>
            <div className='h-[0.125rem] w-8 bg-gray-300 mr-4 my-auto'></div> Best Sellers <div className='h-[0.125rem] w-full bg-gray-300 ml-4 my-auto'></div>
          </h4>
            <div className='flex flex-wrap mt-12 justify-center gap-8'>
            {products.map(product => (
              <Link key={product.product_id} href={`/catalog/${product.product_id}`} className='relative bg-gray-200 w-full max-sm:w-[90%] md:w-[36%] lg:w-[28%] xl:w-[17%] min-h-[23rem] max-h-fit rounded-xl'>
                
                <Image src={product.main_image ? product.main_image.image_url : '/placeholder.png'} alt={product.product_name} width={135} height={200} className='mx-auto mb-2 mt-6 w-40 h-48'/>
                {isNewProduct(product.created_at) && (
                  <span className={`${poppinsB.className} ml-4 bg-gradient-to-b from-[#CF1669] to-[#FF3A44] text-white text-xs px-2 rounded-lg`}>NEW</span>
                )}
                <h1 className={`${poppinsB.className} mx-4 mt-1 text-md break-words truncate`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.product_name}
                </h1>
                <h2 className={`${interSB.className} mx-4 text-sm text-gray-500 break-words truncate`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.category.category_name}
                </h2>
                {product.average_rating !== null && (
                  <div className="flex items-center ml-4 my-1">
                    <Icon icon="ic:baseline-star" className='text-yellow-500'/>
                    <span className={`${interSB.className} ml-1 text-sm text-gray-600`}>{product.average_rating}</span>
                  </div>
                )}
                <p className={`${interSB.className} ml-4 text-md text-[#0F4A99]`}>
                    {formatPrice(product.price)}
                </p>
                <button className={`${interSB.className} text-nowrap text-white bg-[#0F4A99] my-3 flex rounded-lg px-12 py-[6px] text-sm mx-auto transition-all hover:bg-[#0a356e]`}>
                    Buy now
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
  );
}