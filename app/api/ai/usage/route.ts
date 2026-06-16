import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

const LIMITS: Record<string, number> = { monthly: 3, yearly: 5 };

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { subscription: true },
    });

    const planType = user?.subscription?.planType ?? 'monthly';
    const limit = LIMITS[planType] ?? 3;

    const today = format(new Date(), 'yyyy-MM-dd');
    const usage = await prisma.aIUsage.findUnique({
      where: { userId_date: { userId: authUser.userId, date: today } },
    });

    const used = usage?.count ?? 0;
    const remaining = Math.max(0, limit - used);

    return NextResponse.json({ used, remaining, limit });
  } catch (err) {
    console.error('Usage error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}