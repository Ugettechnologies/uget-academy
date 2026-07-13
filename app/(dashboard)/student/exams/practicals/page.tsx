import React from 'react';
import Link from 'next/link';
import { 
  FileCheck, 
  CheckCircle2, 
  ArrowRight,
  Calendar
} from 'lucide-react';
import { mockExams } from '../page';

export const dynamic = 'force-dynamic';

export default function StudentPracticalExamsPage() {
  // Only filter exams that are practical (id === '1')
  const practicalExams = mockExams.filter(e => e.id === '1');

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Practical Evaluations</h1>
        <p className="text-slate-500 text-xs mt-1">Review guidelines and grades for your architectural practical assignments and reviews.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {practicalExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileCheck className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 block">{exam.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Evaluation Period: 180 mins</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-450 font-semibold">{exam.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border bg-emerald-50 text-emerald-600 border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{exam.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-700">{exam.grade}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/student/exams/1/result`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
