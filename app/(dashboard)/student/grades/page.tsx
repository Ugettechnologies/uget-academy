import React from 'react';
import { 
  Award, 
  TrendingUp, 
  CheckCircle, 
  BookOpen, 
  FileText 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface GradeItem {
  name: string;
  type: 'Assignment' | 'Examination';
  score: string;
  status: 'Graded' | 'Open' | 'Pending';
}

const gradesList: GradeItem[] = [
  { name: 'Week 1: Git & GitHub Masterclass', type: 'Assignment', score: '95/100', status: 'Graded' },
  { name: 'Week 2: Advanced HTML5 & CSS3', type: 'Assignment', score: '88/100', status: 'Graded' },
  { name: 'Week 3: CSS Flexbox & CSS Grid', type: 'Assignment', score: '90/100', status: 'Graded' },
  { name: 'Week 4: JavaScript Fundamentals', type: 'Assignment', score: '85/100', status: 'Graded' },
  { name: 'Week 5: DOM Manipulation & Events', type: 'Assignment', score: '92/100', status: 'Graded' },
  { name: 'Mid-Term Frontend Evaluation', type: 'Examination', score: '94/100', status: 'Graded' },
  { name: 'Week 6: Asynchronous JS & API Integration', type: 'Assignment', score: '94/100', status: 'Graded' },
  { name: 'Week 7: React Components & Props', type: 'Assignment', score: '89/100', status: 'Graded' },
  { name: 'Week 8: State Management & Hooks', type: 'Assignment', score: '91/100', status: 'Graded' },
  { name: 'Week 9: Next.js Pages & App Router Routing', type: 'Assignment', score: '93/100', status: 'Graded' },
  { name: 'Final Academy Certification Exam', type: 'Examination', score: '90/100', status: 'Graded' },
  { name: 'Week 10: High-Fidelity Figma UI Redesign', type: 'Assignment', score: '--', status: 'Open' },
];

export default function StudentGradesPage() {
  const overallAverage = 91; // (Sum of scores) / Count of graded items

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Grades</h1>
        <p className="text-slate-500 text-xs mt-1">Track your performance scorecard, grade breakdown, and overall average standing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA Average Card */}
        <div className="lg:col-span-1 bg-[#1E60D5] rounded-3xl p-8 text-white shadow-xl shadow-[#1E60D5]/10 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">Academy standing</span>
            <span className="text-5xl font-black block mt-2">{overallAverage}%</span>
          </div>
          
          <div className="space-y-2 mt-6">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Excellent Standing
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-normal">
              You are currently performing in the top 10% of the class. Keep up the high quality submissions to maintain your credentials.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-[#1E60D5]">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-3xl font-black block">10 / 11</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assignments Graded</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-[#1E60D5]">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <span className="text-3xl font-black block">2 / 2</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Exams Evaluated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown table card */}
      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50">
          <h2 className="text-sm font-black text-slate-800">Gradebook Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-8 py-4">Item Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {gradesList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-4 font-semibold text-slate-700">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.type === 'Examination'
                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                        : 'bg-blue-50 text-[#1E60D5] border-blue-100'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-700">{item.score}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      item.status === 'Graded'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                        : 'bg-blue-50 text-blue-600 border-blue-500/20'
                    }`}>
                      <span>{item.status}</span>
                    </span>
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
