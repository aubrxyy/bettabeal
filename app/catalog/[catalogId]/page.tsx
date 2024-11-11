'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Rating } from '@mui/material';
import { Inter } from 'next/font/google';
import BreadcrumbsComponent from '@/app/_components/Breadcrumbs';
import { Icon } from '@iconify/react';

const interB = Inter({
  subsets: ['latin'],
  weight: '700',
});

const interSB = Inter({
  subsets: ['latin'],
  weight: '600',
});

interface Product {
  product_id: number;
  product_name: string;
  description: string;
  price: string;
  main_image: {
    image_url: string;
  } | null;
  category: {
    category_name: string;
  };
  seller: {
    store_name: string | null;
    phone_number: string;
    email: string;
  };
}

export default function ProductDetail() {
  const params = useParams();
  const id = params.catalogId;
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formatPrice = (price: string) => {
    const number = parseInt(price, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${number}`;
  };

  useEffect(() => {
    if (id) {
      fetch(`https://api.bettabeal.my.id/api/products/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Product not found');
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            setProduct(data.data);
          } else {
            setError('Product not found');
          }
        })
        .catch(error => {
          console.error('Error fetching product:', error);
          setError('Product not found');
        });
    }
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className='mt-8 mb-12 ml-24'>
        <BreadcrumbsComponent />
      </div>
        <div className="flex flex-row items-center justify-around mx-36 ">
          <Image
            src={product.main_image ? product.main_image.image_url : '/placeholder.png'}
            alt={product.product_name}
            width={300}
            height={400}
            className="object-cover"
          />
          <div className='flex flex-col'>
            <h1 className={`${interB.className} text-4xl mt-4 text-[#0F4A99]`}>{product.product_name}</h1>
            <Rating name="read-only" value={4.5} precision={0.5} size="small" readOnly className='mt-2'/>
          <p className={`${interSB.className} text-3xl mt-4`}>{formatPrice(product.price)}</p>
          <div className="flex flex-row space-x-4 mt-4">
            <button className="border-[1px] px-8 py-3 rounded-md border-[#0F4A99] text-[#0F4A99] mx-auto lg:mx-0 flex flex-row space-x-2 items-center justify-center w-64">
                <Icon icon="material-symbols-light:favorite-outline" width={28} height={28}/>
                <span>Add to wishlist</span>
            </button>
            <button className="border-[1px] px-8 py-3 rounded-md bg-[#0F4A99] mx-auto lg:mx-0 flex-row flex space-x-2 text-white items-center justify-center w-64">
                <Icon icon="ion:cart-outline" width={28} height={28}/>
                <span>Add to cart</span>
              </button>
          </div>
            <p className="mt-4">{product.description}</p>
          </div>
        </div>
    </>
  );
}