import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const users = await prisma.user.findMany({
      include: { subscription: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt,
        subscription: u.subscription,
      })),
    });
  } catch (err) {
    console.error('Admin users error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// User o'chirish
export async function DELETE(req: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId kerak' }, { status: 400 });

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, message: "Foydalanuvchi o'chirildi" });
  } catch (err) {
    console.error('Delete user error:', err);
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}
