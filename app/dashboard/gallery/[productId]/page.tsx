'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';
import Header from '../../Header';
import Navbar from '../../Navbar';
import { Icon } from '@iconify/react';
import 'react-toastify/dist/ReactToastify.css';
import TextField from '@mui/material/TextField';
import { useDropzone, FileRejection } from 'react-dropzone';
import Image from 'next/image';
import Link from 'next/link';

interface GalleryItem {
  gallery_id: number;
  image_url: string;
  is_main: boolean;
}

export default function EditGalleryPage() {
  const [productName, setProductName] = useState('');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { productId } = useParams();

  useEffect(() => {
    const fetchGallery = async () => {
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/gallery`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code === '000') {
          setProductName(data.data.product_name);
          setGalleryItems([data.data.main_image, ...Object.values(data.data.gallery)]);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchGallery();
  }, [productId, router]);

  const handleDelete = async (galleryId: number) => {
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    const itemToDelete = galleryItems.find(item => item.gallery_id === galleryId);
    if (itemToDelete?.is_main) {
      setError('Cannot delete the main image. Please set another image as the main image first.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/gallery/${galleryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error deleting image: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      setGalleryItems(galleryItems.filter(item => item.gallery_id !== galleryId));
    } catch (error) {
      console.error('Delete error:', error);
      setError(`Delete error: ${(error as Error).message}`);
    }
  };

  const handleSetMainImage = async (galleryId: number) => {
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/gallery/${galleryId}/main`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error setting main image: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      setGalleryItems(galleryItems.map(item => ({
        ...item,
        is_main: item.gallery_id === galleryId,
      })));
    } catch (error) {
      console.error('Set main image error:', error);
      setError(`Set main image error: ${(error as Error).message}`);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    if (rejectedFiles.length > 0) {
      setError('File size exceeds the 2 MB limit.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/gallery/upload/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.code === '000') {
        setGalleryItems([...galleryItems, data.data]);
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload error: ${(error as Error).message}`);
    }
  }, [galleryItems, productId, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    maxSize: 2048 * 1024 // 2048 KB
  });

  const handleSave = () => {
    router.push('/dashboard/gallery');
  };

  const closeModal = () => {
    setError(null);
  };

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="min-h-screen w-full px-5 py-4 mt-[4.63rem]" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-4 py-2 text-white items-center">
          <Link href="/dashboard/gallery" className="flex items-center gap-2 text-sm leading-none mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold">Edit Gallery</h1>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="mb-4">
            <TextField
              label="Product Name"
              value={productName}
              variant="outlined"
              fullWidth
              disabled
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryItems.map(item => (
              <div key={item.gallery_id} className="relative border rounded-lg p-4">
                <button
                  onClick={() => handleDelete(item.gallery_id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <Icon icon="mdi:close" className="h-5 w-5" />
                </button>
                <Image
                  src={item.image_url} width={1000} height={1000}
                  alt={productName}
                  className="size-60 object-cover rounded-md"
                />
                <button
                  onClick={() => handleSetMainImage(item.gallery_id)}
                  className={`mt-2 w-full py-2 rounded-md ${item.is_main ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {item.is_main ? (
                    <div className='flex items-center justify-center py-1'>
                      <Icon icon="mdi:check" className="mr-2 h-5 w-5 inline" />
                      <p className='leading-tight'>Main Image</p>
                    </div>
                  ) : (
                    <div className='flex items-center justify-center py-1'>
                      <p className='leading-tight'>Set As Main</p>
                    </div>
                  )}
                </button>
              </div>
            ))}
            <div {...getRootProps()} className={`relative border-4 border-dashed rounded-lg p-4 flex items-center justify-center ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-center text-blue-500">Drop the files here ...</p>
              ) : (
                <p className="text-center text-gray-500">Drag and drop images here, or click to select images</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>

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
      </div>
    </div>
  );
}