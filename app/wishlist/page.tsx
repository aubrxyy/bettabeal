'use client';

import Image from 'next/image';
import { Inter, Poppins } from 'next/font/google';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import BreadcrumbsComponent from '../_components/Breadcrumbs';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { showToast } from '@/app/toastManager';

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
  rating: number;
  category: {
    category_name: string;
  };
}

interface WishlistItem {
  wishlist_id: number;
  product: Product;
}

const poppinsB = Poppins({
  subsets: ['latin'],
  weight: '700',
});

const interSB = Inter({
  subsets: ['latin'],
  weight: '600',
});

function WishlistContent() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const formatPrice = (price: string) => {
    const number = parseInt(price, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${number}`;
  };

  useEffect(() => {
    const token = Cookies.get('USR');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            const wishlistItems = data.data || [];
            const fetchProductDetails = wishlistItems.map((item: WishlistItem) =>
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${item.product.product_id}`)
                .then(response => response.json())
                .then(productData => {
                  if (productData.status === 'success') {
                    item.product = productData.data;
                  }
                  return item;
                })
            );
            Promise.all(fetchProductDetails).then(updatedItems => {
              setWishlistItems(updatedItems);
            });
          } else {
            setWishlistItems([]); // Ensure state is set to an empty array on failure
          }
        })
        .catch(error => {
          console.error('Error fetching wishlist:', error);
          setWishlistItems([]); // Ensure state is set to an empty array on error
        });
    } else {
      setWishlistItems([]); // Ensure state is set to an empty array if no token
    }
  }, []);

  const handleRemoveFromWishlist = (wishlistId: number) => {
    const token = Cookies.get('USR');
    if (!token) {
      showToast('Please log in to remove items from the wishlist.', { type: 'error' });
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/${wishlistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setWishlistItems(prevItems => prevItems.filter(item => item.wishlist_id !== wishlistId));
          showToast('Product removed from wishlist.', { type: 'success' });
        } else {
          showToast('Failed to remove product from wishlist', { type: 'error' });
        }
      })
      .catch(error => {
        console.error('Error removing product from wishlist:', error);
        showToast('Failed to remove product from wishlist', { type: 'error' });
      });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedItems = wishlistItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(wishlistItems.length / itemsPerPage);

  return (
    <>
      <div className='mt-8 mb-12 ml-4 sm:ml-8 md:ml-12 lg:ml-24'>
        <BreadcrumbsComponent />
      </div>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex flex-col lg:flex-row mx-auto mb-20">
          <div className="w-full px-4">
            <h2 className="text-md  font-bold mb-4 text-gray-500">
              Wishlist Products: <span className='text-[#0F4A99] text-lg'>{wishlistItems.length}</span>
            </h2>
            <div className={`transition-opacity duration-500 ${wishlistItems.length === 0 ? 'opacity-0' : 'opacity-100'}`}>
              {wishlistItems.length === 0 ? (
                <div className="flex justify-center mx-16 md:mx-48 lg:mx-64 xl:mx-72 items-center h-full text-nowrap">
                  <p className="text-lg text-gray-500">No products in your wishlist.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {paginatedItems.map(item => (
                    <div key={item.wishlist_id} className="bg-gray-200 w-96 sm:w-72 md:w-56 lg:w-60 xl:w-64 min-h-96 h-fit pb-6 rounded-2xl cursor-pointer">
                      <Link href={`/catalog/${item.product.product_id}`}>
                        <Image
                          src={item.product.main_image ? item.product.main_image.image_url : '/placeholder.png'}
                          alt={item.product.product_name}
                          width={200}
                          height={200}
                          className="mx-auto mb-2 mt-6 w-48 h-60 object-cover shadow-md"
                        />
                      </Link>
                      <div className='flex flex-row mx-4 items-end'>
                        <h1 className={`${poppinsB.className} mt-2 text-md break-words truncate`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.product.product_name}
                        </h1>
                      </div>
                      <h2 className={`${interSB.className} mx-4 text-sm text-gray-500 break-words truncate`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product.category.category_name}
                      </h2>
                      <div className="flex items-center ml-4 my-1">
                        <Icon icon="ic:baseline-star" className='text-yellow-500'/>
                        <span className={`${interSB.className} ml-1 text-sm text-gray-600`}>4.5</span>
                        <p className={`${interSB.className} ml-2 text-md text-[#0F4A99]`}>
                          | {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.wishlist_id)}
                        className={`${interSB.className} mt-3 text-nowrap text-white bg-[#0F4A99] flex rounded-lg w-[90%] sm:w-52 md:w-40 lg:w-44 xl:w-52 justify-center py-2 text-sm mx-auto transition-all hover:bg-[#0a356e]`}
                      >
                        Remove from wishlist
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 mx-1 ${currentPage === i + 1 ? 'bg-[#0F4A99] text-white' : 'text-[#0F4A99] bg-gray-100'} rounded-lg`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Wishlist() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WishlistContent />
    </Suspense>
  );
}