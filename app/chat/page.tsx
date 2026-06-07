'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/components/layout/AppSidebar';
import { Send, Upload, X, Sparkles, Image as ImageIcon, Loader2, Download, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

const AI_MODES = ['generate','edit','background','style','addObject','removeObject','logo','banner'] as const;
type AIMode = typeof AI_MODES[number];

const MODE_LABELS: Record<AIMode, string> = {
  generate:     'Rasm yaratish',
  edit:         'Rasm tahrirlash',
  background:   'Fon almashtirish',
  style:        'Anime style',
  addObject:    "Ob'ekt qo'shish",
  removeObject: "Ob'ekt o'chirish",
  logo:         "Logo qo'shish",
  banner:       'Banner yaratish',
};

export default function ChatPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<AIMode>('generate');
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; preview: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ used: number; remaining: number; limit: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return; }
      if (d.blocked) { router.push('/login'); return; }
      setUsername(d.user.username);
      if (!d.user.hasActiveSub) { router.push('/subscription-inactive'); return; }
    });
  }, [router]);

  const loadUsage = useCallback(async () => {
    const res = await fetch('/api/ai/usage');
    if (res.ok) {
      const data = await res.json();
      setUsageInfo(data);
      setLimitReached(data.remaining === 0);
    }
  }, []);

  useEffect(() => { loadUsage(); }, [loadUsage]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Faqat rasm fayl yuklang'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Rasm 10MB dan kichik bo\'lsin'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedImage({ base64: result.split(',')[1], preview: result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !uploadedImage) || loading) return;
    if (limitReached) { toast.error('Kunlik limit tugadi. Ertaga qayta urinib ko\'ring.'); return; }

    const userMsg: Message = {
      role: 'user',
      content: input.trim(),
      imageUrl: uploadedImage?.preview,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const currentInput = input.trim();
    const currentImage = uploadedImage;
    setInput('');
    setUploadedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, mode: selectedMode, imageBase64: currentImage?.base64 }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setLimitReached(true);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Kunlik limit tugadi. Ertaga qayta urinib ko\'ring.', timestamp: new Date() }]);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Xatolik');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Rasm tayyor!',
        imageUrl: data.imageUrl,
        timestamp: new Date(),
      }]);
      loadUsage();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      toast.error(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${msg}`, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar username={username} />

      <main className="flex-1 flex flex-col" style={{ height: '100vh' }}>
        {/* Header */}
        <div className="border-b border-dark-border px-5 py-3 flex items-center justify-between bg-dark-card shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-primary-400" />
            <span className="font-semibold text-white text-sm">AI Image Assistant</span>
          </div>
          <div className="flex items-center gap-3">
            {usageInfo && (
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
                usageInfo.remaining === 0
                  ? 'border-red-500 border-opacity-40 bg-red-500 bg-opacity-10 text-red-400'
                  : 'border-dark-border bg-dark-50 text-gray-400'
              }`}>
                <ImageIcon size={11} />
                {usageInfo.remaining}/{usageInfo.limit} qoldi
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs py-1.5 px-3">
              <Upload size={13} /> Rasm yuklash
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Mode chips */}
        <div className="border-b border-dark-border px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
          {AI_MODES.map(mode => (
            <button key={mode} onClick={() => setSelectedMode(mode)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedMode === mode ? 'bg-primary-600 text-white' : 'bg-dark-50 text-gray-400 hover:text-gray-200 border border-dark-border'
              }`}>
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll p-5 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center select-none">
              <div className="w-20 h-20 rounded-2xl bg-primary-600 bg-opacity-10 border border-primary-600 border-opacity-20 flex items-center justify-center mb-5">
                <ImageIcon size={32} className="text-primary-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">AI Image Assistant</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Rasm yaratish, tahrirlash yoki fon almashtirish uchun buyruq yozing.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 max-w-xs">
                {["Ko'k dengiz ustida quyosh botishi","Kelajak shahri, neon ranglar","Abstract art, minimal","Anime style portret"].map(ex => (
                  <button key={ex} onClick={() => setInput(ex)}
                    className="text-left text-xs p-2.5 rounded-lg bg-dark-50 border border-dark-border text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0 mt-auto">
                  <Sparkles size={14} className="text-white" />
                </div>
              )}
              <div className={`flex flex-col gap-2 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.imageUrl && msg.role === 'user' && (
                  <img src={msg.imageUrl} alt="Uploaded" className="rounded-xl max-w-xs max-h-48 object-cover border border-dark-border" />
                )}
                {msg.imageUrl && msg.role === 'assistant' && (
                  <div className="relative group">
                    <img src={msg.imageUrl} alt="Generated" className="rounded-xl max-w-sm w-full object-cover" />
                    <a href={msg.imageUrl} download="megaai.png" target="_blank" rel="noopener noreferrer"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-60 rounded-lg p-1.5">
                      <Download size={14} className="text-white" />
                    </a>
                  </div>
                )}
                {msg.content && (
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-dark-card border border-dark-border text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-dark-card border border-dark-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2.5">
                <Loader2 size={14} className="animate-spin text-primary-400" />
                <span className="text-gray-400 text-sm">AI rasm yaratmoqda...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-dark-border p-4 bg-dark-card shrink-0">
          {limitReached && (
            <div className="mb-3 flex items-center gap-2 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <span className="text-red-400 text-xs">Kunlik limit tugadi. Ertaga qayta urinib ko&apos;ring.</span>
            </div>
          )}
          {uploadedImage && (
            <div className="mb-3 flex items-center gap-2">
              <div className="relative">
                <img src={uploadedImage.preview} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-dark-border" />
                <button onClick={() => setUploadedImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <X size={9} className="text-white" />
                </button>
              </div>
              <span className="text-gray-500 text-xs">Rasm yuklandi</span>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-10 h-10 rounded-xl bg-dark-50 border border-dark-border text-gray-400 hover:text-gray-200 flex items-center justify-center transition-all">
              <Upload size={16} />
            </button>
            <textarea ref={textareaRef} rows={1}
              className="flex-1 input-field resize-none min-h-[40px] max-h-32 py-2.5 text-sm"
              placeholder={limitReached ? 'Limit tugadi. Ertaga qayta urinib ko\'ring.' : 'Xabar yozing...'}
              value={input} disabled={limitReached}
              onChange={e => { setInput(e.target.value); const ta = e.target; ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 128) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button onClick={handleSend} disabled={loading || limitReached || (!input.trim() && !uploadedImage)}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                loading || limitReached || (!input.trim() && !uploadedImage)
                  ? 'bg-dark-50 border border-dark-border text-gray-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white blue-glow'
              }`}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
