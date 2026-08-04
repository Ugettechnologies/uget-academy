'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-[#0F172A] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl text-white">
      {/* Header Logo */}
      <div className="flex flex-col items-center text-center">
        <Logo size="md" showText={false} className="mb-3 justify-center" />
        <h2 className="text-2xl font-black text-white tracking-tight">
          Admin Portal Authentication
        </h2>
        <p className="mt-1 text-xs text-amber-300 font-mono font-bold uppercase tracking-wider">
          Super Authority Oversight
        </p>
      </div>

      {/* Notice Banner */}
      <div className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-4 text-xs text-amber-300 flex items-start gap-3">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Restricted Access Area</p>
          <p className="text-[11px] leading-relaxed text-amber-200">
            Admin access is restricted exclusively to authorized Google Workspace accounts (<code className="font-mono text-amber-300 font-semibold">ugettechnologies@gmail.com</code>).
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-950/40 border border-red-800/60 p-3.5 text-xs text-red-300 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Only Login Action */}
      <div className="space-y-4 pt-2">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded-2xl py-4 px-6 text-xs font-black text-slate-950 bg-white hover:bg-slate-100 transition duration-150 disabled:opacity-50 shadow-xl flex items-center justify-center gap-3 cursor-pointer group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="group-hover:translate-x-0.5 transition-transform">
                Sign In with Google
              </span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-slate-400 font-mono">
          Strict OAuth 2.0 Identity Enforcement Active
        </p>
      </div>
    </div>
  );
}
