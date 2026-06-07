import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, signToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username va parol kerak' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "Username yoki parol noto'g'ri" }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Username yoki parol noto'g'ri" }, { status: 401 });
    }
    if (user.isBlocked) {
      return NextResponse.json({ error: "Hisobingiz bloklangan. Admin bilan bog'laning." }, { status: 403 });
    }
    const token = signToken({ userId: user.id, username: user.username });
    const response = NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
    response.cookies.set('megaai_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Kirishda xatolik' }, { status: 500 });
  }
}
