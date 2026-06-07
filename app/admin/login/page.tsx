'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', code: '' });
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.code) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      router.push('/admin');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex flex-col">
      <div className="p-4 sm:p-6">
        <Logo />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="card space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 bg-opacity-10 border border-primary-600 border-opacity-30 flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Admin panelga kirish</h2>
              <p className="text-gray-500 text-sm mt-1">Faqat adminlar uchun</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Username</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Admin username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Admin kod</label>
                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Kod kiriting"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading} className="btn-primary w-full blue-glow">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={16} />}
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
