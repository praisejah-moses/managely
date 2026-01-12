import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is accessing the dashboard
  if (pathname.startsWith('/dashboard')) {
    // Check for authentication token in cookies
    const token = request.cookies.get('auth-token')?.value;

    // If no token, redirect to login
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Optional: Verify token with server (can be expensive, consider caching)
    // For now, we'll let the dashboard page verify the token client-side
    // to avoid making API calls on every request
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/dashboard/:path*'],
};
