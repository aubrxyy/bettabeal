'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/app/_utils/cookies';
import Image from 'next/image';
import { Rating } from '@mui/material';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface ReviewableItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: string;
}

interface ReviewableOrder {
  order_id: number;
  order_date: string;
  total_items: number;
  reviewable_items: ReviewableItem[];
}

interface Review {
  review_id: number;
  order: {
    order_id: number;
    order_item_id: number;
  };
  seller: {
    seller_id: number;
    store_name: string;
    store_rating: number;
  };
  product: {
    product_id: number;
    name: string;
    image: string;
  };
  user: {
    user_id: number;
    name: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function ReviewPage() {
  const [reviewableOrders, setReviewableOrders] = useState<ReviewableOrder[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<ReviewableOrder | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ReviewableItem | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const [currentPageReviews, setCurrentPageReviews] = useState(1);
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews'>('orders');
  const router = useRouter();

  useEffect(() => {
    const fetchReviewableOrders = async () => {
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
        return;
      }

      let page = 1;
      let allOrders: ReviewableOrder[] = [];
      let hasNextPage = true;

      while (hasNextPage) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/reviewable-orders?page=${page}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const text = await response.text();
          console.log('Reviewable Orders Response:', text);
          const data = JSON.parse(text);

          if (data.status === 'success') {
            allOrders = [...allOrders, ...data.data.orders];
            hasNextPage = data.data.pagination.current_page < data.data.pagination.last_page;
            page++;
          } else {
            setError(`Error: ${data.message}`);
            hasNextPage = false;
          }
        } catch (error) {
          console.error('Fetch error:', error);
          setError(`Fetch error: ${(error as Error).message}`);
          hasNextPage = false;
        }
      }

      setReviewableOrders(allOrders);
    };

    const fetchReviews = async () => {
      const token = getCookie('USR');
      if (!token) {
        router.push('/login');
        return;
      }

      let page = 1;
      let allReviews: Review[] = [];
      let hasNextPage = true;

      while (hasNextPage) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/reviews?page=${page}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const text = await response.text();
          console.log('Reviews Response:', text);
          const data = JSON.parse(text);

          if (data.status === 'success') {
            allReviews = [...allReviews, ...data.data.reviews];
            hasNextPage = data.data.pagination.current_page < data.data.pagination.last_page;
            page++;
          } else {
            setError(`Error: ${data.message}`);
            hasNextPage = false;
          }
        } catch (error) {
          console.error('Fetch error:', error);
          setError(`Fetch error: ${(error as Error).message}`);
          hasNextPage = false;
        }
      }

      setReviews(allReviews);
    };

