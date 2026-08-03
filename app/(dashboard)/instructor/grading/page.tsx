import React from 'react';
import { requireRole } from '@/lib/require-role';
import GradingFeedbackPanel from '@/components/instructor/GradingFeedbackPanel';
import { CheckSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorGradingPage() {
  await requireRole(['INSTRUCTOR']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <CheckSquare className="w-7 h-7 text-amber-400" />
            Grading Queue & DM Feedback Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Evaluate student deliverables, record scores, and dispatch feedback directly to student portals and email.
          </p>
        </div>
      </div>

      <GradingFeedbackPanel />
    </div>
  );
}
