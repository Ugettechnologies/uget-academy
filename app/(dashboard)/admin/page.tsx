import React from 'react';
import { requireRole } from '@/lib/require-role';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Settings
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await requireRole(['ADMIN']);

  // Fetch metrics in parallel
  const [
    studentCount,
    instructorCount,
    courseCount,
    pendingPayments,
    recentLogs
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
    prisma.course.count(),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-950 dark:text-white">
            <ShieldCheck className="w-8 h-8 text-brand-primary" />
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            System overview for {session.user.email} (Administrator account)
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link
            href="/admin/audit-log"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-5 text-sm transition shadow-md"
          >
            <Activity className="w-4 h-4 mr-2" />
            View Audit Logs
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Students</span>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white">{studentCount}</h3>
            <span className="text-[11px] text-slate-500 block">Registered student learners</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Instructors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Instructors</span>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white">{instructorCount}</h3>
            <span className="text-[11px] text-slate-500 block">Active class teachers</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Courses</span>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white">{courseCount}</h3>
            <span className="text-[11px] text-slate-500 block">Total learning modules</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pending Payments</span>
            <h3 className={`text-3xl font-black ${pendingPayments > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-950 dark:text-white'}`}>
              {pendingPayments}
            </h3>
            <span className="text-[11px] text-slate-500 block">Requires manual verification</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            Quick Admin Operations
          </h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            
            <Link
              href="/admin/payments"
              className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-xl transition"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Verify Student Payments</h4>
                <p className="text-[11px] text-slate-500">Review receipts and verify bank deposits</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/students"
              className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-xl transition"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Manage Student Roles</h4>
                <p className="text-[11px] text-slate-500">List students and adjust account authorizations</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/instructors"
              className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-xl transition"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instructors & Staff</h4>
                <p className="text-[11px] text-slate-500">Monitor teacher registrations</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-400" />
              Recent Actions Log
            </h3>
            <Link
              href="/admin/audit-log"
              className="text-xs text-brand-primary font-bold hover:underline flex items-center gap-1"
            >
              See all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No administrative actions have been logged yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-4 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-[10px] mr-2">
                        {log.action}
                      </span>
                      <span className="text-slate-600 dark:text-slate-455">{log.userEmail}</span>
                      {log.targetId && (
                        <p className="text-[10px] text-slate-400">Target ID: {log.targetId}</p>
                      )}
                    </div>
                    <div className="text-right text-slate-400 space-y-1">
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                      <p className="text-[10px] text-slate-500">{log.ip || 'no-ip'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
