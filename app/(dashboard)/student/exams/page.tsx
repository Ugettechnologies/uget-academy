import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  FileCheck, 
  CheckCircle2, 
  Clock,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentExamsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // 1. Fetch student enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // 2. Fetch quizzes in enrolled courses & check attempts
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

  // 3. Fetch practical exams & check student grade creative/interview score
  const practicalExams = await prisma.exam.findMany({
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

  // Map database elements into UI structures
  const formattedExams: Array<{
    id: string;
    title: string;
    description: string;
    type: 'QUIZ' | 'PRACTICAL';
    status: 'Graded' | 'Taken' | 'Open';
    grade: string;
    link: string;
  }> = [];

  // Map Quizzes
  quizzes.forEach((quiz) => {
    const attempt = quiz.attempts[0];
    let status: 'Graded' | 'Taken' | 'Open' = 'Open';
    let grade = '--';

    if (attempt) {
      status = 'Graded';
      grade = `${attempt.score}%`;
    }

    formattedExams.push({
      id: quiz.id,
      title: quiz.title,
      description: 'Theoretical multiple-choice evaluation testing module concepts.',
      type: 'QUIZ',
      status,
      grade,
      link: `/student/courses/${quiz.courseId}`, // Can take it inside workspace tabs
    });
  });

  // Map Practicals
  practicalExams.forEach((exam) => {
    const gradeRecord = exam.course.grades[0];
    let status: 'Graded' | 'Taken' | 'Open' = 'Open';
    let grade = '--';

    if (gradeRecord && (gradeRecord.creativeScore > 0 || gradeRecord.interviewScore > 0)) {
      status = 'Graded';
      grade = `${Math.round((gradeRecord.creativeScore + gradeRecord.interviewScore) / 2)}%`;
    }

    formattedExams.push({
      id: exam.id,
      title: `Practical: ${exam.course.title}`,
      description: exam.practicalTask.substring(0, 150) + '...',
      type: 'PRACTICAL',
      status,
      grade,
      link: `/student/exams/practicals`,
    });
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-850 tracking-tight">Examinations</h1>
        <p className="text-slate-500 text-xs mt-1">Acquire technical endorsements by completing timed practical exams and multiple-choice quizzes.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {formattedExams.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs font-semibold border border-slate-100 shadow-sm">
            No exams or quizzes are currently published for your enrolled syllabus.
          </div>
        ) : (
          formattedExams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 transition hover:shadow-md">
              <div className="space-y-3.5 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E0EEFF] text-[#1E60D5] flex items-center justify-center border border-blue-100">
                    <GraduationCap className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-805 text-base tracking-tight">{exam.title}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Type: {exam.type}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">{exam.description}</p>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider md:text-right">Grade</span>
                  <span className="text-sm font-black text-slate-800">{exam.grade}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    exam.status === 'Graded'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                      : 'bg-blue-50 text-blue-600 border-blue-500/20'
                  }`}>
                    {exam.status === 'Graded' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{exam.status}</span>
                  </span>

                  <Link
                    href={exam.link}
                    className={`inline-flex items-center gap-1 text-xs font-bold transition px-4 py-2.5 rounded-xl border ${
                      exam.status === 'Open' && exam.type === 'QUIZ'
                        ? 'bg-[#1E60D5] text-white hover:bg-[#1E60D5]/90 border-transparent shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>{exam.status === 'Open' ? 'Start' : 'Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
