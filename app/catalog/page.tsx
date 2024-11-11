'use client';

import Image from 'next/image';
import { Rating } from '@mui/material';
import { Inter, Poppins } from 'next/font/google';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import BreadcrumbsComponent from '../_components/Breadcrumbs';

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

const interB = Inter({
  subsets: ['latin'],
  weight: '700',
});

export default function Catalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSearchTerm = searchParams.get('search') || '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [fade, setFade] = useState(false);
  const [searchTerm] = useState(initialSearchTerm);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

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

  useEffect(() => {
    fetch('https://api.bettabeal.my.id/api/products?per_page=1000')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const activeProducts = data.data.data.filter((product: Product) => product.is_active);
          setAllProducts(activeProducts);
        }
      })
      .catch(error => console.error('Error fetching all products:', error));
  }, []);

  useEffect(() => {
    setFade(true);
    fetch(`https://api.bettabeal.my.id/api/products?page=${currentPage}&per_page=12`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const activeProducts = data.data.data.filter((product: Product) => product.is_active);
          setProducts(activeProducts);
          setTotalPages(data.data.last_page);
        }
        setTimeout(() => setFade(false), 500);
        window.scrollTo(0, 0);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setFade(false);
      });
  }, [currentPage]);

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories(prevSelectedCategories =>
      prevSelectedCategories.includes(categoryId)
        ? prevSelectedCategories.filter(id => id !== categoryId)
        : [...prevSelectedCategories, categoryId]
    );
    setCurrentPage(1);
    router.push(`/catalog?page=1&search=${searchTerm}`);
  };

  const getProductCountByCategory = (categoryId: number) => {
    return allProducts.filter(product => product.category_id === categoryId).length;
  };

  const handleCategorySearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategorySearchTerm(event.target.value);
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category_id);
    const matchesSearchTerm = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearchTerm;
  });

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * 12, currentPage * 12);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / 12));
  }, [filteredProducts]);

  const handlePageChange = (page: number) => {
    setFade(true);
    setTimeout(() => {
      setCurrentPage(page);
      router.push(`/catalog?page=${page}&search=${searchTerm}`);
    }, 500);
  };

  const filteredCategories = categories.filter(category =>
    category.category_name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 mx-1 ${currentPage === i ? 'bg-[#0F4A99] text-white' : 'text-[#0F4A99] bg-gray-100'} rounded-lg`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <>
      <div className='mt-8 mb-12 ml-24'>
        <BreadcrumbsComponent />
      </div>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex mx-40 mb-20">
          <div className="w-1/3 px-4">
            <h2 className={`text-xl mb-4 text-[#0F4A99] ${interB.className}`}>Categories</h2>
            <hr />
            <div className="relative my-4">
              <Icon icon="mynaui:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 icon" width={20} height={20} />
              <input
                type="text"
                value={categorySearchTerm}
                onChange={handleCategorySearchChange}
                className={`block w-full pl-10 xl:pr-12 py-3 bg-gray-100 text-[#0F4A99] accent-[#0F4A99] outline-none rounded-md placeholder-gray-400 sm:text-sm`}
                placeholder="Search Categories"
              />
            </div>
            <div className="mt-4 flex flex-col space-y-2">
              {filteredCategories.map(category => (
                <label key={category.category_id} className="flex items-center text-[#0F4A99]">
                  <input
                    type="checkbox"
                    className="mr-2 accent-[#0F4A99]"
                    onChange={() => handleCategoryChange(category.category_id)}
                    checked={selectedCategories.includes(category.category_id)}
                  />
                  {category.category_name} <span className='ml-2 text-sm text-gray-400'>({getProductCountByCategory(category.category_id)})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="w-full px-4">
            <h2 className="text-md font-bold mb-4 text-gray-500">
              Available Products: <span className='text-[#0F4A99] text-lg'>{filteredProducts.length}</span>
            </h2>
            <div className={`transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
              <div className="grid grid-cols-3 gap-8">
                {paginatedProducts.map(product => (
                  <div key={product.product_id} className="bg-gray-200 w-64 h-[28rem] rounded-2xl">
                    <Image
                      src={product.main_image ? product.main_image.image_url : '/placeholder.png'}
                      alt={product.product_name}
                      width={200}
                      height={200}
                      className="mx-auto mt-6 w-48 h-60 object-cover shadow-md"
                    />
                    <h1 className={`${poppinsB.className} ml-4 my-2 text-base`}>{product.product_name}</h1>
                    <Rating name="read-only" value={5} precision={0.5} size="small" className="ml-3" readOnly />
                    <h2 className={`${poppinsB.className} ml-4 mt-2 text-xs`}>Price range</h2>
                    <p className={`ml-4 mt-2 text-xs text-[#0F4A99]`}>
                      Rp {product.price} / ekor
                    </p>
                    <button
                      className={`mt-3 text-nowrap text-white bg-[#0F4A99] flex rounded-lg px-[4.5rem] py-2 text-xs mx-auto transition-all hover:bg-[#0a356e]`}
                    >
                      Beli Sekarang
                    </button>
                  </div>
                ))}
              </div>
              {filteredProducts.length > 12 && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-1 text-[#0F4A99] rounded disabled:opacity-25"
                  >
                    &#10094;
                  </button>
                  {renderPaginationButtons()}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-1 text-[#0F4A99] rounded disabled:opacity-25"
                  >
                    &#10095;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}