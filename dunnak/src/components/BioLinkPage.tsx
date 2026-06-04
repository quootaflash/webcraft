import React, { useEffect, useState } from 'react';
import { ProductLink, User } from '../types.js';
import { ExternalLink, ShoppingBag, Terminal, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface BioData {
  user: {
    display_name: string;
    username: string;
    subscription_plan: string;
  };
  products: ProductLink[];
}

export default function BioLinkPage({ username }: { username: string }) {
  const [data, setData] = useState<BioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBio() {
      try {
        const res = await fetch(`/api/bio/${username}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gagal memuat halaman bio link');
        }
        const parsed = await res.json();
        setData(parsed);
      } catch (e: any) {
        setError(e.message || 'Halaman bio link tidak ditemukan');
      } finally {
        setLoading(false);
      }
    }
    fetchBio();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat halaman bio...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Halaman Tidak Ditemukan</h1>
          <p className="text-slate-600 mb-6">{error || 'Halaman bio link ini belum didaftarkan atau telah dihapus.'}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white font-medium rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const initials = data.user.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Header Branding */}
        <div className="flex justify-center mb-8">
          <a href="/" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full hover:shadow-sm transition-all">
            <span className="text-xs text-slate-500">Dibuat dengan</span>
            <span className="text-xs font-bold text-brand-700">Dunnak</span>
          </a>
        </div>

        {/* User Card */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-brand-700 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white mx-auto mb-4 hover:scale-105 transition-transform duration-300">
            {initials}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
            {data.user.display_name}
            {data.user.subscription_plan !== 'Free' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                PRO
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 font-medium">@{data.user.username}</p>
          <p className="text-xs text-slate-400 mt-1">Recommending genuine, tested products</p>
        </div>

        {/* Affiliate Link Items */}
        <div className="space-y-4">
          {data.products.length === 0 ? (
            <div className="bg-white/60 backdrop-blur border border-dashed border-slate-200 p-8 rounded-2xl text-center">
              <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Pengguna belum menambahkan produk apapun.</p>
            </div>
          ) : (
            data.products.map((prod) => (
              <a
                key={prod.id}
                id={`bio_prod_${prod.id}`}
                href={`/api/r/${prod.id}`}
                target="_blank"
                rel="noreferrer"
                className="group block bg-white hover:bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-800 group-hover:text-brand-800 transition-colors">
                      {prod.title}
                    </h3>
                    {prod.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {prod.description}
                      </p>
                    )}
                  </div>
                  <div className="w-9 h-9 bg-brand-50 text-brand-700 group-hover:bg-brand-700 group-hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Small Footer */}
        <div className="text-center text-slate-400 text-xs mt-12 py-4">
          <p className="font-semibold text-slate-500">Dunnak &copy; 2026</p>
          <p className="text-[10px] text-slate-400 mt-1">Platform Bio-Link Khusus Affiliate Marketer</p>
        </div>
      </div>
    </div>
  );
}
