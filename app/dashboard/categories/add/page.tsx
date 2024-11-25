'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';
import Link from 'next/link';
import Header from '../../Header';
import Navbar from '../../Navbar';

export default function AddCategoryPage() {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('category_name', categoryName);
    formData.append('description', description);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`
    , {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getCookie('USR')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error adding category: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      router.push('/dashboard/categories');
    } catch (error) {
      console.error('Add error:', error);
      setError(`Add error: ${(error as Error).message}`);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

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
          <h1 className="text-2xl font-bold">Add Category</h1>
        </div>

        <form onSubmit={handleAdd} className='bg-white p-6 rounded-lg mx-4'>
          <h2 className="text-lg font-semibold mb-4">Information</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Category Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded-lg"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            className="w-full border p-2 rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Add Category</button>
      </form>
      </div>
    </div>
  );
}