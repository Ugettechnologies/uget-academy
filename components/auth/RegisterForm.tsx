'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

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
          {role === 'STUDENT' ? 'Student Enrollment' : 'Instructor Accounts'}
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-accent hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/40 p-6 text-center space-y-5">
        {role === 'STUDENT' ? (
          <>
            <p className="text-xs text-gray-300 leading-relaxed">
              Registration for new candidates is managed through our enrollment portal. 
              Please complete your enrollment and payment there to get your access code.
            </p>
            <div className="pt-2">
              <a
                href="https://www.uget-enrollment.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#2563EB] to-[#60A5FA] py-3 text-xs font-bold text-white hover:from-[#2563EB]/90 hover:to-[#60A5FA]/90 transition duration-150 shadow-lg shadow-[#2563EB]/25"
              >
                Go to Enrollment Portal
              </a>
            </div>
            <p className="text-[10px] text-gray-500 leading-normal">
              Once you complete the enrollment, a generated password code will be sent to your email.
              You can then use that code to log in and access your dashboard.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-300 leading-relaxed">
              Instructor accounts are created directly by the Academy Administration.
              Direct online registration is not available for staff.
            </p>
            <p className="text-[10px] text-gray-500 leading-normal">
              Please contact the Administrator or check your email for your generated password code 
              (e.g., <code className="text-gray-400 font-mono">2026/A456D</code>) to log in.
            </p>
          </>
        )}
      </div>

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-gray-400 hover:text-white hover:underline transition">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
