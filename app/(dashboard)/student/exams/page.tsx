import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  Play, 
  GraduationCap, 
  Clock,
  ArrowRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'Graded' | 'Open' | 'Taken';
  grade: string;
  dueDate: string;
}

export const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Mid-Term Frontend Evaluation',
    description: 'Practical evaluation testing HTML5 semantic design, advanced CSS grid, responsive layout structures, and asynchronous Javascript integration.',
    duration: '180 Minutes',
    status: 'Graded',
    grade: '94/100',
    dueDate: '15/05/2026',
  },
  {
    id: '2',
    title: 'Final Academy Certification Exam',
    description: 'Comprehensive evaluation covering Next.js framework, advanced state management hooks, database connections, and full-stack deployment setups.',
    duration: '120 Minutes',
    status: 'Open',
    grade: '--',
    dueDate: '20/06/2026',
  }
];

export default function StudentExamsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Examinations</h1>
        <p className="text-slate-500 text-xs mt-1">Acquire certifications by completing timed practical exams and structured evaluations.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockExams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 transition hover:shadow-md">
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E0EEFF] text-[#1E60D5] flex items-center justify-center">
                  <GraduationCap className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{exam.title}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duration: {exam.duration}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">{exam.description}</p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider md:text-right">Grade</span>
                <span className="text-sm font-black text-slate-800">{exam.grade}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  exam.status === 'Graded'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                    : 'bg-blue-50 text-blue-600 border-blue-500/20'
                }`}>
                  {exam.status === 'Graded' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>{exam.status}</span>
                </span>

                <Link
                  href={exam.status === 'Graded' ? `/student/exams/${exam.id}/result` : `/student/exams/${exam.id}`}
                  className={`inline-flex items-center gap-1 text-xs font-bold transition px-4 py-2.5 rounded-xl ${
                    exam.status === 'Open'
                      ? 'bg-[#1E60D5] text-white hover:bg-[#1E60D5]/90 shadow-md shadow-[#1E60D5]/10'
                      : 'bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{exam.status === 'Open' ? 'Start' : 'Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
