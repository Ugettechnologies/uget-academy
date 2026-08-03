'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Shield, AlertCircle, Loader2, Key, Check } from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('ugettechnologies@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid Admin or Staff credentials.');
        setLoading(false);
        return;
      }

      const userRole = data.role as string;

      if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
        setError('Unauthorized: This account does not have Admin or Staff portal permissions.');
        setLoading(false);
        return;
      }

      // Fast instant navigation
      const targetPath = userRole === 'ADMIN' ? '/admin' : '/staff';
      window.location.href = targetPath;
    } catch (err) {
      console.error(err);
      setError('An error occurred during authentication. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-[#0F172A] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl text-white">
      {/* Header Logo */}
      <div className="flex flex-col items-center text-center">
        <Logo size="md" showText={false} className="mb-3 justify-center" />
        <h2 className="text-2xl font-black text-white tracking-tight">
          Admin Platform Login
        </h2>
        <p className="mt-1 text-xs text-amber-300 font-mono font-bold uppercase tracking-wider">
          Super Authority & HR Ops Portal
        </p>
      </div>

      {/* Notice Banner */}
      <div className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-4 text-xs text-amber-300 flex items-start gap-3">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Restricted Access Area</p>
          <p className="text-[11px] leading-relaxed text-amber-200">
            Only authorized Super Admin email <strong className="text-white">ugettechnologies@gmail.com</strong> or Admin-provisioned Staff accounts can sign in here.
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-950/40 border border-red-800/60 p-3.5 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
            Admin Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-[#1E293B] px-4 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition text-xs font-mono"
            placeholder="ugettechnologies@gmail.com"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
            Admin Password Code
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-[#1E293B] pl-4 pr-11 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition text-xs font-mono"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 transition select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-white/10 bg-[#1E293B] text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Remember Admin Session</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 transition duration-150 disabled:opacity-50 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
            </>
          ) : (
            'Sign In to Admin Platform'
          )}
        </button>
      </form>
    </div>
  );
}
