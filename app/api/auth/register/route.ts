import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, signToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username va parol kerak' }, { status: 400 });
    }
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: "Username 3-30 ta belgi bo'lsin" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Parol kamida 6 ta belgi bo'lsin" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Bu username band' }, { status: 409 });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { username, passwordHash } });
    const token = signToken({ userId: user.id, username: user.username });
    const response = NextResponse.json({ success: true, user: { id: user.id, username } });
    response.cookies.set('megaai_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: "Ro'yxatdan o'tishda xatolik" }, { status: 500 });
  }
}
