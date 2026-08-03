'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Key, X, Check, AlertCircle, Loader2, ShieldAlert, Send, GraduationCap, UserCheck, ExternalLink, Info, Shield } from 'lucide-react';
import Logo from '@/components/Logo';

type LoginTab = 'STUDENT' | 'INSTRUCTOR';
type ForgotStep = 'IDENTIFY' | 'STUDENT_REQUEST_SENT' | 'INSTRUCTOR_FORM' | 'INSTRUCTOR_SENT';

export default function LoginForm() {
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

      // Check if student/instructor matches active tab
      if (activeTab === 'STUDENT' && userRole !== 'STUDENT') {
        setError('This account is an Instructor account. Please switch to the Instructor / Coach Login tab.');
        setLoading(false);
        return;
      }

      if (activeTab === 'INSTRUCTOR' && userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN' && userRole !== 'STAFF') {
        setError('This account is a Student account. Please switch to the Student Login tab.');
        setLoading(false);
        return;
      }

      // Fast instant navigation
      const redirectPath = userRole === 'ADMIN' ? '/admin' : userRole === 'STAFF' ? '/staff' : `/${userRole.toLowerCase()}`;
      window.location.href = redirectPath;
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
    } fontName: {
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
          Select your learning role to access your portal
        </p>
      </div>

      {/* Dual Selector Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1.5 bg-[#0F172A] border border-white/10 rounded-2xl shadow-lg">
        <button
          type="button"
          onClick={() => {
            setActiveTab('STUDENT');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'STUDENT'
              ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>Student Login</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('INSTRUCTOR');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'INSTRUCTOR'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Instructor / Coach</span>
        </button>
      </div>

      {/* Path Specific Context Notice */}
      {activeTab === 'STUDENT' ? (
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
      ) : (
        <div className="rounded-xl bg-purple-950/30 border border-purple-500/20 p-3.5 text-xs text-purple-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-purple-200">Admin-Managed Instructor Accounts</p>
            <p className="text-[11px] leading-relaxed text-purple-300/90">
              Instructor accounts are assigned directly by Academy Administration. Department login IDs are formatted by department, e.g. <strong className="text-white">UGT2026/INSCS/A026</strong>.
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
              : 'Department Instructor ID or Email'}
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-[#0F172A]/70 px-4 py-3 text-white placeholder-gray-500 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:outline-none transition text-xs font-mono"
            placeholder={
              activeTab === 'STUDENT'
                ? 'e.g. 2026/STU/A026 or student@uget.edu'
                : 'e.g. UGT2026/INSCS/A026 or UGT2026/INSDA/A026'
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
              className="block w-full rounded-xl border border-white/10 bg-[#0F172A]/70 pl-4 pr-11 py-3 text-white placeholder-gray-500 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:outline-none transition text-xs font-mono"
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
              className="rounded border-white/10 bg-[#0F172A] text-brand-accent focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setForgotInput(email);
              setShowForgotModal(true);
            }}
            className="text-[11px] text-brand-accent hover:underline font-medium"
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
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/90 hover:to-indigo-600/90 shadow-purple-500/20'
          }`}
        >
          {loading
            ? 'Authenticating...'
            : activeTab === 'STUDENT'
            ? 'Sign In to Student Portal'
            : 'Sign In to Instructor Portal'}
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
              <div className="p-2.5 bg-brand-primary/20 text-brand-accent rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Password Reset Request
                </h3>
                <p className="text-xs text-gray-400">
                  Password reset requests are submitted directly to Administration for approval.
                </p>
              </div>
            </div>

            <form onSubmit={handleForgotIdentify} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Email or User ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026/STU/A026"
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-brand-accent focus:outline-none transition text-xs font-mono"
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
                  className="px-5 py-2 text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
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
