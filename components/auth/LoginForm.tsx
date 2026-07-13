'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved credentials if 'Remember me' was enabled
  useEffect(() => {
    const savedEmail = localStorage.getItem('uget_remember_email');
    const savedPassword = localStorage.getItem('uget_remember_password');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Save or clear credentials based on 'Remember me' checkbox
    if (rememberMe) {
      localStorage.setItem('uget_remember_email', email);
      localStorage.setItem('uget_remember_password', password);
    } else {
      localStorage.removeItem('uget_remember_email');
      localStorage.removeItem('uget_remember_password');
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }

      // Success: redirect based on role
      router.push(`/${data.role.toLowerCase()}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Centered Logo and Header */}
      <div className="flex flex-col items-center text-center">
        <Logo size="md" showText={false} className="mb-4 justify-center" />
        <h2 className="text-xl font-bold text-white tracking-tight">
          Log in to your account
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Don't have an account?{' '}
          <a href="https://www.uget-enrollment.online/" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline font-medium">
            Enroll and pay here
          </a>
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-955/20 border border-red-900/50 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-lg border border-white/10 bg-[#0F172A]/50 px-3.5 py-2.5 text-white placeholder-gray-650 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition text-xs"
            placeholder="alan.turing@example.com"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-white/10 bg-[#0F172A]/50 pl-3.5 pr-10 py-2.5 text-white placeholder-gray-650 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition text-xs"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition"
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
              className="rounded border-white/10 bg-[#0F172A]/50 text-[#2563EB] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-[10px] text-brand-accent hover:underline font-medium">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-[#2563EB] to-[#60A5FA] py-3 text-xs font-bold text-white hover:from-[#2563EB]/90 hover:to-[#60A5FA]/90 focus:outline-none transition duration-150 disabled:opacity-50 font-sans shadow-lg shadow-[#2563EB]/25"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
