'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Address {
  address_id: number;
  name: string;
  address: string;
  district_id: number;
  postcode_id: number | null;
  phone_number: string;
  is_main: number;
}

function AddressContent() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const addressesPerPage = 3;
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchAddresses = async () => {
      const token = getCookie('USR');
      if (!token) {
        setError('User is not authenticated');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          setError(`Unexpected content type: ${contentType} - ${text}`);
          return;
        }

        const data = await response.json();
        if (data.code === '000') {
          setAddresses(data.data);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Successfully added address!');
    }
  }, [searchParams]);

  const handleEdit = (addressId: number) => {
    router.push(`/user/address/${addressId}`);
  };

  const handleDelete = async () => {
    const token = getCookie('USR');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${addressToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      // Remove the deleted address from the state
      setAddresses(addresses.filter((address) => address.address_id !== addressToDelete));
      setShowDeleteDialog(false);
      setAddressToDelete(null);
    } catch (error) {
      setError(`Delete error: ${(error as Error).message}`);
    }
  };

  const handleAddAddress = () => {
    router.push('/user/address/add');
  };

  const confirmDelete = (addressId: number) => {
    setAddressToDelete(addressId);
    setShowDeleteDialog(true);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setAddressToDelete(null);
  };

  // Pagination logic
  const indexOfLastAddress = currentPage * addressesPerPage;
  const indexOfFirstAddress = indexOfLastAddress - addressesPerPage;
  const currentAddresses = addresses.slice(indexOfFirstAddress, indexOfLastAddress);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position='bottom-right' closeOnClick />
      <h1 className="text-2xl font-bold mb-4">Saved Addresses</h1>
      <button
        onClick={handleAddAddress}
        className="bg-[#38B6FF] w-full text-white px-4 py-2 rounded-md hover:opacity-85 mb-4 shadow-md"
      >
        Add new address
      </button>
      <hr />
      <br />
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-4">
        {currentAddresses.map((address) => (
          <li key={address.address_id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="font-semibold">Name: {address.name}</p>
              <p>Address: {address.address}</p>
              <p>Phone Number: {address.phone_number}</p>
              {address.is_main === 1 && <p className="text-gray-500 italic">This is your default delivery address</p>}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(address.address_id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => confirmDelete(address.address_id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {addresses.length > addressesPerPage && (
        <div className="mt-4">
          {Array.from({ length: Math.ceil(addresses.length / addressesPerPage) }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 mx-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
      {showDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl mb-4">Are you sure you want to delete this address?</h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewAddresses() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddressContent />
    </Suspense>
  );
}