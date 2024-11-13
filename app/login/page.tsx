'use client'

import { Inter } from 'next/font/google';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { setCookie } from '../_utils/cookies';

const inter = Inter({
  subsets: ['latin'],
  weight: '700',
})

const interR = Inter({
  subsets: ['latin'],
  weight: '400',
})

export default function Login() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.token) {
            setCookie('USR', data.token, { secure: true, sameSite: 'Strict', maxAge: 3600 });
            localStorage.setItem('token', data.user.token);

            if (data.user.role === 'seller') {
              setSuccessMessage('Login successful! Redirecting to dashboard.');
            } else if (data.user.role === 'customer') {
              setSuccessMessage('Login successful! Redirecting to home page.');
            } else {
              setSuccessMessage(null);
            }
            setTimeout(() => {
              if (data.user.role === 'seller') {
                window.location.href = '/dashboard';
              } else if (data.user.role === 'customer') {
                window.location.href = '/';
              }
            }, 1000);
          } else {
            setErrorMessage('Login failed, please check your username/password!');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setErrorMessage('An error occurred. Please try again later.');
        });
      });
    }
  }, []);

  return (
    <div className="bg-cover bg-center h-screen loginBG">
      <div className="flex items-center justify-center h-full">
        <div className={`bg-white px-16 py-20 rounded-lg shadow-lg text-center ${interR.className}`}>
          <h2 className={`text-3xl mb-2 text-black ${inter.className}`}>Login</h2>
          {successMessage ? (
            <div className="mb-4 text-sm text-green-500 bg-green-200 border-2 border-green-400 rounded-md p-3">
              {successMessage}
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-16">New to Our Product? <a href="/register" className="text-blue-500">Create an Account</a></p>
              {errorMessage && (
                <div className="mb-4 text-sm text-red-500 bg-red-200 border-2 border-red-400 rounded-md p-3">
                  {errorMessage}
                </div>
              )}
              <form id="loginForm">
                <div className="mb-4 w-96">
                  <label htmlFor="username" className="block text-left mb-2 text-gray-400">Username</label>
                  <input type="text" id="username" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter username" required/>
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-left mb-2 text-gray-400">Password</label>
                  <input type="password" id="password" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter password" required/>
                </div>
                <button type="submit" className="w-full bg-[#1E2753] hover:bg-[#49579B] text-white p-2 rounded">Login</button>
              </form>
              <hr className="mt-8"/>
              <div className="flex justify-center">
                <Image src="/logoBB.png" width={150} height={100} alt="BettaBeal" className="mt-20"/>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}