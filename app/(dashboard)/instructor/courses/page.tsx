import React from 'react';
import CourseBuilder from '@/components/instructor/CourseBuilder';

export default function InstructorCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
          Course Studio
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create, publish, and manage all your courses.
        </p>
      </div>

      <CourseBuilder />
    </div>
  );
}
