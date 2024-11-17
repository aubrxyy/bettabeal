'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../Header';
import Navbar from '../../Navbar';
import Cookies from 'js-cookie';
import Image from 'next/image';

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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState({
    productName: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    mainImage: '',
  });
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
            price: product.price,
            stockQuantity: product.stock_quantity,
            category: product.category_id.toString(),
          });
          if (product.main_image) {
            setImagePreviews([`${product.main_image.image_url}`]);
          }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
      const isValidSize = file.size <= 2048 * 1024; // 2048 KB
      if (!isValidType) {
        setFileError('Only .jpeg, .png, and .jpg files are allowed.');
        return false;
      }
      if (!isValidSize) {
        setFileError('File size must be less than 2048 KB.');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFileError(null);
      setImages(validFiles.slice(0, 1)); // Only keep the first valid file
      setImagePreviews(validFiles.slice(0, 1).map(file => URL.createObjectURL(file)));
    }
  };

  const handleDeleteImage = () => {
    setImages([]);
    setImagePreviews([]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

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
      mainImage: '',
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

    if (fileError) {
      newErrors.mainImage = 'Please fix the file upload errors before submitting.';
      hasError = true;
    }

    if (images.length === 0 && imagePreviews.length === 0) {
      newErrors.mainImage = 'Product image is required.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('product_name', formData.productName);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('stock_quantity', formData.stockQuantity);
    formDataToSend.append('category_id', formData.category);
    if (images.length > 0) {
      formDataToSend.append('main_image', images[0]);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.code === '000' && data.status === 'success') {
        console.log('Product updated successfully:', data);
        router.push('/dashboard/products');
      } else {
        setErrors(prev => ({ ...prev, mainImage: `Error: ${data.errors.main_image.join(', ')}` }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setErrors(prev => ({ ...prev, mainImage: `Fetch error: ${(error as Error).message}` }));
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

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Images</h2>
              <div 
                className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${isDragging ? 'bg-gray-100' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {images.length === 0 && imagePreviews.length === 0 && (
                  <>
                    <input
                      type="file"
                      multiple
                      accept=".jpeg,.png,.jpg"
                      className="hidden"
                      id="file-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-md mb-2">
                          Add File
                        </div>
                        <span className="text-sm text-gray-500">Or drag and drop files</span>
                      </div>
                    </label>
                  </>
                )}
                {fileError && <p className="text-red-500 mt-2">{fileError}</p>}
                {errors.mainImage && <p className="text-red-500 mt-2">{errors.mainImage}</p>}
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative">
                      <Image width={100} height={100} src={src} alt={`Preview ${index}`} className="w-24 h-24 object-cover rounded-md" />
                      <button
                        onClick={() => handleDeleteImage()}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-lg p-3 size-4 flex items-center text-center text-xl justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
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
                <button className="text-blue-500 hover:underline mt-4">
                  Create New
                </button>
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