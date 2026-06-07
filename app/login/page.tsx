'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LangSwitcher from '@/components/ui/LangSwitcher';
import { useLang } from '@/hooks/useLang';
import { t } from '@/lib/i18n';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { lang } = useLang();
  const tr = t(lang);
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) { toast.error("To'ldiring"); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');
      toast.success('Xush kelibsiz!');
      window.location.href = '/chat';
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex flex-col">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <Logo /><LangSwitcher />
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="card space-y-5">
            <div className="text-center mb-2">
              <div className="flex justify-center mb-3">
                <Logo size="lg" href={undefined as unknown as string} />
              </div>
              <h2 className="text-xl font-bold text-white">Hisobingizga kiring</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tr.auth.username}</label>
                <input type="text" className="input-field" placeholder="Username kiriting"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoComplete="username" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tr.auth.password}</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                    placeholder="Parol kiriting" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full blue-glow">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Kirish...' : tr.auth.login}
            </button>
            <p className="text-center text-sm text-gray-400">
              {tr.auth.noAccount}{' '}
              <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                {tr.auth.registerLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
