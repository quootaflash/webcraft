import React, { useEffect, useState } from 'react';
import { User, ProductLink, DashboardStats, SubscriptionPlan } from '../types.js';
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  PlusCircle,
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Save,
  MapPin,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface DashboardProps {
  token: string;
  initialUser: User;
  onLogout: () => void;
}

export default function Dashboard({ token, initialUser, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stats' | 'subscriptions' | 'settings'>('overview');
  const [user, setUser] = useState<User>(initialUser);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<ProductLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Settings form states
  const [setDisplayName, setSetDisplayName] = useState(user.display_name);
  const [setUsenameVal, setSetUsernameVal] = useState(user.username);
  const [setEmailVal, setSetEmailVal] = useState(user.email);
  const [setPassVal, setSetPassVal] = useState('');

  // Copy status
  const [copied, setCopied] = useState(false);

  // Header helpers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Products
      const prRes = await fetch('/api/products', { headers: getAuthHeaders() });
      if (!prRes.ok) throw new Error('Gagal memuat daftar produk');
      const prData = await prRes.json();
      setProducts(prData);

      // Fetch Stats
      const stRes = await fetch('/api/stats', { headers: getAuthHeaders() });
      if (!stRes.ok) throw new Error('Gagal memuat data statistik');
      const stData = await stRes.json();
      setStats(stData);

      // Fetch User (to keep in sync)
      const uRes = await fetch('/api/user/me', { headers: getAuthHeaders() });
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData);
        setSetDisplayName(uData.display_name);
        setSetUsernameVal(uData.username);
        setSetEmailVal(uData.email);
      }

    } catch (e: any) {
      setError(e.message || 'Gagal menyinkronkan data dengan server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Create Product Link
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newTitle.trim() || !newUrl.trim()) {
      setError('Judul Produk dan URL wajib diisi');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newTitle.trim(),
          affiliate_url: newUrl.trim(),
          description: newDesc.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan produk');
      }

      setSuccess(data.message || 'Produk ditambahkan!');
      setNewTitle('');
      setNewUrl('');
      setNewDesc('');
      setIsAdding(false);
      await fetchData(); // Refresh details

    } catch (e: any) {
      setError(e.message);
    }
  };

  // Edit Product Link
  const handleStartEdit = (prod: ProductLink) => {
    setEditingId(prod.id);
    setEditTitle(prod.title);
    setEditUrl(prod.affiliate_url);
    setEditDesc(prod.description || '');
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/products/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editTitle.trim(),
          affiliate_url: editUrl.trim(),
          description: editDesc.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui produk');

      setSuccess(data.message || 'Produk diperbarui!');
      setEditingId(null);
      await fetchData();

    } catch (e: any) {
      setError(e.message);
    }
  };

  // Delete Product Link
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk affiliate ini?')) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus produk');

      setSuccess(data.message);
      await fetchData();

    } catch (e: any) {
      setError(e.message);
    }
  };

  // Position re-indexing buttons (Move Up / Down)
  const handleMovePosition = async (index: number, direction: 'up' | 'down') => {
    setError(null);
    setSuccess(null);

    const reorderedList = [...products];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= reorderedList.length) return;

    // Swap elements
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[targetIdx];
    reorderedList[targetIdx] = temp;

    // Build the ordering body payload mapping each ID to its index position
    const payload = reorderedList.map((item, idx) => ({
      id: item.id,
      position: idx
    }));

    try {
      const res = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ordering: payload })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan penyusunan urutan');

      // Update state local for instant UI response, followed by statistical refresh
      setProducts(reorderedList);
      await fetchData();

    } catch (e: any) {
      setError(e.message);
    }
  };

  // Upgrade Plan Simulator
  const handleUpgradeSubscription = async (plan: SubscriptionPlan) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ plan })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal melakukan upgrade');

      setSuccess(data.message);
      setUser(data.user);
      await fetchData();

    } catch (e: any) {
      setError(e.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const body: any = {
        display_name: setDisplayName.trim(),
        username: setUsenameVal.trim().toLowerCase(),
        email: setEmailVal.trim()
      };

      if (setPassVal) {
        body.password = setPassVal;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah pengaturan akun');

      setSuccess(data.message);
      setUser(data.user);
      setSetPassVal('');
      await fetchData();

    } catch (e: any) {
      setError(e.message);
    }
  };

  // Copy Bio link clipboard helper
  const handleCopyToClipboard = () => {
    const pubUrl = `${window.location.origin}/u/${user.username}`;
    navigator.clipboard.writeText(pubUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { key: 'overview' as const, label: 'Dashboard Overview', icon: LayoutDashboard },
    { key: 'products' as const, label: 'Produk Affiliate', icon: ShoppingBag },
    { key: 'stats' as const, label: 'Statistik', icon: BarChart3 },
    { key: 'subscriptions' as const, label: 'Langganan', icon: CreditCard },
    { key: 'settings' as const, label: 'Pengaturan Akun', icon: Settings }
  ];

  const planCapacity = (plan: SubscriptionPlan) => {
    if (plan === 'Free') return '5 produk';
    if (plan === 'Lite') return '50 produk';
    return 'Tanpa Batas';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white text-slate-800 flex flex-col justify-between p-6 shrink-0 z-10 md:sticky md:top-0 md:h-screen border-r border-slate-200">
        <div>
          {/* Sidebar Brand header */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-base shadow-sm">D</div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight uppercase">DUNNAK</span>
            </div>
          </div>

          {/* User Quick Info */}
          <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
              {user.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user.display_name}</p>
              <span className="inline-flex items-center text-[9px] font-bold tracking-wider px-2 py-0.5 mt-0.5 rounded uppercase bg-indigo-50 text-indigo-700">
                Pkt: {user.subscription_plan}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  id={`side_nav_${item.key}`}
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setActiveTab(item.key);
                  }}
                  className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer package indicator & logout */}
        <div className="pt-4 border-t border-slate-100 mt-6 space-y-4">
          <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Paket Aktif</p>
            <p className="font-extrabold text-sm">{user.subscription_plan} Plan</p>
            <div className="w-full bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${user.subscription_plan === 'Free' ? (products.length / 5) * 100 : user.subscription_plan === 'Lite' ? (products.length / 50) * 100 : 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              {products.length}/{user.subscription_plan === 'Free' ? 5 : user.subscription_plan === 'Lite' ? 50 : '∞'} Produk Digunakan
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all text-left outline-none"
          >
            <LogOut className="w-4 h-4" /> Putuskan Keluar
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden bg-slate-50">
        {/* Main Panel Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Banner with Link Copier */}
        <div id="dashboard_branding_banner" className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-900">Dashboard Panel</h1>
            <p className="text-xs text-slate-500 font-medium">Bahas produk & link affiliate siap sebar dalam sekejap</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Direct bio link view */}
            <a
              href={`/u/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Lihat Bio Link <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {/* Quick clipboard copier */}
            <button
              onClick={handleCopyToClipboard}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow shadow-brand-700/10"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Salin URL Bio
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global action feedback status */}
        {error && (
          <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-xl border border-red-100 flex items-start gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-xs font-semibold p-4 rounded-xl border border-green-100 flex items-center justify-between mb-6">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess(null)} className="text-[10px] text-green-600 font-bold hover:underline outline-none">Tutup</button>
          </div>
        )}

        {/* Sync loading status */}
        {loading && !refreshing ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-500 font-medium">Sinkronisasi data platform...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* TAB: Overview Summary */}
            {activeTab === 'overview' && stats && (
              <div id="tab_overview" className="space-y-8 animate-fadeIn">
                
                {/* Stats Widgets Bento block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Total links */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Produk</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalProducts}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">Affiliate Link Terpasang</p>
                  </div>

                  {/* Total clicks */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Klik</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalClicks.toLocaleString('id-ID')}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">Akumulasi Link Terklik</p>
                  </div>

                  {/* Active plan */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Paket Aktif</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{stats.subscriptionPlan}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">
                      Status: <span className="text-green-600 font-extrabold uppercase">AKTIF</span>
                    </p>
                  </div>

                  {/* Product Quota constraint */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    {stats.remainingQuota <= 1 && stats.subscriptionPlan !== 'Pro' && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">LIMIT</div>
                    )}
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sisa Kuota Produk</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">
                      {stats.subscriptionPlan === 'Pro' ? '∞' : stats.remainingQuota}
                    </p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">
                      Batas Maks: {stats.productLimit === Infinity ? 'Unlimited' : `${stats.productLimit} Produk`}
                    </p>
                  </div>
                </div>

                {/* Popular product listing on Overview */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900">🏆 Produk Terpopuler</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Berdasarkan total klik affiliate tertinggi</p>
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="text-slate-400 hover:text-slate-700 outline-none"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {stats.popularProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-400 font-medium">Belum ada statistik klik terekam.</p>
                      <button onClick={() => setActiveTab('products')} className="text-[11px] text-brand-700 font-bold hover:underline mt-2">
                        + Tambahkan Produk Baru
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-4 pt-1">
                      {stats.popularProducts.slice(0, 3).map((prod, idx) => (
                        <div key={prod.id} className="flex justify-between items-center pt-4 first:pt-0">
                          <div className="flex items-center gap-3">
                            <span className="w-5.5 h-5.5 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-extrabold text-slate-500">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-extrabold text-slate-700 truncate max-w-xs">{prod.title}</span>
                          </div>
                          <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
                            {prod.click_count} Klik
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quota warnings alert */}
                {stats.remainingQuota === 0 && stats.subscriptionPlan !== 'Pro' && (
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">Kuota Produk Anda Habis!</h4>
                      <p className="text-xs text-amber-700 mt-1">Anda sudah mencapai batas penyimpanan {stats.productLimit} produk pada paket {stats.subscriptionPlan}.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('subscriptions')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-extrabold transition-all outline-none text-center"
                    >
                      Tingkatkan Paket Langganan
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Affiliate Link Module */}
            {activeTab === 'products' && (
              <div id="tab_products" className="space-y-6 animate-fadeIn">
                
                {/* Module title and CTA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Kelola Produk & Bio Link</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Pasang, edit, hapus, dan atur urutan link rujukan Anda. Berkapasitas {planCapacity(user.subscription_plan)}.
                    </p>
                  </div>
                  {/* Create product form trigger overlay */}
                  {!isAdding && stats && (stats.remainingQuota > 0 || stats.subscriptionPlan === 'Pro') && (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all outline-none shrink-0"
                    >
                      <PlusCircle className="w-4 h-4" /> Pasang Produk Baru
                    </button>
                  )}
                </div>

                {/* Quota empty warning when trying to add */}
                {stats && stats.remainingQuota === 0 && stats.subscriptionPlan !== 'Pro' && (
                  <div className="bg-amber-50 text-amber-800 text-xs font-bold p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                    <span>⚠️ Batas produk paket {user.subscription_plan} tercapai. Silakan hapus produk lama atau upgrade paket Anda.</span>
                    <button onClick={() => setActiveTab('subscriptions')} className="text-brand-700 hover:underline">Upgrade</button>
                  </div>
                )}

                {/* Add product expandable form */}
                {isAdding && (
                  <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900">Pasang Produk Baru</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Judul Produk *</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Contoh: Sepatu Running Premium"
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-slate-800 focus:border-brand-700 transition-all placeholder:text-slate-400"
                        />
                      </div>

                      {/* URL */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">URL Affiliate *</label>
                        <input
                          type="url"
                          required
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="https://shope.ee/..."
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-slate-800 focus:border-brand-700 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Deskripsi Singkat (Opsional)</label>
                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Detail ukuran sepatu, diskon 30%, link garansi, dsb..."
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-slate-800 focus:border-brand-700 h-20 resize-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex gap-2.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all outline-none"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4.5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all outline-none"
                      >
                        Pasang Produk
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit inline product overlay editor or full map */}
                {products.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200/60 shadow-sm text-center">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-extrabold text-slate-800">Belum ada produk affiliate.</p>
                    <p className="text-xs text-slate-400 mt-1">Tambahkan link affiliate pertama Anda secara gratis!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((prod, idx) => {
                      const isEditing = editingId === prod.id;
                      return (
                        <div
                          key={prod.id}
                          className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all"
                        >
                          {isEditing ? (
                            <form onSubmit={handleUpdateProduct} className="flex-1 space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mengedit: {prod.title}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500">Judul Produk</label>
                                  <input
                                    type="text"
                                    required
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500">URL Affiliate</label>
                                  <input
                                    type="url"
                                    required
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold outline-none"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">Deskripsi Singkat (Opsional)</label>
                                <textarea
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium h-12"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold rounded-lg outline-none"
                                >
                                  Batal
                                </button>
                                <button
                                  type="submit"
                                  className="px-3.5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-extrabold rounded-lg outline-none"
                                >
                                  Simpan
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-slate-400 font-bold tracking-wider uppercase bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                                    Pos {idx + 1}
                                  </span>
                                  <h3 className="text-sm font-black text-slate-800 truncate max-w-sm">{prod.title}</h3>
                                </div>
                                {prod.description ? (
                                  <p className="text-xs text-slate-500 line-clamp-2 md:max-w-xl pr-4">{prod.description}</p>
                                ) : (
                                  <p className="text-xs text-slate-300 italic font-medium pr-4">Tidak ada deskripsi</p>
                                )}
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline max-w-sm break-all truncate">
                                  {prod.affiliate_url}
                                </span>
                              </div>

                              {/* Actions container with move elements and edit deleting */}
                              <div className="flex items-center gap-2 border-t border-slate-100 md:border-t-0 pt-3.5 md:pt-0">
                                {/* Position adjusting buttons */}
                                <div className="flex items-center gap-1 border-r border-slate-100 pr-3.5 mr-1 bg-slate-50 p-1.5 rounded-xl shrink-0">
                                  <button
                                    onClick={() => handleMovePosition(idx, 'up')}
                                    disabled={idx === 0}
                                    title="Naikkan Posisi"
                                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors cursor-pointer outline-none"
                                  >
                                    <ChevronUp className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => handleMovePosition(idx, 'down')}
                                    disabled={idx === products.length - 1}
                                    title="Turunkan Posisi"
                                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors cursor-pointer outline-none"
                                  >
                                    <ChevronDown className="w-4.5 h-4.5" />
                                  </button>
                                </div>

                                {/* Edit details button */}
                                <button
                                  onClick={() => handleStartEdit(prod)}
                                  className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all cursor-pointer outline-none"
                                  title="Edit Produk"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                {/* Delete button */}
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all cursor-pointer outline-none"
                                  title="Hapus Produk"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Statistics Module */}
            {activeTab === 'stats' && stats && (
              <div id="tab_stats" className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Analitik & Statistik Klik</h2>
                  <p className="text-xs text-slate-500 font-medium">Lacak jumlah konversi tayangan ke taptap tautan produk secara langsung.</p>
                </div>

                {/* Aggregation clicks card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Klik Seluruh Produk</span>
                    <h3 className="text-4xl font-black text-slate-900 mt-1">{stats.totalClicks.toLocaleString('id-ID')} Clicks</h3>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all outline-none"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Sinkronkan Statistik
                  </button>
                </div>

                {/* Per-product detailing graph bars */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Klik Per Produk Affiliate</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Teratur dan diurutkan berdasarkan performa klik terbanyak</p>
                  </div>

                  {stats.popularProducts.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">Belum ada tayangan produk terklik untuk dianalisa.</div>
                  ) : (
                    <div className="space-y-4">
                      {stats.popularProducts.map((prod) => {
                        const totalClicks = stats.totalClicks;
                        // Calculate percentage with fallback
                        const percentage = totalClicks > 0 ? (prod.click_count / totalClicks) * 100 : 0;
                        return (
                          <div key={prod.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-slate-700 truncate max-w-sm">{prod.title}</span>
                              <span className="font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                {prod.click_count} Klik ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            {/* Graphical representation slider */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-brand-700 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(3, percentage)}%` }} // Minimum widths so it remains visible
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Subscription module */}
            {activeTab === 'subscriptions' && stats && (
              <div id="tab_subscriptions" className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Langganan Paket & Batas Kuota</h2>
                  <p className="text-xs text-slate-500 font-medium">Manajemen paket limitasi produk affiliate Anda saat promosi berkembang.</p>
                </div>

                {/* Active subscription summary */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Sistem Paket Aktif</p>
                    <p className="text-xl font-black text-brand-700 mt-1">{stats.subscriptionPlan}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Status Hak Paket</p>
                    <span className="inline-flex text-[10px] font-bold px-2 py-0.5 mt-1 bg-green-50 text-green-700 rounded uppercase">
                      Active
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Kapasitas Produk</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-1">
                      {stats.productLimit === Infinity ? 'Tanpa Batas' : `${stats.productLimit} Produk maksimal`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Masa Kadaluarsa</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      {new Date(stats.expiredAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Plan upgrade triggers */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 mb-4">Tingkatkan Performa Dengan Paket Premium</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Simulator option */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Free</h4>
                        <p className="text-2xl font-black text-slate-900 mt-1">Rp 0</p>
                        <p className="text-[10px] text-slate-400 mt-1">Sesuai pendaftaran awal</p>
                        <ul className="space-y-2 mt-4 text-xs font-medium text-slate-500">
                          <li>• Maksimal 5 produk affiliate</li>
                          <li>• Tayangan analitik dasar</li>
                          <li>• 1 Bio Link</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handleUpgradeSubscription('Free')}
                        disabled={user.subscription_plan === 'Free'}
                        className="w-full py-2.5 mt-6 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition-all outline-none"
                      >
                        {user.subscription_plan === 'Free' ? 'Paket Terpasang' : 'Turun ke Free'}
                      </button>
                    </div>

                    {/* Lite Premium option */}
                    <div className="bg-white p-6 rounded-2xl border border-brand-500 shadow-sm flex flex-col justify-between relative">
                      <span className="absolute top-0 right-4 px-3 py-1 bg-brand-500 text-white text-[9px] font-bold rounded-b-lg">LITE PRO</span>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Lite</h4>
                        <p className="text-2xl font-black text-brand-700 mt-1">Rp 49K</p>
                        <p className="text-[10px] text-slate-400 mt-1">Ideal untuk pemula</p>
                        <ul className="space-y-2 mt-4 text-xs font-medium text-slate-500">
                          <li>• Maksimal 50 produk affiliate</li>
                          <li>• Tayangan analitik dasar</li>
                          <li>• 1 Bio Link</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handleUpgradeSubscription('Lite')}
                        disabled={user.subscription_plan === 'Lite'}
                        className="w-full py-2.5 mt-6 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all outline-none shadow-sm"
                      >
                        {user.subscription_plan === 'Lite' ? 'Paket Terpasang' : 'Tingkatkan Lite'}
                      </button>
                    </div>

                    {/* Pro option */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Pro Unlimited</h4>
                        <p className="text-2xl font-black text-slate-900 mt-1">Rp 149K</p>
                        <p className="text-[10px] text-slate-400 mt-1">Untuk affiliate kawakan</p>
                        <ul className="space-y-2 mt-4 text-xs font-medium text-slate-500">
                          <li>• Kapasitas produk TANPA BATAS</li>
                          <li>• Tayangan analitik dasar</li>
                          <li>• Hingga 3 Bio Link terpisah</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handleUpgradeSubscription('Pro')}
                        disabled={user.subscription_plan === 'Pro'}
                        className="w-full py-2.5 mt-6 bg-slate-900 hover:bg-slate-950 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all outline-none"
                      >
                        {user.subscription_plan === 'Pro' ? 'Paket Terpasang' : 'Tingkatkan Pro'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Account Settings */}
            {activeTab === 'settings' && (
              <div id="tab_settings" className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Pengaturan Akun & Profil</h2>
                  <p className="text-xs text-slate-500 font-medium">Sesuaikan konfigurasi email, display name, atau ganti password akun Anda.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Tampilan</label>
                      <input
                        type="text"
                        required
                        value={setDisplayName}
                        onChange={(e) => setSetDisplayName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Username Bio Link</label>
                      <input
                        type="text"
                        required
                        value={setUsenameVal}
                        onChange={(e) => setSetUsernameVal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                      />
                      <p className="text-[10px] text-slate-400">
                        Alamat Bio publik halaman Anda: <span className="font-bold text-brand-700">/u/{setUsenameVal}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Utama</label>
                      <input
                        type="email"
                        required
                        value={setEmailVal}
                        onChange={(e) => setSetEmailVal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>

                    {/* Change Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Ubah Password baru (Kosongkan jika tidak diubah)</label>
                      <input
                        type="password"
                        placeholder="******"
                        value={setPassVal}
                        onChange={(e) => setSetPassVal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl transition-all outline-none"
                    >
                      <Save className="w-4 h-4" /> Simpan Perubahan Profil
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Phone Preview Column */}
      <div className="hidden xl:flex w-80 bg-slate-100 border-l border-slate-200 flex-col items-center justify-center p-6 shrink-0 sticky top-0 h-screen">
        <div className="text-center mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pratinjau Live Bio Link</span>
        </div>

        <div className="relative w-full max-w-[240px] aspect-[9/19] bg-white rounded-[2.5rem] border-[6px] border-slate-950 shadow-lg overflow-hidden flex flex-col">
          {/* Notch indicator */}
          <div className="h-3 w-1/3 bg-slate-950 mx-auto rounded-b-lg mb-4 shrink-0"></div>

          {/* Scrollable container */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar text-center">
            {/* Avatar block */}
            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-base shadow-sm">
              {user.display_name.charAt(0).toUpperCase()}
            </div>

            <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">{user.display_name}</h4>
            <p className="text-[8px] text-slate-500 mt-0.5">@{user.username}</p>

            <p className="text-[9px] text-slate-400 mt-2.5 leading-relaxed">
              Curated finds & lifestyle premium products. Klik link rujukan di bawah!
            </p>

            {/* Links preview list */}
            <div className="mt-4 space-y-2">
              {products.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[9px] text-slate-400 font-medium">Belum ada link affiliate.</p>
                </div>
              ) : (
                products.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="w-full py-2 px-3 bg-slate-900 text-white rounded-lg text-[9px] font-medium shadow-sm truncate text-center"
                  >
                    {prod.title}
                  </div>
                ))
              )}
              {products.length > 5 && (
                <p className="text-[8px] text-slate-400 mt-1 font-semibold">+{products.length - 5} Produk Lainnya</p>
              )}
            </div>
          </div>

          {/* Slogan */}
          <div className="mt-auto pb-3 shrink-0 text-center border-t border-slate-50 pt-1.5 bg-white">
            <p className="text-[8px] text-slate-400 tracking-widest uppercase font-bold">POWERED BY DUNNAK</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
