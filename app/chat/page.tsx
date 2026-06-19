'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/components/layout/AppSidebar';
import {
  Send, Upload, X, Sparkles, ImageIcon,
  Loader2, Download, AlertCircle, Plus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface Session {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; preview: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ used: number; remaining: number; limit: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return; }
      if (d.blocked) { router.push('/login'); return; }
      setUsername(d.user.username);
      setAvatarUrl(d.user.avatarUrl || null);
      if (!d.user.hasActiveSub) { router.push('/subscription-inactive'); return; }
    });
  }, [router]);

  const loadSessions = useCallback(async () => {
    const res = await fetch('/api/chat/sessions');
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions || []);
      if (!data.sessions || data.sessions.length === 0) {
        const newId = await createNewSession();
        if (newId) setActiveSessionId(newId);
      } else {
        setActiveSessionId(prev => prev || data.sessions[0].id);
      }
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  useEffect(() => {
    if (!activeSessionId) return;
    setMessages([]);
    fetch(`/api/chat/messages?sessionId=${activeSessionId}`)
      .then(r => r.json())
      .then(d => { if (d.messages) setMessages(d.messages); });
  }, [activeSessionId]);

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

  const createNewSession = async (): Promise<string | null> => {
    const res = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Yangi chat' }),
    });
    if (res.ok) {
      const data = await res.json();
      setSessions(prev => [data.session, ...prev]);
      setActiveSessionId(data.session.id);
      setMessages([]);
      return data.session.id;
    }
    return null;
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bu chatni o'chirasizmi?")) return;
    await fetch('/api/chat/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      if (remaining.length > 0) setActiveSessionId(remaining[0].id);
      else await createNewSession();
    }
  };

  const saveMessage = async (role: string, content: string, imageUrl?: string) => {
    if (!activeSessionId) return;
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: activeSessionId, role, content, imageUrl, mode: 'generate' }),
    });
    if (role === 'user') {
      const shortTitle = content.length > 35 ? content.substring(0, 35) + '...' : content;
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? { ...s, title: s.title === 'Yangi chat' ? shortTitle : s.title, updatedAt: new Date().toISOString() }
          : s
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Faqat rasm fayl yuklang'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Rasm 10MB dan kichik bo'lsin"); return; }
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
    if (limitReached) { toast.error("Kunlik limit tugadi. Ertaga qayta urinib ko'ring."); return; }

    let sessionId = activeSessionId;
    if (!sessionId) { sessionId = await createNewSession(); }
    if (!sessionId) return;

    const mode = uploadedImage ? 'edit' : 'generate';

    const userMsg: Message = { role: 'user', content: input.trim(), imageUrl: uploadedImage?.preview };
    setMessages(prev => [...prev, userMsg]);
    await saveMessage('user', userMsg.content, userMsg.imageUrl);

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
        body: JSON.stringify({ prompt: currentInput, mode, imageBase64: currentImage?.base64 }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setLimitReached(true);
        const errMsg = data.error || 'Kunlik limit tugadi.';
        setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
        await saveMessage('assistant', errMsg);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Xatolik');

      const assistantMsg: Message = { role: 'assistant', content: data.message || 'Rasm tayyor!', imageUrl: data.imageUrl };
      setMessages(prev => [...prev, assistantMsg]);
      await saveMessage('assistant', assistantMsg.content, assistantMsg.imageUrl);
      loadUsage();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      toast.error(msg);
      const errMsg: Message = { role: 'assistant', content: `❌ ${msg}` };
      setMessages(prev => [...prev, errMsg]);
      await saveMessage('assistant', errMsg.content);
    } finally {
      setLoading(false);
    }
  }; 



  return (
    <div className="flex min-h-screen relative">
      <AppSidebar
        username={username}
        avatarUrl={avatarUrl}
        onHistoryClick={() => setHistoryOpen(true)}
      />

      {/* Chat history drawer - Claude/ChatGPT uslubida */}
      {historyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50" onClick={() => setHistoryOpen(false)}>
          <div className="absolute inset-y-0 left-0 lg:left-64 w-72 bg-dark-card border-r border-dark-border flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <span className="font-semibold text-white text-sm">Chat tarixi</span>
              <button onClick={async () => { await createNewSession(); setHistoryOpen(false); }}
                className="w-7 h-7 rounded-lg bg-primary-600 bg-opacity-20 text-primary-400 hover:bg-opacity-40 flex items-center justify-center transition-all">
                <Plus size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.length === 0 ? (
                <div className="text-center text-gray-600 text-xs py-6">Chat yo&apos;q</div>
              ) : (
                sessions.map(s => (
                  <div key={s.id}
                    onClick={() => { setActiveSessionId(s.id); setHistoryOpen(false); }}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                      activeSessionId === s.id
                        ? 'bg-primary-600 bg-opacity-20 border border-primary-600 border-opacity-30'
                        : 'hover:bg-dark-hover'
                    }`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${activeSessionId === s.id ? 'text-white' : 'text-gray-300'}`}>
                        {s.title}
                      </p>
                    </div>
                    <button onClick={(e) => deleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0" style={{ height: '100vh' }}>
        {/* Header */}
        <div className="border-b border-dark-border px-4 py-3 flex items-center justify-between bg-dark-card shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary-400" />
            <span className="font-semibold text-white text-sm">AI Image Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            {usageInfo && (
              <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
                usageInfo.remaining === 0
                  ? 'border-red-500 border-opacity-40 bg-red-500 bg-opacity-10 text-red-400'
                  : 'border-dark-border bg-dark-50 text-gray-400'
              }`}>
                <ImageIcon size={10} />
                {usageInfo.remaining}/{usageInfo.limit}
              </div>
            )}
            <button onClick={() => createNewSession()} className="btn-secondary text-xs py-1.5 px-3 gap-1">
              <Plus size={13} /> Yangi
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs py-1.5 px-3 gap-1">
              <Upload size={13} /> Rasm
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center select-none">
              <div className="w-20 h-20 rounded-2xl bg-primary-600 bg-opacity-10 border border-primary-600 border-opacity-20 flex items-center justify-center mb-4">
                <ImageIcon size={32} className="text-primary-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">AI Image Assistant</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-5">
                Nima xohlasangiz, oddiy o&apos;z so&apos;zlaringiz bilan yozing — rasm yaratish, tahrirlash, fon almashtirish va h.k.
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                {[
                  "Ko'k dengiz ustida quyosh",
                  "Kelajak shahri, neon ranglar",
                  "Muzqaymoq rasmi",
                  "Anime style portret",
                ].map(ex => (
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
              <div className="bg-dark-card border border-dark-border rounded-2xl px-4 py-3 flex items-center gap-2.5">
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
              placeholder={limitReached ? 'Limit tugadi...' : 'Xabar yozing...'}
              value={input} disabled={limitReached}
              onChange={e => {
                setInput(e.target.value);
                const ta = e.target;
                ta.style.height = 'auto';
                ta.style.height = Math.min(ta.scrollHeight, 128) + 'px';
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button onClick={handleSend}
              disabled={loading || limitReached || (!input.trim() && !uploadedImage)}
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