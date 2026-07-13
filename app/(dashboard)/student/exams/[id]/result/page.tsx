'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle, 
  FileText, 
  Calendar,
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default function StudentExamResultPage({ params }: ResultPageProps) {
  const { id } = use(params);

  // Configure results data
  const resultData = id === '1' ? {
    title: 'Mid-Term Frontend Evaluation',
    score: 94,
    correctCount: 19,
    totalCount: 20,
    status: 'PASSED',
    date: '15/05/2026',
    feedback: 'Your HTML structure and CSS variables are extremely well organized. Responsive grid elements are robust and display perfectly on all target viewports. Excellent work!',
    gradedBy: 'Instructor Demo'
  } : {
    title: 'Final Academy Certification Exam',
    score: 90,
    correctCount: 18,
    totalCount: 20,
    status: 'PASSED',
    date: new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    feedback: 'Outstanding performance! You showed high proficiency in Next.js folder routing, React state management context hooks, database connection pooling configurations, and API structures. Keep it up!',
    gradedBy: 'Instructor Demo'
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in text-slate-800">
      {/* Navigation */}
      <div>
        <Link href="/student/exams" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E60D5] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Examinations
        </Link>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Exam Results</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="md:col-span-1 bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Your Score</span>
          
          <div className="relative w-28 h-28 rounded-full border-8 border-slate-100 flex items-center justify-center">
            {/* Visual stroke simulation */}
            <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-l-transparent transform rotate-45" />
            <span className="text-3xl font-black text-slate-800">{resultData.score}%</span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-500/25">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{resultData.status}</span>
            </span>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-6 flex flex-col justify-center">
          <h2 className="font-bold text-slate-800 text-base">{resultData.title}</h2>
          
          <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-5">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Correct Answers</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{resultData.correctCount} / {resultData.totalCount}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Completed On</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{resultData.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Feedback Card */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-4">
        <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-[#1E60D5]" />
          Review & Instructor Feedback
        </h3>
        <div className="border-t border-slate-50 pt-4 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed italic font-normal">
            "{resultData.feedback}"
          </p>

          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">{resultData.gradedBy}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Evaluation Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
