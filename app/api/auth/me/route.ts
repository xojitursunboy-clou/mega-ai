import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
 
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ user: null }, { status: 401 });
 
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { subscription: true },
    });
    if (!user) return NextResponse.json({ user: null }, { status: 404 });
    if (user.isBlocked) return NextResponse.json({ user: null, blocked: true }, { status: 403 });
 
    const sub = user.subscription;
    const hasActiveSub = !!(sub && sub.status === 'active' && new Date(sub.endDate) > new Date());
 
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        isBlocked: user.isBlocked,
        hasActiveSub,
        subscription: sub ? {
          planType: sub.planType,
          startDate: sub.startDate,
          endDate: sub.endDate,
          status: sub.status,
        } : null,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
 