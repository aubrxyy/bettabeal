'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';

interface Address {
  address_id: number;
  name: string;
  address: string;
  district_id: number;
  poscode_id: number | null;
  phone_number: string;
  is_main: boolean;
  biteship_id?: string;
}

interface District {
  district_id: number;
  district_name: string;
}

interface Poscode {
  poscode_id: number;
  code: string;
}

interface Area {
  id: string;
  name: string;
}

export default function EditAddress() {
  const [address, setAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaInput, setAreaInput] = useState('');
  const router = useRouter();
  const { addressId } = useParams();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || 'user/address';
  const [districtId, setDistrictId] = useState('');
  const [postcodeId, setPostcodeId] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [postcodes, setPostcodes] = useState<Poscode[]>([]);

  useEffect(() => {
    const fetchDistricts = async () => {
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/districts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code === '000' && data.status === 'success') {
          setDistricts(data.data);
        } else {
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchDistricts();
  }, [router]);

  useEffect(() => {
    const fetchPostcodes = async () => {
      if (!districtId) return;

      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/districts/${districtId}/poscodes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code === '000' && data.status === 'success') {
          setPostcodes(data.data);
        } else {
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchPostcodes();
  }, [districtId, router]);

  useEffect(() => {
    const fetchAddress = async () => {
      const token = getCookie('USR');
      if (!token) {
        setError('User is not authenticated');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${addressId}`, {
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
          setAddress({
            ...data.data,
            is_main: data.data.is_main === 1, // Ensure is_main is a boolean
          });
          setAreaInput(data.data.biteship_id ? data.data.biteship_id : '');
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchAddress();
  }, [addressId]);

  const fetchAreas = async (input: string) => {
    const token = getCookie('USR');
    if (!token) {
      // Handle missing token
      return;
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
    setAddress((prevAddress) => prevAddress ? { ...prevAddress, biteship_id: area.id } : null);
    setAreaInput(area.name);
    setAreas([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getCookie('USR');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        setError(`Error: ${response.status} - ${errorData.message}`);
      }

      router.push(`/${redirect}?success=editSaved`);
    } catch (error) {
      setError(`Update error: ${(error as Error).message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddress((prevAddress) => prevAddress ? { ...prevAddress, [name]: type === 'checkbox' ? checked : value } : null);
  };

  if (!address) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Edit Address</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="text-sm">
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Name:</label>
          <input
            type="text"
            name="name"
            value={address.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Address:</label>
          <input
            type="text"
            name="address"
            value={address.address}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">District ID:</label>
           <select
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.district_id} value={district.district_id}>
                {district.district_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Postcode ID:</label>
          <select
            value={postcodeId}
            onChange={(e) => setPostcodeId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Select Postcode</option>
            {postcodes.map((postcode) => (
              <option key={postcode.poscode_id} value={postcode.poscode_id}>
                {postcode.code}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Phone Number:</label>
          <input
            type="text"
            name="phone_number"
            value={address.phone_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Main Address:</label>
          <input
            type="checkbox"
            name="is_main"
            checked={address.is_main}
            onChange={handleChange}
            className="mr-2 leading-tight"
          />
          <span className="text-gray-700">Set as main address</span>
        </div>
        <div className="mb-4 relative">
          <label className="block text-gray-700 font-semibold mb-1">Area:</label>
          <input
            type="text"
            value={areaInput}
            onChange={(e) => {
              setAreaInput(e.target.value);
              fetchAreas(e.target.value);
            }}
            placeholder="Search for an area"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
          Save changes
        </button>
      </form>
    </div>
  );
}