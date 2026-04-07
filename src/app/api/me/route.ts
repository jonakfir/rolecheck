import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/me?email=...
 * Returns whether the user is an admin and their plan info.
 * Used by the dashboard to show admin badge.
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  return NextResponse.json({
    isAdmin: isAdmin(email),
  });
}
