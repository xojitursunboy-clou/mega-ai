'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import { useLang } from '@/hooks/useLang';
import { t } from '@/lib/i18n';
import { Upload, MessageSquare, Sparkles, Download, Check } from 'lucide-react';

const stepIcons = [Upload, MessageSquare, Sparkles, Download];

export default function HomePage() {
  const { lang } = useLang();
  const tr = t(lang);

  const handleBuyPlan = (planType: string) => {
    const planLabel = planType === 'monthly' ? tr.pricing.monthly : tr.pricing.yearly;
    const message = encodeURIComponent(
      `Salom. MegaAI uchun tarif sotib olmoqchiman.\nUsername: ...\nTarif: ${planLabel}`
    );
    window.open(`https://t.me/polatov_776?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-600 bg-opacity-10 border border-primary-600 border-opacity-30 rounded-full px-4 py-1.5 mb-8">
          <Sparkles size={14} className="text-primary-400" />
          <span className="text-primary-400 text-sm font-medium">AI-Powered Image Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in-up leading-tight">
          {tr.hero.title}
          <br />
          <span className="gradient-text">{tr.hero.titleHighlight}</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
          {tr.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
          <Link href="/register" className="btn-primary text-base py-3 px-8 blue-glow">
            {tr.hero.cta}
          </Link>
          <Link href="/pricing" className="btn-secondary text-base py-3 px-8">
            {tr.hero.pricing}
          </Link>
        </div>

        {/* Before / After */}
        <div className="mt-16 max-w-3xl mx-auto animate-fade-in-up delay-300">
          <div className="card relative overflow-hidden p-3">
            <div className="grid grid-cols-2 gap-3">
              {/* AVVAL */}
              <div className="relative rounded-xl overflow-hidden group" style={{aspectRatio:'16/9'}}>
                <Image
                  src="/images/before.jpg"
                  alt="Avval"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 400px"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  Avval
                </div>
              </div>

              {/* KEYIN */}
              <div className="relative rounded-xl overflow-hidden group" style={{aspectRatio:'16/9'}}>
                <Image
                  src="/images/after.jpg"
                  alt="Keyin"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900 to-transparent opacity-40" />
                <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Sparkles size={10} />
                  Keyin
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs text-center mt-2">
              AI yordamida istalgan rasmni o&apos;zgartiring
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-3">{tr.howItWorks.title}</h2>
          <p className="text-gray-400 text-center mb-12">Oddiy qadamlar, ajoyib natija</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tr.howItWorks.steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={i} className="card hover:border-primary-600 hover:border-opacity-40 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-primary-600 bg-opacity-20 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-primary-400" />
                  </div>
                  <div className="text-xs text-primary-400 font-bold mb-1">{i + 1}.</div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">{tr.pricing.title}</h2>
          <p className="text-gray-400 mb-12">{tr.pricing.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="card text-left hover:border-gray-600 transition-all">
              <div className="text-lg font-bold text-white mb-1">{tr.pricing.monthly}</div>
              <div className="text-3xl font-bold text-white mb-1">{tr.pricing.monthlyPrice}</div>
              <div className="text-gray-500 text-sm mb-5">{tr.pricing.perMonth}</div>
              <ul className="space-y-2 mb-6">
                {tr.pricing.features.monthly.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={14} className="text-primary-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuyPlan('monthly')} className="btn-secondary w-full">
                {tr.pricing.buyBtn}
              </button>
            </div>
            <div className="card text-left border-primary-600 border-opacity-50 relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {tr.pricing.save}
              </div>
              <div className="text-lg font-bold text-white mb-1">{tr.pricing.yearly}</div>
              <div className="text-3xl font-bold gradient-text mb-1">{tr.pricing.yearlyPrice}</div>
              <div className="text-gray-500 text-sm mb-5">{tr.pricing.perYear}</div>
              <ul className="space-y-2 mb-6">
                {tr.pricing.features.yearly.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={14} className="text-primary-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuyPlan('yearly')} className="btn-primary w-full blue-glow">
                {tr.pricing.buyBtn}
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            <a href="https://t.me/polatov_776" target="_blank" rel="noopener noreferrer"
              className="text-primary-400 hover:underline">@polatov_776</a>{' '}
            orqali bog&apos;laning
          </p>
        </div>
      </section>

      <footer className="border-t border-dark-border py-8 text-center text-gray-500 text-sm">
        © 2026 MegaAI. All rights reserved.
      </footer>
    </div>
  );
}
