'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/components/layout/AppSidebar';
import { useLang } from '@/hooks/useLang';
import { t } from '@/lib/i18n';
import { User, CreditCard, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface UserData {
  id: string;
  username: string;
  createdAt: string;
  hasActiveSub: boolean;
  subscription?: {
    planType: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}

export default function ProfilePage() {
  const { lang } = useLang();
  const tr = t(lang);
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return; }
      if (d.blocked) { router.push('/login'); return; }
      setUser(d.user);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 spinner rounded-full" />
        </main>
      </div>
    );
  }

  const isActive = user?.hasActiveSub;

  return (
    <div className="flex min-h-screen">
      <AppSidebar username={user?.username} />
      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">{tr.profile.title}</h1>

          <div className="card mb-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-2xl font-bold text-white uppercase">
                {user?.username?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.username}</h2>
                <p className="text-gray-500 text-sm">
                  {user?.createdAt ? format(new Date(user.createdAt), 'dd.MM.yyyy') : ''} dan beri
                </p>
              </div>
            </div>
            <div className="bg-dark-50 rounded-lg p-3 inline-block">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <User size={13} />{tr.profile.username}
              </div>
              <div className="text-white font-medium">{user?.username}</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <CreditCard size={18} className="text-primary-400" />
                Tarif ma&apos;lumotlari
              </h3>
              {isActive
                ? <span className="status-badge-active">{tr.profile.active}</span>
                : <span className="status-badge-inactive">{tr.profile.inactive}</span>}
            </div>

            {user?.subscription ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-dark-50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">{tr.profile.planType}</div>
                  <div className="text-white font-medium">
                    {user.subscription.planType === 'monthly' ? 'Oylik' : 'Yillik'}
                  </div>
                </div>
                <div className="bg-dark-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                    <Calendar size={11} />{tr.profile.startDate}
                  </div>
                  <div className="text-white font-medium">
                    {format(new Date(user.subscription.startDate), 'dd.MM.yyyy')}
                  </div>
                </div>
                <div className="bg-dark-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                    <Calendar size={11} />{tr.profile.endDate}
                  </div>
                  <div className="text-white font-medium">
                    {format(new Date(user.subscription.endDate), 'dd.MM.yyyy')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">Tarif faollashtirilmagan</div>
            )}

            {!isActive && (
              <button onClick={() => router.push('/subscription-inactive')} className="btn-primary mt-4 blue-glow">
                Tarif sotib olish
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
