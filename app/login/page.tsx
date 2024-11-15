'use client';

import { Inter } from 'next/font/google';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { setCookie } from '../_utils/cookies';

const inter = Inter({
  subsets: ['latin'],
  weight: '700',
});

const interR = Inter({
  subsets: ['latin'],
  weight: '400',
});

export default function Login() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

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
            password: password,
          }),
        })
          .then(response => response.json())
          .then(data => {
            if (data.token) {
              const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 3600; // 30 days or 1 hour
              setCookie('USR', data.token, { secure: true, sameSite: 'Strict', maxAge });
              setCookie('UID', data.user.user_id, { secure: true, sameSite: 'Strict', maxAge });
              localStorage.setItem('token', data.token);

              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentication`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.token}`,
                },
              })
                .then(authResponse => authResponse.json())
                .then(authData => {
                  if (authData.code === '000' && authData.role === 'seller') {
                    setSuccessMessage('Login successful! Redirecting to dashboard.');
                    setTimeout(() => {
                      window.location.href = '/dashboard';
                    }, 1000);
                  } else if (authData.code === '000' && authData.role === 'customer') {
                    setSuccessMessage('Login successful! Redirecting to homepage.');
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 1000);
                  } else {
                    setErrorMessage('Error logging in. Please contact customer support!');
                  }
                })
                .catch(error => {
                  console.error('Error:', error);
                  setErrorMessage('An error occurred during authentication. Please try again later.');
                });
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
  }, [rememberMe]);

  return (
    <div className="bg-cover bg-center h-screen loginBG">
      <div className="flex items-center justify-center h-full px-4">
        <div className={`bg-white px-6 py-8 sm:px-10 sm:py-12 md:px-12 md:py-16 lg:px-16 lg:py-20 rounded-lg shadow-lg text-center w-full max-w-md ${interR.className}`}>
          <h2 className={`text-3xl mb-2 text-black ${inter.className}`}>Login</h2>
          {successMessage ? (
            <div className="mb-4 text-sm text-green-500 bg-green-200 border-2 border-green-400 rounded-md p-3">
              {successMessage}
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-16">
                New to Our Product? <a href="/register" className="text-blue-500">Create an Account</a>
              </p>
              {errorMessage && (
                <div className="mb-4 text-sm text-red-500 bg-red-200 border-2 border-red-400 rounded-md p-3">
                  {errorMessage}
                </div>
              )}
              <form id="loginForm">
                <div className="mb-4">
                  <label htmlFor="username" className="block text-left mb-2 text-gray-400">Username</label>
                  <input type="text" id="username" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter username" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-left mb-2 text-gray-400">Password</label>
                  <input type="password" id="password" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter password" required />
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-gray-400">Remember Me</label>
                </div>
                <button type="submit" className="w-full bg-[#1E2753] hover:bg-[#49579B] text-white p-2 rounded">Login</button>
              </form>
              <hr className="mt-8" />
              <div className="flex justify-center">
                <Image src="/logoBB.png" width={150} height={100} alt="BettaBeal" className="mt-20" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}