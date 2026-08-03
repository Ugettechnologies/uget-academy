import React from 'react';
import { requireRole } from '@/lib/require-role';
import AdminCourseManager from '@/components/admin/AdminCourseManager';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <BookOpen className="w-7 h-7 text-blue-400" />
            Courses & Tutor Assignment Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Create, publish, or archive courses and explicitly assign tutors/instructors to specific course tracks.
          </p>
        </div>
      </div>

      <AdminCourseManager />
    </div>
  );
}
