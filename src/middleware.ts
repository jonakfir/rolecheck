import { NextResponse, type NextRequest } from 'next/server';

// Firebase uses client-side auth (no server sessions to refresh).
// Dashboard protection is handled client-side via onAuthStateChanged.
// This middleware is kept as a no-op placeholder for future server-side checks.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
