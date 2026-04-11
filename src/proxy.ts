import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getEncodedSecret } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // 1. Handle Protected Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    try {
      const { payload } = await jwtVerify(session, getEncodedSecret());
      
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth', request.url));
      }
      return NextResponse.next();
    } catch (err: any) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // 2. Handle Auth Page Redirection (Prevention of double login)
  if (pathname === '/auth') {
    if (session) {
      try {
        const { payload } = await jwtVerify(session, getEncodedSecret());
        if (payload.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      } catch {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth'],
};
