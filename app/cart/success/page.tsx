'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Success() {
  const router = useRouter();

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="px-5 py-4 mt-[4.63rem]">
                  <div className="bg-white rounded-lg p-6 text-center flex flex-col justify-center">
                      <Image width={200} height={200} src='/paysuccess.png' alt='success' className='mx-auto mb-8'/>
            <h1 className="text-5xl font-bold text-green-600 mb-4">Thank you for your purchase!</h1>
            <p className="text-lg mb-4">Your order has been successfully placed.</p>
            
              <button
                onClick={() => router.push('/user/orders')}
                className="ml-1 text-blue-800 rounded-lg hover:text-blue-600 underline"
              >
                Track your orders here
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}