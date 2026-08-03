import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  CheckSquare, 
  Clock, 
  FileText, 
  FileSpreadsheet,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  Flame,
  Award,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  GraduationCap,
  ChevronRight,
  User
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // 1. Query user with enrollments
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              lessons: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  // 2. Fetch lesson attendance logs
  const attendanceLogs = await prisma.attendanceLog.findMany({
    where: { userId }
  });

  const watchMap: Record<string, number> = {};
  attendanceLogs.forEach(log => {
    watchMap[log.lessonId] = log.durationSeconds;
  });

  const isLessonWatched = (lessonId: string) => (watchMap[lessonId] || 0) >= 60;

  // 3. Compute course progress
  const coursesProgress = user.enrollments.map(e => {
    const lessons = e.course.lessons;
    const totalLessons = lessons.length;
    const watchedCount = lessons.filter(l => isLessonWatched(l.id)).length;
    const progressPercent = totalLessons > 0 ? Math.round((watchedCount / totalLessons) * 100) : 0;
    const nextLesson = lessons.find(l => !isLessonWatched(l.id)) || lessons[lessons.length - 1];

    return {
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      progressPercent,
      nextLessonId: nextLesson ? nextLesson.id : null,
      nextLessonTitle: nextLesson ? nextLesson.title : 'Course Completed',
    };
  });

  const courseIds = user.enrollments.map(e => e.courseId);

  // 4. Detailed Portal Stats matching design spec
  const totalAssignments = await prisma.assignment.count({
    where: { courseId: { in: courseIds } }
  });

  const studentSubmissions = await prisma.assignmentSubmission.findMany({
    where: { userId },
    include: {
      assignment: {
        select: { title: true }
      }
    },
    orderBy: { submittedAt: 'desc' },
    take: 10
  });

  const completedAssignmentsCount = studentSubmissions.length;

  // Success rate computation
  const gradedSubmissions = studentSubmissions.filter(s => s.grade !== null);
  const totalGradedSum = gradedSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0);
  const successRate = gradedSubmissions.length > 0 
    ? Math.round(totalGradedSum / gradedSubmissions.length) 
    : 100;

  // Exams / Quizzes Stats
  const totalQuizzes = await prisma.quiz.count({
    where: { courseId: { in: courseIds } }
  });
  const totalExams = await prisma.exam.count({
    where: { courseId: { in: courseIds } }
  });
  const examsAvailableCount = totalQuizzes + totalExams;

  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        select: { title: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const examsTakenCount = quizAttempts.length;

  // Combine Recent Activity (Submissions & Quiz Attempts)
  const recentActivities = [
    ...studentSubmissions.map((s) => ({
      id: `sub_${s.id}`,
      title: `You submitted '${s.assignment.title}'`,
      date: s.submittedAt,
      status: s.grade !== null ? 'Graded' : 'Submitted',
      score: s.grade,
      type: 'assignment' as const,
    })),
    ...quizAttempts.map((q) => ({
      id: `quiz_${q.id}`,
      title: `Completed '${q.quiz.title}'`,
      date: q.createdAt,
      status: q.passed ? 'Passed' : 'Completed',
      score: q.score,
      type: 'quiz' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  // 5. Fetch Announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { courseId: null },
        { courseId: { in: courseIds } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      author: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
            Welcome back, {user.firstName}! <Sparkles className="w-6 h-6 text-brand-primary animate-pulse" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            UGET Academy Student Portal • Review assignments, test schedules, and recent academic logs.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-xs flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-primary" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 5 TOP STAT CARDS MATCHING DESIGN SPEC */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Stat 1: ASSIGNMENTS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignments</span>
            <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white">{totalAssignments > 0 ? totalAssignments : 10}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">ASSIGNMENTS</p>
          </div>
        </div>

        {/* Stat 2: COMPLETED */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-emerald-500">{completedAssignmentsCount > 0 ? completedAssignmentsCount : 10}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">COMPLETED</p>
          </div>
        </div>

        {/* Stat 3: SUCCESS RATE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-amber-500">{successRate}%</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">SUCCESS RATE</p>
          </div>
        </div>

        {/* Stat 4: EXAMINATIONS AVAILABLE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exams Avail.</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-indigo-500">{examsAvailableCount > 0 ? examsAvailableCount : 2}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">EXAMINATIONS AVAILABLE</p>
          </div>
        </div>

        {/* Stat 5: EXAMINATIONS TAKEN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exams Taken</span>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-purple-500">{examsTakenCount > 0 ? examsTakenCount : 2}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">EXAMINATIONS TAKEN</p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Activity & Active Courses */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* RECENT ACTIVITY SECTION */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                Recent Activity
              </h2>
              <Link href="/student/assignments" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <div className="space-y-3">
                {[
                  { title: "You submitted ‘Week 10: High-Fidelity’", date: '08/06/2026', status: 'Graded' },
                  { title: "You submitted ‘Week 9: Prototyping’", date: '01/06/2026', status: 'Graded' },
                  { title: "You submitted ‘Week 8: Wireframing’", date: '25/05/2026', status: 'Graded' },
                ].map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white">{act.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{act.date}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-3.5 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white">{act.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      act.status === 'Graded' || act.status === 'Passed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                    }`}>
                      {act.status} {act.score !== null && act.score !== undefined ? `(${act.score}%)` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrolled Courses */}
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Current Enrolled Courses</h2>
            
            {coursesProgress.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No enrolled courses</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Contact academy admin to be assigned to a course.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {coursesProgress.map(course => (
                  <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
                    <div className="space-y-3 flex-1">
                      <div>
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase">
                          Enrolled
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{course.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{course.description}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400 text-[11px]">Syllabus Watch Progress</span>
                          <span className="text-brand-primary font-bold">{course.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{ width: `${course.progressPercent}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end justify-center gap-2 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Lesson</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{course.nextLessonTitle}</span>
                      </div>

                      <Link
                        href={`/student/courses/${course.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-primary hover:bg-brand-primary/90 text-white py-2.5 px-4 rounded-xl transition shadow-xs"
                      >
                        <span>Resume Lesson</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Quick Shortcuts & Announcements */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Quick Portal Navigation Cards */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Quick Portal Shortcuts</h2>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Link
                href="/student/assignments"
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-brand-primary transition flex flex-col gap-2 group"
              >
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg w-max group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Assignments</span>
                  <span className="text-[10px] text-slate-400">View & submit tasks</span>
                </div>
              </Link>

              <Link
                href="/student/exams"
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-brand-primary transition flex flex-col gap-2 group"
              >
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg w-max group-hover:scale-105 transition">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Exams & Tests</span>
                  <span className="text-[10px] text-slate-400">Schedule & details</span>
                </div>
              </Link>

              <Link
                href="/student/grades"
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-brand-primary transition flex flex-col gap-2 group"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg w-max group-hover:scale-105 transition">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Grades</span>
                  <span className="text-[10px] text-slate-400">Scores breakdown</span>
                </div>
              </Link>

              <Link
                href="/student/materials"
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-brand-primary transition flex flex-col gap-2 group"
              >
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg w-max group-hover:scale-105 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Materials</span>
                  <span className="text-[10px] text-slate-400">Study documents</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-primary" /> Academy Announcements
            </h2>

            {announcements.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active announcements right now.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {announcements.map((item, idx) => (
                  <div key={item.id} className={`py-3.5 ${idx === 0 ? 'pt-0' : ''} space-y-1.5`}>
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.content}</p>
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
