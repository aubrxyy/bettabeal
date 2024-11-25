'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';
import Header from '../../Header';
import Navbar from '../../Navbar';
import 'react-toastify/dist/ReactToastify.css';
import { useDropzone, FileRejection } from 'react-dropzone';
import Image from 'next/image';

export default function AddArticlePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      router.push('/dashboard/articles');
    } catch (error) {
      setError(`Add error: ${(error as Error).message}`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      setError('File size exceeds the 2 MB limit or invalid file type.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file)); // Create a preview URL for the new image
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    maxSize: 2048 * 1024 // 2048 KB
  });

  const closeModal = () => {
    setError(null);
  };

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4.63rem]"></div>
        <h1 className="text-2xl text-white mx-4 font-bold mb-4">Add Article</h1>
        {error && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Error</h2>
              <p className="mb-4">{error}</p>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleAdd} className="text-sm bg-white rounded-lg p-5 mx-4">
          <div className="mb-2">
            <label className="block text-gray-700 font-semibold mb-1">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 font-semibold mb-1">Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              rows={6}
            />
          </div>
          <label className="block text-gray-700 font-semibold mb-1">Image:</label>
          <div
            {...getRootProps()}
            className={`mb-2 p-4 border-2 border-dashed rounded-lg ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-center text-blue-500">Drop the files here ...</p>
            ) : (
              <p className="text-center text-gray-500">Drag and drop an image here, or click to select an image</p>
            )}
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <Image width={1000} height={1000} src={imagePreview} alt="Preview" className="w-[28rem] h-[21rem] object-cover rounded-md" />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Add Article
          </button>
        </form>
      </div>
    </div>
  );
}