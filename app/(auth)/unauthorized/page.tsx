import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function UnauthorizedPage() {
  const session = await getSession();
  
  let dashboardUrl = '/login';
  if (session && session.role) {
    dashboardUrl = `/${(session.role as string).toLowerCase()}`;
  }

  return (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 shadow-lg shadow-red-500/5">
          <ShieldAlert className="w-8 h-8" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Access Restricted
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
          Your account does not have the necessary permissions to access this area. If you believe this is an error, please contact your administrator.
        </p>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <Link
          href={dashboardUrl}
          className="bg-white hover:bg-slate-50 text-slate-950 font-bold text-xs py-3.5 px-6 rounded-full shadow-md transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {session ? 'Back to Dashboard' : 'Sign In'}
        </Link>
        
        {session && (
          <form action="/api/auth/logout" method="POST" className="w-full">
            <button
              type="submit"
              className="w-full bg-transparent hover:bg-white/5 text-slate-350 border border-white/10 font-bold text-xs py-3 px-6 rounded-full transition"
            >
              Sign Out from Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
