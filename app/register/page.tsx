'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import LangSwitcher from '@/components/ui/LangSwitcher';
import { useLang } from '@/hooks/useLang';
import { t } from '@/lib/i18n';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { lang } = useLang();
  const tr = t(lang);
  const router = useRouter();

  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.confirmPassword) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (form.username.length < 3) {
      toast.error('Username kamida 3 ta harf bo\'lsin');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Parollar mos kelmadi');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Parol kamida 6 ta belgi bo\'lsin');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
      toast.success("Ro'yxatdan o'tildi!");
      router.push('/chat');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex flex-col">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <Logo />
        <LangSwitcher />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="card space-y-4">
            <div className="text-center mb-2">
              <div className="flex justify-center mb-3">
                <Logo size="lg" href={undefined as unknown as string} />
              </div>
              <h2 className="text-xl font-bold text-white">Yangi hisob yarating</h2>
              <p className="text-gray-400 text-sm mt-1">Username va parol bilan kiring</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tr.auth.username}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="masalan: ali123"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tr.auth.password}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Kamida 6 ta belgi"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tr.auth.confirmPassword}</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Parolni qayta kiriting"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full blue-glow">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Ro'yxatdan o'tilmoqda..." : tr.auth.register}
            </button>

            <p className="text-center text-sm text-gray-400">
              {tr.auth.hasAccount}{' '}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                {tr.auth.loginLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
