'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/components/layout/AppSidebar';
import { Lock, Check, ExternalLink } from 'lucide-react';

export default function SubscriptionInactivePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return; }
      if (d.blocked) { router.push('/login'); return; }
      setUsername(d.user.username);
      if (d.user.hasActiveSub) { router.push('/chat'); return; }
    });
  }, [router]);

  const handleBuy = () => {
    const message = encodeURIComponent(
      `Salom. MegaAI uchun tarif sotib olmoqchiman.\nUsername: ${username}\nTarif: Oylik`
    );
    window.open(`https://t.me/polatov_776?text=${message}`, '_blank');
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar username={username} />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
              <Lock size={40} className="text-primary-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Tarif faollashtirilmagan</h1>
            <p className="text-gray-400">AI imkoniyatlaridan foydalanish uchun tarif xarid qiling.</p>
          </div>
          <div className="card text-left">
            <div className="text-gray-400 text-sm mb-1">Oylik tarif</div>
            <div className="text-2xl font-bold text-white mb-4">
              99 000 so&apos;m <span className="text-gray-500 text-base font-normal">/ oy</span>
            </div>
            <ul className="space-y-2 mb-5">
              {['Kuniga 3 ta rasm yaratish','Rasm tahrirlash','AI chat yordamchisi','Yuqori sifatli natijalar'].map((f,i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={14} className="text-primary-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button onClick={handleBuy} className="btn-primary w-full blue-glow">
              <ExternalLink size={15} />
              Telegram orqali bog&apos;lanish
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            To&apos;lov qilgach admin sizga tarifni yoqadi va chat ishlaydi.
          </p>
        </div>
      </main>
    </div>
  );
}
