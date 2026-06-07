import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { addMonths, addYears } from 'date-fns';

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { userId, action } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'userId va action kerak' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    if (action === 'block') {
      await prisma.user.update({ where: { id: userId }, data: { isBlocked: true } });
      return NextResponse.json({ success: true, message: 'Foydalanuvchi bloklandi' });
    }
    if (action === 'unblock') {
      await prisma.user.update({ where: { id: userId }, data: { isBlocked: false } });
      return NextResponse.json({ success: true, message: 'Blok olib tashlandi' });
    }
    if (action === 'cancel') {
      await prisma.subscription.upsert({
        where: { userId },
        update: { status: 'cancelled', endDate: new Date() },
        create: { userId, planType: 'monthly', startDate: new Date(), endDate: new Date(), status: 'cancelled' },
      });
      return NextResponse.json({ success: true, message: 'Tarif bekor qilindi' });
    }
    if (action === 'monthly' || action === 'yearly') {
      const startDate = new Date();
      const endDate = action === 'monthly' ? addMonths(startDate, 1) : addYears(startDate, 1);
      await prisma.subscription.upsert({
        where: { userId },
        update: { planType: action, startDate, endDate, status: 'active' },
        create: { userId, planType: action, startDate, endDate, status: 'active' },
      });
      await prisma.payment.create({
        data: { userId, planType: action, amount: action === 'monthly' ? 99000 : 950000 },
      });
      return NextResponse.json({ success: true, message: `${action} tarif berildi` });
    }
    return NextResponse.json({ error: "Noto'g'ri action" }, { status: 400 });
  } catch (err) {
    console.error('Admin subscription error:', err);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
