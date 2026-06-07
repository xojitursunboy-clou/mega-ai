'use client';

import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LangSwitcher from '@/components/ui/LangSwitcher';
import { useLang } from '@/hooks/useLang';
import { t } from '@/lib/i18n';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { lang } = useLang();
  const tr = t(lang);
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-dark-border bg-dark-300 bg-opacity-95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-gray-100 text-sm transition-colors">{tr.nav.home}</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-gray-100 text-sm transition-colors">{tr.nav.pricing}</Link>
            <Link href="/#how" className="text-gray-400 hover:text-gray-100 text-sm transition-colors">{tr.nav.howItWorks}</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LangSwitcher />
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">{tr.nav.login}</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">{tr.nav.register}</Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-400 hover:text-gray-100" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-2 border-t border-dark-border pt-4">
            <Link href="/" className="block px-3 py-2 text-gray-400 hover:text-gray-100 text-sm" onClick={() => setOpen(false)}>{tr.nav.home}</Link>
            <Link href="/pricing" className="block px-3 py-2 text-gray-400 hover:text-gray-100 text-sm" onClick={() => setOpen(false)}>{tr.nav.pricing}</Link>
            <Link href="/#how" className="block px-3 py-2 text-gray-400 hover:text-gray-100 text-sm" onClick={() => setOpen(false)}>{tr.nav.howItWorks}</Link>
            <div className="flex items-center gap-3 px-3 pt-2">
              <LangSwitcher />
              <Link href="/login" className="btn-secondary text-sm py-2 px-4 flex-1 text-center" onClick={() => setOpen(false)}>{tr.nav.login}</Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4 flex-1 text-center" onClick={() => setOpen(false)}>{tr.nav.register}</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
