'use client';

import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import Image from "next/image";

const inter = Inter({
  subsets: ['latin'],
  weight: '700',
})

const interR = Inter({
  subsets: ['latin'],
  weight: '400',
})

export default function Register() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const fullName = (document.getElementById('fullName') as HTMLInputElement).value;
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const birthdate = (document.getElementById('birthdate') as HTMLInputElement).value;
        const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register/customer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: fullName,
            username: username,
            birth_date: birthdate,
            phone_number: phoneNumber,
            email: email,
            password: password
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem('token', data.token);
            document.cookie = `currentUser=${data.token}; path=/;`;
            setSuccessMessage('Registration successful! Redirecting to home page.');
            setTimeout(() => {
              window.location.href = '/';
            }, 1000); // Redirect after 1 second
          } else {
            setErrorMessage('Registration failed, please check your details!');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setErrorMessage('An error occurred. Please try again later.');
        });
      });
    }
  }, []);

  const handlePhoneNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validValue = value.replace(/[^0-9]/g, '');
    e.target.value = validValue;
  };

  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center loginBG">
      <div className="bg-white px-8 py-10 rounded-lg shadow-lg text-center w-full max-w-lg">
        <h2 className={`text-2xl mb-2 text-black ${inter.className}`}>Create an account</h2>
        <p className={`text-gray-400 mb-8 ${interR.className}`}>Have an account? <a href="/login" className="text-blue-500">Login</a></p>
        {successMessage ? (
          <div className="mb-4 text-sm text-green-500 bg-green-200 border-2 border-green-400 rounded-md p-3">
            {successMessage}
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="mb-4 text-sm text-red-500 bg-red-200 border-2 border-red-400 rounded-md p-3">
                {errorMessage}
              </div>
            )}
            <form id="registerForm" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="mb-1 sm:col-span-2">
                <label htmlFor="fullName" className={`block text-left mb-2 text-gray-400 ${interR.className}`}>Full Name</label>
                <input type="text" id="fullName" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter full name" required/>
              </div>
              <div className="mb-1 sm:col-span-2">
                <label htmlFor="username" className={`block text-left mb-2 text-gray-400 ${interR.className}`}>Username</label>
                <input type="text" id="username" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter username" required/>
              </div>
              <div className="mb-1">
                <label htmlFor="birthdate" className={`block text-left mb-2 text-gray-400 ${interR.className}`}>Birthdate</label>
                <input type="date" id="birthdate" className="w-full p-2 border border-gray-300 rounded" required/>
              </div>
              <div className="mb-1">
                <label htmlFor="phoneNumber" className={`block text-left mb-2 text-gray-400 ${interR.className}`}>Phone Number</label>
                <input type="text" id="phoneNumber" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter phone number" required onInput={handlePhoneNumberInput} pattern="[0-9]*"/>
              </div>
              <div className="mb-1 sm:col-span-2">
                <label htmlFor="email" className={`block text-left mb-2 text-gray-400 ${interR.className}`}>Email</label>
                <input type="email" id="email" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter email" required/>
              </div>
              <div className="mb-1 sm:col-span-2">
                <label htmlFor="password" className={`block text-left mb-2 text-gray-400 ${interR.className}`}>Password</label>
                <input type="password" id="password" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter password" required/>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="w-full bg-[#1E2753] hover:bg-[#49579B] text-white p-2 rounded">Create account</button>
              </div>
            </form>
            <hr className="mt-8"/>
            <div className="flex justify-center">
              <Image src="/logoBB.png" width={150} height={100} alt="BettaBeal" className="mt-8"/>
            </div>
          </>
        )}
      </div>
    </div>
  );
}