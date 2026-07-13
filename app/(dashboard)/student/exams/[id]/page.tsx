'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  HelpCircle, 
  Award, 
  AlertTriangle,
  Play
} from 'lucide-react';

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StudentExamDetailPage({ params }: ExamDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // If it's exam 1 (which is graded), redirect to the result page
  if (id === '1') {
    router.replace(`/student/exams/1/result`);
    return null;
  }

  const examDetails = {
    title: 'Final Academy Certification Exam',
    description: 'This is the comprehensive evaluation required to attain your UGET Developer Certification. You will be tested on advanced Next.js concepts, state management architectures, relational database connections (Prisma/Postgres), and API design principles.',
    duration: '120 Minutes',
    questionsCount: 20,
    passingScore: '80%',
    attemptsAllowed: '1 Attempt Only'
  };

  const handleStartExam = () => {
    router.push(`/student/exams/${id}/take`);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Navigation */}
      <div>
        <Link href="/student/exams" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E60D5] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Examinations
        </Link>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">{examDetails.title}</h1>
      </div>

      {/* Instructions Card */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-6">
        <div className="space-y-3">
          <h2 className="text-base font-black text-slate-800 tracking-tight">Instructions & Guidelines</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">{examDetails.description}</p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-slate-50 py-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Duration</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{examDetails.duration}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Questions</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>{examDetails.questionsCount} Qs</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Passing Mark</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <Award className="w-4 h-4 text-slate-500" />
              <span>{examDetails.passingScore}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Attempts</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#EF4444]">
              <AlertTriangle className="w-4 h-4" />
              <span>{examDetails.attemptsAllowed}</span>
            </div>
          </div>
        </div>

        {/* Advisory Warning */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] rounded-2xl p-5 text-xs leading-relaxed space-y-1">
          <p className="font-bold">⚠️ Critical Examination Advisory:</p>
          <p>Make sure you have a reliable internet connection before starting. Once you click "Start Examination", the timer will begin and cannot be paused. Refreshing the browser page or navigating away will lock the attempt.</p>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleStartExam}
            className="bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3.5 px-8 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#1E60D5]/15"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Accept & Begin Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
}
