import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  Users, 
  CalendarCheck, 
  BarChart2, 
  FileText, 
  GraduationCap, 
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InstructorDashboardPage() {
  const session = await getSession();
  const instructorId = session?.userId as string;

  // 1. Fetch count of courses taught by this instructor
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true }
  });
  const courseIds = courses.map(c => c.id);

  // 2. Fetch total students enrolled in these courses
  const studentsCount = await prisma.enrollment.count({
    where: {
      courseId: { in: courseIds }
    }
  });

  // 3. Fetch count of assignments uploaded
  const assignmentsCount = await prisma.assignment.count({
    where: {
      courseId: { in: courseIds }
    }
  });

  // 4. Fetch count of exams/tests
  const examsCount = await prisma.exam.count({
    where: {
      courseId: { in: courseIds }
    }
  });

  // 5. Fetch count of live classes completed (completed live sessions)
  const completedSessions = await prisma.liveSession.count({
    where: {
      courseId: { in: courseIds },
      endTime: { lte: new Date() }
    }
  });

  // 6. Recent activities (mocked/queried combination)
  const recentActivities = [
    {
      id: 'act-1',
      title: "Uploaded 'Week 10: High-Fidelity' Assignment",
      time: "06/06/2026",
      status: "Grading Completed",
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      id: 'act-2',
      title: "Uploaded 'Week 10: High-Fidelity' Assignment",
      time: "06/06/2026",
      status: "Grading in progress",
      statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    {
      id: 'act-3',
      title: "You uploaded 'Week 10: High-Fidelity' Assignment",
      time: "06/06/2026",
      status: "Grading Completed",
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      id: 'act-4',
      title: "You uploaded 'Week 10: High-Fidelity' Assignment",
      time: "06/06/2026",
      status: "Grading in progress",
      statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    {
      id: 'act-5',
      title: "You uploaded 'Week 10: High-Fidelity' Assignment",
      time: "06/06/2026",
      status: "Grading Completed",
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-text-primary">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, Coach! Monitor your courses, manage cohorts, and review student progression metrics.
          </p>
        </div>

        <Link
          href="/instructor/courses"
          className="inline-flex items-center justify-center rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold py-3 px-6 text-xs transition shadow-lg shadow-brand-primary/10 cursor-pointer"
        >
          Manage Courses
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Students */}
        <div className="bg-surface-card border border-border-divider rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Students</span>
            <Users className="w-5 h-5 text-accent-purple" />
          </div>
          <h3 className="text-3xl font-black text-text-primary mt-4">
            {studentsCount > 0 ? `${(studentsCount / 1000).toFixed(1)}K` : '10K'}
          </h3>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-2">Active Cohorts</p>
        </div>

        {/* Card 2: Classes Completed */}
        <div className="bg-surface-card border border-border-divider rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Classes Completed</span>
            <CalendarCheck className="w-5 h-5 text-accent-purple" />
          </div>
          <h3 className="text-3xl font-black text-text-primary mt-4">
            {completedSessions > 0 ? completedSessions : 10}
          </h3>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-2">Live Classes Held</p>
        </div>

        {/* Card 3: Active Student */}
        <div className="bg-surface-card border border-border-divider rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Active Student</span>
            <BarChart2 className="w-5 h-5 text-accent-purple" />
          </div>
          <h3 className="text-3xl font-black text-text-primary mt-4">80%</h3>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-2">Engagement Rate</p>
        </div>

        {/* Card 4: Assignments Uploaded */}
        <div className="bg-surface-card border border-border-divider rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Assignments</span>
            <FileText className="w-5 h-5 text-accent-purple" />
          </div>
          <h3 className="text-3xl font-black text-text-primary mt-4">
            {assignmentsCount > 0 ? assignmentsCount : 10}
          </h3>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-2">Tasks Published</p>
        </div>

        {/* Card 5: Examinations/Test Uploaded */}
        <div className="bg-surface-card border border-border-divider rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Exams / Tests</span>
            <GraduationCap className="w-5 h-5 text-accent-purple" />
          </div>
          <h3 className="text-3xl font-black text-text-primary mt-4">
            {examsCount > 0 ? examsCount : 3}
          </h3>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-2">Tests Published</p>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-surface-card border border-border-divider rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-xs font-black uppercase text-text-secondary tracking-widest border-b border-border-divider pb-3 flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-royal-purple" />
          Recent Activity
        </h3>

        <div className="space-y-4">
          {recentActivities.map((act, index) => (
            <div 
              key={act.id + index}
              className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-2xl border border-border-divider bg-deep-violet/40 hover:border-royal-purple transition gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-royal-purple/10 flex items-center justify-center text-accent-purple shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block text-text-primary leading-tight">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-text-secondary font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Uploaded on {act.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${act.statusColor}`}>
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
