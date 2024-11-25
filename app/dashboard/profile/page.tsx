'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';
import Header from '../Header';
import Navbar from '../Navbar';
import Image from 'next/image';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface SellerBiodata {
  seller_id: number;
  store_name: string;
  store_address: string;
  store_description: string;
  store_logo: string | null;
  store_rating: number;
  total_sales: number;
  updated_at: string;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function ProfilePage() {
  const [biodata, setBiodata] = useState<SellerBiodata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    store_address: '',
    store_description: '',
  });
  const router = useRouter();

  useEffect(() => {
    const fetchBiodata = async () => {
      const uid = getCookie('UID');
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers/${uid}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.code === '000') {
          setBiodata(data.seller);
          setFormData({
            store_name: data.seller.store_name,
            store_address: data.seller.store_address,
            store_description: data.seller.store_description,
          });
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEdit = async () => {
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/biodata`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.code === '000') {
        setBiodata(data.data);
        handleClose();
        setError(null); // Clear any previous errors
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Edit error:', error);
      setError(`Edit error: ${(error as Error).message}`);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!biodata) {
    return <div>Loading...</div>;
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4.63rem]">
          <div className="pr-4 py-4 text-white items-center">
            <h1 className="text-2xl font-bold">Seller Profile</h1>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              {biodata.store_logo ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${biodata.store_logo}`}
                  alt={biodata.store_name}
                  width={150}
                  height={150}
                  className="rounded-full object-cover size-36"
                />
              ) : (
                <div className="flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white text-4xl font-bold">
                  {getInitials(biodata.store_name)}
                </div>
              )}
              <h2 className="text-2xl font-bold mt-4">{biodata.store_name}</h2>
              <p className="text-gray-600 mt-2">{biodata.store_address}</p>
              <p className="text-gray-600 mt-2">{biodata.store_description}</p>
              <button
                onClick={handleOpen}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title" className="text-lg font-bold mb-4">Edit Profile</h2>
          <label className="block text-gray-700 font-semibold mb-1">Store Name:</label>
          <input
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            className="mb-4 border-2 py-2 w-full px-2 rounded-md"
          />
          <label className="block text-gray-700 font-semibold mb-1">Store Address:</label>
          <input
            value={formData.store_address}
            onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
            className="mb-4 border-2 py-2 w-full px-2 rounded-md"
          />
          <label className="block text-gray-700 font-semibold mb-1">Store Description:</label>
          <textarea
            value={formData.store_description}
            onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
            className="mb-4 border-2 py-2 w-full px-2 rounded-md"
            rows={4}
          />
          <Button
            onClick={handleEdit}
            variant="contained"
            color="primary"
            fullWidth
          >
            Save Changes
          </Button>
        </Box>
      </Modal>
    </div>
  );
}