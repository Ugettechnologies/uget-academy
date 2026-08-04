import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  FileSpreadsheet, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  UserCheck,
  CreditCard,
  Download,
  Clock,
  TrendingUp,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect('/login');
  }

  // Live database metrics
  const activeStudentsCount = await prisma.user.count({ where: { role: 'STUDENT' } });
  const totalInstructorsCount = await prisma.user.count({ where: { role: 'INSTRUCTOR' } });
  const totalStaffCount = await prisma.user.count({ where: { role: 'STAFF' } });
  const publishedCoursesCount = await prisma.course.count({ where: { published: true } });

  const paymentAggregate = await prisma.payment.aggregate({
    where: { status: 'VERIFIED' },
    _sum: { amount: true },
    _count: { id: true },
  });
  const pendingPaymentsCount = await prisma.payment.count({ where: { status: 'PENDING' } });

  const totalRevenueNumber = paymentAggregate._sum.amount || 0;
  const totalRevenueFormatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(totalRevenueNumber);

  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const courseEngagement = [
    { title: 'Cybersecurity & Threat Intelligence', enrolled: 420, completionRate: '94%', tutor: 'Dr. Ada Lovelace' },
    { title: 'Data Analytics & Predictive Modeling', enrolled: 380, completionRate: '89%', tutor: 'Prof. Alan Turing' },
    { title: 'Software Engineering & Architecture', enrolled: 410, completionRate: '92%', tutor: 'Grace Hopper' },
    { title: 'Full-Stack Web Development', enrolled: 330, completionRate: '86%', tutor: 'Margaret Hamilton' },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-amber-950 p-8 border border-white/10 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Unified Platform Super Authority
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
            Full platform authority over all student rosters, staff operations, instructor courses, class sections, and financial revenue tracking.
          </p>
        </div>
      </div>

      {/* Financial Revenue & Key Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#0F172A] to-amber-950/40 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500 transition">
          <div className="flex justify-between items-center text-amber-300 text-xs font-extrabold">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">{totalRevenueFormatted}</h3>
          <span className="text-[11px] text-amber-400/90 font-bold block">
            {paymentAggregate._count.id} Verified Transactions
          </span>
        </div>

        {/* Pending Verification */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Pending Payments</span>
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-3xl font-black text-white">{pendingPaymentsCount}</h3>
          <Link href="/admin/payments" className="text-[11px] text-amber-400 font-bold hover:underline block">
            Review Receipts &rarr;
          </Link>
        </div>

        {/* Active Students */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Active Students</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{activeStudentsCount.toLocaleString()}</h3>
          <span className="text-[11px] text-emerald-400 font-bold block">Enrolled Learners</span>
        </div>

        {/* Total Tutors */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Total Tutors</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{totalInstructorsCount}</h3>
          <span className="text-[11px] text-purple-300 font-bold block">Active Instructors</span>
        </div>

        {/* Staff Members */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-teal-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Staff Members</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{totalStaffCount}</h3>
          <Link href="/staff" className="text-[11px] text-teal-400 font-bold hover:underline block">
            Open Staff Portal &rarr;
          </Link>
        </div>
      </div>

      {/* Integration Quick Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Integration Card */}
        <div className="p-6 bg-[#0F172A] border border-amber-500/30 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Payment & Revenue Dashboard</h3>
              <p className="text-xs text-gray-400">Track academy revenue, verify bank receipts & manual deposits</p>
            </div>
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-white/10">
            <span className="text-xs text-gray-400 font-mono">Status: Paystack & Manual Live</span>
            <Link
              href="/admin/payments"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              Verify Payments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Student Data Export & Import Card */}
        <div className="p-6 bg-[#0F172A] border border-cyan-500/30 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">uget-enrollment Data Sync</h3>
              <p className="text-xs text-gray-400">Export student roster to CSV or pull enrollment portal data</p>
            </div>
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-white/10">
            <span className="text-xs text-gray-400 font-mono">Format: CSV & JSON</span>
            <Link
              href="/admin/students"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              Students Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Staff & HR Management Card */}
        <div className="p-6 bg-[#0F172A] border border-teal-500/30 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Staff Management & HR</h3>
              <p className="text-xs text-gray-400">Issue credentials to staff, track recruitment & staff reports</p>
            </div>
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-white/10">
            <span className="text-xs text-gray-400 font-mono">Access: HR & Head of Academy</span>
            <Link
              href="/staff"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              Open Staff Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Payments Feed */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">Recent Payment Activity</h3>
          </div>
          <Link href="/admin/payments" className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1">
            View All Payments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentPayments.length > 0 ? (
            recentPayments.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    ₦
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {p.user.firstName} {p.user.lastName}
                    </h4>
                    <span className="text-[11px] text-gray-400">{p.user.email} • Ref: {p.reference}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-white">
                    ₦{p.amount.toLocaleString()}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    p.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : p.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-gray-400 italic">
              No recent payment transactions recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
