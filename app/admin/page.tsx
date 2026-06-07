'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Users, BarChart2, LogOut, Shield, Search, Loader2, RefreshCw, Ban, CheckCircle, Trash2, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface UserRow {
  id: string;
  username: string;
  isBlocked: boolean;
  createdAt: string;
  subscription?: { planType: string; startDate: string; endDate: string; status: string } | null;
}

interface Stats {
  totalUsers: number; activeUsers: number; monthlyUsers: number;
  yearlyUsers: number; todayNew: number; totalImages: number;
}

const DEFAULT_STATS: Stats = { totalUsers:0, activeUsers:0, monthlyUsers:0, yearlyUsers:0, todayNew:0, totalImages:0 };
type TabType = 'dashboard' | 'users' | 'blocked';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [search, setSearch] = useState('');
  const [blockedSearch, setBlockedSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ur, sr] = await Promise.all([fetch('/api/admin/users'), fetch('/api/admin/stats')]);
      if (ur.status === 401) { router.push('/admin/login'); return; }
      const ud = await ur.json().catch(() => ({ users: [] }));
      const sd = await sr.json().catch(() => DEFAULT_STATS);
      setUsers(Array.isArray(ud.users) ? ud.users : []);
      setStats({
        totalUsers: Number(sd.totalUsers??0), activeUsers: Number(sd.activeUsers??0),
        monthlyUsers: Number(sd.monthlyUsers??0), yearlyUsers: Number(sd.yearlyUsers??0),
        todayNew: Number(sd.todayNew??0), totalImages: Number(sd.totalImages??0),
      });
    } catch { toast.error("Yuklanmadi"); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(userId + action);
    try {
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Xatolik');
      const labels: Record<string,string> = {
        monthly:'✅ Oylik tarif berildi', yearly:'✅ Yillik tarif berildi',
        cancel:'❌ Tarif bekor qilindi', block:'🚫 Bloklandi', unblock:'✅ Blok olib tashlandi',
      };
      toast.success(labels[action] || 'OK');
      loadData();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Xatolik'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`"${username}" ni o'chirishni tasdiqlaysizmi?`)) return;
    setActionLoading(userId + 'delete');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Xatolik');
      toast.success("✅ Foydalanuvchi o'chirildi");
      loadData();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Xatolik'); }
    finally { setActionLoading(null); }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    router.push('/admin/login');
  };

  const isActive = (u: UserRow) => {
    const s = u.subscription;
    return s && s.status === 'active' && new Date(s.endDate) > new Date();
  };

  const activeUsers = users.filter(u => !u.isBlocked);
  const blockedUsers = users.filter(u => u.isBlocked);

  const filteredUsers = activeUsers.filter(u => {
    const match = u.username.toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    if (filter === 'active') return isActive(u);
    if (filter === 'inactive') return !isActive(u);
    return true;
  });

  const filteredBlocked = blockedUsers.filter(u =>
    u.username.toLowerCase().includes(blockedSearch.toLowerCase())
  );

  const statCards = [
    { label: 'Jami foydalanuvchilar', value: stats.totalUsers,   color: 'text-blue-400',   bg: 'bg-blue-500' },
    { label: 'Faol foydalanuvchilar', value: stats.activeUsers,  color: 'text-green-400',  bg: 'bg-green-500' },
    { label: 'Oylik tarifli',         value: stats.monthlyUsers, color: 'text-purple-400', bg: 'bg-purple-500' },
    { label: 'Yillik tarifli',        value: stats.yearlyUsers,  color: 'text-orange-400', bg: 'bg-orange-500' },
    { label: 'Bugungi yangi',         value: stats.todayNew,     color: 'text-cyan-400',   bg: 'bg-cyan-500' },
    { label: 'Jami rasm yaratilgan',  value: stats.totalImages,  color: 'text-pink-400',   bg: 'bg-pink-500' },
  ];

  const navItems = [
    { id: 'dashboard' as TabType, icon: BarChart2, label: 'Dashboard' },
    { id: 'users'     as TabType, icon: Users,     label: 'Foydalanuvchilar' },
    { id: 'blocked'   as TabType, icon: Ban,       label: `Bloklangan (${blockedUsers.length})` },
  ];

  const ActionBtn = ({ label, onClick, color, icon: Icon, userId, action }:
    { label:string; onClick:()=>void; color:string; icon?:React.ElementType; userId:string; action:string }) => (
    <button onClick={onClick} disabled={!!actionLoading}
      className={`text-xs px-2 py-1 rounded flex items-center gap-0.5 transition-all disabled:opacity-40 ${color}`}>
      {actionLoading === userId+action
        ? <Loader2 size={9} className="animate-spin" />
        : Icon ? <Icon size={9} /> : null}
      {label}
    </button>
  );

  const Sidebar = () => (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-dark-card border-r border-dark-border flex flex-col
      transform transition-transform duration-200
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:relative lg:translate-x-0 lg:flex
    `}>
      <div className="p-5 border-b border-dark-border flex items-center justify-between">
        <div>
          <Logo />
          <div className="mt-1 flex items-center gap-1.5">
            <Shield size={11} className="text-primary-400" />
            <span className="text-primary-400 text-xs font-medium">Admin Panel</span>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
            className={`sidebar-item ${activeTab === id ? 'sidebar-item-active' : ''}`}>
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-dark-border">
        <button onClick={handleLogout} className="sidebar-item text-red-400 hover:bg-red-500 hover:bg-opacity-10">
          <LogOut size={18} />
          <span className="text-sm font-medium">Chiqish</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-dark-border bg-dark-card sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <Logo size="sm" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
                <button onClick={loadData} className="btn-secondary text-sm py-2 px-3 gap-1.5">
                  <RefreshCw size={14} />
                  <span className="hidden sm:inline">Yangilash</span>
                </button>
              </div>
              {loading
                ? <div className="flex items-center justify-center h-40"><Loader2 size={28} className="animate-spin text-primary-400" /></div>
                : <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {statCards.map(({ label, value, color, bg }) => (
                      <div key={label} className="card">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${bg} bg-opacity-20 flex items-center justify-center mb-2 sm:mb-3`}>
                          <BarChart2 size={14} className={color} />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
                        <div className="text-gray-400 text-xs">{label}</div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Foydalanuvchilar</h1>
                <button onClick={loadData} className="btn-secondary text-sm py-2 px-3 gap-1.5">
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" className="input-field pl-9" placeholder="Username..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {[{ val:'all',label:'Barchasi' },{ val:'active',label:'Faol' },{ val:'inactive',label:'Faol emas' }].map(({val,label}) => (
                    <button key={val} onClick={() => setFilter(val)}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        filter===val ? 'bg-primary-600 text-white' : 'bg-dark-50 text-gray-400 border border-dark-border hover:text-gray-200'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>

              {loading
                ? <div className="flex items-center justify-center h-40"><Loader2 size={28} className="animate-spin text-primary-400" /></div>
                : <div className="card overflow-x-auto p-0">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-dark-border">
                          {['#','Username','Sana','Tarif','Boshlanish','Tugash','Status','Amallar'].map(h=>(
                            <th key={h} className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {filteredUsers.map((u,i) => (
                          <tr key={u.id} className="hover:bg-dark-hover transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-gray-500">{i+1}</td>
                            <td className="px-3 sm:px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary-600 bg-opacity-20 flex items-center justify-center text-xs font-bold text-primary-400 uppercase shrink-0">
                                  {u.username[0]}
                                </div>
                                <span className="text-white font-medium">{u.username}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-gray-400 whitespace-nowrap">{format(new Date(u.createdAt),'dd.MM.yy')}</td>
                            <td className="px-3 sm:px-4 py-3 text-gray-300 whitespace-nowrap">
                              {u.subscription?.planType==='monthly'?'Oylik':u.subscription?.planType==='yearly'?'Yillik':<span className="text-gray-600">—</span>}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-gray-400 whitespace-nowrap">
                              {u.subscription?.startDate ? format(new Date(u.subscription.startDate),'dd.MM.yy') : '—'}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-gray-400 whitespace-nowrap">
                              {u.subscription?.endDate ? format(new Date(u.subscription.endDate),'dd.MM.yy') : '—'}
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              {isActive(u) ? <span className="status-badge-active">Faol</span> : <span className="status-badge-inactive">Faol emas</span>}
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                <ActionBtn label="Oylik" userId={u.id} action="monthly" color="bg-blue-600 bg-opacity-20 text-blue-400 hover:bg-opacity-40" onClick={()=>handleAction(u.id,'monthly')} />
                                <ActionBtn label="Yillik" userId={u.id} action="yearly" color="bg-purple-600 bg-opacity-20 text-purple-400 hover:bg-opacity-40" onClick={()=>handleAction(u.id,'yearly')} />
                                <ActionBtn label="Bekor" userId={u.id} action="cancel" color="bg-orange-600 bg-opacity-20 text-orange-400 hover:bg-opacity-40" onClick={()=>handleAction(u.id,'cancel')} />
                                <ActionBtn label="Blok" icon={Ban} userId={u.id} action="block" color="bg-red-600 bg-opacity-20 text-red-400 hover:bg-opacity-40" onClick={()=>handleAction(u.id,'block')} />
                                <button onClick={()=>handleDelete(u.id,u.username)} disabled={!!actionLoading}
                                  className="text-xs px-2 py-1 rounded bg-gray-600 bg-opacity-20 text-gray-400 hover:bg-opacity-40 flex items-center gap-0.5 disabled:opacity-40">
                                  {actionLoading===u.id+'delete' ? <Loader2 size={9} className="animate-spin" /> : <Trash2 size={9} />} O'chir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length===0 && <div className="text-center py-10 text-gray-500">Foydalanuvchi topilmadi</div>}
                    <div className="px-4 py-2 border-t border-dark-border text-xs text-gray-500">Jami: {filteredUsers.length} ta</div>
                  </div>
              }
            </div>
          )}

          {/* BLOCKED */}
          {activeTab === 'blocked' && (
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Bloklangan foydalanuvchilar</h1>
                <button onClick={loadData} className="btn-secondary text-sm py-2 px-3"><RefreshCw size={14} /></button>
              </div>

              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" className="input-field pl-9" placeholder="Username qidirish..."
                  value={blockedSearch} onChange={e => setBlockedSearch(e.target.value)} />
              </div>

              {loading
                ? <div className="flex items-center justify-center h-40"><Loader2 size={28} className="animate-spin text-primary-400" /></div>
                : <div className="card overflow-x-auto p-0">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-dark-border">
                          {['#','Username','Sana','Tarif','Status','Amallar'].map(h=>(
                            <th key={h} className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {filteredBlocked.map((u,i) => (
                          <tr key={u.id} className="hover:bg-dark-hover transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-gray-500">{i+1}</td>
                            <td className="px-3 sm:px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 bg-opacity-20 flex items-center justify-center text-xs font-bold text-red-400 uppercase shrink-0">
                                  {u.username[0]}
                                </div>
                                <span className="text-white font-medium">{u.username}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-gray-400 whitespace-nowrap">{format(new Date(u.createdAt),'dd.MM.yy')}</td>
                            <td className="px-3 sm:px-4 py-3 text-gray-300">
                              {u.subscription?.planType==='monthly'?'Oylik':u.subscription?.planType==='yearly'?'Yillik':<span className="text-gray-600">—</span>}
                            </td>
                            <td className="px-3 sm:px-4 py-3"><span className="status-badge-inactive">Bloklangan</span></td>
                            <td className="px-3 sm:px-4 py-3">
                              <div className="flex gap-1">
                                <ActionBtn label="Blokdan chiqar" icon={CheckCircle} userId={u.id} action="unblock"
                                  color="bg-green-600 bg-opacity-20 text-green-400 hover:bg-opacity-40" onClick={()=>handleAction(u.id,'unblock')} />
                                <button onClick={()=>handleDelete(u.id,u.username)} disabled={!!actionLoading}
                                  className="text-xs px-2 py-1 rounded bg-gray-600 bg-opacity-20 text-gray-400 hover:bg-opacity-40 flex items-center gap-0.5 disabled:opacity-40">
                                  {actionLoading===u.id+'delete' ? <Loader2 size={9} className="animate-spin" /> : <Trash2 size={9} />} O'chir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredBlocked.length===0 && <div className="text-center py-10 text-gray-500">Bloklangan foydalanuvchi yo'q</div>}
                    <div className="px-4 py-2 border-t border-dark-border text-xs text-gray-500">Jami: {filteredBlocked.length} ta</div>
                  </div>
              }
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
