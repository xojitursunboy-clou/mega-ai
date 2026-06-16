import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
 
// Barcha sessiyalarni olish
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 
    const sessions = await prisma.chatSession.findMany({
      where: { userId: authUser.userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { take: 1, orderBy: { createdAt: 'asc' } } },
    });
 
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('Get sessions error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
 
// Yangi sessiya yaratish
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 
    const { title } = await req.json().catch(() => ({}));
 
    const session = await prisma.chatSession.create({
      data: {
        userId: authUser.userId,
        title: title || 'Yangi chat',
      },
    });
 
    return NextResponse.json({ session });
  } catch (err) {
    console.error('Create session error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
 
// Sessiyani o'chirish
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId kerak' }, { status: 400 });
 
    // Faqat o'z sessiyasini o'chira olsin
    await prisma.chatSession.deleteMany({
      where: { id: sessionId, userId: authUser.userId },
    });
 
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete session error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
 