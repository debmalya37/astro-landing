// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// proxy.ts
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('admin_auth')?.value;
  
  // Create the expected credential string from ENV
  const validCredentials = `${process.env.ADMIN_ID}:${process.env.ADMIN_PASSWORD}`;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    // Check if cookie matches the ID:PASS format
    if (authCookie !== validCredentials) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  return NextResponse.next();
}

// 4. Refine your matcher to ignore static files and internal Next.js paths
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