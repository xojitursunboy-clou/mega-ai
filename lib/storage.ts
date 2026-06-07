import { createAdminClient } from './supabase';

const BUCKET = 'ai-images';

/**
 * Upload a base64 image to Supabase Storage and return its public URL.
 */
export async function uploadImageToStorage(
  base64: string,
  userId: string,
  mimeType: string = 'image/png'
): Promise<string> {
  const supabase = createAdminClient();
  const buffer = Buffer.from(base64, 'base64');
  const fileName = `${userId}/${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

/**
 * Download a remote image URL and upload it to Supabase Storage.
 * Useful for saving OpenAI DALL·E result URLs (they expire after 1 hour).
 */
export async function mirrorImageToStorage(
  remoteUrl: string,
  userId: string
): Promise<string> {
  const response = await fetch(remoteUrl);
  if (!response.ok) throw new Error('Failed to fetch remote image');
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return uploadImageToStorage(base64, userId, 'image/png');
}
