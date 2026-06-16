import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
 
// Oylik: 3 ta, Yillik: 5 ta
const LIMITS: Record<string, number> = { monthly: 3, yearly: 5 };
 
// Ko'p xilma-xil demo rasmlar
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1024&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&q=80',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1024&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1024&q=80',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1024&q=80',
  'https://images.unsplash.com/photo-1490750967868-88df5691cc4b?w=1024&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1024&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1024&q=80',
  'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1024&q=80',
  'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1024&q=80',
  'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?w=1024&q=80',
  'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=1024&q=80',
];
 
let lastDemoIndex = -1;
 
function getNextDemoImage(): string {
  // Har safar boshqa rasm — ketma-ket emas, tasodifiy lekin oldingi bilan bir xil bo'lmasin
  let idx;
  do {
    idx = Math.floor(Math.random() * DEMO_IMAGES.length);
  } while (idx === lastDemoIndex && DEMO_IMAGES.length > 1);
  lastDemoIndex = idx;
  return DEMO_IMAGES[idx];
}
 
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { subscription: true },
    });
    if (!user) return NextResponse.json({ error: 'User topilmadi' }, { status: 404 });
 
    const sub = user.subscription;
    const isActive = sub && sub.status === 'active' && new Date(sub.endDate) > new Date();
    if (!isActive) return NextResponse.json({ error: 'Tarif faol emas' }, { status: 403 });
 
    // Tarif turiga qarab limit
    const dailyLimit = LIMITS[sub.planType] ?? 3;
 
    const today = format(new Date(), 'yyyy-MM-dd');
    const usage = await prisma.aIUsage.findUnique({
      where: { userId_date: { userId: authUser.userId, date: today } },
    });
    if (usage && usage.count >= dailyLimit) {
      return NextResponse.json({
        error: `Kunlik limit tugadi (${dailyLimit} ta). Ertaga qayta urinib ko'ring.`
      }, { status: 429 });
    }
 
    const { prompt, mode, imageBase64 } = await req.json();
    if (!prompt && !imageBase64) {
      return NextResponse.json({ error: 'Prompt yoki rasm kerak' }, { status: 400 });
    }
 
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
 
    let imageUrl: string;
    const hasOpenAI = process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== 'your_openai_api_key' &&
      process.env.OPENAI_API_KEY.startsWith('sk-');
 
    if (hasOpenAI) {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      let openaiUrl: string | null = null;
 
      if (imageBase64 && mode !== 'generate') {
        const buf = Buffer.from(imageBase64, 'base64');
        const file = new File([buf], 'image.png', { type: 'image/png' });
        const res = await openai.images.edit({
          model: 'dall-e-2', image: file,
          prompt: finalPrompt, n: 1, size: '1024x1024',
        });
        openaiUrl = res.data?.[0]?.url ?? null;
      } else {
        const res = await openai.images.generate({
          model: 'dall-e-3', prompt: finalPrompt,
          n: 1, size: '1024x1024', quality: 'standard',
        });
        openaiUrl = res.data?.[0]?.url ?? null;
      }
 
      if (!openaiUrl) throw new Error('OpenAI rasmni qaytarmadi');
      imageUrl = openaiUrl;
    } else {
      await new Promise(r => setTimeout(r, 1200));
      imageUrl = getNextDemoImage();
    }
 
    await prisma.aIUsage.upsert({
      where: { userId_date: { userId: authUser.userId, date: today } },
      update: { count: { increment: 1 } },
      create: { userId: authUser.userId, date: today, count: 1 },
    });
 
    return NextResponse.json({
      success: true,
      imageUrl,
      message: hasOpenAI ? 'Rasm muvaffaqiyatli yaratildi!' : '✅ Demo rasm',
    });
 
  } catch (err: unknown) {
    console.error('AI generate error:', err);
    const message = err instanceof Error ? err.message : 'Xatolik yuz berdi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
 