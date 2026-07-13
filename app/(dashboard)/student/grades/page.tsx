import React from 'react';
import { 
  Award, 
  TrendingUp, 
  CheckCircle, 
  BookOpen, 
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PerformanceItem {
  name: string;
  score: string;
  status: 'Pending' | 'Graded';
  date: string;
}

const performanceList: PerformanceItem[] = [
  { name: 'Assignment Week 10: High-Fidelity', score: '100%', status: 'Pending', date: '15/06/2026' },
  { name: 'Final evaluation 1', score: '100%', status: 'Graded', date: '15/06/2026' },
  { name: 'Week 9: Routing', score: '100%', status: 'Graded', date: '08/06/2026' },
  { name: 'Week 8: State', score: '100%', status: 'Graded', date: '01/06/2026' },
];

export default function StudentGradesDashboardPage() {
  const overallAverage = 83; // Exact match to the mock image score: 83%

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Gradeboard</h1>
        <p className="text-slate-500 text-xs mt-1">Cohort 1. Web Development</p>
      </div>

      {/* Blue Banner with progress metrics */}
      <div className="bg-[#1E60D5] rounded-3xl p-8 text-white shadow-xl shadow-[#1E60D5]/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-white/10 rounded-full filter blur-3xl" />
        
        {/* Overall score */}
        <div className="md:col-span-4 flex flex-col justify-center">
          <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">Overall score</span>
          <span className="text-7xl font-black block leading-none mt-2">{overallAverage}<span className="text-2xl font-medium">%</span></span>
        </div>

        {/* Progress bars matrix */}
        <div className="md:col-span-8 space-y-4">
          {/* Assignments */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/90">
              <span>Assignments progression</span>
              <span>93%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: '93%' }} />
            </div>
          </div>

          {/* Exams */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/90">
              <span>Exams progression</span>
              <span>92%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: '92%' }} />
            </div>
          </div>

          {/* Attendance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/90">
              <span>Attendance rate</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Yellow Advisory Info Alert box */}
      <div className="bg-[#FEF3C7] border border-[#FCD34D] text-[#B45309] rounded-2xl p-5 text-xs flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Syllabus Evaluation Alert</p>
          <p className="leading-relaxed opacity-90 font-medium">To qualify for certificate generation, all week-by-week coursework submissions must undergo verification. Attendance should exceed 80% class watch time limits.</p>
        </div>
      </div>

      {/* Performance Breakdown Table */}
      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Your performance</h2>
          <span className="text-xs font-bold text-slate-650 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
            Class Attendance: <span className="text-[#1E60D5] font-extrabold">7/9</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-8 py-4">Task/Assessment</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {performanceList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-4 font-semibold text-slate-700">{item.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{item.score}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      item.status === 'Graded'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-50 text-[#D97706] border-amber-500/20'
                    }`}>
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-semibold">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
