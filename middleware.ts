import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('currentUser')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  console.log('Current User:', currentUser);
  console.log('User Role:', userRole);
  console.log('Request Path:', request.nextUrl.pathname);

  const publicPaths = ['/', '/login', '/register', '/public', '/framebg.jpg', '/logoBB.png'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (currentUser && userRole === 'seller' && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (currentUser && userRole === 'customer' && request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  if (!currentUser && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};