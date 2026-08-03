import React from 'react';
import { requireRole } from '@/lib/require-role';
import ClassSectionManager from '@/components/admin/ClassSectionManager';
import { Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminClassesPage() {
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <Layers className="w-7 h-7 text-cyan-400" />
            Class Sections & Student Assignment
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage morning, evening, and weekend class sections for each course and assign enrolled students to specific class sections.
          </p>
        </div>
      </div>

      <ClassSectionManager />
    </div>
  );
}
