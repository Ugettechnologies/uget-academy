import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { User, Mail, Calendar, Shield, Award, Clock, BookOpen } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-slate-500 text-xs mt-1">Manage your security credentials, check syllabus progression, and overview statistics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Summary & Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 text-center relative overflow-hidden">
            {/* Avatar block */}
            <div className="w-20 h-20 bg-gradient-to-tr from-[#1E60D5] to-[#60A5FA] rounded-full mx-auto flex items-center justify-center text-white text-2xl font-black shadow-md relative">
              {user.firstName[0]}
              {user.lastName[0]}
              <span className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] text-white border-2 border-white">
                ✓
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-base font-black text-slate-850">
                {user.firstName} {user.lastName}
              </h3>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide bg-[#E0EEFF] text-[#1E60D5] uppercase">
                Student Member
              </span>
            </div>

            <div className="border-t border-slate-50 mt-6 pt-6 space-y-3.5 text-left text-xs text-slate-550">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">
                  Joined:{' '}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-emerald-600">Status: Account Active</span>
              </div>
            </div>
          </div>

          <ProfileForm initialFirstName={user.firstName} initialLastName={user.lastName} />
        </div>

        {/* Academic Performance Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Courses Card */}
            <div className="bg-white border border-slate-50 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Active Courses</span>
                <span className="text-3xl font-black block text-slate-800">{totalCourses}</span>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            {/* Watch duration Card */}
            <div className="bg-white border border-slate-50 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Time in Class</span>
                <span className="text-3xl font-black block text-slate-800">{totalWatchHours} hrs</span>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Attendance percentage Card */}
            <div className="bg-white border border-slate-50 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Attendance Score</span>
                <span className="text-3xl font-black block text-slate-800">{attendancePercent}%</span>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-50 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
            <h4 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-4">
              Classroom & Syllabus Progression
            </h4>

            {user.enrollments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You have not registered for any classes yet.{' '}
                <Link href="/student/courses" className="text-[#1E60D5] hover:underline font-bold">
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 bg-slate-50/50 rounded-2xl"
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-700">{enr.course.title}</span>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <span>Syllabus Progress:</span>
                          <span className="font-extrabold text-[#1E60D5]">{watchPercent}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 font-bold">
                          {watchedCount} / {courseLessonsCount} modules
                        </span>
                        <Link
                          href={`/student/courses/${enr.course.id}`}
                          className="px-4 py-2 rounded-xl bg-[#E0EEFF] text-[#1E60D5] text-xs font-bold transition hover:bg-[#1E60D5] hover:text-white"
                        >
                          Enter Classroom
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
