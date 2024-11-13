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

        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        fetch(`${process.env.API_URL}/api/register/customer`, {
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
            localStorage.setItem('token', data.token);
            document.cookie = `currentUser=${data.token}; path=/;`;
            setSuccessMessage('Registration successful! Redirecting to home page.');
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
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

  return (
    <div className="bg-cover bg-center h-screen loginBG">
      <div className="flex items-center justify-center h-full">
        <div className="bg-white px-16 py-20 rounded-lg shadow-lg text-center">
          <h2 className={`text-3xl mb-2 text-black ${inter.className}`}>Create an account</h2>
          <p className={`text-gray-400 mb-16 ${interR.className}`}>Have an account? <a href="/login" className="text-blue-500">Login</a></p>
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
              <form id="registerForm">
                <div className="mb-4 w-96">
                  <label htmlFor="username" className={`block text-left mb-2 text-gray-400 ${interR.className}`}>Username</label>
                  <input type="text" id="username" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter username" required/>
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className={`block text-left mb-2 text-gray-400 ${interR.className}`}>Password</label>
                  <input type="password" id="password" className="w-full p-2 border border-gray-300 rounded" placeholder="Enter password" required/>
                </div>
                <button type="submit" className="w-full bg-[#1E2753] hover:bg-[#49579B] text-white p-2 rounded">Create account</button>
              </form>
              <hr className="mt-8"/>
              <div className="flex justify-center">
                <Image src="/logoBB.png" width={150} height={100} alt="BettaBeal" className="mt-12"/>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}