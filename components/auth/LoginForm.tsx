'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Key, X, Check, Copy, AlertCircle, Loader2, ShieldAlert, Send, GraduationCap, UserCheck, ExternalLink, Info, Shield } from 'lucide-react';
import Logo from '@/components/Logo';

type LoginTab = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
type ForgotStep = 'IDENTIFY' | 'STUDENT_REQUEST_SENT' | 'INSTRUCTOR_FORM' | 'INSTRUCTOR_SENT';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal');

  const [activeTab, setActiveTab] = useState<LoginTab>('STUDENT');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('IDENTIFY');
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [instructorMessage, setInstructorMessage] = useState('');

  // Check portal param in URL
  useEffect(() => {
    if (portalParam === 'admin' || portalParam === 'staff') {
      setActiveTab('ADMIN');
      if (portalParam === 'admin') {
        setEmail('ugettechnologies@gmail.com');
      }
    }
  }, [portalParam]);

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

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('IDENTIFY');
    setForgotInput('');
    setForgotError(null);
    setForgotSuccessMessage(null);
    setInstructorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
        body: JSON.stringify({ email, password, expectedRole: activeTab }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }

      const userRole = data.role as string;

      // Allow ADMIN and STAFF to sign in directly
      if (userRole === 'ADMIN') {
        router.push('/admin');
        router.refresh();
        return;
      }

      if (userRole === 'STAFF') {
        router.push('/staff');
        router.refresh();
        return;
      }

      // Check if student/instructor matches tab
      if (activeTab === 'STUDENT' && userRole !== 'STUDENT') {
        setError('This account is an Instructor account. Please switch to the Instructor / Coach Login tab.');
        setLoading(false);
        return;
      }

      if (activeTab === 'INSTRUCTOR' && userRole !== 'INSTRUCTOR') {
        setError('This account is a Student account. Please switch to the Student Login tab.');
        setLoading(false);
        return;
      }

      // Route to dedicated role portal
      router.push(`/${userRole.toLowerCase()}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // ── Forgot Password Handling ─────────────────────────────────────────────
  const handleForgotIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotInput,
          roleHint: activeTab,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.error === 'INSTRUCTOR_NO_SELF_RESET') {
        setForgotStep('INSTRUCTOR_FORM');
        setForgotLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to submit reset request.');
      }

      setForgotSuccessMessage(data.message || 'Your reset request has been dispatched to the Administrator for approval.');
      setForgotStep('STUDENT_REQUEST_SENT');
    } catch (err: any) {
      setForgotError(err.message || 'Error processing reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleInstructorResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotInput,
          message: instructorMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit query.');
      }

      setForgotStep('INSTRUCTOR_SENT');
    } catch (err: any) {
      setForgotError(err.message || 'An error occurred.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Logo */}
      <div className="flex flex-col items-center text-center">
        <Logo size="md" showText={false} className="mb-3 justify-center" />
        <h2 className="text-2xl font-bold text-white tracking-tight">
          UGET Academy
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Select your portal role to sign in
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1.5 bg-[#0F172A] border border-white/10 rounded-2xl shadow-lg">
        <button
          type="button"
          onClick={() => {
            setActiveTab('STUDENT');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'STUDENT'
              ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span>Student</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('INSTRUCTOR');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'INSTRUCTOR'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Instructor</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ADMIN');
            setEmail('ugettechnologies@gmail.com');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'ADMIN'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-black'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Admin</span>
        </button>
      </div>

      {/* Path Specific Context Notice */}
      {activeTab === 'STUDENT' && (
        <div className="rounded-xl bg-blue-950/30 border border-blue-500/20 p-3.5 text-xs text-blue-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-blue-200">First time enrolling?</p>
            <p className="text-[11px] leading-relaxed text-blue-300/90">
              Students enroll through{' '}
              <a
                href="https://www.uget-enrollment.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white underline hover:text-blue-200 inline-flex items-center gap-1"
              >
                uget-enrollment.online <ExternalLink className="w-3 h-3 inline" />
              </a>
              . Once payment is complete, Admin emails your password.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'INSTRUCTOR' && (
        <div className="rounded-xl bg-purple-950/30 border border-purple-500/20 p-3.5 text-xs text-purple-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-purple-200">Admin-Managed Instructor Accounts</p>
            <p className="text-[11px] leading-relaxed text-purple-300/90">
              Instructor accounts are assigned directly by Academy Administration. Login IDs are formatted by department, e.g. <strong className="text-white">UGT2026/INSCS/A026</strong>.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'ADMIN' && (
        <div className="rounded-xl bg-amber-950/30 border border-amber-500/20 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">Super Admin & HR Staff Authentication</p>
            <p className="text-[11px] leading-relaxed text-amber-300/90">
              Only authorized Super Admin email <strong className="text-white">ugettechnologies@gmail.com</strong> or Admin-provisioned HR Staff accounts can sign in.
            </p>
          </div>
        </div>
      )}

      {/* Main Login Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-950/30 border border-red-800/60 p-3.5 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
            {activeTab === 'STUDENT'
              ? 'Admission Number or Email Address'
              : activeTab === 'INSTRUCTOR'
              ? 'Department Instructor ID or Email'
              : 'Admin Email (ugettechnologies@gmail.com)'}
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-[#0F172A]/70 px-4 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition text-xs font-mono"
            placeholder={
              activeTab === 'STUDENT'
                ? 'e.g. 2026/STU/A026 or student@uget.edu'
                : activeTab === 'INSTRUCTOR'
                ? 'e.g. UGT2026/INSCS/A026 or UGT2026/INSDA/A026'
                : 'ugettechnologies@gmail.com'
            }
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
            Password Code
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-[#0F172A]/70 pl-4 pr-11 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition text-xs font-mono"
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
              className="rounded border-white/10 bg-[#0F172A] text-amber-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setForgotInput(email);
              setShowForgotModal(true);
            }}
            className="text-[11px] text-amber-400 hover:underline font-medium"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3.5 text-xs font-bold text-white transition duration-150 disabled:opacity-50 shadow-lg ${
            activeTab === 'STUDENT'
              ? 'bg-gradient-to-r from-[#2563EB] to-[#60A5FA] hover:from-[#2563EB]/90 hover:to-[#60A5FA]/90 shadow-blue-500/20'
              : activeTab === 'INSTRUCTOR'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/90 hover:to-indigo-600/90 shadow-purple-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/20'
          }`}
        >
          {loading
            ? 'Authenticating...'
            : activeTab === 'STUDENT'
            ? 'Sign In to Student Portal'
            : activeTab === 'INSTRUCTOR'
            ? 'Sign In to Instructor Portal'
            : 'Sign In to Admin / Staff Portal'}
        </button>
      </form>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left">
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Password Recovery Query
                </h3>
                <p className="text-xs text-gray-400">
                  Password reset requests are submitted directly to Administration for approval.
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            <form onSubmit={handleForgotIdentify} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Email or User ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ugettechnologies@gmail.com or 2026/STU/A026"
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForgotModal}
                  className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotInput.trim()}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl transition flex items-center gap-2 disabled:opacity-50 font-black"
                >
                  {forgotLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
