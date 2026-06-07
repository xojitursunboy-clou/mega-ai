'use client';

import { useLang } from '@/hooks/useLang';
import { Language } from '@/lib/i18n';

const langs: Language[] = ['uz', 'en', 'ru'];

export default function LangSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 bg-dark-50 border border-dark-border rounded-lg p-1">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`lang-btn ${lang === l ? 'lang-btn-active' : 'lang-btn-inactive'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
