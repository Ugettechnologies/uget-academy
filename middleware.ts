import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next') || 
    pathname.match(/\.(.*)$/) ||
    pathname === '/login' ||
    pathname === '/admin/login' ||
    pathname === '/staff/login' ||
    pathname.startsWith('/staff/onboarding') ||
    pathname.startsWith('/register') ||
    pathname === '/' ||
    pathname === '/unauthorized'
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;
  
  if (!session) {
    // If accessing admin, redirect to /admin/login. If accessing staff, redirect to /staff/login. Otherwise /login
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname.startsWith('/staff')) {
      return NextResponse.redirect(new URL('/staff/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(session);
  
  if (!payload) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname.startsWith('/staff')) {
      return NextResponse.redirect(new URL('/staff/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = payload.role as string;

  // Role-based routing protection
  if (pathname.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  if (pathname.startsWith('/instructor') && role !== 'INSTRUCTOR') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/staff') && role !== 'ADMIN' && role !== 'STAFF') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
