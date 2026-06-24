'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface RegisterFormProps {
  role: 'STUDENT' | 'INSTRUCTOR';
}

export default function RegisterForm({ role }: RegisterFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== reenterPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the Captcha check.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      setSuccess('Account created! Please check your email to verify your account.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setReenterPassword('');
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
          Create a UGET Academy account
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-accent hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#0F172A]/40 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-[#0F172A]/70 hover:border-white/20 transition duration-150"
        >
          <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#0F172A]/40 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-[#0F172A]/70 hover:border-white/20 transition duration-150"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
      </div>

      <div className="relative flex items-center justify-center py-1">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-4 text-[10px] text-gray-500 font-semibold uppercase">
          or
        </span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-950/20 border border-red-900/50 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-950/20 border border-green-900/50 p-3.5 text-xs text-green-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full rounded-lg border border-white/10 bg-[#0F172A]/50 px-3.5 py-2.5 text-white placeholder-gray-600 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition text-xs"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full rounded-lg border border-white/10 bg-[#0F172A]/50 px-3.5 py-2.5 text-white placeholder-gray-600 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition text-xs"
              placeholder="Last name"
            />
          </div>
        </div>

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
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border border-white/10 bg-[#0F172A]/50 px-3.5 py-2.5 text-white placeholder-gray-650 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition text-xs"
            placeholder="••••••••••••"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Re-enter Password
          </label>
          <input
            type="password"
            required
            value={reenterPassword}
            onChange={(e) => setReenterPassword(e.target.value)}
            className="block w-full rounded-lg border border-white/10 bg-[#0F172A]/50 px-3.5 py-2.5 text-white placeholder-gray-650 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition text-xs"
            placeholder="••••••••••••"
          />
        </div>

        <div className="flex justify-center py-1">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setError('Captcha verification failed. Please try again.')}
            onExpire={() => setTurnstileToken(null)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-[#2563EB] to-[#60A5FA] py-3 text-xs font-bold text-white hover:from-[#2563EB]/90 hover:to-[#60A5FA]/90 focus:outline-none transition duration-150 disabled:opacity-50 font-sans shadow-lg shadow-[#2563EB]/25"
        >
          {loading ? 'Creating account...' : `Sign up as ${role === 'STUDENT' ? 'Student' : 'Instructor'}`}
        </button>

        <p className="text-[10px] text-center text-gray-500 mt-4 leading-normal">
          By signing up, you agree to our{' '}
          <a href="#" className="hover:underline text-gray-400">Terms</a>,{' '}
          <a href="#" className="hover:underline text-gray-400">Acceptable Use</a>, and{' '}
          <a href="#" className="hover:underline text-gray-400">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}
