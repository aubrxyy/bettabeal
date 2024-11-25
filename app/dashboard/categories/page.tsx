'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../Header';
import Navbar from '../Navbar';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getCookie } from '@/app/_utils/cookies';

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (categoryId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getCookie('USR')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error deleting category: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      setCategories(categories.filter(category => category.category_id !== categoryId));
    } catch (error) {
      console.error('Delete error:', error);
      setError(`Delete error: ${(error as Error).message}`);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4.63rem]">
          <h1 className="text-2xl font-bold mb-4 text-white">Categories</h1>
          <div className='bg-white rounded-lg p-4'>
            <Link href="/dashboard/categories/add">
              <button className="mb-4 w-full py-2 bg-blue-500 text-white rounded-lg">Add Category</button>
            </Link>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Category Name</th>
                  <th className="py-2 px-4 border-b">Description</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.category_id}>
                    <td className="py-2 px-4 border-b">{category.category_name}</td>
                    <td className="py-2 px-4 border-b">{category.description}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {category.is_active ? (
                        <span className="px-2 py-1 text-xs font-semibold leading-tight text-green-700 bg-green-100 rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold leading-tight text-red-700 bg-red-100 rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b flex flex-row space-x-4 justify-center">
                      <Link href={`/dashboard/categories/${category.category_id}`}>
                        <FiEdit2 className='text-blue-700 border rounded-md size-8 p-2'/>
                      </Link>
                      <button
                        onClick={() => handleDelete(category.category_id)}
                      >
                        <FiTrash2 className='text-red-700 border rounded-md size-8 p-2' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}