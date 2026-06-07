import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({ name: 'megaai_admin', value: '', maxAge: 0, path: '/' });
  return NextResponse.json({ success: true });
}
