'use client';

import { useEffect, useState } from 'react';
import Header from "../Header";
import Navbar from "../Navbar";
import Cookies from 'js-cookie';
import { Icon } from '@iconify/react';

interface Customer {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  price: string;
  subtotal: string;
}

interface Order {
  order_id: number;
  customer: Customer;
  items: OrderItem[];
  shipping_address: {
    address: string;
    district_id: number;
    poscode_id: number;
  };
  total_amount: string;
  status: string;
  payment_type: string;
  transaction_id: string | null;
  shipping_status: string;
  paid_at: string | null;
  created_at: string;
}

interface District {
  district_id: number;
  district_name: string;
}

interface Poscode {
  poscode_id: number;
  code: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState<string>('');
  const [errorModalMessage, setErrorModalMessage] = useState<string>('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [poscodes, setPoscodes] = useState<Poscode[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchOrders = async (page = 1, status = 'all') => {
    const token = Cookies.get('USR');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    try {
      const url = status === 'all'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/orders?page=${page}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/orders?page=${page}&status=${status}`;

      const response = await fetch(url, {
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
        setPagination(data.data.pagination);
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    const token = Cookies.get('USR');
    if (!token) {
      setError('User is not authenticated');
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
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      const data = await response.json();
      if (data.code === '000') {
        setSelectedOrder(data.data);
        setShowModal(true);
        fetchDistricts();
        fetchPoscodes(data.data.shipping_address.district_id);
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/districts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error fetching districts: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      const data = await response.json();
      if (data.code === '000') {
        setDistricts(data.data);
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  const fetchPoscodes = async (districtId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/districts/${districtId}/poscodes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error fetching poscodes: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      const data = await response.json();
      if (data.code === '000') {
        setPoscodes(data.data);
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  const handleUpdateShippingStatus = async (newStatus: string) => {
    const token = Cookies.get('USR');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    const invalidOrders = selectedOrders.filter(orderId => {
      const order = orders.find(o => o.order_id === orderId);
      if (newStatus === 'shipped' && order?.status !== 'success') {
        return true;
      }
      if (newStatus === 'delivered' && order?.shipping_status !== 'shipped') {
        return true;
      }
      return false;
    });

    if (invalidOrders.length > 0) {
      setErrorModalMessage(
        newStatus === 'shipped'
          ? 'Cannot mark as shipping because one or more selected orders are not paid yet.'
          : 'Cannot mark as delivered because one or more selected orders are not marked as shipping yet.'
      );
      setShowErrorModal(true);
      return;
    }

    try {
      let successMessages = '';
      for (const orderId of selectedOrders) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/shipping-status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shipping_status: newStatus }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error updating order ${orderId}: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        successMessages += `Successfully marked order #${orderId} as ${newStatus === 'shipped' ? 'shipping' : 'delivered'}.\n`;
      }

      setSuccessModalMessage(successMessages);
      setShowSuccessModal(true);

      fetchOrders(currentPage, filterStatus); // Keep the current pagination page
      setSelectedOrders([]);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  const handleOrderSelection = (orderId: number) => {
    setSelectedOrders(prevSelectedOrders =>
      prevSelectedOrders.includes(orderId)
        ? prevSelectedOrders.filter(id => id !== orderId)
        : [...prevSelectedOrders, orderId]
    );
  };

  useEffect(() => {
    fetchOrders(currentPage, filterStatus);
  }, [currentPage, filterStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setFilterStatus(status);
    setCurrentPage(1); // Reset to the first page when filter changes
    fetchOrders(1, status);
  };

  const formatCurrency = (amount: string) => {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    });
    return formatter.format(parseFloat(amount));
  };

  const getDistrictName = (districtId: number) => {
    const district = districts.find(d => d.district_id === districtId);
    return district ? district.district_name : 'N/A';
  };

