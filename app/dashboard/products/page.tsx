'use client'

import Header from "../Header";
import Navbar from "../Navbar";
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Image from "next/image";
import Link from "next/link";

interface Product {
  product_id: number;
  product_name: string;
  description: string;
  price: string;
  stock_quantity: number;
  main_image: {
    image_url: string;
  } | null;
  category: {
    category_name: string;
  };
}

interface Category {
  category_id: number;
  category_name: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [category, setCategory] = useState('all');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = Cookies.get('USR');
      if (!token) {
        setError('User is not authenticated');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching products: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        const data = await response.json();
        if (data.code === '000' && data.status === 'success') {
          setProducts(data.data.data);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    const fetchCategories = async () => {
      const token = Cookies.get('USR');
      if (!token) {
        setError('User is not authenticated');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching categories: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        const data = await response.json();
        if (data.code === '000' && data.status === 'success') {
          setCategories(data.data);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDeleteSelected = async () => {
    const token = Cookies.get('USR');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    try {
      for (const productId of selectedProducts) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error deleting product ${productId}: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }
      }

      setProducts(prev => prev.filter(product => !selectedProducts.includes(product.product_id)));
      setSelectedProducts([]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  const filteredProducts = products.filter(product => 
    (category === 'all' || product.category.category_name === category) &&
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4.63rem]">
          <div className="flex justify-between items-start my-2 mr-2">
            <h1 className="text-2xl text-white font-bold">Products</h1>
            <Link href="/dashboard/products/add" className="text-white px-4 py-2 bg-blue-800 rounded-md">+ Add Product</Link>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white rounded-t-md">
            <select 
              className="border bg-white text-[#0F4A99] rounded-md px-4 py-2 w-32"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">Filter</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_name}>{cat.category_name}</option>
              ))}
            </select>

            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button 
              className="text-[#0F4A99] p-2 border-2 rounded-md"
              onClick={() => {/* Implement edit functionality */}}
            >
              <FiEdit2 />
            </button>

            <button 
              className="text-red-500 p-2 border-2 rounded-md"
              onClick={() => setShowConfirmation(true)}
            >
              <FiTrash2 />
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow rounded-b-md pb-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-12 py-3">Inventory</th>
                  <th className="text-left px-12 py-3">Price</th>
                  <th className="text-left px-12 py-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.product_id} className="border-t">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.product_id)}
                        onChange={() => handleProductSelect(product.product_id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/products/${product.product_id}`} className="flex items-center gap-3">
                        {product.main_image && (
                          <Image width={100} height={100}
                            src={product.main_image.image_url}
                            alt={product.product_name}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.product_name}</div>
                          <div className="text-sm text-gray-500">{product.category.category_name}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-12 py-3 text-nowrap text-sm">{product.stock_quantity} in stock</td>
                    <td className="px-12 py-3 text-nowrap text-sm">Rp. {parseInt(product.price).toLocaleString('id-ID')}</td>
                    <td className="px-12 py-3 text-sm">4.5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete {selectedProducts.length} selected product(s)?</p>
            <div className="flex justify-end gap-4">
              <button 
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={() => {
                  handleDeleteSelected();
                  setShowConfirmation(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          Products deleted successfully!
        </div>
      )}
    </div>
  );
}