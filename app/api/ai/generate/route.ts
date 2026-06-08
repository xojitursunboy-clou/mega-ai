import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

const DAILY_LIMIT = 3;

// Demo rasmlar - OpenAI API yo'q bo'lganda ishlating
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1024&q=80',
  'https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=1024&q=80',
  'https://images.unsplash.com/photo-1706900954575-f10a8e82a0f6?w=1024&q=80',
  'https://images.unsplash.com/photo-1704727648900-4cf50e0e1de6?w=1024&q=80',
];

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Subscription tekshirish
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { subscription: true },
    });
    if (!user) return NextResponse.json({ error: 'User topilmadi' }, { status: 404 });

    const sub = user.subscription;
    const isActive = sub && sub.status === 'active' && new Date(sub.endDate) > new Date();
    if (!isActive) return NextResponse.json({ error: 'Tarif faol emas' }, { status: 403 });

    // Kunlik limit tekshirish
    const today = format(new Date(), 'yyyy-MM-dd');
    const usage = await prisma.aIUsage.findUnique({
      where: { userId_date: { userId: authUser.userId, date: today } },
    });
    if (usage && usage.count >= DAILY_LIMIT) {
      return NextResponse.json({ error: 'Kunlik limit tugadi. Ertaga qayta urinib ko\'ring.' }, { status: 429 });
    }

    const { prompt, mode, imageBase64 } = await req.json();
    if (!prompt && !imageBase64) {
      return NextResponse.json({ error: 'Prompt yoki rasm kerak' }, { status: 400 });
    }

    let imageUrl: string;

    // OpenAI API key bor bo'lsa - haqiqiy AI ishlatiladi
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const modePrompts: Record<string, string> = {
        generate: prompt || 'A beautiful digital artwork',
        edit: `Edit this image: ${prompt}`,
        background: `Replace the background with: ${prompt}`,
        style: `Convert to anime style. ${prompt || ''}`.trim(),
        addObject: `Add to this image: ${prompt}`,
        removeObject: `Remove from this image: ${prompt}`,
        logo: `Add a professional logo overlay: ${prompt}`,
        banner: `Create an advertising banner: ${prompt}`,
      };
      const finalPrompt = modePrompts[mode] || prompt;

      let openaiUrl: string | null = null;

      if (imageBase64 && mode !== 'generate') {
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const imageFile = new File([imageBuffer], 'image.png', { type: 'image/png' });
        const response = await openai.images.edit({
          model: 'dall-e-2',
          image: imageFile,
          prompt: finalPrompt,
          n: 1,
          size: '1024x1024',
        });
       openaiUrl = response.data?.[0]?.url ?? null;
      } else {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: finalPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        });
        openaiUrl = response.data?.[0]?.url ?? null;
      }

      if (!openaiUrl) throw new Error('OpenAI rasmni qaytarmadi');

      // Supabase Storage ga saqla (agar ulangan bo'lsa)
      try {
        const { mirrorImageToStorage } = await import('@/lib/storage');
        imageUrl = await mirrorImageToStorage(openaiUrl, authUser.userId);
      } catch {
        imageUrl = openaiUrl; // fallback: OpenAI URL ishlatiladi
      }

    } else {
      // DEMO MODE — OpenAI API key yo'q, demo rasm qaytariladi
      await new Promise(r => setTimeout(r, 1500)); // 1.5s kutish (real kabi)
      imageUrl = DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];
    }

    // Kunlik foydalanishni yangilash
    await prisma.aIUsage.upsert({
      where: { userId_date: { userId: authUser.userId, date: today } },
      update: { count: { increment: 1 } },
      create: { userId: authUser.userId, date: today, count: 1 },
    });

    const isDemoMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key';
    return NextResponse.json({
      success: true,
      imageUrl,
      message: isDemoMode ? '✅ Demo rasm (OpenAI ulanmagan)' : 'Rasm muvaffaqiyatli yaratildi!',
    });

  } catch (err: unknown) {
    console.error('AI generate error:', err);
    const message = err instanceof Error ? err.message : 'Xatolik yuz berdi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
