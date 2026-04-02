import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getEncodedSecret } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // 1. Handle Protected Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    try {
      const { payload } = await jwtVerify(session, getEncodedSecret());
      console.log('Middleware Admin Check:', { pathname, userRole: payload.role });
      
      if (payload.role !== 'ADMIN') {
        console.warn('Access Denied to Admin:', { email: payload.email, userRole: payload.role });
        return NextResponse.redirect(new URL('/auth', request.url));
      }
      return NextResponse.next();
    } catch (err: any) {
      console.error('Middleware Error:', err.message);
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // 2. Handle Protected Participant Routes
  if (pathname.startsWith('/participant')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    try {
      const { payload } = await jwtVerify(session, getEncodedSecret());
      if (payload.role !== 'PARTICIPANT') {
        return NextResponse.redirect(new URL('/auth', request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // 3. Handle Auth Page Redirection (Prevention of double login)
  if (pathname === '/auth') {
    if (session) {
      try {
        const { payload } = await jwtVerify(session, getEncodedSecret());
        const target = payload.role === 'ADMIN' ? '/admin/dashboard' : '/participant/dashboard';
        return NextResponse.redirect(new URL(target, request.url));
      } catch {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/participant/:path*', '/auth'],
};
