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

export default function ShippingPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const router = useRouter();

  const SearchParamsComponent = () => {
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

          const data = await response.json();
          if (data.code === '000') {
            setAddresses(data.data);
            if (selectedAddress === null) {
              const mainAddress = data.data.find((address: Address) => address.is_main);
              if (mainAddress) {
                setSelectedAddress(mainAddress.address_id);
              }
            }
          } else {
            setError(`Error: ${data.message}`);
          }
        } catch (error) {
          setError(`Fetch error: ${(error as Error).message}`);
        }
      };

      fetchAddresses();
    }, [selectedAddress]);

    useEffect(() => {
      if (searchParams.get('success') === 'deleteSaved') {
        toast.success('Address deleted successfully!');
      } else if (searchParams.get('success') === 'editSaved') {
        toast.success('Changes saved successfully!');
      }
    }, [searchParams]);

    return null;
  };

  const handleEdit = (addressId: number) => {
    router.push(`/user/address/${addressId}?redirect=cart/shipping`);
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
      router.push('/cart/shipping?success=deleteSaved');
    } catch (error) {
      setError(`Delete error: ${(error as Error).message}`);
    }
  };

  const confirmDelete = (addressId: number) => {
    setAddressToDelete(addressId);
    setShowDeleteDialog(true);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setAddressToDelete(null);
  };

  const handleAddressChange = (addressId: number) => {
    setSelectedAddress(addressId);
  };

  const handleProceedToCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address_id: selectedAddress }),
      });

      if (!response.ok) {
        const text = await response.text();
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      const data = await response.json();
      if (data.code === '000') {
        router.push(`/cart/checkout?order_id=${data.data.order_id}`);
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      setError(`Order creation error: ${(error as Error).message}`);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position='bottom-right' closeOnClick />
      <h1 className="text-2xl font-bold mb-4">Select Shipping Address</h1>
      <ul className="space-y-4">
        {addresses.map((address) => (
          <li key={address.address_id} className="bg-white px-4 py-6 rounded-lg shadow-md flex justify-between items-center">
            <label htmlFor={`address-${address.address_id}`} className="flex items-center w-full cursor-pointer">
              <input
                type="radio"
                id={`address-${address.address_id}`}
                name="selectedAddress"
                value={address.address_id}
                checked={selectedAddress === address.address_id}
                onChange={() => handleAddressChange(address.address_id)}
                className="mr-8 custom-radio"
              />
              <div className="flex flex-col w-full text-left">
                {address.is_main === 1 && <span className="mb-1 text-white bg-gradient-to-b from-[#0F4A99] to-[#38B6FF] rounded-lg text-xs text-center font-bold h-6 flex items-center justify-center w-[14ch] uppercase">Main address</span>}
                <span className="font-semibold mb-1">{address.name}</span>
                <span className='text-sm text-gray-600'>{address.address}</span>
                <span className='text-sm text-gray-600'>{address.phone_number}</span>
              </div>
            </label>
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
      <div className="flex justify-between mt-8">
        <button
          onClick={() => router.back()}
          className="border-[1px] px-8 py-3 rounded-md bg-gray-500 text-white"
        >
          Back
        </button>
        <button
          onClick={handleProceedToCheckout}
          className="border-[1px] px-8 py-3 rounded-md bg-[#0F4A99] text-white"
        >
          Proceed to Checkout
        </button>
      </div>
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
      <style jsx>{`
        .custom-radio {
          transform: scale(1.5);
        }
      `}</style>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsComponent />
      </Suspense>
    </div>
  );
}