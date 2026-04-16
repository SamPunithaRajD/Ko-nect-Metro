import React, { useState } from 'react';
import { Train, Ship, Shield, Eye, EyeOff, Lock, Mail, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type RolePreset = {
  email: string;
  password: string;
  role: string;
  description: string;
  icon: React.ElementType;
  color: string;
  textColor: string;
};

const rolePresets: RolePreset[] = [
  {
    email: 'admin@konect.com',
    password: 'admin123',
    role: 'Admin',
    description: 'Full system control — fleet, AI planning, approval',
    icon: Shield,
    color: '#E31E24',
    textColor: '#fff',
  },
  {
    email: 'metro@konect.com',
    password: 'metro123',
    role: 'Metro Employee',
    description: 'Kochi Metro Rail — train operations & status updates',
    icon: Train,
    color: '#0072CE',
    textColor: '#fff',
  },
  {
    email: 'water@konect.com',
    password: 'water123',
    role: 'Water Metro Employee',
    description: 'Water Metro — boat fleet operations & reporting',
    icon: Ship,
    color: '#00897B',
    textColor: '#fff',
  },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (preset: RolePreset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setSelectedPreset(preset.email);
    setError('');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003A8F 50%, #00478c 100%)' }}
    >
      <div className="flex-1 hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 60px,
              rgba(255,255,255,0.3) 60px,
              rgba(255,255,255,0.3) 61px
            ), repeating-linear-gradient(
              0deg,
              transparent,
              transparent 60px,
              rgba(255,255,255,0.3) 60px,
              rgba(255,255,255,0.3) 61px
            )`
          }}
        />
        <div className="relative z-10 text-white max-w-md text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(227,30,36,0.2)', border: '1px solid rgba(227,30,36,0.4)' }}>
              <Train className="w-10 h-10" style={{ color: '#E31E24' }} />
            </div>
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(0,114,206,0.2)', border: '1px solid rgba(0,114,206,0.4)' }}>
              <Ship className="w-10 h-10" style={{ color: '#0072CE' }} />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-3 tracking-tight">KO-NECT</h2>
          <p className="text-lg mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Kochi Metro Rail Ltd.
          </p>
          <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Integrated Operations Control System
          </p>
          <div className="space-y-3 text-left">
            {[
              'Real-time fleet monitoring for 100 vehicles',
              'AI-powered daily operational planning',
              'Role-based access for Admin & Field Staff',
              'Instant plan delivery to employee dashboards',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#0072CE' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[460px] flex items-center justify-center p-6 lg:p-10 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <Train className="w-7 h-7" style={{ color: '#E31E24' }} />
            <Ship className="w-7 h-7" style={{ color: '#0072CE' }} />
            <span className="text-xl font-bold" style={{ color: '#003A8F' }}>KO-NECT</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0d1117' }}>Welcome back</h1>
          <p className="text-sm mb-7" style={{ color: '#666' }}>Sign in to access your operations dashboard</p>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#999' }}>
              Select your role
            </p>
            <div className="space-y-2">
              {rolePresets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.email;
                return (
                  <button
                    key={preset.email}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-150 text-left border"
                    style={{
                      borderColor: isSelected ? preset.color : '#e5e7eb',
                      backgroundColor: isSelected ? `${preset.color}10` : '#fafafa',
                      boxShadow: isSelected ? `0 0 0 1px ${preset.color}40` : 'none',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: preset.color }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold" style={{ color: '#111' }}>{preset.role}</div>
                      <div className="text-xs truncate" style={{ color: '#888' }}>{preset.description}</div>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: preset.color }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#555' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#aaa' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSelectedPreset(null); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm transition-all"
                  style={{ borderColor: '#ddd', outline: 'none', color: '#111' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#003A8F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,58,143,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="your.email@konect.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#555' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#aaa' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm transition-all"
                  style={{ borderColor: '#ddd', outline: 'none', color: '#111' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#003A8F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,58,143,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#aaa' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3.5 py-3 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#003A8F' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#002a6e'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#003A8F'; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to KO-NECT'
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: '#bbb' }}>
            Kochi Metro Rail Ltd. — Secure Operations Platform
          </p>
        </div>
      </div>
    </div>
  );
};