  const getPoscode = (poscodeId: number) => {
    const poscode = poscodes.find(p => p.poscode_id === poscodeId);
    return poscode ? poscode.code : 'N/A';
  };

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4.63rem]">
          {/* Search and Filter Header */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between mb-4">
              <div className="flex gap-4">
                <select className="rounded-md px-4 py-2 font-bold text-sm bg-white border text-blue-900" onChange={handleFilterChange}>
                  <option value="all">Order status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateShippingStatus('shipped')}
                  className="py-2 px-4 bg-[#0F4A99] hover:bg-blue-600 transition-all text-white rounded-lg"
                >
                  <div className='flex flex-row'>
                    <Icon icon="uil:truck" className='size-6 mr-2'></Icon> Mark as Shipping
                  </div>
                </button>
                <button
                  onClick={() => handleUpdateShippingStatus('delivered')}
                  className="py-2 px-4 bg-[#0F4A99] hover:bg-blue-600 transition-all text-white rounded-lg"
                >
                  <div className='flex flex-row'>
                    <Icon icon="line-md:confirm-circle" className='size-6 mr-2'></Icon> Mark as Delivered
                  </div>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="p-3"></th>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Payment status</th>
                  <th className="p-3">Shipping Status</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id} className="border-t">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.order_id)}
                        onChange={() => handleOrderSelection(order.order_id)}
                      />
                    </td>
                    <td className="p-2">#{order.order_id}</td>
                    <td className="p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-2 text-sm">{order.customer.full_name}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        order.status === 'success' ? 'bg-green-500 text-white' :
                        order.status === 'pending' ? 'bg-orange-400 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {order.status === 'success' ? 'PAID' : order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2">
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
                    <td className="p-2">{formatCurrency(order.total_amount)}</td>
                    <td className="py-2 px-4 border-b">
                  {order.shipping_status === 'delivered' ? (
                    <span className="px-2 py-1 rounded-md font-bold text-xs bg-green-500 text-white">
                      COMPLETED
                    </span>
                  ) : (
                    <button
                      onClick={() => fetchOrderDetails(order.order_id)}
                      className="text-blue-800 text-xs hover:underline text-nowrap"
                    >
                      View Order
                    </button>
                  )}
                </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.total > 10 && (
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <button
                    className="p-2"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                  >
                    &#8636;
                  </button>
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`p-2 ${page === pagination.current_page ? 'bg-blue-100' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="p-2"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                  >
                    &#8641;
                  </button>
                </div>
                <div className='text-sm italic text-gray-600'>{pagination.total} order results</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Order Details</h2>
              <p className='mb-2'>Transaction ID: {selectedOrder.transaction_id || 'N/A'}</p>
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Customer</h3>
              <p>{selectedOrder.customer.full_name}</p>
              <p>{selectedOrder.customer.email}</p>
              <p>{selectedOrder.customer.phone_number}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Shipping Address</h3>
              <p>{selectedOrder.shipping_address.address}</p>
              <p>Kecamatan {getDistrictName(selectedOrder.shipping_address.district_id)}, Jawa Barat</p>
              <p> {getPoscode(selectedOrder.shipping_address.poscode_id)}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Items</h3>
              <ul>
                {selectedOrder.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.quantity} x {item.product_name}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Order Summary</h3>
              <p>Total: {formatCurrency(selectedOrder.total_amount)}</p>
              <p>Status: <span className={`px-2 py-1 rounded text-sm font-bold ${
                        selectedOrder.status === 'success' ? 'bg-green-500 text-white' :
                        selectedOrder.status === 'pending' ? 'bg-orange-400 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {selectedOrder.status === 'success' ? 'PAID' : selectedOrder.status.toUpperCase()}
                      </span></p>
              <p>Shipping Status: <span className={`px-2 py-1 rounded text-sm font-bold ${selectedOrder.shipping_status === 'delivered'
                          ? 'bg-green-500 text-white'
                          : selectedOrder.shipping_status === 'shipped'
                          ? 'bg-orange-300 text-white'
                          : selectedOrder.shipping_status === 'processing'
                          ? 'bg-yellow-400 text-black'
                          : 'bg-red-500 text-white'
                        }`}
                      >
                      {selectedOrder.shipping_status === 'shipped' ? 'SHIPPING' : selectedOrder.shipping_status ? selectedOrder.shipping_status.toUpperCase() : 'N/A'}
                      </span></p>
              <p>Paid At: {selectedOrder.paid_at || 'N/A'}</p>
              <p>Created At: {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{errorModalMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

            {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Success</h2>
            <p>{successModalMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}