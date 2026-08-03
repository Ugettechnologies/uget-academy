import React from 'react';
import { requireRole } from '@/lib/require-role';
import AssessmentCreator from '@/components/instructor/AssessmentCreator';
import { PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CreateAssessmentPage() {
  await requireRole(['INSTRUCTOR']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <PlusCircle className="w-7 h-7 text-cyan-400" />
            Set Assessment & Draft Questions
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Create assignments, CBT quizzes, or 3-section exams using the built-in rich text drafting editor.
          </p>
        </div>
      </div>

      <AssessmentCreator />
    </div>
  );
}
