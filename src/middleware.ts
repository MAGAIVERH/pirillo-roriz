import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

const PUBLIC_ROUTES = ['/login', '/aluno/login', '/professor/login'];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some(
    (name) => request.cookies.get(name)?.value,
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/aluno')) {
    return NextResponse.redirect(new URL('/aluno/login', request.url));
  }

  if (pathname.startsWith('/professor')) {
    return NextResponse.redirect(new URL('/professor/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/aluno/:path*', '/professor/:path*'],
};
