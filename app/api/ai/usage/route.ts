import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

const DAILY_LIMIT = 3;

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = format(new Date(), 'yyyy-MM-dd');
    const usage = await prisma.aIUsage.findUnique({
      where: { userId_date: { userId: authUser.userId, date: today } },
    });

    const used = usage?.count ?? 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);

    return NextResponse.json({ used, remaining, limit: DAILY_LIMIT });
  } catch (err) {
    console.error('Usage status error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
