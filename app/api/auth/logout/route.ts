import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieOptions = clearAuthCookie();
  const cookieStore = await cookies();
  cookieStore.set(cookieOptions);
  return NextResponse.json({ success: true });
}
