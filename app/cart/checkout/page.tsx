'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  subtotal: string;
  product: {
    product_id: number;
    product_name: string;
    description: string;
    price: number;
  };
}

interface Order {
  order_id: number;
  user_id: number;
  address_id: number;
  total_amount: string;
  status: string;
  snap_token: string;
  items: OrderItem[];
  address: {
    address_id: number;
    biteship_id: string;
  };
}

interface CourierOption {
  id: string;
  courier_name: string;
  courier_service_name: string;
  duration: string;
  price: number;
  courier_service_code: string;
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: Record<string, unknown>) => void;
        onPending: (result: Record<string, unknown>) => void;
        onError: (result: Record<string, unknown>) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

export default function CheckoutPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [courierOptions, setCourierOptions] = useState<CourierOption[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = getCookie('USR');
      if (!token) {
        setError('User is not authenticated');
        return;
      }

      try {
        console.log(`Fetching order details for order_id: ${orderId}`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching order details: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        const data = await response.json();
        console.log('Order details fetched:', data);
        if (data.code === '000') {
          setOrder(data.data);
          console.log('Order state set:', data.data);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  useEffect(() => {
    const fetchCourierOptions = async () => {
      if (!order) return;

      const token = getCookie('USR');
      if (!token) {
        setError('User is not authenticated');
        return;
      }

      const items = order.items.map(item => ({
        name: item.product.product_name,
        description: item.product.description,
        value: item.product.price,
        weight: 500,
        quantity: item.quantity,
      }));

      try {
        console.log('Fetching courier options with items:', items);
        const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BITESHIP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin_area_id: 'IDNP9IDNC74IDND6715IDZ16128',
            destination_area_id: order.address.biteship_id,
            couriers: 'paxel,jne,tiki,jnt',
            items,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching courier options: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        const data = await response.json();
        console.log('Courier options fetched:', data);
        if (data.success) {
          const optionsWithId = data.pricing.map((option: CourierOption, index: number) => {
            const { id, ...rest } = option;
            return {
              id: `${option.courier_name}-${option.courier_service_code}-${index}`,
              ...rest,
            };
          });
          setCourierOptions(optionsWithId);
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    if (order) {
      fetchCourierOptions();
    }
  }, [order]);

  const handleCourierChange = (courierId: string) => {
    setSelectedCourier(courierId);
  };

  const handlePayment = async () => {
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error fetching order details: ${text}`);
        throw new Error(`Error: ${response.status} - ${text}`);
      }

      const data = await response.json();
      if (data.code === '000' && data.data.snap_token) {
        const snapToken = data.data.snap_token;
        window.snap.pay(snapToken, {
          onSuccess: async function(result) {
            console.log('Payment success:', result);
            toast.success('Payment successful!');
            // Update order status to "paid"
            try {
              const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'paid' }),
              });

              if (!updateResponse.ok) {
                const text = await updateResponse.text();
                console.error(`Error updating order status: ${text}`);
                throw new Error(`Error: ${updateResponse.status} - ${text}`);
              }

              const updateData = await updateResponse.json();
              if (updateData.code === '000') {
                console.log('Order status updated to paid');
              } else {
                throw new Error(`Error: ${updateData.message}`);
              }
            } catch (error) {
              console.error('Error updating order status:', error);
              toast.error('Failed to update order status');
            }
          },
          onPending: function(result) {
            console.log('Payment pending:', result);
            toast.info('Payment pending...');
            // Handle pending
          },
          onError: function(result) {
            console.log('Payment error:', result);
            toast.error('Payment failed!');
            // Handle error
          },
          onClose: function() {
            console.log('Payment popup closed');
            // Handle close
          }
        });
      } else {
        throw new Error('Failed to retrieve Snap token');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to proceed to payment');
    }
  };

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
  };

  const formatDuration = (duration: string) => {
    if (duration === '1 - 1') {
      return '1 day';
    } else if (duration === '1') {
      return '1 day';
    } else if (duration === '0 days') {
      return 'same day';
    } else {
      return duration;
    }
  };

  const selectedCourierOption = courierOptions.find(option => option.id === selectedCourier);
  const shippingFee = selectedCourierOption ? selectedCourierOption.price : 0;
  const totalItemsPrice = parseFloat(order?.total_amount || '0');
  const subtotal = totalItemsPrice + shippingFee;

  if (error) {
    return <div>{error}</div>;
  }

  if (!order) {
    console.log('Order is still null, displaying loading...');
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <ToastContainer position='bottom-right' closeOnClick />
      <h1 className="text-3xl font-bold mb-6 text-center">Order Summary</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Products</h2>
        <ul className="space-y-4">
          {order.items.map(item => (
            <li key={item.order_item_id} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm">
              <div>
                <span className="font-semibold">{item.quantity} x {item.product.product_name}</span>
                <p className="text-gray-600">{item.product.description}</p>
              </div>
              <span className="font-semibold">{formatPrice(parseFloat(item.subtotal))}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Available Couriers</h2>
        <ul className="space-y-4">
          {courierOptions.map(option => (
            <li key={option.id} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="courier"
                  value={option.id}
                  checked={selectedCourier === option.id}
                  onChange={() => handleCourierChange(option.id)}
                  className="mr-2"
                />
                <span>{option.courier_name} - {option.courier_service_name} ({formatDuration(option.duration)})</span>
              </label>
              <span className="font-semibold">{formatPrice(option.price)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Order Total</h2>
        <p className="flex justify-between items-center">
          <span>Total Items:</span>
          <span className="font-semibold">{formatPrice(totalItemsPrice)}</span>
        </p>
        <p className="flex justify-between items-center">
          <span>Estimated Shipping Fee:</span>
          <span className="font-semibold">{formatPrice(shippingFee)}</span>
        </p>
        <p className="flex justify-between items-center text-xl font-bold mt-4">
          <span>Subtotal:</span>
          <span>{formatPrice(subtotal)}</span>
        </p>
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={() => router.back()}
          className="border-[1px] px-8 py-3 rounded-md bg-gray-500 text-white hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={handlePayment}
          className="border-[1px] px-8 py-3 rounded-md bg-[#0F4A99] text-white hover:bg-[#0D3A7A]"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}