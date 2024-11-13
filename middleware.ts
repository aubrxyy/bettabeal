import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const USR = request.cookies.get('USR')?.value;
  console.log('Current User:', USR);
  console.log('Request Path:', request.nextUrl.pathname);

  const publicPaths = ['/', '/login', '/register', '/public', '/framebg.jpg', '/logoBB.png'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!USR && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};