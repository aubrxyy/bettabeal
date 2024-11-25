'use client';

import Image from 'next/image';
import { Inter, Poppins } from 'next/font/google';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import BreadcrumbsComponent from '../_components/Breadcrumbs';
import Link from 'next/link';

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
  average_rating: number;
  main_image: {
    image_url: string;
  } | null;
  category: {
    category_id: number;
    category_name: string;
    is_active: boolean;
  };
  out_of_stock: boolean;
}

const poppinsB = Poppins({
  subsets: ['latin'],
  weight: '700',
});

const interB = Inter({
  subsets: ['latin'],
  weight: '700',
});

const interSB = Inter({
  subsets: ['latin'],
  weight: '600',
});

function CatalogContent() {
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
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const formatPrice = (price: string) => {
    const number = parseInt(price, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${number}`;
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?per_page=1000`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const activeProducts = data.data.data.filter((product: Product) => product.is_active && product.category.is_active);
          setAllProducts(activeProducts);
        }
      })
      .catch(error => console.error('Error fetching all products:', error));
  }, []);

  useEffect(() => {
    setFade(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?page=${currentPage}&per_page=12`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const activeProducts = data.data.data.filter((product: Product) => product.is_active && product.category.is_active);
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

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

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

  const isNewProduct = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <>
      <div className='mt-8 mb-12 ml-4 sm:ml-8 md:ml-12 lg:ml-24'>
        <BreadcrumbsComponent />
      </div>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex flex-col lg:flex-row mx-auto mb-20">
          <div className="w-full lg:w-1/3 px-4">
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
              {filteredProducts.length === 0 ? (
                <div className="flex justify-center mx-16 md:mx-48 lg:mx-64 xl:mx-72 items-center h-full text-nowrap">
                  <p className="text-lg text-gray-500">No products for this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {paginatedProducts.map(product => (
                    product.out_of_stock ? (
                      <div key={product.product_id} className="bg-gray-200 lg:w-60 xl:w-64 min-h-96 h-fit pb-6 rounded-2xl opacity-60">
                        <Image
                          src={product.main_image ? product.main_image.image_url : '/placeholder.png'}
                          alt={product.product_name}
                          width={200}
                          height={200}
                          className="mx-auto mb-2 mt-6 w-48 h-60 object-cover shadow-md"
                        />
                        <div className='flex flex-row mx-4 items-end'>
                          <h1 className={`${poppinsB.className} mt-2 text-md break-words truncate`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {product.product_name}
                          </h1>
                          {isNewProduct(product.created_at) ? (
                            <span className={`${poppinsB.className} ml-2 bg-gradient-to-b from-[#CF1669] to-[#FF3A44] text-white text-xs px-2 rounded-lg h-6 flex items-center`}>NEW</span>
                          ) : (
                            <span className="ml-2 text-xs px-2 rounded-lg h-6 flex items-center invisible">NEW</span>
                          )}
                        </div>
                        <h2 className={`${interSB.className} mx-4 text-sm text-gray-500 break-words truncate`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.category.category_name}
                        </h2>
                        <div className="flex items-center ml-4 my-1">
                          {product.average_rating > 0 && (
                            <>
                              <Icon icon="ic:baseline-star" className='text-yellow-500'/>
                              <span className={`${interSB.className} ml-1 mr-1 text-sm text-gray-600`}>{product.average_rating.toFixed(1)} |</span>
                            </>
                          )}
                          <p className={`${interSB.className} text-md text-[#0F4A99]`}>
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        {product.out_of_stock && (
                          <p className="text-red-500 italic text-sm ml-4">Out of Stock</p>
                        )}
                        <button
                          className={`${interSB.className} mt-3 text-nowrap text-white bg-[#0F4A99] flex rounded-lg w-[90%] sm:w-52 md:w-40 lg:w-44 xl:w-52 justify-center py-2 text-sm mx-auto transition-all hover:bg-[#0a356e]`}
                          disabled
                        >
                          Buy now
                        </button>
                      </div>
                    ) : (
                      <Link key={product.product_id} href={`/catalog/${product.product_id}`} className="bg-gray-200 lg:w-60 xl:w-64 min-h-96 h-fit pb-6 rounded-2xl cursor-pointer">
                        <Image
                          src={product.main_image ? product.main_image.image_url : '/placeholder.png'}
                          alt={product.product_name}
                          width={200}
                          height={200}
                          className="mx-auto mb-2 mt-6 w-48 h-60 object-cover shadow-md"
                        />
                        <div className='flex flex-row mx-4 items-end'>
                          <h1 className={`${poppinsB.className} mt-2 text-md break-words truncate`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {product.product_name}
                          </h1>
                          {isNewProduct(product.created_at) ? (
                            <span className={`${poppinsB.className} ml-2 bg-gradient-to-b from-[#CF1669] to-[#FF3A44] text-white text-xs px-2 rounded-lg h-6 flex items-center`}>NEW</span>
                          ) : (
                            <span className="ml-2 text-xs px-2 rounded-lg h-6 flex items-center invisible">NEW</span>
                          )}
                        </div>
                        <h2 className={`${interSB.className} mx-4 text-sm text-gray-500 break-words truncate`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.category.category_name}
                        </h2>
                        <div className="flex items-center ml-4 my-1">
                          {product.average_rating > 0 && (
                            <>
                              <Icon icon="ic:baseline-star" className='text-yellow-500'/>
                              <span className={`${interSB.className} ml-1 mr-1 text-sm text-gray-600`}>{product.average_rating.toFixed(1)} |</span>
                            </>
                          )}
                          <p className={`${interSB.className} text-md text-[#0F4A99]`}>
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <button
                          className={`${interSB.className} mt-3 text-nowrap text-white bg-[#0F4A99] flex rounded-lg w-[90%] sm:w-52 md:w-40 lg:w-44 xl:w-52 justify-center py-2 text-sm mx-auto transition-all hover:bg-[#0a356e]`}
                        >
                          Buy now
                        </button>
                      </Link>
                    )
                  ))}
                </div>
              )}
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

export default function Catalog() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CatalogContent />
    </Suspense>
  );
}