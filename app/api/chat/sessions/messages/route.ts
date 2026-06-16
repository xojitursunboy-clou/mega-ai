import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Sessiya xabarlarini olish
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ error: 'sessionId kerak' }, { status: 400 });

    // Sessiya foydalanuvchiga tegishli ekanligini tekshirish
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: authUser.userId },
    });
    if (!session) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// Xabar saqlash
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, role, content, imageUrl, mode } = await req.json();
    if (!sessionId || !role || content === undefined) {
      return NextResponse.json({ error: "Ma'lumotlar yetishmayabdi" }, { status: 400 });
    }

    // Sessiya tekshiruvi
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: authUser.userId },
    });
    if (!session) return NextResponse.json({ error: 'Sessiya topilmadi' }, { status: 404 });

    const message = await prisma.chatMessage.create({
      data: { sessionId, role, content, imageUrl: imageUrl || null, mode: mode || null },
    });

    // Sessiya sarlavhasini birinchi user xabar asosida yangilash
    if (role === 'user' && session.title === 'Yangi chat') {
      const shortTitle = content.length > 40 ? content.substring(0, 40) + '...' : content;
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: shortTitle, updatedAt: new Date() },
      });
    } else {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error('Save message error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}