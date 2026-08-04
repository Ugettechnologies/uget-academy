import React, { Suspense } from 'react';
import AdminLoginForm from '@/components/auth/AdminLoginForm';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto bg-[#0F172A] border border-white/10 p-8 rounded-3xl text-center text-slate-400 text-xs font-mono">
          Loading Admin Portal...
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
