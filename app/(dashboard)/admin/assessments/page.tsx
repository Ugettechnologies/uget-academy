import React from 'react';
import { requireRole } from '@/lib/require-role';
import AdminAssessmentBuilder from '@/components/admin/AdminAssessmentBuilder';
import { FileSpreadsheet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAssessmentsPage() {
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <FileSpreadsheet className="w-7 h-7 text-amber-400" />
            Platform-Wide Multi-Step Assessment Builder
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure time limits, pass marks, late policies, and question types across all courses.
          </p>
        </div>
      </div>

      <AdminAssessmentBuilder />
    </div>
  );
}
