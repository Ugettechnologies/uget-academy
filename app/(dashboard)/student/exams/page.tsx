import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  UserCheck, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info
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

  // 2. Fetch quizzes & instructor information
  const quizzes = await prisma.quiz.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      attempts: {
        where: { userId },
      },
      course: {
        select: { 
          title: true,
          instructor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        },
      },
    },
  });

  // 3. Fetch practical exams & instructor information
  const practicalExams = await prisma.exam.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: {
        select: { 
          title: true,
          instructor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          },
          grades: {
            where: { userId },
          },
        },
      },
    },
  });

  // Format exams
  const examsList = [
    ...quizzes.map((quiz) => {
      const attempt = quiz.attempts[0];
      const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 20;

      return {
        id: quiz.id,
        title: quiz.title,
        courseTitle: quiz.course.title,
        duration: '60 Minutes',
        totalMarks: questionsCount > 0 ? questionsCount * 1 : 60,
        passMarks: Math.round((questionsCount > 0 ? questionsCount : 60) * 0.5),
        startTime: '12 May 2026 23:27:00 (WAT)',
        questionCount: questionsCount > 0 ? questionsCount : 60,
        tutorName: `${quiz.course.instructor.firstName} ${quiz.course.instructor.lastName}`,
        tutorEmail: quiz.course.instructor.email,
        tutorPhone: quiz.course.instructor.phone || '+234 800 123 4567',
        isCompleted: !!attempt,
        score: attempt ? attempt.score : null,
        passed: attempt ? attempt.passed : false,
        link: `/student/courses/${quiz.courseId}`,
        type: 'QUIZ' as const,
      };
    }),
    ...practicalExams.map((exam) => {
      const grade = exam.course.grades[0];
      const isGraded = grade && (grade.creativeScore > 0 || grade.interviewScore > 0);

      return {
        id: exam.id,
        title: `Practical Examination: ${exam.course.title}`,
        courseTitle: exam.course.title,
        duration: '120 Minutes',
        totalMarks: 100,
        passMarks: 50,
        startTime: 'Scheduled Flexible Submission',
        questionCount: 1,
        tutorName: `${exam.course.instructor.firstName} ${exam.course.instructor.lastName}`,
        tutorEmail: exam.course.instructor.email,
        tutorPhone: exam.course.instructor.phone || '+234 800 123 4567',
        isCompleted: isGraded,
        score: isGraded ? Math.round((grade.creativeScore + grade.interviewScore) / 2) : null,
        passed: isGraded ? (grade.creativeScore + grade.interviewScore) / 2 >= 50 : false,
        link: `/student/exams/practicals`,
        type: 'PRACTICAL' as const,
      };
    }),
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-brand-primary" />
          Examinations & Assessment Details
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Review examination instructions, check duration & pass marks, contact tutors, and launch timed tests.
        </p>
      </div>

      {examsList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Examinations Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your instructor has not scheduled any examinations or mid-course tests for your enrolled courses yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {examsList.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs hover:shadow-md transition">
              
              {/* Exam Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-primary tracking-wider bg-brand-primary/10 px-2.5 py-1 rounded-md">
                    {item.courseTitle}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white mt-2">{item.title}</h2>
                </div>

                <div className="flex items-center gap-3">
                  {item.isCompleted ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Score: {item.score}% ({item.passed ? 'PASSED' : 'COMPLETED'})
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Available to Take
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Metadata Stat Badges matching Design Spec */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Duration</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">{item.duration}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Marks</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">{item.totalMarks}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Pass Marks</span>
                  <span className="text-base font-extrabold text-emerald-500 mt-0.5 block">{item.passMarks}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Start Time</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">{item.startTime}</span>
                </div>
              </div>

              {/* General Instructions Box matching Spec */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  General Instructions
                </h3>
                
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                  <li>This question paper has <strong>{item.questionCount} questions</strong>.</li>
                  <li>Each question carries <strong>1 mark</strong>.</li>
                  <li>Each question has <strong>4 options</strong>. Select the correct option.</li>
                  <li>Click Finish only after completion. Your exam will automatically submit once time elapses.</li>
                </ul>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 font-medium mt-3">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Warning:</strong> Do not attempt to navigate away from the exam. Switching to another window or minimizing the browser window will automatically log you out of the exam session.
                  </div>
                </div>
              </div>

              {/* Tutor Details Card matching Spec */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Tutor Details</h4>
                  <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-300 font-medium pt-1">
                    <span>Name: <strong className="text-slate-900 dark:text-white">{item.tutorName}</strong></span>
                    <span>Email: <strong className="text-slate-900 dark:text-white">{item.tutorEmail}</strong></span>
                    <span>Mobile: <strong className="text-slate-900 dark:text-white">{item.tutorPhone}</strong></span>
                  </div>
                </div>

                <Link
                  href={item.link}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs transition shadow-sm"
                >
                  <span>{item.isCompleted ? 'Review Score' : item.type === 'QUIZ' ? 'Start Test' : 'Start Exam'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
