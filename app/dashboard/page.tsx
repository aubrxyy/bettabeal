'use client';

import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { getCookie } from '../_utils/cookies';
import { useRouter } from 'next/navigation';
import Rating from '@mui/material/Rating';
import Header from './Header';
import Navbar from './Navbar';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const interB = Inter({
  subsets: ['latin'],
  weight: '600',
});


export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [totalArticles, setTotalArticles] = useState<number | null>(null);
  const [orderData, setOrderData] = useState<{ date: string; time: string; count: number }[]>([]);
  const [ordersByDate, setOrdersByDate] = useState<{ date: string; revenue: number }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [storeRating, setStoreRating] = useState(5);
  
  function calculateDeliveredStats(ordersData: {
      data: {
          orders: Array<{
              shipping_status: string;
              total_amount: string;
          }>;
      };
  }) {
      const orders = ordersData.data.orders;
      
      const deliveredOrders = orders.filter(order => 
          order.shipping_status === 'delivered'
      );
      
      const totalRevenue = deliveredOrders.reduce((sum, order) => 
          sum + parseFloat(order.total_amount), 
          0
      );
      
      return {
          deliveredOrdersCount: deliveredOrders.length,
          totalRevenue: totalRevenue
      };
  }
  
  async function calculateTotalStats(ordersData: {
      data: {
          pagination: { last_page: number };
      };
  }) {
      let totalDeliveredOrders = 0;
      let totalRevenue = 0;
      const lastPage = ordersData.data.pagination.last_page;
      
      for(let page = 1; page <= lastPage; page++) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders?page=${page}`);
          const pageData = await response.json();
          const pageStats = calculateDeliveredStats(pageData);
          
          totalDeliveredOrders += pageStats.deliveredOrdersCount;
          totalRevenue += pageStats.totalRevenue;
      }
      
      return {
          totalDeliveredOrders,
          totalRevenue
      };
  }

  useEffect(() => {
    const fetchAllOrders = async () => {
      const token = getCookie('USR');
      if (!token) {
        return;
      }

      let allOrders: any[] = [];
      let currentPage = 1;
      let lastPage = 1;

      try {
        do {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders?page=${currentPage}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const text = await response.text();
            console.error(`Error fetching orders: ${text}`);
            return;
          }

          const data = await response.json();
          if (data.status === 'success') {
            allOrders = allOrders.concat(data.data.orders);
            lastPage = data.data.pagination.last_page;
            currentPage++;
          } else {
            console.error(`Error: ${data.message}`);
            return;
          }
        } while (currentPage <= lastPage);

        const deliveredOrders = allOrders.filter((order: any) => order.shipping_status === 'delivered');
        const revenue = deliveredOrders.reduce((acc: number, order: any) => acc + parseFloat(order.total_amount), 0);
        
        setTotalRevenue(revenue);
        setTotalOrders(deliveredOrders.length);

        const ordersByDateAndTime = allOrders.reduce((acc: any, order: any) => {
          const createdAt = new Date(order.created_at);
          const date = createdAt.toLocaleDateString();
          const time = createdAt.getHours();
          const timeLabel = `${time}:00`;
          const dateTimeLabel = `${date} ${timeLabel}`;
          if (!acc[dateTimeLabel]) {
            acc[dateTimeLabel] = 0;
          }
          acc[dateTimeLabel]++;
          return acc;
        }, {});

        const orderDataArray = Object.keys(ordersByDateAndTime).map(dateTime => {
          const [date, time] = dateTime.split(' ');
          return {
            date,
            time,
            count: ordersByDateAndTime[dateTime],
          };
        });

        const latestThreeDays = Array.from(new Set(orderDataArray.map(data => data.date)))
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .slice(0, 3);

        const filteredOrderData = orderDataArray.filter(data => latestThreeDays.includes(data.date));

        setOrderData(filteredOrderData);

        const ordersByDate = allOrders.reduce((acc: any, order: any) => {
          if (order.shipping_status === 'delivered') {
            const date = new Date(order.created_at).toLocaleDateString();
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += parseFloat(order.total_amount);
          }
          return acc;
        }, {});

        const ordersByDateArray = Object.keys(ordersByDate).map(date => ({
          date,
          revenue: ordersByDate[date],
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);

        setOrdersByDate(ordersByDateArray);

        const recentTransactions = allOrders.map(order => ({
          customerName: order.customer.full_name,
          date: new Date(order.created_at).toLocaleDateString(),
          amount: parseFloat(order.total_amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
          status: order.status,
        }));

        setRecentTransactions(recentTransactions);

        const productMap = new Map();
        allOrders.forEach(order => {
          if (order.shipping_status === 'delivered') {
            interface OrderItem {
              product_name: string;
              price: number;
              quantity: number;
            }

            interface Product {
              name: string;
              price: number;
              unitSold: number;
            }

            order.items.forEach((item: OrderItem) => {
              if (!productMap.has(item.product_name)) {
                productMap.set(item.product_name, {
                  name: item.product_name,
                  price: item.price,
                  unitSold: 0,
                } as Product);
              }
              productMap.get(item.product_name)!.unitSold += item.quantity;
            });
          }
        });

        const topProductsArray = Array.from(productMap.values()).sort((a, b) => b.unitSold - a.unitSold);
        setTopProducts(topProductsArray);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchAllOrders();
  }, []);

  useEffect(() => {
    const token = getCookie('USR');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.code === '000') {
            setTotalArticles(data.articles.length);
          }
        })
        .catch(error => {
          console.error('Error fetching articles:', error);
        });
    }
  }, []);

        useEffect(() => {
              const fetchStoreRating = async () => {
                const token = getCookie('USR');
                const userid = getCookie('UID');
                if (token) {
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers/${userid}`, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                    });

                    if (!response.ok) {
                      const text = await response.text();
                      console.error(`Error fetching store rating: ${text}`);
                      return;
                    }

                    const data = await response.json();
                    if (data.code === '000') {
                      setStoreRating(data.seller.store_rating);
                    } else {
                      console.error(`Error: ${data.message}`);
                    }
                  } catch (error) {
                    console.error('Fetch error:', error);
                  }
                }
              };

              fetchStoreRating();
            }, []);

  useEffect(() => {
    const token = getCookie('USR');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentication`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.code === '000' && data.role === 'seller') {
            setIsAuthenticated(true);
          } else if (data.code === '403') {
            router.push('/error');
          } else {
            setIsAuthenticated(false);
          }
        })
        .catch(error => {
          console.error('Error during authentication:', error);
          setIsAuthenticated(false);
        });
    } else {
      router.push('/login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated === false) {
    return null;
  }

  const dates = Array.from(new Set(orderData.map(data => data.date)));
  const timeLabels = Array.from(new Set(orderData.map(data => data.time))).sort((a, b) => parseInt(a) - parseInt(b));
  const datasets = dates.slice(0, 3).map((date, index) => ({
    label: `Orders on ${date}`,
    data: orderData.filter(data => data.date === date).map(data => data.count),
    borderColor: index === 0 ? 'rgba(255, 99, 132, 1)' : index === 1 ? 'rgba(54, 162, 235, 1)' : 'rgba(75, 192, 192, 1)',
    backgroundColor: index === 0 ? 'rgba(255, 99, 132, 0.2)' : index === 1 ? 'rgba(54, 162, 235, 0.2)' : 'rgba(75, 192, 192, 0.2)',
    fill: true,
    spanGaps: true, // Ignore gaps in the data
  }));

  const chartData = {
    labels: timeLabels,
    datasets,
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Total Orders Over Time',
        font: {
          size: 20,
          weight: 700,
        },
        color: '#333',
        padding: {
          top: 10,
          bottom: 30,
        },
        align: 'center' as const,
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Orders',
        },
        ticks: {
          beginAtZero: true,
          stepSize: 1,
          callback: function(tickValue: string | number) {
            return typeof tickValue === 'number' && Number.isInteger(tickValue) ? tickValue : null;
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const barChartData = {
    labels: ordersByDate.map(data => {
      const date = new Date(data.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Total Revenue',
        data: ordersByDate.map(data => data.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Last 7 Days Sales',
        font: {
          size: 20,
          weight: 'bold' as const,
        },
        color: '#333',
        padding: {
          top: 10,
          bottom: 30,
        },
        align: 'center' as const,
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        ticks: {
          beginAtZero: true,
          stepSize: 1,
          callback: function(tickValue: string | number) {
            return typeof tickValue === 'number' && Number.isInteger(tickValue) ? tickValue : null;
          },
        },
      },
    },
  };

  

  return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4.63rem]">
          <h1 className={`text-white text-2xl mt-2 mb-4 ${interB.className}`}>Dashboard</h1>
          <div className="grid grid-cols-4 gap-2 md:gap-4 xl:gap-6 mb-6">
            <div className='h-16 bg-white rounded-md flex items-center'>
              <div className='text-lg flex flex-col justify-start text-left ml-4'>
                <span className='font-bold leading-tight'>{totalRevenue !== null ? `Rp ${totalRevenue.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Loading...'}</span>
                <span className='text-xs text-blue-800'>Total revenue</span>
              </div>
            </div>
            
            <div className='h-16 bg-white rounded-md flex items-center'>
              <div className='text-lg flex flex-col justify-start text-left ml-4'>
                <span className='font-bold leading-tight'>{totalOrders !== null ? totalOrders : 'Loading...'}</span>
                <span className='text-xs text-blue-800'>Total orders</span>
              </div>
            </div>

            <div className='h-16 bg-white rounded-md flex items-center'>
              <div className='text-lg flex flex-col justify-start text-left ml-4'>
                <div className='flex flex-row gap-x-2 items-center'>
                  <Rating name="half-rating-read" defaultValue={storeRating ?? 5} precision={0.01} readOnly />
                  <span className='text-xs'>{storeRating}</span >
                </div>
                
                <span className='text-xs text-blue-800'>Store rating</span>
              </div>
            </div>

            <div className='h-16 bg-white rounded-md flex items-center'>
              <div className='text-lg flex flex-col justify-start text-left ml-4'>
                <span className='font-bold leading-tight'>{totalArticles !== null ? totalArticles : 'Loading...'}</span>
                <span className='text-xs text-blue-800'>Article(s) posted</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-4 xl:gap-6 mb-6">
            <div className='h-96 bg-white rounded-md col-span-5 p-2 flex justify-center'>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className='h-96 bg-white rounded-md col-span-2 p-4'>
              <div className="h-full">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-4 xl:gap-8 mb-8">
            <div className='h-96 bg-white rounded-md p-4'>
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              <table className="min-w-full bg-white">
                <thead>
                  <tr className='border-b-2'>
                    <th className="py-2 text-left pl-1">Customer Name</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.slice(0, 5).map((transaction, index) => (
                    <tr key={index} className='border-b-2'>
                      <td className="py-[0.75rem] text-sm pl-1">{transaction.customerName}</td>
                      <td className="py-[0.75rem] text-center text-sm">{transaction.date}</td>
                      <td className="py-[0.75rem] text-left text-sm pl-6">{transaction.amount}</td>
                      <td className='py-[0.75rem] text-center'>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          transaction.status === 'success' ? 'bg-green-500 text-white' :
                          transaction.status === 'pending' ? 'bg-orange-400 text-white' :
                          'bg-blue-500 text-white'
                        }`}>{transaction.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='h-96 bg-white rounded-md p-4'>
              <h2 className="text-xl font-bold mb-4">Best Seller Products</h2>
              <table className="min-w-full bg-white">
                <thead>
                  <tr className='border-b-2'>
                    <th className="py-2 text-left">Product</th>
                    <th className="py-2 pr-16">Price</th>
                    <th className="py-2">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className='border-b-2'>
                      <td className="py-2 text-xs">{product.name}</td>
                      <td className="py-2 text-xs">{parseFloat(product.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                      <td className="py-2 text-xs text-center">{product.unitSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}