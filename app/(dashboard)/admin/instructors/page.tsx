import React from 'react';
import { requireRole } from '@/lib/require-role';
import AdminInstructorDirectory from '@/components/admin/AdminInstructorDirectory';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminInstructorsPage() {
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <Users className="w-7 h-7 text-purple-400" />
            Instructors & Staff Directory
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Provision instructor accounts, format department IDs, and manage staff archiving on file.
          </p>
        </div>
      </div>

      <AdminInstructorDirectory />
    </div>
  );
}
