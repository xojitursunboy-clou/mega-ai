import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { format, startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    const [
      totalUsers,
      allSubscriptions,
      todayNew,
      totalImagesResult,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.findMany(),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfDay(now), lte: endOfDay(now) },
        },
      }),
      prisma.aIUsage.aggregate({ _sum: { count: true } }),
    ]);

    const activeSubscriptions = allSubscriptions.filter(
      s => s.status === 'active' && new Date(s.endDate) > now
    );

    const activeUsers = activeSubscriptions.length;
    const monthlyUsers = activeSubscriptions.filter(s => s.planType === 'monthly').length;
    const yearlyUsers = activeSubscriptions.filter(s => s.planType === 'yearly').length;
    const totalImages = totalImagesResult._sum.count || 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      monthlyUsers,
      yearlyUsers,
      todayNew,
      totalImages,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
