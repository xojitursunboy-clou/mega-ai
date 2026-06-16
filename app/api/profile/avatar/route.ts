import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'Rasm kerak' }, { status: 400 });

    const supabase = createAdminClient();
    const buffer = Buffer.from(imageBase64, 'base64');
    const ext = mimeType?.includes('png') ? 'png' : 'jpg';
    const fileName = `avatars/${authUser.userId}.${ext}`;

    const { error } = await supabase.storage
      .from('ai-images')
      .upload(fileName, buffer, {
        contentType: mimeType || 'image/jpeg',
        upsert: true,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('ai-images').getPublicUrl(fileName);
    const avatarUrl = data.publicUrl + '?t=' + Date.now();

    await prisma.user.update({
      where: { id: authUser.userId },
      data: { avatarUrl },
    });

    return NextResponse.json({ success: true, avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return NextResponse.json({ error: 'Rasm yuklanmadi' }, { status: 500 });
  }
}