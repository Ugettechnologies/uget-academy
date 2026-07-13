import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { User, Mail, Calendar, Shield, Award, Clock, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import ProfileForm from '@/components/student/ProfileForm';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  const session = await getSession();
  const userId = session?.userId as string;

  // Query database for user information
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              lessons: true,
            },
          },
        },
      },
      attendanceLogs: true,
    },
  });

  if (!user) {
    return (
      <div className="py-20 text-center text-red-500 font-semibold">
        Profile data could not be retrieved. Please sign in again.
      </div>
    );
  }

  // Calculate statistics
  const totalCourses = user.enrollments.length;
  let totalLessons = 0;
  user.enrollments.forEach(e => {
    totalLessons += e.course.lessons.length;
  });

  const completedLessons = user.attendanceLogs.filter(log => log.durationSeconds >= 60).length;
  const totalWatchSeconds = user.attendanceLogs.reduce((acc, log) => acc + log.durationSeconds, 0);
  const totalWatchHours = (totalWatchSeconds / 3600).toFixed(1);
  const attendancePercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 100;

  return (
    <div className="space-y-8 animate-fade-in text-white">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <User className="w-8 h-8 text-brand-accent" />
          My Profile
        </h2>
        <p className="mt-1.5 text-sm text-slate-400 font-normal leading-relaxed">
          Manage your account profile details, review academic metrics, and track your attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full filter blur-3xl -z-10" />
            
            {/* Dummy Avatar */}
            <div className="w-24 h-24 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-full mx-auto flex items-center justify-center text-white text-3xl font-black shadow-lg relative border-4 border-slate-900">
              {user.firstName[0]}
              {user.lastName[0]}
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-slate-900">
                ✓
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                {user.firstName} {user.lastName}
              </h3>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide bg-brand-primary/15 text-brand-accent border border-brand-primary/20 uppercase">
                Student Member
              </span>
            </div>

            <div className="border-t border-slate-850 mt-6 pt-6 space-y-3.5 text-left text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>
                  Member since:{' '}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-slate-500" />
                <span>Status: Verified Account</span>
              </div>
            </div>
          </div>

          <ProfileForm initialFirstName={user.firstName} initialLastName={user.lastName} />
        </div>

        {/* Academic Performance Card */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-accent" />
            Academic Transcript & Scorecard
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Courses Card */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Active Courses</span>
                <span className="text-4xl font-extrabold block text-white">{totalCourses}</span>
              </div>
              <BookOpen className="absolute right-4 bottom-4 w-12 h-12 text-brand-primary/10" />
            </div>

            {/* Watch duration Card */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Time in Class</span>
                <span className="text-4xl font-extrabold block text-white">{totalWatchHours} hrs</span>
              </div>
              <Clock className="absolute right-4 bottom-4 w-12 h-12 text-brand-primary/10" />
            </div>

            {/* Attendance percentage Card */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Attendance Score</span>
                <span className="text-4xl font-extrabold block text-white">{attendancePercent}%</span>
              </div>
              <Award className="absolute right-4 bottom-4 w-12 h-12 text-brand-primary/10" />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h4 className="text-lg font-bold text-white border-b border-slate-850 pb-4">
              Registered Class Syllabus Summary
            </h4>

            {user.enrollments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-450">
                You have not registered for any classes yet.{' '}
                <Link href="/student/courses" className="text-brand-accent hover:underline">
                  Visit catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.enrollments.map((enr) => {
                  let courseLessonsCount = enr.course.lessons.length;
                  let watchedCount = enr.course.lessons.filter((l: any) => {
                    const duration = user.attendanceLogs.find(log => log.lessonId === l.id)?.durationSeconds || 0;
                    return duration >= 60;
                  }).length;
                  let watchPercent = courseLessonsCount > 0 ? Math.round((watchedCount / courseLessonsCount) * 100) : 100;

                  return (
                    <div
                      key={enr.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-850/80 bg-slate-950/20 rounded-2xl"
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-200">{enr.course.title}</span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>Syllabus completion rate:</span>
                          <span className="font-semibold text-brand-accent">{watchPercent}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 font-semibold">
                          {watchedCount} / {courseLessonsCount} modules
                        </span>
                        <Link
                          href={`/student/courses/${enr.course.id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/25 border border-brand-primary/20 text-brand-accent text-xs font-semibold transition"
                        >
                          Enter Room
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
