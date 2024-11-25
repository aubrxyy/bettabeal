'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';

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
  snap_token: string;
  status: string;
  shipping_status: string | null;
  payment_type: string | null;
  transaction_id: string | null;
  payment_status: string | null;
  fraud_status: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  address: {
    address_id: number;
    user_id: number;
    name: string;
    address: string;
    district_id: number;
    poscode_id: number;
    phone_number: string;
    is_main: number;
    created_at: string;
    updated_at: string;
    biteship_id: string;
  };
  user: {
    user_id: number;
    username: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const ordersPerPage = 11;

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getCookie('USR');
      if (!token) {
        setError('User is not authenticated');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching orders: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        const data = await response.json();
        if (data.status === 'success') {
          setOrders(data.data.orders);
          setTotalPages(Math.ceil(data.data.orders.length / ordersPerPage));
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchOrders();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 border ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
        >
          {i}
        </button>
      );
    }

    return <div className="flex justify-center mt-4">{pages}</div>;
  };

  const formatCurrency = (amount: string) => {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    });
    return formatter.format(parseFloat(amount));
  };

  const startIndex = (currentPage - 1) * ordersPerPage;
  const selectedOrders = orders.slice(startIndex, startIndex + ordersPerPage);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">Total Amount</th>
              <th className="py-2 px-4 border-b">Payment Status</th>
              <th className="py-2 px-4 border-b">Shipping Status</th>
              <th className="py-2 px-4 border-b">Order Date</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedOrders.map(order => (
              <tr key={order.order_id} className="text-center">
                <td className="py-2 px-4 border-b">#{order.order_id}</td>
                <td className="py-2 px-4 border-b">{formatCurrency(order.total_amount)}</td>
                <td className='border-b'>
                  <span className={`px-2 py-1 rounded-md font-bold text-xs ${order.status === 'success' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className='border-b'>
                  <span className={`px-2 py-1 rounded text-sm font-bold ${order.shipping_status === 'delivered'
                          ? 'bg-green-500 text-white'
                          : order.shipping_status === 'shipped'
                          ? 'bg-orange-300 text-white'
                          : order.shipping_status === 'processing'
                          ? 'bg-yellow-400 text-black'
                          : 'bg-red-500 text-white'
                        }`}
                      >
                      {order.shipping_status === 'shipped' ? 'SHIPPING' : order.shipping_status ? order.shipping_status.toUpperCase() : 'N/A'}
                  </span>
                </td>
                <td className="py-2 px-4 text-xs text-nowrap border-b">{new Date(order.created_at).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  
                    <button
                      onClick={() => router.push(`/cart/checkout?order_id=${order.order_id}`)}
                      className="text-blue-800 text-xs hover:underline text-nowrap"
                    >
                      View Order
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}