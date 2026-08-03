import React from 'react';
import { requireRole } from '@/lib/require-role';
import LessonUploader from '@/components/instructor/LessonUploader';
import { FolderDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorMaterialsPage() {
  await requireRole(['INSTRUCTOR']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <FolderDown className="w-7 h-7 text-purple-400" />
            Materials & Content Dispatch
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Upload and dispatch learning resources directly to your assigned students' portal materials library.
          </p>
        </div>
      </div>

      <LessonUploader />
    </div>
  );
}
