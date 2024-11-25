'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';
import Link from 'next/link';
import Header from '../../Header';
import Navbar from '../../Navbar';

interface Category {
  category_id: number;
  category_name: string;
  description: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<File | null>(null);
  const [order, setOrder] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const router = useRouter();
  const { categoryId } = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
          method: 'GET',
          headers: {
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
        if (data.status === 'success') {
          setCategories(data.data);
          const category = data.data.find((cat: Category) => cat.category_id === parseInt(categoryId as string));
          if (category) {
            setCategory(category);
            setCategoryName(category.category_name);
            setDescription(category.description);
            setOrder(category.order);
            setIsActive(category.is_active);
          } else {
            setError('Category not found');
          }
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchCategories();
  }, [categoryId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the category name already exists
    const existingCategory = categories.find(cat => cat.category_name.toLowerCase() === categoryName.toLowerCase() && cat.category_id !== category?.category_id);
    if (existingCategory) {
      setError('Category name already exists');
      setShowErrorModal(true);
      return;
    }

    const formData = new URLSearchParams();
    formData.append('category_name', categoryName);
    formData.append('description', description);
    if (icon) {
      formData.append('icon', icon.name); // Assuming the API expects the file name
    }
    if (order !== null) {
      formData.append('order', order.toString());
    }
    formData.append('is_active', isActive.toString());

    try {
      console.log('Sending update request with data:', {
        category_name: categoryName,
        description,
        icon: icon ? icon.name : null,
        order,
        is_active: isActive,
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${getCookie('USR')}`,
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      console.log('Response:', responseText);

      if (!response.ok) {
        console.error(`Error updating category: ${responseText}`);
        setError(`Error: ${response.status} - ${responseText}`);
        setShowErrorModal(true);
        return;
      }

      router.push('/dashboard/categories');
    } catch (error) {
      console.error('Update error:', error);
      setError(`Update error: ${(error as Error).message}`);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="min-h-screen w-full px-5 py-4 mt-[4.63rem]" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        {/* Header */}
        <div className="px-4 py-2 text-white items-center">
          <Link href="/dashboard/categories" className="flex items-center gap-2 text-sm leading-none mb-1">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold">Edit Category</h1>
        </div>

        {/* Main Content */}
        <div className="px-4 py-2 flex gap-6">
          {/* Left Panel - Category Information */}
          <div className="bg-white rounded-lg p-6 flex-grow">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                  {error && <p className="text-red-500 mt-1">{error}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">Active category?</label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className='ml-1 size-4'
              />
            </div>
            <button 
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleUpdate}
          >
            Save
          </button>
          </div>
        </div>

      </div>

    </div>
  );
}