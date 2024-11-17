'use client';

import { useState } from 'react';
import { getCookie } from '@/app/_utils/cookies';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddressDetails() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [postcodeId, setPostcodeId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isMain, setIsMain] = useState(false);
  const router = useRouter();

  interface Area {
    id: string;
    name: string;
  }

  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [areaInput, setAreaInput] = useState('');

  const fetchAreas = async (input: string) => {
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
    }

    if (!input) {
      setAreas([]);
      return;
    }

    const encodedInput = encodeURIComponent(input).replace(/%20/g, '+');
    const response = await fetch(`https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodedInput}&type=single`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BITESHIP_API_TOKEN}`,
      },
    });
    const data = await response.json();
    if (data.success) {
      setAreas(data.areas);
    }
  };

  const handleAreaSelect = (area: Area) => {
    setSelectedArea(area.id);
    setAreaInput(area.name);
    setAreas([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
    }

    const requestBody = {
      name,
      address,
      district_id: districtId,
      poscode_id: postcodeId,
      phone_number: phoneNumber,
      is_main: isMain,
      biteship_id: selectedArea,
    };

    console.log('Request Body:', requestBody);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    if (data.code === '000') {
      router.push('/user/address?success=addSaved');
    } else {
      toast.error('Failed to add address. Please fill the required fields');
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-xl">
      <ToastContainer closeOnClick hideProgressBar autoClose={2000} />
      <h1 className="text-xl font-bold mb-4">Add a new address</h1>
      <form onSubmit={handleSubmit} className='text-sm'>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder='Nama Penerima...'
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder='Alamat lengkap...'
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">District ID:</label>
          <input
            type="text"
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Postcode ID:</label>
          <input
            type="text"
            value={postcodeId}
            onChange={(e) => setPostcodeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Phone Number:</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            pattern="[0-9]*"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Main Address:</label>
          <input
            type="checkbox"
            checked={isMain}
            onChange={(e) => setIsMain(e.target.checked)}
            className="mr-2 leading-tight"
          />
          <span className="text-gray-700">Set as main address</span>
        </div>
        <div className="mb-4 relativ2">
          <label className="block text-gray-700 font-semibold mb-1">Area:</label>
          <input
            type="text"
            value={areaInput}
            onChange={(e) => {
              setAreaInput(e.target.value);
              fetchAreas(e.target.value);
            }}
            placeholder="Search for an area"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required
          />
          {areas.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto">
              {areas.map((area) => (
                <li
                  key={`${area.id}-${area.name}`}
                  onClick={() => handleAreaSelect(area)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  {area.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Create address
        </button>
      </form>
    </div>
  );
}