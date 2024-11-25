'use client';

import Cookies from 'js-cookie';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '../../Header';
import Navbar from '../../Navbar';

interface Category {
  category_id: number;
  category_name: string;
}

export default function EditProduct() {
  const router = useRouter();
  const { productId } = useParams();
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState({
    productName: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      const token = Cookies.get('USR');
      if (!token) {
        setErrors(prev => ({ ...prev, category: 'User is not authenticated' }));
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching product details: ${text}`);
          setErrors(prev => ({ ...prev, category: `Error: ${response.status} - ${text}` }));
          return;
        }

        const data = await response.json();
        if (data.code === '000' && data.status === 'success') {
          const product = data.data;
          setFormData({
            productName: product.product_name,
            description: product.description,
            price: product.price.toString(),
            stockQuantity: product.stock_quantity.toString(),
            category: product.category_id.toString(),
          });
        } else {
          setErrors(prev => ({ ...prev, category: `Error: ${data.message}` }));
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setErrors(prev => ({ ...prev, category: `Fetch error: ${(error as Error).message}` }));
      }
    };

    const fetchCategories = async () => {
      const token = Cookies.get('USR');
      if (!token) {
        setErrors(prev => ({ ...prev, category: 'User is not authenticated' }));
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
          setErrors(prev => ({ ...prev, category: `Error: ${response.status} - ${text}` }));
          return;
        }

        const data = await response.json();
        if (data.code === '000' && data.status === 'success') {
          setCategories(data.data);
        } else {
          setErrors(prev => ({ ...prev, category: `Error: ${data.message}` }));
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setErrors(prev => ({ ...prev, category: `Fetch error: ${(error as Error).message}` }));
      }
    };

    fetchProductDetails();
    fetchCategories();
  }, [productId]);

  const handleSubmit = async () => {
    const token = Cookies.get('USR');
    if (!token) {
      setErrors(prev => ({ ...prev, category: 'User is not authenticated' }));
      return;
    }

    let hasError = false;
    const newErrors = {
      productName: '',
      description: '',
      price: '',
      stockQuantity: '',
      category: '',
    };

    if (!formData.productName) {
      newErrors.productName = 'Product name is required.';
      hasError = true;
    }

    if (!formData.description) {
      newErrors.description = 'Description is required.';
      hasError = true;
    }

    if (!formData.price) {
      newErrors.price = 'Price is required.';
      hasError = true;
    }

    if (!formData.stockQuantity) {
      newErrors.stockQuantity = 'Stock quantity is required.';
      hasError = true;
    }

    if (!formData.category) {
      newErrors.category = 'Category is required.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const formDataToSend = new URLSearchParams();
    formDataToSend.append('product_name', formData.productName);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('stock_quantity', formData.stockQuantity);
    formDataToSend.append('category_id', formData.category);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend.toString(),
      });

      const data = await response.json();
      if (data.code === '000' && data.status === 'success') {
        console.log('Product updated successfully:', data);
        router.push('/dashboard/products');
      } else {
        setErrors(prev => ({ ...prev, category: `Error: ${data.message}` }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setErrors(prev => ({ ...prev, category: `Fetch error: ${(error as Error).message}` }));
    }
  };

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="min-h-screen w-full px-5 py-4 mt-[4.63rem]" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        {/* Header */}
        <div className="px-4 py-2 text-white  items-center">
          <Link href="/dashboard/products" className="flex items-center gap-2 text-sm leading-none mb-1">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>

        {/* Main Content */}
        <div className="px-4 py-2 flex gap-6">
          {/* Left Panel - Product Information */}
          <div className="bg-white rounded-lg p-6 flex-grow">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter product name"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  />
                  {errors.productName && <p className="text-red-500 mt-1">{errors.productName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                  {errors.description && <p className="text-red-500 mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="text-lg font-semibold mb-4">Product price (IDR)</label>
              <div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                {errors.price && <p className="text-red-500 mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="mt-8">
              <label className="text-lg font-semibold mb-4">Stock Quantity</label>
              <div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                  placeholder="Enter available stock for sale"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                />
                {errors.stockQuantity && <p className="text-red-500 mt-1">{errors.stockQuantity}</p>}
              </div>
            </div>
          </div>

          {/* Right Panel - Categories */}
          <div className="w-72">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label key={category.category_id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.category_id}
                      checked={formData.category === category.category_id.toString()}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="mr-2"
                    />
                    {category.category_name}
                  </label>
                ))}
                {errors.category && <p className="text-red-500 mt-1">{errors.category}</p>}
                <Link href="/dashboard/categories/add" className="text-blue-500 hover:underline mt-4">
                  Create New
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bottom-0 left-0 right-0 p-4 flex justify-end gap-4">
          <button 
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}