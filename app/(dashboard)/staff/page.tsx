import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { UserCheck, Layers, Link2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffOpsDashboardPage() {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'INSTRUCTOR')) {
    redirect('/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#090D16] flex text-white font-sans">
      {/* Staff Sidebar */}
      <div className="w-64 hidden lg:block sticky top-0 h-screen">
        <StaffSidebar user={{ firstName: user.firstName, lastName: user.lastName, email: user.email }} />
      </div>

      {/* Main Viewport */}
      <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-full overflow-x-hidden">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-indigo-950 p-8 border border-white/10 shadow-2xl">
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-extrabold uppercase border border-indigo-500/30 tracking-wider">
              Non-Staff Operations Layer
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white mt-2">
              Platform Operations & HR Portal
            </h1>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Maintains operational tasks such as class section student assigning and staff intake forms. Monitored continuously by the Platform Super Administrator.
            </p>
          </div>
        </div>

        {/* Quick Operations Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/classes"
            className="p-6 bg-[#0F172A] border border-white/10 hover:border-cyan-500/40 rounded-3xl transition shadow-xl space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">Class Sections & Roster Assigning</h3>
                <p className="text-xs text-gray-400">Assign enrolled students to Section A, B, or Weekend cohorts</p>
              </div>
            </div>
            <div className="flex justify-end">
              <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">Manage Class Sections <ArrowRight className="w-4 h-4" /></span>
            </div>
          </Link>

          <Link
            href="/staff/onboarding"
            className="p-6 bg-[#0F172A] border border-white/10 hover:border-teal-500/40 rounded-3xl transition shadow-xl space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl">
                <Link2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition">Staff Onboarding Data Intake</h3>
                <p className="text-xs text-gray-400">Self-service onboarding form link for new instructors and staff</p>
              </div>
            </div>
            <div className="flex justify-end">
              <span className="text-xs text-teal-400 font-bold flex items-center gap-1">Open Intake Form <ArrowRight className="w-4 h-4" /></span>
            </div>
          </Link>
        </div>

        {/* Notice on Payments */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1">
          <p className="font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Platform Security Policy Notice
          </p>
          <p className="text-[11px] text-gray-400">
            Payment management and financial settlements are excluded from the ops portal and restricted exclusively to Super Admin oversight.
          </p>
        </div>
      </main>
    </div>
  );
}
