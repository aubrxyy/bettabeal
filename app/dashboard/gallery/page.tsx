'use client';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from 'next/link';
import Header from '../Header';
import Navbar from '../Navbar';
import { getCookie } from '@/app/_utils/cookies';
import { useRouter } from 'next/navigation';
import { FiEdit2 } from 'react-icons/fi';
import Image from 'next/image';

interface Product {
  product_id: number;
  product_name: string;
  category: {
    category_id: number;
    category_name: string;
  };
  main_image: {
    image_url: string;
  } | null;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface GalleryItem {
  id: number;
  productName: string;
  category: string;
  images: string[];
}

export default function GalleryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code === '000') {
          setProducts(data.data.data);
        } else {
          console.error(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    const fetchCategories = async () => {
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code === '000') {
          setCategories(data.data);
        } else {
          console.error(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [router]);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
        return;
      }

      const galleryItemsPromises = products.map(async (product) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.product_id}/gallery`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          if (data.code === '000') {
            return {
              id: product.product_id,
              productName: product.product_name,
              category: product.category.category_name,
              images: [data.data.main_image.image_url, ...Object.values(data.data.gallery).map((item: any) => item.image_url)],
            };
          } else {
            console.error(`Error: ${data.message}`);
            return null;
          }
        } catch (error) {
          console.error('Fetch error:', error);
          return null;
        }
      });

      const galleryItems = await Promise.all(galleryItemsPromises);
      setGalleryItems(galleryItems.filter(item => item !== null) as GalleryItem[]);
    };

    if (products.length > 0) {
      fetchGalleryItems();
    }
  }, [products, router]);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilter(event.target.value as string);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredGalleryItems = galleryItems.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredGalleryItems.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredGalleryItems.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="min-h-screen w-full px-5 py-4 mt-[4.63rem]" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        {/* Header */}
        <div className="py-4 text-white items-center">
          <h1 className="text-2xl font-bold">Product gallery</h1>
        </div>

        <div className="p-6 bg-white rounded-md">
          <div className="flex gap-4 mb-4 text-[#0F4A99]">
            <FormControl className="w-[180px]">
              <Select
                labelId="category-filter"
                value={filter}
                onChange={handleFilterChange}
                className='h-10 text-[#0F4A99]'
              >
                <MenuItem value="all" className='text-[#0F4A99]'>All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.category_id} value={category.category_name} className='text-[#0F4A99]'>{category.category_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              className="flex-1"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
            />
          </div>

          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Images</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(item => (
                <tr key={item.id}>
                  <td className="py-2 px-4 border-b">
                    <div>
                      <div className="font-semibold">{item.productName}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b ">
                    <div className="flex gap-4 ">
                      {item.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="size-36 bg-gray-100 rounded-md overflow-hidden">
                          <Image
                            width={1000}
                            height={1000}
                            src={image}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Link href={`/dashboard/gallery/${item.id}`}>
                      <FiEdit2 className="text-blue-600 hover:text-blue-800 cursor-pointer" size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredGalleryItems.length > productsPerPage && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 text-[#0F4A99] rounded disabled:opacity-25"
              >
                &#10094;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 mx-1 ${currentPage === i + 1 ? 'bg-[#0F4A99] text-white' : 'text-[#0F4A99] bg-gray-100'} rounded-lg`}
                >
                  {i + 1}
                </button>
              ))}
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
  );
}