    fetchReviewableOrders();
    fetchReviews();
  }, [router]);

  const cleanImageUrl = (url: string) => {
    return url.replace('https://api.bettabeal.my.id/storage/http://api-bettabeal.dgeo.id/storage/', 'https://api.bettabeal.my.id/storage/');
  };

  const handleOpen = (order: ReviewableOrder, product: ReviewableItem) => {
    setCurrentOrder(order);
    setCurrentProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRating(0);
    setComment('');
  };

  const handleAddReview = async () => {
    const token = getCookie('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!currentOrder || !currentProduct) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${currentOrder.order_id}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviews: [{
            order_item_id: currentProduct.order_item_id,
            product_id: currentProduct.product_id,
            rating,
            comment,
          }],
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Review added successfully!');
        handleClose();
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Add review error:', error);
      setError(`Add review error: ${(error as Error).message}`);
    }
  };

  const paginatedReviewableOrders = reviewableOrders.slice((currentPageOrders - 1) * 2, currentPageOrders * 2);
  const paginatedReviews = reviews.slice((currentPageReviews - 1) * 3, currentPageReviews * 3);

  const handlePageChangeOrders = (page: number) => {
    setCurrentPageOrders(page);
  };

  const handlePageChangeReviews = (page: number) => {
    setCurrentPageReviews(page);
  };

  const renderPaginationButtons = (totalPages: number, currentPage: number, handlePageChange: (page: number) => void) => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 mx-1 ${currentPage === i ? 'bg-blue-500 text-white' : 'text-blue-500 bg-gray-100'} rounded-lg`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-start mb-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 mx-1 ${activeTab === 'orders' ? 'bg-blue-500 text-white' : 'text-blue-500 bg-gray-100'} rounded-lg`}
        >
          Unreviewed orders
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 mx-1 ${activeTab === 'reviews' ? 'bg-blue-500 text-white' : 'text-blue-500 bg-gray-100'} rounded-lg`}
        >
          My Reviews
        </button>
      </div>

      {activeTab === 'orders' && (
        <>
          <h1 className="text-2xl font-bold mb-4">Products you can review</h1>
          {paginatedReviewableOrders.length > 0 ? (
            paginatedReviewableOrders.map(order => (
              <div key={order.order_id} className="mb-4 p-2 border rounded-lg shadow-md">
                <h2 className="text-lg font-semibold">Order</h2>
                <p className="text-gray-600 mb-2 text-sm">Order Date: {new Date(order.order_date).toLocaleString()}</p>
                <div className="grid grid-cols-1 gap-2">
                  {order.reviewable_items.map(item => (
                    <div key={item.order_item_id} className="flex items-center border p-2 rounded-lg">
                      <Image
                        src={cleanImageUrl(item.product_image)}
                        alt={item.product_name}
                        width={50}
                        height={50}
                        className="object-cover rounded-md"
                      />
                      <div className="ml-2">
                        <h3 className="text-md font-semibold">{item.product_name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(item.price))}</p>
                      </div>
                      <button
                        onClick={() => handleOpen(order, item)}
                        className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
                      >
                        Add Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No reviewable orders found.</p>
          )}
          {reviewableOrders.length > 2 && (
            <div className="flex justify-center mt-4">
              {renderPaginationButtons(Math.ceil(reviewableOrders.length / 2), currentPageOrders, handlePageChangeOrders)}
            </div>
          )}
        </>
      )}

      {activeTab === 'reviews' && (
        <>
          <h1 className="text-2xl font-bold mb-4">My Reviews</h1>
          {paginatedReviews.length > 0 ? (
            paginatedReviews.map(review => (
              <div key={review.review_id} className="mb-4 p-2 border rounded-lg shadow-md">
                <div className="flex items-center">
                  <Image
                    src={cleanImageUrl(review.product.image)}
                    alt={review.product.name}
                    width={50}
                    height={50}
                    className="object-cover rounded-md"
                  />
                  <div className="ml-2">
                    <h3 className="text-md font-semibold">{review.product.name}</h3>
                    <p className="text-gray-600">Rating: <Rating name="read-only" value={review.rating} precision={1} readOnly /></p>
                    <p className="text-gray-600">Comment: {review.comment}</p>
                    <p className="text-gray-600">Reviewed on: {new Date(review.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No reviews found.</p>
          )}
          {reviews.length > 2 && (
            <div className="flex justify-center mt-4">
              {renderPaginationButtons(Math.ceil(reviews.length / 2), currentPageReviews, handlePageChangeReviews)}
            </div>
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title" className="text-lg font-bold mb-4">Add Review for {currentProduct?.product_name}</h2>
          <Rating
            name="rating"
            value={rating}
            precision={1}
            onChange={(event, newValue) => {
              setRating(newValue || 0);
            }}
          />
          <hr className='mt-2 mb-4'/>
          <TextField
            label="Comment"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            fullWidth
            className="mt-4"
          />
          <button
            onClick={handleAddReview}
            className="mt-4 bg-blue-500 rounded-lg text-white px-4 py-2"
          >
            Submit Review
          </button>
        </Box>
      </Modal>
    </div>
  );
}