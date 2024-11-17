import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('USR')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/error', request.url));
  }

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentication`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === '000' && data.role === 'seller') {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL('/error', request.url));
      }
    })
    .catch(error => {
      console.error('Error during authentication:', error);
      return NextResponse.redirect(new URL('/error', request.url));
    });
}

export const config = {
  matcher: ['/dashboard/:path*'],
};