import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, 
  Clock, 
  ArrowRight,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentQuizExamsPage() {
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

  // Fetch quizzes
  const quizzes = await prisma.quiz.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      attempts: {
        where: { userId },
      },
      course: {
        select: { title: true },
      },
    },
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-850 tracking-tight">Quiz Assessments</h1>
        <p className="text-slate-500 text-xs mt-1">Acquire technical endorsements by passing timed theoretical multiple-choice quizzes.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        {quizzes.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">No quizzes published for your cohort course syllabus.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Course category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {quizzes.map((quiz) => {
                  const attempt = quiz.attempts[0];
                  const isAttempted = !!attempt;

                  return (
                    <tr key={quiz.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-150">
                            <Award className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{quiz.title}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{quiz.questions ? (quiz.questions as any[]).length : 0} questions</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-505">
                        {quiz.course.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          isAttempted
                            ? 'bg-emerald-55 text-emerald-605 border-emerald-500/20'
                            : 'bg-blue-50 text-blue-600 border-blue-500/20'
                        }`}>
                          {isAttempted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span>{isAttempted ? 'Completed' : 'Not Attempted'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800">
                        {isAttempted ? `${attempt.score}%` : '--'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/student/courses/${quiz.courseId}`}
                          className={`inline-flex items-center gap-1 text-xs font-bold transition px-4 py-2 rounded-xl border ${
                            !isAttempted
                              ? 'bg-[#1E60D5] text-white hover:bg-[#1E60D5]/90 border-transparent shadow-sm'
                              : 'bg-white border-slate-205 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span>{!isAttempted ? 'Take Quiz' : 'View'}</span>
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
