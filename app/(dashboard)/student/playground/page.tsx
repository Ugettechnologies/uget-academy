import React from 'react';
import { requireRole } from '@/lib/require-role';
import CodePlayground from '@/components/student/CodePlayground';
import { Code2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentPlaygroundPage() {
  await requireRole(['STUDENT']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <Code2 className="w-7 h-7 text-emerald-400" />
            Code Playground & IDE
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Write, run, and auto-grade your coding assignments live in your browser.
          </p>
        </div>
      </div>

      <CodePlayground />
    </div>
  );
}
