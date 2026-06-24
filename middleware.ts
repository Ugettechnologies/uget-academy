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
    pathname.startsWith('/register') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(session);
  
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = payload.role as string;

  // Role-based routing protection
  if (pathname.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
  }
  
  if (pathname.startsWith('/instructor') && role !== 'INSTRUCTOR') {
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
  }
  
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
