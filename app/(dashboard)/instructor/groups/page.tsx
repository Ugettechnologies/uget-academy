import React from 'react';
import { requireRole } from '@/lib/require-role';
import GroupProjectAssigner from '@/components/instructor/GroupProjectAssigner';
import { Users2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorGroupsPage() {
  await requireRole(['INSTRUCTOR']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <Users2 className="w-7 h-7 text-indigo-400" />
            Group & Pair Project Assigner
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Split your assigned class into groups or pairs and assign shared cohort projects.
          </p>
        </div>
      </div>

      <GroupProjectAssigner />
    </div>
  );
}
