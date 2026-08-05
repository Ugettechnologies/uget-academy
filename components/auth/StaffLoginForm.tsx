'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

export default function StaffLoginForm() {
  const [email, setEmail] = useState('');
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
        body: JSON.stringify({ email, password, expectedRole: 'STAFF' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid HR & Staff credentials.');
        setLoading(false);
        return;
      }

      const userRole = data.role as string;

      if (userRole !== 'ADMIN') {
        setError('Unauthorized: Only Super Admin accounts can access the HR & Staff portal.');
        setLoading(false);
        return;
      }

      // Fast instant navigation
      window.location.href = '/staff';
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
        <h2 className="text-2xl font-bold text-white tracking-tight">
          HR & Staff Portal Sign In
        </h2>
        <p className="mt-1 text-xs text-indigo-300 font-mono font-bold uppercase tracking-wider">
          Operations & Student Records Management
        </p>
      </div>

      {/* Notice Banner */}
      <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-4 text-xs text-indigo-300 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Admin-Managed Staff Accounts</p>
          <p className="text-[11px] leading-relaxed text-indigo-200">
            Enter your assigned Staff ID / Username (e.g. <strong className="text-white">UGT2026/STF/A012</strong>) or Staff Email and Password.
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
            Staff ID or Staff Email
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-[#1E293B] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none transition text-xs font-mono"
            placeholder="e.g. UGT2026/STF/A012 or staff@uget.edu"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
            Password Code
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-[#1E293B] pl-4 pr-11 py-3 text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none transition text-xs font-mono"
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
              className="rounded border-white/10 bg-[#1E293B] text-indigo-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Remember Staff Session</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition duration-150 disabled:opacity-50 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying Staff Credentials...
            </>
          ) : (
            'Sign In to HR & Staff Portal'
          )}
        </button>
      </form>
    </div>
  );
}
