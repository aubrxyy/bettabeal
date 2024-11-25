'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Rating } from '@mui/material';
import { Inter } from 'next/font/google';
import BreadcrumbsComponent from '@/app/_components/Breadcrumbs';
import { Icon } from '@iconify/react';
import Cookies from 'js-cookie';
import { showToast } from '@/app/toastManager';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

const interB = Inter({
  subsets: ['latin'],
  weight: '700',
});

const interSB = Inter({
  subsets: ['latin'],
  weight: '600',
});

interface Product {
  product_id: number;
  product_name: string;
  description: string;
  price: string;
  stock_quantity: number;
  is_active: boolean;
  total_sales: number;
  main_image: {
    image_url: string;
  } | null;
  additional_images: {
    image_url: string;
  }[];
  category: {
    category_id: number;
    category_name: string;
  };
  seller: {
    store_name: string | null;
    phone_number: string;
    email: string;
  };
  average_rating: number;
  rating_breakdown: {
    [key: number]: number;
  };
  reviews: Review[];
}

interface Review {
  review_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

interface Customer {
  full_name: string;
  profile_image: string;
}

interface WishlistItem {
  wishlist_id: number;
  product: Product;
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.catalogId;
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartQuantity, setCartQuantity] = useState<number | null>(null);
  const [wishlistItem, setWishlistItem] = useState<WishlistItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [customerData, setCustomerData] = useState<{ [key: number]: Customer }>({});
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  const formatPrice = (price: string) => {
    const number = parseInt(price, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${number}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

    useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Product not found');
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            setProduct(data.data);
            fetchRelatedProducts(data.data.category.category_id, data.data.product_id);
            fetchCustomerData(data.data.reviews);
          } else {
            setError('Product not found');
          }
        })
        .catch(error => {
          console.error('Error fetching product:', error);
          setError('Product not found');
        });
    }
  }, [id]);
  
  const fetchRelatedProducts = async (categoryId: number, currentProductId: number) => {
    let page = 1;
    let allProducts: Product[] = [];
    let hasNextPage = true;
  
    while (hasNextPage) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?page=${page}`);
        const data = await response.json();
  
        if (data.status === 'success') {
          const filteredProducts = data.data.data.filter((product: Product) => 
            product.category.category_id === categoryId && 
            product.is_active && 
            product.product_id !== currentProductId
          );
          allProducts = [...allProducts, ...filteredProducts];
          hasNextPage = !!data.data.next_page_url;
          page++;
        } else {
          hasNextPage = false;
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        hasNextPage = false;
      }
    }
  
    setRelatedProducts(allProducts);
  };

  const fetchCustomerData = (reviews: Review[]) => {
    const uniqueUserIds = Array.from(new Set(reviews.map(review => review.user_id)));
    uniqueUserIds.forEach(userId => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${userId}`)
        .then(response => response.json())
        .then(data => {
          if (data.code === '000') {
            setCustomerData(prevData => ({
              ...prevData,
              [userId]: data.customer,
            }));
          }
        })
        .catch(error => console.error('Error fetching customer data:', error));
    });
  };

  useEffect(() => {
    const token = Cookies.get('USR');
    if (token && product) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success' && data.data && data.data.items) {
            const cartItem = data.data.items.find((item: any) => item.product.product_id === product.product_id);
            if (cartItem) {
              setCartQuantity(cartItem.quantity);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
        });

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success' && data.data) {
            const wishlistItem = data.data.find((item: WishlistItem) => item.product.product_id === product.product_id);
            if (wishlistItem) {
              setWishlistItem(wishlistItem);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching wishlist:', error);
        });
    }
  }, [product]);

  const handleAddToCart = () => {
    const token = Cookies.get('USR');
    if (!token) {
      showToast('Please log in to add items to the cart.', { type: 'error' });
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: product?.product_id,
        quantity,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const newCartQuantity = (cartQuantity !== null ? cartQuantity + quantity : quantity);
          setCartQuantity(newCartQuantity);
          showToast(`'${product?.product_name}' added to cart. Total in cart: ${newCartQuantity}`, { type: 'success' });
        } else {
          showToast('Failed to add product to cart', { type: 'error' });
        }
      })
      .catch(error => {
        console.error('Error adding product to cart:', error);
        showToast('Failed to add product to cart', { type: 'error' });
      });
  };

  const handleAddToWishlist = () => {
    const token = Cookies.get('USR');
    if (!token) {
      showToast('Please log in to add items to the wishlist.', { type: 'error' });
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: product?.product_id,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setWishlistItem(data.data);
          showToast(`'${product?.product_name}' added to wishlist.`, { type: 'success' });
        } else if (data.status === 'error' && data.message === 'Product already in wishlist') {
          showToast('Product already in wishlist', { type: 'info' });
        } else {
          showToast('Failed to add product to wishlist', { type: 'error' });
        }
      })
      .catch(error => {
        console.error('Error adding product to wishlist:', error);
        showToast('Failed to add product to wishlist', { type: 'error' });
      });
  };

  const handleRemoveFromWishlist = () => {
    const token = Cookies.get('USR');
    if (!token) {
      showToast('Please log in to remove items from the wishlist.', { type: 'error' });
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/${wishlistItem?.wishlist_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setWishlistItem(null);
          showToast(`'${product?.product_name}' removed from wishlist.`, { type: 'success' });
        } else {
          showToast('Failed to remove product from wishlist', { type: 'error' });
        }
      })
      .catch(error => {
        console.error('Error removing product from wishlist:', error);
        showToast('Failed to remove product from wishlist', { type: 'error' });
      });
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className='mt-8 mb-12 ml-24'>
        <BreadcrumbsComponent />
      </div>
      <div className="flex flex-row items-start justify-around mb-24 gap-x-24 mx-36">
        <div className='w-1/2'>
          <div className="relative">
            <Swiper
              spaceBetween={10}
              navigation={true}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Navigation, Thumbs]}
              className="w-full h-[500px] product-swiper mb-4"
            >
              {product.main_image && (
                <SwiperSlide className="flex items-center justify-center bg-gray-50 rounded-lg">
                  <Image
                    src={product.main_image.image_url}
                    alt={product.product_name}
                    width={400}
                    height={500}
                    className="object-contain w-full h-full"
                    priority
                  />
                </SwiperSlide>
              )}
              {product.additional_images.map((image, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center bg-gray-50 rounded-lg">
                  <Image
                    src={image.image_url}
                    alt={`${product.product_name} - ${index + 1}`}
                    width={400}
                    height={500}
                    className="object-contain w-full h-full"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Thumbnails Swiper */}
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="thumbs-swiper mt-4 h-24"
            >
              {product.main_image && (
                <SwiperSlide className="cursor-pointer rounded-lg overflow-hidden">
                  <div className="h-24 w-full bg-gray-50">
                    <Image
                      src={product.main_image.image_url}
                      alt={product.product_name}
                      width={1000}
                      height={1000}
                      className="object-contain w-full h-full"
                    />
                  </div>
                </SwiperSlide>
              )}
              {product.additional_images.map((image, index) => (
                <SwiperSlide key={index} className="cursor-pointer rounded-lg overflow-hidden">
                  <div className="h-24 w-full bg-gray-50">
                    <Image
                      src={image.image_url}
                      alt={`${product.product_name} - ${index + 1}`}
                      width={1000}
                      height={1000}
                      className="object-contain w-full h-full"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
        <div className='flex flex-col w-1/2'>
          <h1 className={`${interB.className} text-4xl mt-4 text-[#0F4A99]`}>{product.product_name}</h1>
          <p className={`${interSB.className} text-3xl mt-4`}>{formatPrice(product.price)}</p>
          <div className="flex flex-row space-x-4 mt-4">
            <button onClick={handleAddToCart} className="border-[1px] w-1/2 px-8 py-3 rounded-md bg-[#0F4A99] mx-auto lg:mx-0 flex-row flex space-x-2 text-white items-center justify-center text-nowrap">
              <Icon icon="ion:cart-outline" width={28} height={28}/>
              <span>Add to cart</span>
            </button>
            {wishlistItem ? (
              <button onClick={handleRemoveFromWishlist} className="w-1/2 border-[1px] px-8 py-3 rounded-md border-[#0F4A99] text-[#0F4A99] mx-auto lg:mx-0 flex flex-row space-x-2 items-center justify-center text-nowrap">
                <Icon icon="material-symbols-light:favorite-outline" width={28} height={28}/>
                <span>Remove from wishlist</span>
              </button>
            ) : (
              <button onClick={handleAddToWishlist} className="w-1/2 border-[1px] px-8 py-3 rounded-md border-[#0F4A99] text-[#0F4A99] mx-auto lg:mx-0 flex flex-row space-x-2 items-center justify-center text-nowrap">
                <Icon icon="material-symbols-light:favorite-outline" width={28} height={28}/>
                <span>Add to wishlist</span>
              </button>
            )}
          </div>
          <div className="flex flex-row items-center mt-4">
            <button onClick={decreaseQuantity} disabled={quantity <= 1} className="px-4 py-2 border rounded-l-xl bg-gray-50">
              -
            </button>
            <span className="px-4 py-2 border-t border-b">{quantity}</span>
            <button onClick={increaseQuantity} disabled={quantity >= product.stock_quantity} className="px-4 py-2 border rounded-r-xl bg-gray-50">
              +
            </button>
          </div>
            <hr className='mt-4 mb-2'/>
            <div className='flex flex-row justify-between gap-x-4 mt-6'>
             <div className='flex flex-row gap-x-4'>
               <div className='items-center bg-gray-200 rounded-lg size-14 flex justify-center text-gray-500'>
                  <Icon icon="uil:truck" width={28} height={28}/>
                </div>
                <div className='flex-col flex gap-y-1 text-left'>
                  <p className='text-gray-600 text-sm text-nowrap'>Free Delivery</p>
                  <p className='text-sm'>Bogor Area</p>
              </div>
             </div>
              <div className='flex flex-row gap-x-4'>
                <div className='items-center bg-gray-200 rounded-lg size-14 flex justify-center text-gray-500'>
                  <Icon icon="material-symbols-light:store-outline" width={28} height={28}/>
                </div>
                <div className='flex-col flex gap-y-1 text-left'>
                  <p className='text-gray-600 text-sm text-nowrap'>Available stock</p>
                    <p className={`text-sm font-bold ${product.stock_quantity === 0 ? 'text-red-600' : ''}`}>{product.stock_quantity}</p>
                </div>
              </div>
              <div className='flex flex-row gap-x-4'>
                <div className='items-center bg-gray-200 rounded-lg size-14 flex justify-center text-gray-500'>
                  <Icon icon="material-symbols-light:store-outline" width={28} height={28}/>
                </div>
                <div className='flex-col flex gap-y-1 text-left'>
                  <p className='text-gray-600 text-sm text-nowrap'>Products sold</p>
                  <p className='text-sm font-bold'>{product.total_sales}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
          <div className='mx-36 mb-24'>
            <h1 className='font-bold text-2xl'>Description</h1>
            <p className="mt-4">{product.description}</p>
          </div>

      <div className='mx-36 mb-24'>
      <h1 className='font-bold text-2xl mb-8'>Reviews</h1>
      <div className='flex gap-x-16'>
        <div className='flex flex-col items-center bg-gray-50 p-8 rounded-xl'>
          <h2 className='text-5xl font-bold text-[#0F4A99]'>{product.average_rating.toFixed(1)}</h2>
          <p className='text-gray-500 text-sm mt-2'>of {product.reviews.length} reviews</p>
          <div className='mt-2'>
            <Rating name="read-only" value={product.average_rating} precision={0.5} size="small" readOnly />
          </div>
        </div>
        <div className='flex flex-col gap-y-2 w-full'>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className='flex items-center gap-x-4'>
              <span className='w-12 flex flex-row items-center gap-x-2'>
                <p className="w-2 mr-1 text-right">{rating}</p>
              <Icon icon="ic:baseline-star" className='text-yellow-500'/>
              </span>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div 
                  className='bg-[#0F4A99] h-2 rounded-full'
                  style={{
                    width: `${((product.rating_breakdown[rating] || 0) / product.reviews.length) * 100}%`
                  }}
                ></div>
              </div>
              <span>{product.rating_breakdown[rating] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className='mt-8'>
        
        {/* Reviews Display */}
        {(showAllReviews 
          ? product.reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage)
          : product.reviews.slice(0, 3)
        ).map(review => {
          const customer = customerData[review.user_id];
          const profileImageUrl = customer?.profile_image 
            ? `${process.env.NEXT_PUBLIC_API_URL}${customer.profile_image}`
            : "/placeholder-avatar.png";

          return (
            <div key={review.review_id} className='mt-8 border-b pb-4'>
              <div className='flex items-center gap-x-4'>
                <Image
                  src={profileImageUrl}
                  alt="User Avatar"
                  width={48}
                  height={48}
                  className="rounded-full size-12"
                />
                <div>
                  <h3 className='font-semibold'>{customer?.full_name || 'Anonymous'}</h3>
                  <Rating name="read-only" value={review.rating} precision={0.5} size="small" readOnly />
                </div>
                <span className='ml-auto text-gray-500'>{formatDate(review.created_at)}</span>
              </div>
              <p className='mt-4 text-gray-600'>
                {review.comment}
              </p>
            </div>
          );
        })}

        {/* Show More Button */}
        {!showAllReviews && product.reviews.length > 3 && (
          <button 
            onClick={() => setShowAllReviews(true)}
            className="mt-8 px-6 py-2 border border-[#0F4A99] text-[#0F4A99] rounded-md hover:bg-[#0F4A99] hover:text-white transition-colors"
          >
            Show More Reviews
          </button>
        )}

        {/* Pagination */}
        {showAllReviews && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(product.reviews.length / reviewsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === index + 1
                    ? 'bg-[#0F4A99] text-white'
                    : 'border border-[#0F4A99] text-[#0F4A99]'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          )}
          <div className='my-12'>
  <h1 className='font-bold text-2xl mb-8'>Related Products</h1>
  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center'>
    {relatedProducts.map(product => (
      <div key={product.product_id} className='bg-white shadow-md rounded-lg overflow-hidden'>
        <Image
          src={product.main_image ? product.main_image.image_url : '/placeholder.png'}
          alt={product.product_name}
          width={200}
          height={200}
          className='w-full h-60 object-cover'
        />
        <div className='p-4'>
          <h2 className='text-lg font-semibold'>{product.product_name}</h2>
          <p className='text-gray-600'>{formatPrice(product.price)}</p>
          <div className='flex items-center mt-2'>
            <Rating name="read-only" value={product.average_rating} precision={0.5} size="small" readOnly />
            <span className='ml-2 text-sm text-gray-600'>({product.average_rating.toFixed(1)})</span>
          </div>
          <button
            onClick={() => router.push(`/catalog/${product.product_id}`)}
            className='mt-4 w-full bg-[#0F4A99] text-white py-2 rounded-md hover:bg-[#0a356e] transition-colors'
          >
            View Product
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
      </div>
    </div>
    </>
  );
}