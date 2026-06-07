'use client';

import AppSidebar from '@/components/layout/AppSidebar';
import { useLang } from '@/hooks/useLang';
import { t } from '@/lib/i18n';
import { Check, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PricingPage() {
  const { lang } = useLang();
  const tr = t(lang);
  const [username, setUsername] = useState('');
  const [activePlan, setActivePlan] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) {
        setUsername(d.user.username);
        setActivePlan(d.user.subscription?.planType || null);
      }
    });
  }, []);

  const handleBuyPlan = (planType: string) => {
    const planLabel = planType === 'monthly' ? tr.pricing.monthly : tr.pricing.yearly;
    const message = encodeURIComponent(
      `Salom. MegaAI uchun tarif sotib olmoqchiman.\nUsername: ${username || '...'}\nTarif: ${planLabel}`
    );
    window.open(`https://t.me/polatov_776?text=${message}`, '_blank');
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar username={username} />

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">{tr.pricing.title}</h1>
            <p className="text-gray-400 mt-1">{tr.pricing.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly */}
            <div className={`card relative ${activePlan === 'monthly' ? 'border-primary-600' : ''}`}>
              {activePlan === 'monthly' && (
                <div className="absolute top-3 right-3 bg-green-500 bg-opacity-20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">Faol</div>
              )}
              <h3 className="text-lg font-bold text-white mb-1">{tr.pricing.monthly}</h3>
              <div className="text-3xl font-bold text-white">{tr.pricing.monthlyPrice}</div>
              <div className="text-gray-500 text-sm mb-6">{tr.pricing.perMonth}</div>
              <ul className="space-y-2.5 mb-6">
                {tr.pricing.features.monthly.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check size={15} className="text-primary-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuyPlan('monthly')} className="btn-secondary w-full">
                <ExternalLink size={15} />
                {tr.pricing.buyBtn}
              </button>
            </div>

            {/* Yearly */}
            <div className={`card relative overflow-hidden ${activePlan === 'yearly' ? 'border-primary-600' : 'border-primary-600 border-opacity-40'}`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-400" />
              {activePlan === 'yearly' ? (
                <div className="absolute top-3 right-3 bg-green-500 bg-opacity-20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">Faol</div>
              ) : (
                <div className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tr.pricing.save}</div>
              )}
              <h3 className="text-lg font-bold text-white mb-1">{tr.pricing.yearly}</h3>
              <div className="text-3xl font-bold gradient-text">{tr.pricing.yearlyPrice}</div>
              <div className="text-gray-500 text-sm mb-6">{tr.pricing.perYear}</div>
              <ul className="space-y-2.5 mb-6">
                {tr.pricing.features.yearly.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check size={15} className="text-primary-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuyPlan('yearly')} className="btn-primary w-full blue-glow">
                <ExternalLink size={15} />
                {tr.pricing.buyBtn}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Tarif sotib olish uchun Telegram orqali bog'laning:{' '}
            <a href="https://t.me/polatov_776" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              @polatov_776
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
