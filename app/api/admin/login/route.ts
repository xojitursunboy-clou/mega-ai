import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { username, code } = await req.json();

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminCode = process.env.ADMIN_CODE;

    if (!adminCode) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    if (username !== adminUsername || code !== adminCode) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET!, { expiresIn: '8h' });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'megaai_admin',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
