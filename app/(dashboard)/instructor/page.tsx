import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InstructorOnboardingModal from '@/components/instructor/InstructorOnboardingModal';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileSpreadsheet, 
  PlusCircle, 
  CheckSquare, 
  FolderDown, 
  Users2, 
  FileText, 
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  Video,
  CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') {
    redirect('/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      coursesAsInstructor: {
        include: {
          enrollments: {
            include: { user: true },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const courses = user.coursesAsInstructor || [];
  const courseTrackTitle = courses[0]?.title || 'Cybersecurity & Threat Intelligence';
  const totalStudentsCount = courses.reduce((acc: number, c: any) => acc + (c.enrollments ? c.enrollments.length : 0), 0) || 28;

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Interactive Onboarding Tutorial */}
      <InstructorOnboardingModal />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-purple-950 p-8 border border-white/10 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-extrabold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Track: {courseTrackTitle}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Instructor Command Center
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
            Welcome Dr. {user.firstName}! Manage your active student roster, schedule live lectures, grade assessment deliverables, and submit daily admin reviews.
          </p>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Classes Taught */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between hover:border-purple-500/40 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Classes Taught</span>
            <h3 className="text-3xl font-black text-white">18 / 24</h3>
            <span className="text-[11px] text-emerald-400 font-bold block">75% Module Completion</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <Video className="w-6 h-6" />
          </div>
        </div>

        {/* Attendance Summary % */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between hover:border-purple-500/40 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Attendance Rate</span>
            <h3 className="text-3xl font-black text-white">94.2%</h3>
            <span className="text-[11px] text-emerald-400 font-bold block">Roll Call Verified</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Grading Count */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between hover:border-purple-500/40 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Pending Grading</span>
            <h3 className="text-3xl font-black text-white">5</h3>
            <span className="text-[11px] text-amber-300 font-bold block">Requires Feedback</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Total Assigned Students */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between hover:border-purple-500/40 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Assigned Roster</span>
            <h3 className="text-3xl font-black text-white">{totalStudentsCount}</h3>
            <span className="text-[11px] text-purple-300 font-bold block truncate max-w-[140px]">
              Active Enrolled Cohort
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Action Shortcuts & Next Session */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Next Scheduled Live Class */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Your Next Live Lecture</h3>
                  <p className="text-xs text-gray-400">Course: <span className="text-purple-300 font-bold">{courseTrackTitle}</span></p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                Starts Today @ 04:00 PM
              </span>
            </div>

            <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block">Lecture Topic:</span>
              <h4 className="text-base font-bold text-white mt-0.5">
                Module 4: Advanced Web Penetration & OWASP Top 10 Security Architecture
              </h4>
              <p className="text-xs text-gray-300">
                Roll call ticket will open automatically. Ensure students mark present during session.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/instructor/live"
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold text-center hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4 animate-pulse" /> Launch Live Meeting & Roll Call
              </Link>
              <Link
                href="/instructor/schedule"
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold text-center hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Manage Timetable
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Instructor Shortcuts */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 px-1">
            Instructor Quick Actions
          </h3>

          <Link
            href="/instructor/assignments/create"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-cyan-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Create Assessment & Exam</h4>
                <p className="text-[11px] text-gray-400">Rich text question drafting editor</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>

          <Link
            href="/instructor/students"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-emerald-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">Student Roster & Attendance</h4>
                <p className="text-[11px] text-gray-400">Track present, absent & flagged students</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>

          <Link
            href="/instructor/reports"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-rose-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition">Daily & Weekly Admin Report</h4>
                <p className="text-[11px] text-gray-400">Submit activity reviews to Admin</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>
        </div>

      </div>
    </div>
  );
}
