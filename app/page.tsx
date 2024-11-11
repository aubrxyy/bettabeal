'use client'

import { useRouter } from 'next/navigation';
import { ArticleHome } from './_components/ArticleHome';
import { Hero } from './_components/Hero';
import { NewArrival } from './_components/NewArrival';
import { setCookie } from './_utils/cookies';

export default function Home() {
  const router = useRouter();

  const handleLogout = () => {
    const exp = new Date(0); 
    setCookie('currentUser', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('userRole', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('userId', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('username', '', { expires: exp, secure: true, sameSite: 'Strict' });
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <>
      <Hero />
      <NewArrival />
      <ArticleHome />
    </>
  );
}