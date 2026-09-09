import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, Shield, HardHat, ChevronRight, Lock, User, Zap, Activity, MapPin, Cpu, BarChart3, Globe, Award } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

const FEATURES = [
  {
    icon: <Activity className="w-5 h-5 text-cat-yellow" />,
    title: 'Real-Time Fleet Telemetry',
    desc: 'Live IoT telemetry tracking across all heavy equipment deployed at Bangalore sites.',
  },
  {
    icon: <Cpu className="w-5 h-5 text-blue-400" />,
    title: 'Explainable AI Decision Support',
    desc: 'AI-powered right-sizing, predictive alerts, and anomaly detection with explainable reasoning.',
  },
  {
    icon: <MapPin className="w-5 h-5 text-cat-success" />,
    title: 'Multi-Site Spatial Intelligence',
    desc: 'Geofenced asset visibility across 6 active Bangalore construction & infrastructure corridors.',
  },
  {
    icon: <Zap className="w-5 h-5 text-cat-warning" />,
    title: 'Priority Action Queue',
    desc: 'Closed-loop human-in-the-loop resolution with before vs after utilization outcome tracking.',
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
    title: 'Demand vs Capacity Analytics',
    desc: 'Live site demand matching, fuel & idle wastage analytics, and fleet efficiency dashboards.',
  },
  {
    icon: <Globe className="w-5 h-5 text-cat-yellow" />,
    title: 'QR-Based Asset Checkout',
    desc: 'Digital operator assignment workflow with QR checkout, AI operator recommendation & mobile portal.',
  },
];

const STATS = [
  { value: '10', label: 'Managed Assets' },
  { value: '6', label: 'Active Sites' },
  { value: '5', label: 'Operators' },
  { value: '24/7', label: 'Live Monitoring' },
];

export const LoginPage: React.FC = () => {
  const { login, loginError, clearLoginError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    return () => clearLoginError();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const ok = login(username, password);
    setIsLoading(false);
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const quickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    clearLoginError();
  };

  return (
    <div className="h-screen w-screen flex ambient-glow-bg relative overflow-hidden">
      <AnimatedBackground />
      {/* Left Info Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-10 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-cat-yellow/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

        {/* Logo & Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img src="/cat-logo.png" alt="Caterpillar CAT Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,184,0,0.5)]" />
            <div>
              <h1 className="text-white font-black text-xl tracking-wider">SMART RENTAL</h1>
              <p className="text-cat-yellow text-xs font-bold tracking-widest uppercase">CONTROL TOWER</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Right Asset.<br />
              Right Site.<br />
              <span className="text-cat-yellow">Right Time.</span>
            </h2>
            <p className="text-cat-muted text-sm leading-relaxed max-w-md">
              An autonomous AI-powered fleet control platform for Caterpillar's heavy equipment rental operations.
              Real-time telemetry, predictive intelligence, and closed-loop action management — all in one view.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {STATS.map((s, i) => (
              <div key={i} className="glass-surface border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-cat-yellow">{s.value}</div>
                <div className="text-[10px] text-cat-muted font-mono mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass-surface border border-white/10 rounded-xl p-3.5 hover:border-white/20 transition-all">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">{f.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-cat-text mb-0.5">{f.title}</div>
                    <div className="text-[10px] text-cat-muted leading-snug">{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-3.5 h-3.5 text-cat-yellow" />
            <span className="text-[11px] text-cat-muted font-mono">Caterpillar Inc. — Internal Fleet Intelligence Platform</span>
          </div>
          <p className="text-[10px] text-cat-muted/60 font-mono">
            Bangalore Operations · Version 1.0 · Powered by Real-Time IoT + Explainable AI
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-white/10 self-stretch my-8" />

      {/* Right Login Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cat-yellow/8 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile-only logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/cat-logo.png" alt="Caterpillar CAT Logo" className="h-14 w-auto object-contain mx-auto mb-3 drop-shadow-[0_0_20px_rgba(255,184,0,0.5)]" />
            <h1 className="text-xl font-black text-white">SMART RENTAL CONTROL TOWER</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-black text-cat-text">Welcome Back</h2>
            <p className="text-cat-muted text-xs font-mono mt-0.5">Sign in to your account to continue</p>
          </div>

          {/* Login Card */}
          <div
            className="glass-card rounded-2xl p-6 border border-white/20 shadow-2xl"
            style={{ animation: shake ? 'shake 0.5s ease-in-out' : undefined }}
          >
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-cat-muted uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cat-muted" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); clearLoginError(); }}
                    placeholder="fleet.manager or rajesh.kumar"
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm text-cat-text placeholder:text-cat-muted/40 focus:outline-none focus:border-cat-yellow/60 transition-all"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-cat-muted uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cat-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearLoginError(); }}
                    placeholder="Enter your password"
                    className="glass-input w-full pl-10 pr-12 py-3 rounded-xl text-sm text-cat-text placeholder:text-cat-muted/40 focus:outline-none focus:border-cat-yellow/60 transition-all"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cat-muted hover:text-cat-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-cat-critical/15 border border-cat-critical/40 rounded-lg px-3 py-2 text-xs text-cat-critical font-medium">
                  ⚠ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cat-yellow hover:bg-yellow-400 disabled:opacity-60 text-black font-extrabold text-sm py-3 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:shadow-[0_0_30px_rgba(255,184,0,0.5)] hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                ) : (
                  <><LogIn className="w-4 h-4" />SIGN IN</>
                )}
              </button>
            </form>
          </div>

          {/* Quick Access */}
          <div className="mt-5 space-y-2">
            <p className="text-[10px] font-mono text-cat-muted uppercase tracking-wider text-center mb-2">Quick Demo Access</p>

            <button
              onClick={() => quickFill('fleet.manager', 'cat@2024')}
              className="w-full glass-surface border border-white/10 hover:border-cat-yellow/50 rounded-xl px-4 py-3 flex items-center justify-between transition-all group hover:bg-cat-yellow/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cat-yellow/20 border border-cat-yellow/40 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cat-yellow" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-cat-text">Fleet Manager</div>
                  <div className="text-[10px] text-cat-muted font-mono">fleet.manager / cat@2024</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-cat-muted group-hover:text-cat-yellow transition-colors" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              {[
                { u: 'rajesh.kumar', p: 'op@1001', name: 'Rajesh Kumar' },
                { u: 'vikram.singh', p: 'op@1002', name: 'Vikram Singh' },
                { u: 'amit.patel', p: 'op@1003', name: 'Amit Patel' },
                { u: 'suresh.deshmukh', p: 'op@1004', name: 'Suresh Deshmukh' },
                { u: 'ganesh.shinde', p: 'op@1005', name: 'Ganesh Shinde' },
              ].map((op) => (
                <button
                  key={op.u}
                  onClick={() => quickFill(op.u, op.p)}
                  className="glass-surface border border-white/10 hover:border-blue-400/50 rounded-xl px-3 py-2.5 flex items-center gap-2 transition-all group hover:bg-blue-500/5 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <HardHat className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[10px] font-bold text-cat-text truncate">{op.name}</div>
                    <div className="text-[9px] text-cat-muted font-mono">Operator</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};
