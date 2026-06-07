import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'megaai_token';
const ADMIN_COOKIE = 'megaai_admin';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  // Protected user routes
  const protectedRoutes = ['/chat', '/profile', '/settings', '/subscription-inactive', '/pricing'];
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));

  if (isProtected) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // Guest only routes — loggedIn bo'lsa /chat ga
  if (pathname === '/login' || pathname === '/register') {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      return NextResponse.redirect(new URL('/chat', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/chat/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/pricing/:path*',
    '/subscription-inactive/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
