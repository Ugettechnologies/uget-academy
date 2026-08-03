import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  FileSpreadsheet, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  UserCheck,
  CheckCircle2
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

  const totalInstructorsCount = 28;
  const activeStudentsCount = 1540;
  const publishedCoursesCount = 10;
  const totalRevenueFormatted = '₦9.2M';
  const pendingAssessmentsCount = 12;

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
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Platform Super Authority
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
            Full platform visibility and authority over all student rosters, instructor courses, class sections, platform assessments, and revenue analytics.
          </p>
        </div>
      </div>

      {/* Health Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Instructors */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Total Tutors</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{totalInstructorsCount}</h3>
          <span className="text-[11px] text-purple-300 font-bold block">100% Assigned</span>
        </div>

        {/* Active Students */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Active Students</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{activeStudentsCount.toLocaleString()}</h3>
          <span className="text-[11px] text-emerald-400 font-bold block">+18% This Cohort</span>
        </div>

        {/* Published Courses */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Published Tracks</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{publishedCoursesCount}</h3>
          <span className="text-[11px] text-blue-300 font-bold block">Active Curriculum</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-3xl font-black text-amber-400">{totalRevenueFormatted}</h3>
          <span className="text-[11px] text-amber-300 font-bold block">Settled & Verified</span>
        </div>

        {/* Pending Assessments */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Pending Grading</span>
            <FileSpreadsheet className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{pendingAssessmentsCount}</h3>
          <span className="text-[11px] text-rose-300 font-bold block">Evaluation Queue</span>
        </div>
      </div>

      {/* Engagement Breakdown & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Engagement Breakdown per Course Table */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Course Track Engagement & Health</h3>
              <p className="text-xs text-gray-400">Enrollment numbers, completion rates, and assigned tutors</p>
            </div>
            <Link href="/admin/courses" className="text-xs text-amber-400 font-bold hover:underline">
              Manage Tracks →
            </Link>
          </div>

          <div className="space-y-3">
            {courseEngagement.map((c, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#1E293B] border border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{c.title}</h4>
                  <span className="text-[10px] text-gray-400 block">Tutor: <strong className="text-purple-300">{c.tutor}</strong></span>
                </div>

                <div className="flex items-center gap-6 text-right shrink-0">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Enrolled</span>
                    <span className="text-xs font-bold text-white">{c.enrolled}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Pass Rate</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{c.completionRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Control Panel Links */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 px-1">
            Admin Authority Controls
          </h3>

          <Link
            href="/admin/courses"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-blue-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition">Courses & Tutor Assignment</h4>
                <p className="text-[11px] text-gray-400">Assign tutors & publish course tracks</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>

          <Link
            href="/admin/classes"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-cyan-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Class Sections & Student Roster</h4>
                <p className="text-[11px] text-gray-400">Section A/B & student class assigning</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>

          <Link
            href="/admin/assessments"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-amber-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">Multi-Step Assessment Builder</h4>
                <p className="text-[11px] text-gray-400">Configure timings, scoring & question types</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>

          <Link
            href="/admin/reports"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-rose-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition">5-Tab Reports & Analytics</h4>
                <p className="text-[11px] text-gray-400">Revenue ₦9.2M, attendance & export data</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>
        </div>

      </div>
    </div>
  );
}
