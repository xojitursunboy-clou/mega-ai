import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('megaai_admin')?.value;
    if (!token) return false;
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
