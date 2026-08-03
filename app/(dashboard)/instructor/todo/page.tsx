import React from 'react';
import { requireRole } from '@/lib/require-role';
import InstructorTodoList from '@/components/instructor/InstructorTodoList';
import { ListTodo } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorTodoPage() {
  await requireRole(['INSTRUCTOR']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <ListTodo className="w-7 h-7 text-teal-400" />
            Instructor To-Do List & Task Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Plan your daily grading, class preparation, and weekly milestones.
          </p>
        </div>
      </div>

      <InstructorTodoList />
    </div>
  );
}
