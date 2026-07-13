import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export interface Assignment {
  id: string;
  name: string;
  dueDate: string;
  status: 'Graded' | 'Pending Review' | 'Open';
  grade: string;
}

export const mockAssignments: Assignment[] = [
  { id: '1', name: 'Week 1: Git & GitHub Masterclass', dueDate: '12/04/2026', status: 'Graded', grade: '95/100' },
  { id: '2', name: 'Week 2: Advanced HTML5 & CSS3', dueDate: '19/04/2026', status: 'Graded', grade: '88/100' },
  { id: '3', name: 'Week 3: CSS Flexbox & CSS Grid', dueDate: '26/04/2026', status: 'Graded', grade: '90/100' },
  { id: '4', name: 'Week 4: JavaScript Fundamentals', dueDate: '03/05/2026', status: 'Graded', grade: '85/100' },
  { id: '5', name: 'Week 5: DOM Manipulation & Events', dueDate: '10/05/2026', status: 'Graded', grade: '92/100' },
  { id: '6', name: 'Week 6: Asynchronous JS & API Integration', dueDate: '17/05/2026', status: 'Graded', grade: '94/100' },
  { id: '7', name: 'Week 7: React Components & Props', dueDate: '24/05/2026', status: 'Graded', grade: '89/100' },
  { id: '8', name: 'Week 8: State Management & Hooks', dueDate: '31/05/2026', status: 'Graded', grade: '91/100' },
  { id: '9', name: 'Week 9: Next.js Pages & App Router Routing', dueDate: '07/06/2026', status: 'Graded', grade: '93/100' },
  { id: '10', name: 'Week 10: High-Fidelity Figma UI Redesign', dueDate: '14/06/2026', status: 'Open', grade: '--' },
];

export default function StudentAssignmentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Assignments</h1>
        <p className="text-slate-500 text-xs mt-1">Review your weekly coursework, check grades, and submit outstanding practical items.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Assignment Name</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {mockAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-150 flex items-center justify-center text-slate-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-700">{assignment.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">{assignment.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      assignment.status === 'Graded'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10'
                        : assignment.status === 'Pending Review'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/10'
                        : 'bg-blue-500/10 text-blue-600 border-blue-500/10'
                    }`}>
                      {assignment.status === 'Graded' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {assignment.status === 'Pending Review' && <Clock className="w-3.5 h-3.5" />}
                      {assignment.status === 'Open' && <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{assignment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{assignment.grade}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/student/assignments/${assignment.id}`}
                      className={`inline-flex items-center gap-1 text-xs font-bold transition px-4 py-2 rounded-xl ${
                        assignment.status === 'Open'
                          ? 'bg-[#1E60D5] text-white hover:bg-[#1E60D5]/90'
                          : 'text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span>{assignment.status === 'Open' ? 'Submit' : 'View'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
