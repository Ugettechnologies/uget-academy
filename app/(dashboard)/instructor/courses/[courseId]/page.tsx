import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LessonUploader from '@/components/instructor/LessonUploader';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InstructorCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    redirect('/login');
  }

  // Fetch course and its lessons
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!course || course.instructorId !== session.userId) {
    redirect('/instructor/courses');
  }

  return (
    <div className="space-y-8">
      {/* Header and Back Link */}
      <div className="flex flex-col gap-2">
        <Link
          href="/instructor/courses"
          className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 w-fit"
        >
          &larr; Back to Courses
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
              {course.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{course.description}</p>
          </div>
          <div className="text-right">
            <span className="block text-2xl font-black text-brand-primary">
              {course.price === 0 ? 'Free' : `₦${course.price.toLocaleString()}`}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
              Course ID: {course.id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Lesson Uploader */}
        <div className="lg:col-span-1 space-y-6">
          <LessonUploader courseId={course.id} onLessonAdded={() => {}} />
        </div>

        {/* Right Side: Lessons List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">
              Course Syllabus ({course.lessons.length} Lessons)
            </h3>

            {course.lessons.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No lessons uploaded for this course yet.
              </div>
            ) : (
              <div className="space-y-4">
                {course.lessons.map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="flex justify-between items-center p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <div>
                      <span className="text-xs text-brand-primary font-bold mr-2">
                        Lesson {lesson.order}:
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          lesson.muxPlaybackId
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                            : 'bg-amber-50 text-amber-700 border border-amber-150'
                        }`}
                      >
                        {lesson.muxPlaybackId ? 'Ready' : 'Processing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
