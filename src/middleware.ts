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

  // Permitir el acceso a la zona de administración si existe la cookie o si se accede directamente
  if (pathname.startsWith('/admin')) {
    if (adminCookie || process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (userCookie || adminCookie || process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
