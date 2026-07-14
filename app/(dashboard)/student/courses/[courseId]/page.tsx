import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CourseWatchView from '@/components/student/CourseWatchView';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getSession();

  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  // Fetch course details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!course) {
    redirect('/student/courses');
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.userId as string,
        courseId: course.id,
      },
    },
  });

  const isEnrolled = !!enrollment;

  if (isEnrolled) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/student"
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            &larr; Back to Dashboard
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white mt-2">
            {course.title}
          </h2>
        </div>
        <CourseWatchView 
          course={course} 
          lessons={course.lessons} 
          user={{
            firstName: (session.firstName as string) || 'Student',
            lastName: (session.lastName as string) || '',
          }}
        />
      </div>
    );
  }

  // Render course landing / enrollment page if not enrolled
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <Link
          href="/student/courses"
          className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 w-fit"
        >
          &larr; Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Details (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <span className="text-xs text-brand-primary font-bold uppercase tracking-wider">
              Course Details
            </span>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white mt-2">
              {course.title}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Taught by: {course.instructor.firstName} {course.instructor.lastName}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-350 mt-6 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Syllabus (locked) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">
              Syllabus ({course.lessons.length} Modules)
            </h3>
            {course.lessons.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Syllabus contents are currently empty.
              </div>
            ) : (
              <div className="space-y-3">
                {course.lessons.map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="flex justify-between items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                        {lesson.order}
                      </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {lesson.title}
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enrollment / Checkout panel (Right) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Enrollment Fee
              </span>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">
                {course.price === 0 ? 'Free' : `₦${course.price.toLocaleString()}`}
              </h3>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <Link
                href={`/student/courses/${course.id}/pay`}
                className="flex w-full items-center justify-center rounded-lg bg-brand-primary hover:bg-brand-primary/95 py-3.5 px-4 text-sm font-bold text-white transition shadow-lg shadow-brand-primary/10"
              >
                Proceed to Payment
              </Link>
              <p className="text-[11px] text-center text-gray-400">
                Secure transaction. Access is granted instantly after payment approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
