'use client';

import BreadcrumbsComponent from '@/app/_components/Breadcrumbs';
import { showToast } from '@/app/toastManager';
import Cookies from 'js-cookie';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

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

interface CartData {
  total_items: number;
  subtotal: number;
  items: CartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [products, setProducts] = useState<{ [key: number]: Product }>({});
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    const number = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${number}`;
  };

  useEffect(() => {
    const token = Cookies.get('USR');
    if (!token) {
      redirect('/login');
    }

    fetch(`${process.env.NEXT_PUBLIC_API_CART_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setCart(data.data);
          // Fetch product details for each cart item
          data.data.items.forEach((item: CartItem) => {
            fetch(`${process.env.API_URL}/api/products/${item.product.product_id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            })
              .then(response => response.json())
              .then(productData => {
                if (productData.status === 'success') {
                  setProducts(prevProducts => ({
                    ...prevProducts,
                    [item.product.product_id]: productData.data,
                  }));
                }
              })
              .catch(error => {
                console.error('Error fetching product details:', error);
              });
          });
        } else {
          setError('Failed to fetch cart');
        }
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
        setError('Failed to fetch cart');
      });
  }, []);

  const handleAddToCart = (productId: number, quantity: number) => {
    const token = Cookies.get('USR');
    if (!token) {
      setError('Please log in to add items to the cart.');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_CART_ADD_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setCart(prevCart => {
            if (!prevCart) return prevCart;
            const updatedItems = prevCart.items.map(item =>
              item.product.product_id === productId ? { ...item, quantity: item.quantity + quantity, total_price: (item.quantity + quantity) * parseFloat(item.product.price) } : item
            );
            return { ...prevCart, items: updatedItems, subtotal: prevCart.subtotal + (quantity * parseFloat(products[productId].price)) };
          });
        } else {
          setError('Failed to add product to cart');
        }
      })
      .catch(error => {
        console.error('Error adding product to cart:', error);
        setError('Failed to add product to cart');
      });
  };

  const handleIncreaseQuantity = (productId: number) => {
    handleAddToCart(productId, 1);
  };

  const handleDecreaseQuantity = (cartItemId: number) => {
    const token = Cookies.get('USR');
    if (!token) {
      setError('Please log in to modify your cart.');
      return;
    }

    const cartItem = cart?.items.find(item => item.cart_item_id === cartItemId);
    if (!cartItem || cartItem.quantity <= 1) return;

    fetch(`${process.env.API_CART_DECREMENT_URL}/${cartItemId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setCart(prevCart => {
            if (!prevCart) return prevCart;
            const updatedItems = prevCart.items.map(item =>
              item.cart_item_id === cartItemId ? { ...item, quantity: item.quantity - 1, total_price: (item.quantity - 1) * parseFloat(item.product.price) } : item
            );
            return { ...prevCart, items: updatedItems, subtotal: prevCart.subtotal - parseFloat(cartItem.product.price) };
          });
        } else {
          setError('Failed to update cart');
        }
      })
      .catch(error => {
        console.error('Error updating cart:', error);
        setError('Failed to update cart');
      });
  };

  const handleRemoveFromCart = (cartItemId: number) => {
    const token = Cookies.get('USR');
    if (!token) {
      setError('Please log in to modify your cart.');
      return;
    }

    fetch(`${process.env.API_CART_ITEMS_URL}/${cartItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const removedItem = cart?.items.find(item => item.cart_item_id === cartItemId);
          setCart(prevCart => {
            if (!prevCart) return prevCart;
            const updatedItems = prevCart.items.filter(item => item.cart_item_id !== cartItemId);
            showToast(`'${removedItem?.product.name}' removed from cart.`, { type: 'success' });
            return { ...prevCart, items: updatedItems, subtotal: prevCart.subtotal - (removedItem ? removedItem.total_price : 0), total_items: prevCart.total_items - 1 };
          });
        } else {
          setError('Failed to remove item from cart');
        }
      })
      .catch(error => {
        console.error('Error removing item from cart:', error);
        setError('Failed to remove item from cart');
      });
  };

  const handleCheckout = () => {
    // Implement the logic for the checkout process
    alert('Proceeding to checkout...');
  };

  const handleQuantityChange = (cartItemId: number, newQuantity: number) => {
    const token = Cookies.get('USR');
    if (!token) {
      setError('Please log in to modify your cart.');
      return;
    }

    const cartItem = cart?.items.find(item => item.cart_item_id === cartItemId);
    const product = products[cartItem?.product.product_id || 0];
    if (!cartItem || newQuantity < 1 || newQuantity > product.stock_quantity) return;

    fetch(`${process.env.API_CART_UPDATE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        cart_item_id: cartItemId,
        quantity: newQuantity,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setCart(prevCart => {
            if (!prevCart) return prevCart;
            const updatedItems = prevCart.items.map(item =>
              item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity, total_price: newQuantity * parseFloat(item.product.price) } : item
            );
            return { ...prevCart, items: updatedItems, subtotal: prevCart.subtotal + (newQuantity - cartItem.quantity) * parseFloat(cartItem.product.price) };
          });
        } else {
          setError('Failed to update cart');
        }
      })
      .catch(error => {
        console.error('Error updating cart:', error);
        setError('Failed to update cart');
      });
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!cart) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className='mt-8 mb-12 ml-24'>
        <BreadcrumbsComponent />
      </div>
      <div className="mx-36">
        <h1 className={`${interB.className} text-4xl mt-4 text-[#0F4A99]`}>My Cart</h1>
        <p className="mt-2">Total Items: {cart.total_items}</p>
        <p className="mt-2">Subtotal: {formatPrice(cart.subtotal)}</p>
        <div className="flex flex-col gap-8 mt-8">
          {cart.items.map(item => {
            const product = products[item.product.product_id];
            return (
              <div key={item.cart_item_id} className="flex flex-row items-center border p-4 rounded-lg">
                {product && (
                  <Image
                    src={product.main_image ? product.main_image.image_url : '/placeholder.png'}
                    alt={product.product_name}
                    width={100}
                    height={100}
                    className="object-cover"
                  />
                )}
                <div className="flex flex-col ml-4">
                  <h1 className={`${interB.className} text-xl text-[#0F4A99]`}>{item.product.name}</h1>
                  <p className={`${interSB.className} text-lg mt-4`}>{formatPrice(parseFloat(item.product.price))}</p>
                  <p className="mt-2">Available Stock: {product?.stock_quantity}</p>
                  <div className="flex flex-row items-center mt-4">
                    <button onClick={() => handleDecreaseQuantity(item.cart_item_id)} className="px-4 py-2 border rounded-l-md bg-gray-200">
                      -
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.cart_item_id, parseInt(e.target.value) || 0)}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                          e.preventDefault();
                        }
                      }}
                      className="px-4 py-2 border-t border-b text-center w-16 no-arrows outline-none"
                    />
                    <button onClick={() => handleIncreaseQuantity(item.product.product_id)} className="px-4 py-2 border rounded-r-md bg-gray-200">
                      +
                    </button>
                  </div>
                  <p className="mt-2">Total Price: {formatPrice(item.total_price)}</p>
                  <button onClick={() => handleRemoveFromCart(item.cart_item_id)} className="border-[1px] px-8 py-3 rounded-md bg-[#0F4A99] text-white mt-4">
                    Remove from cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-8">
          <button onClick={handleCheckout} className="border-[1px] px-8 py-3 rounded-md bg-[#0F4A99] text-white">
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}