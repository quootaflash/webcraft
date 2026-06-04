import React, { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown, Award, TrendingUp, ShieldAlert, Palette, HelpCircle, Link as LinkIcon, Laptop } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onSelectPlanAndStart?: (plan: 'Free' | 'Lite' | 'Pro') => void;
}

export default function LandingPage({ onNavigate, onSelectPlanAndStart }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const pricingPlans = [
    {
      name: 'Free',
      price: 'Rp 0',
      period: 'selamanya',
      limit: 'Maks. 5 Produk',
      features: [
        'Maksimal 5 produk affiliate',
        'Statistik klik dasar',
        '1 Halaman Bio Link',
        'Tema Standar Dunnak',
      ],
      planKey: 'Free' as const,
      isPopular: false,
      ctaText: 'Mulai Gratis',
      color: 'slate',
    },
    {
      name: 'Lite',
      price: 'Rp 49.000',
      period: '/ bulan',
      limit: 'Maks. 50 Produk',
      features: [
        'Maksimal 50 produk affiliate',
        'Statistik klik dasar',
        '1 Halaman Bio Link',
        'Prioritas Muat Cepat',
        'Dukungan Email 24/7',
      ],
      planKey: 'Lite' as const,
      isPopular: true,
      ctaText: 'Pilih Lite',
      color: 'brand',
    },
    {
      name: 'Pro',
      price: 'Rp 149.000',
      period: '/ bulan',
      limit: 'Tanpa Batas Produk',
      features: [
        'Produk affiliate tanpa batas',
        'Statistik klik dasar',
        'Hingga 3 Bio Link terpisah',
        'Prioritas Muat Cepat',
        'Akses Fitur Premium Baru',
        'Dukungan Prioritas Utama',
      ],
      planKey: 'Pro' as const,
      isPopular: false,
      ctaText: 'Pilih Pro',
      color: 'brand-deep',
    },
  ];

  const faqs = [
    {
      q: 'Apa itu Dunnak?',
      a: 'Dunnak adalah platform bio link khusus bagi affiliate marketer untuk mengelola semua link promosi produk mereka ke dalam satu halaman profesional sehingga meningkatkan performa konversi konvensional.',
    },
    {
      q: 'Apakah bisa digunakan gratis?',
      a: 'Tentu saja! Paket Free gratis untuk selamanya dengan batas kapasitas hingga 5 produk affiliate, 1 bio link dan statistik klik dasar.',
    },
    {
      q: 'Bagaimana cara upgrade paket?',
      a: 'Anda bisa melakukan uji coba dan meningkatkan paket kapan saja secara langsung dari halaman "Langganan" yang berada di Dashboard Anda secara instan.',
    },
    {
      q: 'Apakah mendukung semua marketplace affiliate?',
      a: 'Ya, Dunnak mendukung link affiliate dari semua platform marketplace online populer di Indonesia maupun dunia seperti Shopee, Tokopedia, Lazada, Blibli, Amazon, Tik Tok Shop, dsb.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] selection:bg-brand-600/10">
      {/* Top Navbar */}
      <nav id="landing_nav" className="fixed top-0 w-full z-50 bg-[#f7f9fb]/85 backdrop-blur-md border-b border-brand-200/40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-10 h-10 bg-brand-700 text-white rounded-xl flex items-center justify-center font-black shadow-md shadow-brand-700/20">
              D
            </div>
            <span className="font-sans font-extrabold text-xl tracking-tight text-neutral-900">Dunnak</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">Fitur</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">Harga Paket</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">FAQ</a>
          </div>

          {/* Action Call */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/login')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-700 transition-colors px-4 py-2"
            >
              Masuk
            </button>
            <button
              onClick={() => onNavigate('/login')}
              className="bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow shadow-brand-700/10 transition-all active:scale-95 duration-200"
            >
              Uji Coba Sekarang
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-tr from-brand-50/10 via-[#f7f9fb] to-brand-100/40">
        {/* Ambient background lights */}
        <div className="absolute top-1/4 -left-28 w-96 h-96 bg-brand-300/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-100/60 border border-brand-200 rounded-full text-brand-800 font-semibold text-xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Solusi Produktivitas Affiliate Terbaik
            </div>
            
            <h1 className="font-sans font-extrabold text-[40px] md:text-[54px] text-slate-950 leading-none tracking-tight">
              Bangun Bio Link Affiliate yang <span className="text-brand-700">Fokus Menghasilkan</span> Penjualan
            </h1>

            <p className="text-slate-600 text-base md:text-lg max-w-2xl leading-relaxed">
              Kelola semua link affiliate Anda dalam satu halaman profesional dan pantau performanya dengan mudah. Dunnak dirancang khusus untuk meningkatkan rasio klik-tayang produk promosi Anda.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => onNavigate('/login')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl text-base shadow-lg shadow-brand-700/20 hover:shadow-xl transition-all duration-300 active:scale-95"
              >
                Mulai Gratis Sekarang <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 border border-slate-200/80 hover:bg-white text-slate-700 font-semibold rounded-xl text-base hover:shadow-sm transition-all duration-300"
              >
                Pelajari Fitur
              </a>
            </div>

            {/* Quick trust banner */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60">
              <div>
                <p className="font-extrabold text-2xl text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-medium">Bebas Iklan Pengganggu</p>
              </div>
              <div>
                <p className="font-extrabold text-2xl text-slate-900">Simpel</p>
                <p className="text-xs text-slate-500 font-medium">Mudah Tanpa Coding</p>
              </div>
              <div>
                <p className="font-extrabold text-2xl text-slate-900">Akurat</p>
                <p className="text-xs text-slate-500 font-medium">Pelacakan Tiap Detik</p>
              </div>
            </div>
          </div>

          {/* Simulated Display Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/80 backdrop-blur rounded-[32px] p-6 shadow-2xl border border-slate-200/40 relative z-20 hover:scale-[1.01] transition-transform duration-300">
              <div className="w-full bg-slate-100 rounded-2xl h-64 overflow-hidden relative shadow-inner flex flex-col justify-center items-center text-center p-6 border border-slate-200/50">
                <div className="w-16 h-16 bg-brand-700 text-white rounded-full flex items-center justify-center text-xl font-extrabold mb-3 shadow">
                  A
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Andi Affiliate</h4>
                <p className="text-xs text-slate-500 mb-4">@andi</p>
                <div className="w-full space-y-2.5 max-w-sm">
                  <div className="bg-white hover:bg-slate-50 border border-slate-200/80 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 text-left flex justify-between items-center shadow-sm">
                    <span>👟 Sepatu Running Premium</span>
                    <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                  <div className="bg-white hover:bg-slate-50 border border-slate-200/80 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 text-left flex justify-between items-center shadow-sm">
                    <span>💻 Laptop Gaming Ultra</span>
                    <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                </div>
              </div>
              
              {/* Overlay Stat info counter */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800">
                <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Konversi Klik</p>
                  <p className="text-base font-black">+1.245 Klik</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Overview */}
      <section id="features" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-slate-950">
              Dibuat Khusus Untuk Pertumbuhan Anda
            </h2>
            <p className="text-slate-600 text-base">
              Semua fitur penting yang Anda butuhkan untuk mengelola jutaan link affiliate dan melacak performa konversinya berada dalam satu tempat yang sangat rapi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-6">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-3">Kelola Produk Affiliate</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Buat daftar, perbarui info produk, tambahkan tautan rujukan secara cepat. Atur urutan manual sesuai strategi konversi harian Anda.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-3">Statistik Klik</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pantau statistik performa tayangan dan klik tautan untuk mengukur produk mana yang paling disukai calon pembeli.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-3">Dashboard Affiliate</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Satu panel terpusat yang menyajikan total produk, akumulasi klik, sisa batas kuota paket dan detail langganan aktif.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-6">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-3">Bio Link Profesional</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Halaman bio link publik modern berkecepatan tinggi dengan sub-path unik sesuai username personal pilihan Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-slate-950">
              Skema Paket Yang Ekonomis & Transparan
            </h2>
            <p className="text-slate-600 text-base">
              Tidak ada biaya tersembunyi. Mulai gratis dan upgrade saat jumlah produk affiliate dan tautan promosi Anda bertambah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                id={`plan_card_${plan.name.toLowerCase()}`}
                className={`bg-white rounded-[32px] p-8 border ${
                  plan.isPopular
                    ? 'border-brand-700 shadow-xl relative scale-102 ring-4 ring-brand-50'
                    : 'border-slate-200/70 shadow-sm'
                } flex flex-col justify-between`}
              >
                {plan.isPopular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-brand-700 text-white font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-full shadow-md">
                    REKOMENDASI
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{plan.name}</span>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                      {plan.limit}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-sans font-black text-3xl md:text-4xl text-slate-950">{plan.price}</span>
                    <span className="text-slate-500 text-sm font-medium">{plan.period}</span>
                  </div>

                  <hr className="border-slate-100 my-6" />

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-sm font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (onSelectPlanAndStart) {
                      onSelectPlanAndStart(plan.planKey);
                    } else {
                      onNavigate('/login');
                    }
                  }}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 duration-200 outline-none ${
                    plan.isPopular
                      ? 'bg-brand-700 text-white hover:bg-brand-800 shadow shadow-brand-700/10'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-sans font-extrabold text-3xl text-slate-950 flex items-center justify-center gap-2">
              <HelpCircle className="w-8 h-8 text-brand-700" /> Tanya Jawab Umum
            </h2>
            <p className="text-slate-600 text-sm">
              Menjawab segala pertanyaan mendasar tentang cara kerja bio link affiliate Dunnak.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group border border-slate-200 rounded-2xl overflow-hidden hover:border-brand-300 transition-colors duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:text-brand-900 transition-colors"
                >
                  <span className="text-base text-slate-800">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 group-hover:text-brand-700 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/50 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-900 py-20 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
          <h2 className="font-sans font-extrabold text-3xl md:text-4xl leading-tight">
            Tingkatkan Konversi Link Promosi Produk Anda Sekarang
          </h2>
          <p className="text-brand-100 text-base max-w-2xl mx-auto leading-relaxed">
            Mulailah mengelompokkan link affiliate Anda dalam satu halaman premium Dunnak. Proses registrasi sangat cepat, mudah, dan gratis selamanya.
          </p>
          <button
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-900 hover:bg-brand-50 font-extrabold rounded-xl transition-all hover:shadow-lg active:scale-95"
          >
            Mulai Secara Gratis <ArrowRight className="w-5 h-5 text-brand-900" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-slate-950 border-t border-slate-800 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800/60">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-700 text-white rounded-lg flex items-center justify-center font-bold">D</div>
              <span className="font-bold text-lg text-white">Dunnak</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Platform Bio-Link khusus affiliate marketer. Atur semua rujukan promosi dagang online Anda dengan mudah dan rapi.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest mb-4">Fitur Utama</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><a href="#features" className="hover:text-white transition-colors">Kelola Tautan</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Analitik Ringkas</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pilihan Skema Paket</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest mb-4">Dukungan</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><a href="#faq" className="hover:text-white transition-colors">Tanya Jawab (FAQ)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Syarat Ketentuan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest mb-4 font-sans">Dunnak MVP 2026</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Didesain khusus untuk keperluan uji validasi pasar affiliate marketer di Indonesia.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-600">
          &copy; 2026 Dunnak. All rights reserved. Created in modern environment.
        </div>
      </footer>
    </div>
  );
}
