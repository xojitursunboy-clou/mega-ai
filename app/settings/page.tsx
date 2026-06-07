'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/components/layout/AppSidebar';
import LangSwitcher from '@/components/ui/LangSwitcher';
import { useLang } from '@/hooks/useLang';
import { t } from '@/lib/i18n';
import { Eye, EyeOff, Loader2, Globe, Lock, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { lang } = useLang();
  const tr = t(lang);
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return; }
      setUsername(d.user.username);
    });
  }, [router]);

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Please fill all fields'); return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match'); return;
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Parol muvaffaqiyatli o\'zgartirildi!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar username={username} />

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-xl mx-auto space-y-5">
          <h1 className="text-2xl font-bold text-white">{tr.settings.title}</h1>

          {/* Language */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-primary-400" />
              <h2 className="font-semibold text-white">{tr.settings.language}</h2>
            </div>
            <LangSwitcher />
          </div>

          {/* Change password */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-primary-400" />
              <h2 className="font-semibold text-white">{tr.settings.changePassword}</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tr.settings.currentPassword}</label>
                <div className="relative">
                  <input
                    type={showPass.current ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowPass(s => ({ ...s, current: !s.current }))}
                  >
                    {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tr.settings.newPassword}</label>
                <div className="relative">
                  <input
                    type={showPass.new ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={passwords.new}
                    onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowPass(s => ({ ...s, new: !s.new }))}
                  >
                    {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tr.settings.confirmNewPassword}</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                />
              </div>
            </div>

            <button onClick={handleChangePassword} disabled={loading} className="btn-primary mt-4">
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {tr.settings.save}
            </button>
          </div>

          {/* Logout */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <LogOut size={18} className="text-red-400" />
              <h2 className="font-semibold text-white">{tr.settings.logout}</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Hisobingizdan chiqib ketish</p>
            <button onClick={handleLogout} className="btn-secondary border-red-500 border-opacity-30 text-red-400 hover:bg-red-500 hover:bg-opacity-10">
              {tr.settings.logout}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
