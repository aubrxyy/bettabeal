'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

interface Biodata {
  full_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  birth_date: string;
  gender: string;
}

export default function Profile() {
  const router = useRouter();
  const [biodata, setBiodata] = useState<Biodata | null>(null);
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
          setBiodata(data.customer);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchBiodata();

    const profileUpdated = localStorage.getItem('profileUpdated');
    if (profileUpdated === 'true') {
      toast.success('Profile updated successfully!');
      localStorage.removeItem('profileUpdated');
    }
  }, [router]);

  if (error) return <div>{error}</div>;
  if (!biodata) return <div>Loading...</div>;

  return (
    <div className="min-h-screen">
      <ToastContainer />
      <div className="max-w-3xl mx-auto pt-8 px-4">
        <div className="bg-white rounded-lg overflow-hidden">
          
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold">Profile Information</h1>
          </div>

          
          <div className="p-6">
            
            <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
              <div className="w-1/4 text-gray-600">Profile Picture</div>
              <div className="w-3/4">
                <Image width={100} height={100}
                  src={`${process.env.NEXT_PUBLIC_API_URL}${biodata.profile_image}`}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            </div>

            
            <div className="flex items-center mb-4">
              <div className="w-1/4 text-gray-600">Full Name</div>
              <div className="w-3/4 font-medium">{biodata.full_name || '-'}</div>
            </div>

            
            <div className="flex items-center mb-4">
              <div className="w-1/4 text-gray-600">Email</div>
              <div className="w-3/4">{biodata.email || '-'}</div>
            </div>

            
            <div className="flex items-center mb-4">
              <div className="w-1/4 text-gray-600">Phone Number</div>
              <div className="w-3/4">{biodata.phone_number || '-'}</div>
            </div>

            
            <div className="flex items-center mb-4">
              <div className="w-1/4 text-gray-600">Birth Date</div>
              <div className="w-3/4">{biodata.birth_date || '-'}</div>
            </div>

          
          <div className="px-6 py-4 border-t border-gray-200">
              <Link href="/user/edit">
                <button className="px-4 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  Edit Profile
                </button>
              </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}