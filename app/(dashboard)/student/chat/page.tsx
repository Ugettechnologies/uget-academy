import React from 'react';
import { requireRole } from '@/lib/require-role';
import StudentChatView from '@/components/student/StudentChatView';
import { MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentChatPage() {
  await requireRole(['STUDENT']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <MessageCircle className="w-7 h-7 text-[#60A5FA]" />
            Direct Messages & Cohort Chat
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Connect privately with your course instructor or message fellow cohort classmates.
          </p>
        </div>
      </div>

      <StudentChatView />
    </div>
  );
}
