import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  FileCheck, 
  CheckCircle2, 
  ArrowRight,
  Clock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentPracticalExamsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // Enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // Fetch practical tasks
  const practicals = await prisma.exam.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: {
        select: {
          title: true,
          grades: {
            where: { userId },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-850 tracking-tight">Practical Evaluations</h1>
        <p className="text-slate-500 text-xs mt-1">Review guidelines and grades for your architectural practical assignments and reviews.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        {practicals.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">No practical evaluations published for your cohort course.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Creative Score</th>
                  <th className="px-6 py-4">Interview Score</th>
                  <th className="px-6 py-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {practicals.map((exam) => {
                  const grade = exam.course.grades[0];
                  const isGraded = grade && (grade.creativeScore > 0 || grade.interviewScore > 0);

                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-150">
                            <FileCheck className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{exam.course.title} Practical</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Timed review</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          isGraded
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                            : 'bg-blue-50 text-blue-600 border-blue-500/20'
                        }`}>
                          {isGraded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span>{isGraded ? 'Graded' : 'Awaiting Grading'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-700">
                        {isGraded ? `${grade.creativeScore}%` : '--'}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-705">
                        {isGraded ? `${grade.interviewScore}%` : '--'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 max-w-xs truncate italic">
                        {grade?.remarks ? `"${grade.remarks}"` : 'No instructor notes recorded.'}
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
