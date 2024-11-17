'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';

interface Biodata {
  full_name: string;
  email: string;
  phone_number: string;
  profile_image: string | File;
  birth_date: string;
  gender: string;
}

export default function EditProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState<Biodata>({
    full_name: '',
    email: '',
    phone_number: '',
    profile_image: '',
    birth_date: '',
    gender: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBiodata = async () => {
      const token = Cookies.get('USR');
      const UID = Cookies.get('UID');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${UID}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching biodata: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        const data = await response.json();
        if (data.code === '000' && data.customer) {
          setFormData(data.customer);
          setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${data.customer.profile_image}`);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchBiodata();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profile_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('full_name', formData.full_name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone_number', formData.phone_number);
    formDataToSend.append('birth_date', formData.birth_date);
    formDataToSend.append('gender', formData.gender);
    if (formData.profile_image instanceof File) {
      formDataToSend.append('profile_image', formData.profile_image);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/biodata`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.code === '000') {
        router.push('/user');
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (

      <div className="bg-white w-full p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-2/3 px-3 py-2 text-sm border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-2/3 px-3 py-2 text-sm border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-2/3 px-3 py-2 text-sm border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-medium text-gray-700">Birth Date</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                className="w-2/3 px-3 py-2 text-sm border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-medium text-gray-700">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-2/3 px-3 py-2 text-sm border border-gray-300 rounded-md"
              />
            </div>
            {imagePreview && (
              <div className="flex justify-center mt-4">
                <Image width={100} height={100}
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            )}
          </div>
          <div className='flex flex-row justify-end items-center space-x-3'>
            <Link href="/user" className="mt-4 px-4 py-2 text-sm border border-[#0F4A99] text-[#0F4A99] rounded-md hover:bg-gray-200 transition-all">
              Cancel
            </Link>
            <button
              type="submit"
              className="mt-4 px-4 py-2 text-sm bg-[#0F4A99] text-white rounded-md hover:opacity-80"
            >
              Save Changes
            </button>
          </div>
        </form>
        
      </div>

  );
}