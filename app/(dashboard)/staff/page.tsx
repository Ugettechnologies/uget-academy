import React from 'react';
import { requireRole } from '@/lib/require-role';
import { ShieldCheck, UserCheck, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  const session = await requireRole(['ADMIN', 'STAFF']);

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-950 dark:text-white">
          <UserCheck className="w-8 h-8 text-brand-primary" />
          Staff Portal
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Staff Dashboard & Resources
        </p>
      </div>

      {/* Welcome Widget */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-[-50%] right-[-10%] w-80 h-80 rounded-full bg-brand-primary/30 blur-[100px]" />
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-accent">Staff Dashboard</span>
          <h4 className="text-2xl font-black">Welcome, {session.user.firstName || session.user.email}!</h4>
          <p className="text-slate-305 text-sm leading-relaxed">
            You have successfully authenticated into the staff dashboard. From here, you have limited access to oversee academy settings and manage operational resources. 
            If you need escalated privileges (such as managing payments or viewing system audit logs), please contact an administrator to update your account role.
          </p>
        </div>
      </div>

      {/* Operations Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <h4 className="font-bold text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Your Permissions
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your role is assigned as <strong className="text-slate-700 dark:text-slate-300 font-semibold">{session.user.role}</strong>. 
            This grants you view access to staff dashboards, directory indexes, and student attendance, but prevents write operations or database mutations on system-wide settings.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <h4 className="font-bold text-base flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            Support Desk
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Need support? You can reach out to the developer support channel or log a ticket. 
            All administrative and operations actions are logged for accountability and quality assurance.
          </p>
        </div>
      </div>

    </div>
  );
}
