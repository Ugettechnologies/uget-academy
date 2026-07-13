'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TakeExamPageProps {
  params: Promise<{ id: string }>;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIdx: number;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    text: 'Which React hook is designed specifically to reference DOM nodes or persist mutable values without causing re-renders?',
    options: ['useState', 'useRef', 'useEffect', 'useMemo'],
    correctIdx: 1
  },
  {
    id: 2,
    text: 'In Next.js App Router, which file name is reserved to declare shared UI layouts across a segment?',
    options: ['page.tsx', 'layout.tsx', 'template.tsx', 'route.ts'],
    correctIdx: 1
  },
  {
    id: 3,
    text: 'What does "SSR" represent in modern web application development?',
    options: ['Static Site Restoration', 'Server Side Rendering', 'Secure Socket Resource', 'State Sync Router'],
    correctIdx: 1
  },
  {
    id: 4,
    text: 'Which Prisma client command is specifically used to retrieve a single record using its unique email or primary ID?',
    options: ['findUnique', 'findFirst', 'findMany', 'queryUnique'],
    correctIdx: 0
  },
  {
    id: 5,
    text: 'What is the primary benefit of connection pooling in PostgreSQL?',
    options: ['Enabling automatic backups', 'Encrypting static tables', 'Reducing overhead by reusing open connection channels', 'Increasing cache size limit'],
    correctIdx: 2
  }
];

export default function TakeExamPage({ params }: TakeExamPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes in seconds
  const [submitting, setSubmitting] = useState(false);

  // Timer Countdown Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleAutoSubmit = () => {
    submitQuiz();
  };

  const submitQuiz = () => {
    setSubmitting(true);
    // Simulate API call and redirect to result page
    setTimeout(() => {
      router.push(`/student/exams/${id}/result`);
    }, 1500);
  };

  const currentQuestion = quizQuestions[currentIdx];
  const isLastQuestion = currentIdx === quizQuestions.length - 1;
  const progressPercent = Math.round(((currentIdx + 1) / quizQuestions.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-slate-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Currently Taking</span>
          <h1 className="text-lg font-black text-slate-800 tracking-tight mt-1">Final Academy Certification Exam</h1>
        </div>
        
        {/* Timer UI */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 font-mono text-sm font-bold w-fit">
          <Clock className="w-4 h-4 text-red-500 animate-pulse" />
          <span>Time Remaining: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
            {/* Question Counter */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E60D5] bg-[#E0EEFF] px-3.5 py-1.5 rounded-xl">Question {currentIdx + 1} of {quizQuestions.length}</span>
              <span className="text-xs text-slate-450 font-bold">{progressPercent}% complete</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="bg-[#1E60D5] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question text */}
            <p className="text-base font-bold text-slate-800 leading-relaxed pt-2">
              {currentQuestion.text}
            </p>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, optIdx) => {
                const selected = answers[currentIdx] === optIdx;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-150 flex items-center gap-4 ${
                      selected
                        ? 'bg-[#F0F6FF] border-[#1E60D5] text-[#1E60D5]'
                        : 'bg-white border-slate-150 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      selected
                        ? 'bg-[#1E60D5] text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-40 transition py-2 px-4 rounded-xl hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-600/90 text-white rounded-xl py-3 px-6 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/10"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit & Finish Exam'}</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E60D5] hover:text-[#1E60D5]/90 transition py-2 px-4 rounded-xl hover:bg-[#E0EEFF]/55"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Status Matrix */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions Matrix</h3>
            
            <div className="grid grid-cols-5 gap-2.5">
              {quizQuestions.map((q, idx) => {
                const answered = answers[idx] !== undefined;
                const isCurrent = idx === currentIdx;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                      isCurrent
                        ? 'bg-[#1E60D5] text-white shadow-sm ring-2 ring-offset-2 ring-[#1E60D5]/20'
                        : answered
                        ? 'bg-[#E0EEFF] text-[#1E60D5]'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-slate-50 pt-4 text-[10px] text-slate-450 font-bold uppercase tracking-wider space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-[#E0EEFF] inline-block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-slate-50 inline-block border border-slate-150" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
