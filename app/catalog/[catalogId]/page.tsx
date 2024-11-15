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
  main_image: {
    image_url: string;
  } | null;
  category: {
    category_name: string;
  };
  seller: {
    store_name: string | null;
    phone_number: string;
    email: string;
  };
}

interface CartItem {
  cart_item_id: number;
  product: {
    product_id: number;
    name: string;
    price: string;
  };
  quantity: number;
  total_price: number;
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

  const formatPrice = (price: string) => {
    const number = parseInt(price, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${number}`;
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
            const cartItem = data.data.items.find((item: CartItem) => item.product.product_id === product.product_id);
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
      <div className="flex flex-row items-center justify-around mx-36">
        <Image
          src={product.main_image ? product.main_image.image_url : '/placeholder.png'}
          alt={product.product_name}
          width={300}
          height={400}
          className="object-cover"
        />
        <div className='flex flex-col'>
          <h1 className={`${interB.className} text-4xl mt-4 text-[#0F4A99]`}>{product.product_name}</h1>
          <Rating name="read-only" value={4.5} precision={0.5} size="small" readOnly className='mt-2'/>
          <p className={`${interSB.className} text-3xl mt-4`}>{formatPrice(product.price)}</p>
          <div className="flex flex-row space-x-4 mt-4">
            {wishlistItem ? (
              <button onClick={handleRemoveFromWishlist} className="border-[1px] px-8 py-3 rounded-md border-[#0F4A99] text-[#0F4A99] mx-auto lg:mx-0 flex flex-row space-x-2 items-center justify-center w-64 text-nowrap">
                <Icon icon="material-symbols-light:favorite-outline" width={28} height={28}/>
                <span>Remove from wishlist</span>
              </button>
            ) : (
              <button onClick={handleAddToWishlist} className="border-[1px] px-8 py-3 rounded-md border-[#0F4A99] text-[#0F4A99] mx-auto lg:mx-0 flex flex-row space-x-2 items-center justify-center w-64">
                <Icon icon="material-symbols-light:favorite-outline" width={28} height={28}/>
                <span>Add to wishlist</span>
              </button>
            )}
            <button onClick={handleAddToCart} className="border-[1px] px-8 py-3 rounded-md bg-[#0F4A99] mx-auto lg:mx-0 flex-row flex space-x-2 text-white items-center justify-center w-64">
              <Icon icon="ion:cart-outline" width={28} height={28}/>
              <span>Add to cart</span>
            </button>
          </div>
          <div className="flex flex-row items-center mt-4">
            <button onClick={decreaseQuantity} disabled={quantity <= 1} className="px-4 py-2 border rounded-l-md bg-gray-200">
              -
            </button>
            <span className="px-4 py-2 border-t border-b">{quantity}</span>
            <button onClick={increaseQuantity} disabled={quantity >= product.stock_quantity} className="px-4 py-2 border rounded-r-md bg-gray-200">
              +
            </button>
          </div>
          <p className="mt-4">Available Stock: {product.stock_quantity}</p>
          <p className="mt-4">{product.description}</p>
        </div>
      </div>
    </>
  );
}