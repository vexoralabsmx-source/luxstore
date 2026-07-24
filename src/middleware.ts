import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir siempre el acceso a assets, login, register y apis
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const adminCookie = request.cookies.get('lux_admin_session');
  const userCookie = request.cookies.get('lux_user_session');

  // Proteger estrictamente la zona de administración /admin
  if (pathname.startsWith('/admin')) {
    if (!adminCookie || adminCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
    }
  }

  // Proteger el panel de cliente /dashboard
  if (pathname.startsWith('/dashboard')) {
    if ((!userCookie || userCookie.value !== 'true') && (!adminCookie || adminCookie.value !== 'true')) {
      return NextResponse.redirect(new URL('/login?redirect=/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
