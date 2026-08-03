'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { ArrowLeft, ExternalLink, ShieldAlert, GraduationCap } from 'lucide-react';

interface RegisterFormProps {
  role: 'STUDENT' | 'INSTRUCTOR';
}

export default function RegisterForm({ role }: RegisterFormProps) {
  return (
    <div className="w-full space-y-6">
      {/* Centered Logo and Header */}
      <div className="flex flex-col items-center text-center">
        <Logo size="md" showText={false} className="mb-4 justify-center" />
        <h2 className="text-xl font-bold text-white tracking-tight">
          {role === 'STUDENT' ? 'Student Enrollment Portal' : 'Instructor Account Management'}
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Already have your login credentials?{' '}
          <Link href="/login" className="text-brand-accent hover:underline font-medium">
            Log in here
          </Link>
        </p>
      </div>

      {role === 'STUDENT' ? (
        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/60 p-6 text-center space-y-5 shadow-xl">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Enrollment Required First</h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
              Students must first complete enrollment and tuition payment via the official enrollment site. Once verified, Administration uploads your student profile and automatically sends your Admission Number (e.g. <code className="text-brand-accent font-mono">2026/STU/A026</code>) and login password via email.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="https://www.uget-enrollment.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] py-3.5 text-xs font-bold text-white hover:from-[#2563EB]/90 hover:to-[#60A5FA]/90 transition duration-150 shadow-lg shadow-[#2563EB]/25"
            >
              <span>Visit Official Enrollment Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-6 text-center space-y-5 shadow-xl">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Admin-Managed Accounts Only</h3>
            <p className="text-xs text-purple-200/90 leading-relaxed max-w-sm mx-auto">
              Instructor and Coach accounts are fully managed by Academy Administration — self-registration is not permitted.
            </p>
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-[11px] text-gray-300 text-left space-y-1 mt-3">
              <p className="font-semibold text-purple-300">Department Login Format Examples:</p>
              <p>• Cybersecurity: <code className="text-white font-mono">UGT2026/INSCS/A026</code></p>
              <p>• Data Analyst: <code className="text-white font-mono">UGT2026/INSDA/A026</code></p>
              <p>• Software Engineering: <code className="text-white font-mono">UGT2026/INSSE/A026</code></p>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-3.5 text-xs font-bold text-white transition duration-150 shadow-lg shadow-purple-500/20"
            >
              Proceed to Instructor Login
            </Link>
          </div>
        </div>
      )}

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-gray-400 hover:text-white hover:underline transition inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Main Login
        </Link>
      </div>
    </div>
  );
}
