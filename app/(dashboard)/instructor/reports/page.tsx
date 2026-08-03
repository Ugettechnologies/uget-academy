import React from 'react';
import { requireRole } from '@/lib/require-role';
import AdminReportForm from '@/components/instructor/AdminReportForm';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorReportsPage() {
  await requireRole(['INSTRUCTOR']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <FileText className="w-7 h-7 text-rose-400" />
            Reporting to Admin
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Submit your daily activity review and weekly summary review reports to the UGET Academy Admin.
          </p>
        </div>
      </div>

      <AdminReportForm />
    </div>
  );
}
