'use client';
import { getCookie } from '@/app/_utils/cookies';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '../Header';
import Navbar from '../Navbar';

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
    store_logo: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
            store_logo: null,
          });
          if (data.seller.store_logo) {
            setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/storage/${data.seller.store_logo}`);
          }
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

    const formDataToSend = new FormData();
    formDataToSend.append('store_name', formData.store_name);
    formDataToSend.append('store_address', formData.store_address);
    formDataToSend.append('store_description', formData.store_description);
    if (formData.store_logo) {
      formDataToSend.append('store_logo', formData.store_logo);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/biodata`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFormData(prev => ({ ...prev, store_logo: file }));
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    },
    maxSize: 2048 * 1024, // 2 MB
  });

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
              {imagePreview ? (
                <Image
                  src={imagePreview}
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
          <label className="block text-gray-700 font-semibold mb-1">Store Logo:</label>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-md p-4 text-center ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-blue-500">Drop the files here ...</p>
            ) : (
              <p className="text-gray-500">Drag and drop an image here, or click to select an image</p>
            )}
          </div>
          {imagePreview && (
            <div className="flex justify-center my-4">
              <Image
                src={imagePreview}
                alt="Store Logo Preview"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}
          <Button
            onClick={handleEdit}
            variant="contained"
            color="primary"
            fullWidth
            className="mt-4"
          >
            Save Changes
          </Button>
        </Box>
      </Modal>
    </div>
  );
}