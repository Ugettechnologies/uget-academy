import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import OnboardingModal from '@/components/student/OnboardingModal';
import { 
  LayoutDashboard, 
  Calendar, 
  Video, 
  FileSpreadsheet, 
  GraduationCap, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Award,
  BookOpen,
  MessageCircle,
  Code2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              instructor: true,
              lessons: true,
            },
          },
        },
      },
      attendanceLogs: true,
      grades: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Calculate statistics
  const enrolledCoursesCount = user.enrollments.length;
  const attendanceCount = user.attendanceLogs.length;
  const attendancePercent = attendanceCount > 0 ? Math.min(100, Math.round((attendanceCount / 12) * 100)) : 100;
  
  const overallScore = user.grades.length > 0
    ? Math.round(user.grades.reduce((acc, g) => acc + g.score, 0) / user.grades.length)
    : 88;

  const primaryCourse = user.enrollments[0]?.course;

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Onboarding Interactive Modal */}
      <OnboardingModal />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-blue-950 p-8 border border-white/10 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2563EB]/20 border border-blue-500/30 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> UGET Academy • Student Space
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
            Your cohort learning dashboard is active. Check your live class schedule, complete deliverables, and review your performance below.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Attendance Record */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between hover:border-blue-500/40 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Attendance Rate</span>
            <h3 className="text-3xl font-black text-white">{attendancePercent}%</h3>
            <span className="text-[11px] text-emerald-400 font-bold block">{attendanceCount} classes verified</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-[#60A5FA] rounded-2xl border border-blue-500/20">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Deliverables Completed */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between hover:border-blue-500/40 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Deliverables</span>
            <h3 className="text-3xl font-black text-white">4 / 4</h3>
            <span className="text-[11px] text-emerald-400 font-bold block">100% On-Time Completion</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between hover:border-blue-500/40 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Academic Score</span>
            <h3 className="text-3xl font-black text-white">{overallScore}%</h3>
            <span className="text-[11px] text-purple-300 font-bold block">Grade Distinction</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Enrolled Tracks */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between hover:border-blue-500/40 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Enrolled Tracks</span>
            <h3 className="text-3xl font-black text-white">{enrolledCoursesCount || 1}</h3>
            <span className="text-[11px] text-gray-400 block truncate max-w-[140px]">
              {primaryCourse?.title || 'Active Track'}
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Live Class Schedule & Quick Nav */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Next Live Class Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Next Live Lecture</h3>
                  <p className="text-xs text-gray-400">Scheduled for Today • 04:00 PM WAT</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30 animate-pulse">
                Starts in 45m
              </span>
            </div>

            <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold text-[#60A5FA] uppercase tracking-wider block">Topic Being Taught:</span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    Advanced Threat Vectors & Cryptography Standards
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-300 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Duration: 90 Mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Roll Call Required</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/student/attendance"
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white text-xs font-bold text-center hover:from-[#2563EB]/90 hover:to-[#60A5FA]/90 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" /> Join Live Lecture Room
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Portal Navigation Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 px-1">
            Quick Portal Access
          </h3>

          <Link
            href="/student/chat"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-blue-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition">Classmate & Instructor Chat</h4>
                <p className="text-[11px] text-gray-400">Direct message instructor & cohort classmates</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>

          <Link
            href="/student/exams"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-purple-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition">3-Section Tests & Exams</h4>
                <p className="text-[11px] text-gray-400">CBT, Practical & Interview slot booking</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>

          <Link
            href="/student/playground"
            className="flex items-center justify-between p-4 bg-[#0F172A] border border-white/10 hover:border-emerald-500/40 rounded-2xl transition shadow-xl group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">Code Playground</h4>
                <p className="text-[11px] text-gray-400">In-browser IDE with auto-grader</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </Link>
        </div>

      </div>
    </div>
  );
}
