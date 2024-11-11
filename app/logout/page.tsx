'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie } from '../_utils/cookies';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const exp = new Date(0);
    setCookie('currentUser', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('userRole', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('userId', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('username', '', { expires: exp, secure: true, sameSite: 'Strict' });
    localStorage.removeItem('token');
    router.push('/login');
  }, [router]);

  return <div>Logging out...</div>;
}