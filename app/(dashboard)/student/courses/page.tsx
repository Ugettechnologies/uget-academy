import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CourseCard from '@/components/student/CourseCard';

export const dynamic = 'force-dynamic';

export default async function StudentCoursesCatalogPage() {
  const session = await getSession();

  // Fetch all published courses
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      instructor: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch student's enrollments to determine enrollment status
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session?.userId as string },
    select: { courseId: true },
  });

  const enrolledCourseIds = new Set(enrollments.map((e: any) => e.courseId));

  return (
    <div className="space-y-8 animate-fade-in text-white">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Course Catalog
        </h2>
        <p className="mt-1.5 text-sm text-slate-400 font-normal leading-relaxed">
          Explore world-class developer masterclasses designed to level up your engineering career.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 backdrop-blur-md">
          No courses are currently available in the catalog.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledCourseIds.has(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
