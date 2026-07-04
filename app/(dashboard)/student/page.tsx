import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CourseCard from '@/components/student/CourseCard';
import Link from 'next/link';
import { BookOpen, Clock, Activity, Award, ArrowRight, Calendar, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = (await getSession()) as any;
  const userId = session?.userId as string;

  // Fetch student's enrollments with lessons and attendance logs
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              attendanceLogs: {
                where: { userId },
              },
            },
          },
          instructor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate metrics
  let totalLessonsCount = 0;
  let attendedLessonsCount = 0;
  let totalWatchSeconds = 0;

  const coursesWithProgress = enrollments.map(({ course }: any) => {
    let courseWatchedCount = 0;
    course.lessons.forEach((lesson: any) => {
      totalLessonsCount++;
      const duration = lesson.attendanceLogs[0]?.durationSeconds || 0;
      totalWatchSeconds += duration;
      if (duration >= 60) {
        attendedLessonsCount++;
        courseWatchedCount++;
      }
    });

    const progressPercent = course.lessons.length > 0
      ? Math.round((courseWatchedCount / course.lessons.length) * 100)
      : 0;

    return {
      ...course,
      progressPercent,
      completedLessons: courseWatchedCount,
    };
  });

  const attendanceRate = totalLessonsCount > 0
    ? Math.round((attendedLessonsCount / totalLessonsCount) * 100)
    : 100;

  const totalWatchHours = (totalWatchSeconds / 3600).toFixed(1);

  // Fetch recent activities
  const activities = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 6,
  }).catch(() => []); // Fallback if no logs

  // Fallback direct query because of syntax/empty records
  const dbActivities = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Dynamic greeting based on current time
  const currentHour = new Date().getHours();
  let greeting = 'Welcome back';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  // SVG configuration for radial attendance chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendanceRate / 100) * circumference;

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full filter blur-3xl -z-10" />
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-white">
            {greeting}, <span className="text-brand-accent">{session?.firstName || 'Learner'}</span>!
          </h2>
          <p className="text-sm text-slate-400 max-w-xl font-normal leading-relaxed">
            Ready to push your limits today? Here is an overview of your active courses, class attendance records, and learning recap.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/student/courses"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-sm font-semibold text-white transition shadow-lg shadow-brand-primary/20"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid: Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Radial Dial */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-800 transition duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Attendance Score</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold">{attendanceRate}%</span>
              <span className="text-xs text-emerald-450 font-bold">Excellent</span>
            </div>
            <p className="text-[11px] text-slate-400">Target score is 80%</p>
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-800 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-brand-accent fill-none transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold text-slate-300">Class</span>
              <span className="text-[9px] text-slate-400">Rate</span>
            </div>
          </div>
        </div>

        {/* Watch Time Stat */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-800 transition duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Total Hours Spent</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">{totalWatchHours}</span>
              <span className="text-sm font-semibold text-slate-400">hrs</span>
            </div>
            <p className="text-[11px] text-slate-400">Active class watch time</p>
          </div>
          <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-accent">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        {/* Recap Briefing Widget */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-800 transition duration-300">
          <div className="space-y-2 flex-grow">
            <span className="text-xs text-slate-400 font-semibold block">Activity Recap</span>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {enrollments.length === 0
                ? "You haven't enrolled in any courses yet. Browse catalog to start class."
                : totalWatchSeconds === 0
                ? `You enrolled in ${enrollments.length} course${enrollments.length > 1 ? 's' : ''}. Open lessons to begin your attendance streak!`
                : `You are active in ${enrollments.length} class${enrollments.length > 1 ? 'es' : ''}. Your completion rate is at ${attendanceRate}%. Stay focused!`}
            </p>
          </div>
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-emerald-400 ml-4">
            <Award className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Main Content Sections: Enrolled Courses & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-accent" />
            Enrolled Courses ({enrollments.length})
          </h3>

          {coursesWithProgress.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm space-y-6">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mx-auto">
                <BookOpen className="w-8 h-8 text-brand-accent" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">No Enrolled Courses</h4>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Join our world-class developer catalog to acquire skills and build projects.
                </p>
              </div>
              <Link
                href="/student/courses"
                className="inline-flex items-center justify-center rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold py-3 px-6 text-sm transition shadow-lg shadow-brand-primary/20 w-full sm:w-auto"
              >
                Browse Catalog &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coursesWithProgress.map((course: any) => (
                <div
                  key={course.id}
                  className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-3xl p-6 shadow-md transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>By {course.instructor.firstName} {course.instructor.lastName}</span>
                      <span className="font-semibold text-brand-accent">{course.progressPercent}% Completed</span>
                    </div>

                    <h4 className="text-lg font-bold text-white line-clamp-1 leading-snug">
                      {course.title}
                    </h4>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-450 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">
                      {course.completedLessons} / {course.lessons.length} Modules completed
                    </span>
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent hover:text-white transition"
                    >
                      Enter Classroom <Play className="w-3 h-3 fill-current" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Activities */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-accent" />
            Class Records & Activities
          </h3>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 shadow-xl space-y-6">
            {dbActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-450">
                No recent activity records found. Play videos to start tracking.
              </div>
            ) : (
              <div className="relative pl-6 border-l border-slate-800/80 space-y-6">
                {dbActivities.map((act: any) => (
                  <div key={act.id} className="relative group">
                    {/* Circle Dot indicator */}
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-850 border border-slate-800 group-hover:bg-brand-accent group-hover:border-brand-primary transition-all duration-300" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-450 block font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(act.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <p className="text-xs font-bold text-slate-200 leading-snug">
                        {act.action === 'WATCHED_LESSON' ? '📽️ Attended Class' : act.action === 'ENROLLED' ? '🎒 Course Enrolled' : '🔐 Access Log'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                        {act.details}
                      </p>
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
