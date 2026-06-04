import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Type, ArrowLeft, Eye, EyeOff, Sparkles, Terminal } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: (token: string, user: any) => void;
  initialPlan?: 'Free' | 'Lite' | 'Pro';
}

export default function LoginPage({ onNavigate, onLoginSuccess, initialPlan = 'Free' }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister
      ? { email, display_name: displayName, username, password }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem');
      }

      setSuccess(data.message || 'Berhasil masuk');

      // If registered with initialPlan set, let's automatically simulated upgrade!
      let token = data.token;
      let user = data.user;

      if (isRegister && initialPlan !== 'Free') {
        const upgradeResponse = await fetch('/api/subscription/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ plan: initialPlan }),
        });
        if (upgradeResponse.ok) {
          const upgradeData = await upgradeResponse.json();
          user = upgradeData.user;
        }
      }

      setTimeout(() => {
        onLoginSuccess(token, user);
      }, 800);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper method to trigger fast login for easy evaluation in preview
  const handleQuickDemoSession = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    // If login fails directly, it means the user does not exist in db.json.
    // Try to register them first to guarantee it works out-of-the-box!
    try {
      // Attempt login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      let data = await loginRes.json();

      // If login failed owing to email don't exist, auto-register!
      if (!loginRes.ok) {
        const usernameDemo = demoEmail.split('@')[0];
        const dispNameDemo = usernameDemo.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: demoEmail,
            display_name: dispNameDemo,
            username: usernameDemo,
            password: demoPass
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          throw new Error(regData.error || 'Gagal registrasi akun demo');
        }

        // Auto-upgrade if we want 'andi_lite' or 'budi_pro'
        let demoToken = regData.token;
        let demoUser = regData.user;

        if (usernameDemo.includes('lite')) {
          const upgradeRes = await fetch('/api/subscription/upgrade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${demoToken}`
            },
            body: JSON.stringify({ plan: 'Lite' }),
          });
          if (upgradeRes.ok) {
            const upData = await upgradeRes.json();
            demoUser = upData.user;
          }
        } else if (usernameDemo.includes('pro')) {
          const upgradeRes = await fetch('/api/subscription/upgrade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${demoToken}`
            },
            body: JSON.stringify({ plan: 'Pro' }),
          });
          if (upgradeRes.ok) {
            const upData = await upgradeRes.json();
            demoUser = upData.user;
          }
        }

        setSuccess('Registrasi dan login otomatis akun demo berhasil');
        setTimeout(() => {
          onLoginSuccess(demoToken, demoUser);
        }, 800);
        return;
      }

      setSuccess('Login otomatis berhasil');
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
      }, 800);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col md:flex-row">
      
      {/* Left side: branding & details */}
      <div className="md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative z-10">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-12"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Landing Page
          </button>

          <div className="space-y-6 max-w-md">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-md">D</div>
            <h1 className="font-sans font-extrabold text-3xl leading-tight text-white mb-2">
              Satu Bio Link Untuk Semua Promosi Affiliate Anda
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Bergabunglah dengan ribuan affiliate marketer profesional di Dunnak yang telah berhasil menghemat waktu dan memantau performa klik produk mereka secara langsung.
            </p>
          </div>
        </div>

        {/* Dynamic quote or credential indicator */}
        <div className="relative z-10 border-t border-slate-800 pt-8 mt-12">
          <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AKUN DEMO EVALUASI CEPAT
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Klik salah satu akun di bawah ini untuk menguji batasan paket (Free: 5 produk, Lite: 50 produk, Pro: unlimited) seketika tanpa input formulir:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleQuickDemoSession('andi_free@dunnak.com', 'pass123')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-2.5 rounded-lg text-left transition-all outline-none"
              >
                <p className="font-bold text-[11px] text-white">Andi Free</p>
                <p className="text-[10px] text-slate-400">Free • Limit 5</p>
              </button>
              <button
                onClick={() => handleQuickDemoSession('bambang_lite@dunnak.com', 'pass123')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-2.5 rounded-lg text-left transition-all outline-none"
              >
                <p className="font-bold text-[11px] text-white">Bambang Lite</p>
                <p className="text-[10px] text-slate-400">Lite • Limit 50</p>
              </button>
              <button
                onClick={() => handleQuickDemoSession('citra_pro@dunnak.com', 'pass123')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-2.5 rounded-lg text-left transition-all outline-none"
              >
                <p className="font-bold text-[11px] text-white">Citra Pro</p>
                <p className="text-[10px] text-slate-400">Pro • Unlimited</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login / Register Form */}
      <div className="md:w-1/2 p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900">
              {isRegister ? 'Buat Akun Dunnak' : 'Masuk ke Dashboard'}
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              {isRegister
                ? 'Kelola produk affiliate Anda sekarang secara tersentral'
                : 'Selamat datang kembali, masukkan detail akun Anda'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-xl border border-red-100 animate-shake">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 text-xs font-semibold p-4 rounded-xl border border-green-100">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Tampilan</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Type className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Andi Affiliate"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Username Bio Link</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <UserIcon className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: andi"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Halaman Anda akan beralamat di: <span className="font-bold text-brand-700">/u/{username || 'username'}</span>
                  </p>
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Alamat Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 rounded-xl py-3 pl-11 pr-11 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 outline-none"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 active:scale-95 duration-200"
            >
              {loading ? 'Sabar, sedang diproses...' : isRegister ? 'Setuju & Buat Akun' : 'Masuk Dashboard'}
            </button>
          </form>

          {/* Toggle form handler */}
          <div className="text-center pt-4 border-t border-slate-200/50">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccess(null);
                setIsRegister(!isRegister);
              }}
              className="text-xs text-indigo-600 font-bold hover:underline outline-none"
            >
              {isRegister
                ? 'Sudah punya akun? Masuk di sini'
                : 'Belum punya akun? Registrasi gratis sekarang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
