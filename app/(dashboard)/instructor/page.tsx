import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InstructorDashboardPage() {
  const session = await getSession();
  
  // Fetch stats
  const coursesCount = await prisma.course.count({
    where: { instructorId: session?.userId as string },
  });

  const publishedCount = await prisma.course.count({
    where: {
      instructorId: session?.userId as string,
      published: true,
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
            Instructor Portal
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor your courses, upload videos, and track your academy's growth.
          </p>
        </div>

        <Link
          href="/instructor/courses"
          className="inline-flex items-center justify-center rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold py-2.5 px-5 text-sm transition shadow-md shadow-brand-primary/10"
        >
          Manage Courses
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Courses</span>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2">{coursesCount}</h3>
          </div>
          <div className="mt-4 text-xs text-slate-500">Drafts and published courses combined</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published Courses</span>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2">{publishedCount}</h3>
          </div>
          <div className="mt-4 text-xs text-slate-500">Visible and active for student enrollment</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earnings</span>
            <h3 className="text-3xl font-black text-brand-primary mt-2">₦0.00</h3>
          </div>
          <div className="mt-4 text-xs text-slate-500">Revenue generated from paid enrollments</div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-[-50%] right-[-10%] w-80 h-80 rounded-full bg-brand-primary/30 blur-[100px]" />
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-accent">Academy Quick Tip</span>
          <h4 className="text-xl font-bold">Ready to upload lessons?</h4>
          <p className="text-slate-350 text-sm leading-relaxed">
            Create a course first to act as a container for your modules. Then upload MP4 files directly. 
            Mux automatically optimizes your videos for adaptive bitrate streaming, ensuring your students enjoy buffer-free lessons on any network.
          </p>
        </div>
      </div>
    </div>
  );
}
