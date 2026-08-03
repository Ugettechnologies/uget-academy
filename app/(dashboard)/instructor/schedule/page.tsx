import React from 'react';
import { requireRole } from '@/lib/require-role';
import TimetableManager from '@/components/instructor/TimetableManager';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorSchedulePage() {
  await requireRole(['INSTRUCTOR']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <Calendar className="w-7 h-7 text-blue-400" />
            Class Schedule & Timetable Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Edit your class timetable. All changes automatically reflect on assigned student portals in real time.
          </p>
        </div>
      </div>

      <TimetableManager />
    </div>
  );
}
