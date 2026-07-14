import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentAssignmentsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // Fetch enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // Fetch all assignments for enrolled courses
  const assignments = await prisma.assignment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      submissions: {
        where: { userId },
      },
      course: {
        select: { title: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-850">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Assignments</h1>
        <p className="text-slate-500 text-xs mt-1">Review your weekly coursework, check grades, and submit outstanding practical items.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        {assignments.length === 0 ? (
          <div className="py-20 text-center text-slate-450 text-xs font-semibold">
            No assignments have been assigned to your enrolled courses.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Assignment Name</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {assignments.map((item) => {
                  const submission = item.submissions[0];
                  
                  // Status resolver
                  let statusLabel: 'Graded' | 'Pending Review' | 'Open' = 'Open';
                  if (submission) {
                    statusLabel = submission.grade !== null ? 'Graded' : 'Pending Review';
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-150">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <span className="font-bold text-slate-800 leading-snug">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {item.course.title}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-450 font-bold font-mono">
                        {new Date(item.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          statusLabel === 'Graded'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                            : statusLabel === 'Pending Review'
                            ? 'bg-amber-50 text-amber-605 border-amber-500/20'
                            : 'bg-blue-50 text-blue-600 border-blue-500/20'
                        }`}>
                          {statusLabel === 'Graded' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {statusLabel === 'Pending Review' && <Clock className="w-3.5 h-3.5" />}
                          {statusLabel === 'Open' && <AlertCircle className="w-3.5 h-3.5" />}
                          <span>{statusLabel}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800">
                        {submission && submission.grade !== null ? `${submission.grade}/100` : '--'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/student/assignments/${item.id}`}
                          className={`inline-flex items-center gap-1 text-xs font-bold transition px-4 py-2 rounded-xl border ${
                            statusLabel === 'Open'
                              ? 'bg-[#1E60D5] text-white hover:bg-[#1E60D5]/90 border-transparent shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{statusLabel === 'Open' ? 'Submit' : 'View'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
