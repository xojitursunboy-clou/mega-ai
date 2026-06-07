'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '@/components/ui/Logo';
import LangSwitcher from '@/components/ui/LangSwitcher';
import { useLang } from '@/hooks/useLang';
import { t } from '@/lib/i18n';
import { MessageSquare, CreditCard, User, Settings, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppSidebar({ username }: { username?: string }) {
  const { lang } = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = [
    { href: '/chat',                  icon: MessageSquare, label: tr.sidebar.chat },
    { href: '/pricing',               icon: CreditCard,   label: tr.sidebar.subscription },
    { href: '/profile',               icon: User,         label: tr.sidebar.profile },
    { href: '/settings',              icon: Settings,     label: tr.sidebar.settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      toast.error('Xatolik');
    }
  };

  const nav = (
    <>
      <div className="p-5 border-b border-dark-border flex items-center justify-between">
        <Logo />
        <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <button key={href} onClick={() => { router.push(href); setOpen(false); }}
              className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}>
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-dark-border space-y-3">
        <LangSwitcher />
        {username && (
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {username[0]}
            </div>
            <p className="text-xs font-medium text-gray-200 truncate">{username}</p>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-item text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10">
          <LogOut size={18} />
          <span className="text-sm font-medium">{tr.sidebar.logout}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-dark-card border-b border-dark-border">
        <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white">
          <Menu size={20} />
        </button>
        <Logo size="sm" />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile sidebar drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-dark-card border-r border-dark-border flex flex-col
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:w-64 lg:min-h-screen
      `}>
        {nav}
      </aside>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14 w-full shrink-0" />
    </>
  );
}
