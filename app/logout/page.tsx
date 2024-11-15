'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie } from '../_utils/cookies';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const exp = new Date(0);
    setCookie('USR', '', { expires: exp, secure: true, sameSite: 'Strict' });
    setCookie('UID', '', { expires: exp, secure: true, sameSite: 'Strict' });
    localStorage.removeItem('token');
    router.push('/login');
  }, [router]);

  return <div>Logging out...</div>;
}