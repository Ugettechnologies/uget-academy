'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Check, 
  Clock, 
  Award, 
  HelpCircle, 
  Code, 
  FileUp, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function AdminAssessmentBuilder() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [courseTrack, setCourseTrack] = useState('Cybersecurity & Threat Intelligence');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('45');
  const [passScorePercent, setPassScorePercent] = useState('70');
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [windowOpensDate, setWindowOpensDate] = useState('Jul 20, 2026 09:00 AM');
  const [windowClosesDate, setWindowClosesDate] = useState('Jul 25, 2026 11:59 PM');

  // Behavior Toggles
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeAnswers, setRandomizeAnswers] = useState(true);
  const [showAnswersAfterSubmit, setShowAnswersAfterSubmit] = useState(false);
  const [lateSubmissionPolicy, setLateSubmissionPolicy] = useState<'NOT_ALLOWED' | 'ALLOWED_PENALTY' | 'ALLOWED_FULL'>('NOT_ALLOWED');

  // Questions
  const [questions, setQuestions] = useState([
    {
      id: 'q-1',
      questionText: 'Which cryptographic algorithm produces a fixed 256-bit digest output?',
      type: 'MULTIPLE_CHOICE',
      options: ['SHA-256', 'MD5', 'RSA-2048', 'AES-128'],
      correctAnswer: 'SHA-256',
    },
  ]);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CODE_INPUT' | 'FILE_UPLOAD'>('MULTIPLE_CHOICE');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    const newQ = {
      id: `q-${Date.now()}`,
      questionText: newQuestionText.trim(),
      type: newQuestionType,
      options: newQuestionType === 'TRUE_FALSE' ? ['True', 'False'] : ['Option A', 'Option B', 'Option C'],
      correctAnswer: 'Option A',
    };

    setQuestions([...questions, newQ]);
    setNewQuestionText('');
  };

  const handlePublishAssessment = () => {
    setIsBuilding(false);
    setStep(1);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div>
          <h3 className="text-sm font-black text-white">Platform-Wide Assessment Directory</h3>
          <p className="text-xs text-gray-400">Configure timings, pass marks, late policies, and question builders.</p>
        </div>

        <div className="flex items-center gap-3">
          {isSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Assessment Configured & Published Platform-Wide!
            </span>
          )}

          <button
            onClick={() => setIsBuilding(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Create New Assessment
          </button>
        </div>
      </div>

      {/* Existing Assessments List */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Active Assessments Queue</h4>

        <div className="divide-y divide-white/5">
          <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
                Cybersecurity Track
              </span>
              <h4 className="text-sm font-bold text-white">Section 1: Computer-Based Test (CBT)</h4>
              <p className="text-xs text-gray-400">Time Limit: 45 Mins • Pass Score: 70% • Questions: 25</p>
            </div>

            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
              Published & Active
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Step Modal Builder */}
      {isBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
            
            {/* Header & Step Bar */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="font-extrabold text-white text-base">Multi-Step Assessment Builder</h3>
                <p className="text-xs text-amber-300 font-mono">Step {step} of 3: {step === 1 ? 'Details & Timing' : step === 2 ? 'Settings & Behavior' : 'Questions Builder'}</p>
              </div>

              <span className="text-xs font-mono font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Drafting Mode
              </span>
            </div>

            {/* STEP 1: Details & Timing */}
            {step === 1 && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-300">Assessment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-Term Comprehensive CBT Assessment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-300">Time Limit (Mins)</label>
                    <input
                      type="number"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(e.target.value)}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-300">Pass Score (%)</label>
                    <input
                      type="number"
                      value={passScorePercent}
                      onChange={(e) => setPassScorePercent(e.target.value)}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-300">Max Attempts</label>
                    <input
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(e.target.value)}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-300">Availability Opens</label>
                    <input
                      type="text"
                      value={windowOpensDate}
                      onChange={(e) => setWindowOpensDate(e.target.value)}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-300">Availability Closes</label>
                    <input
                      type="text"
                      value={windowClosesDate}
                      onChange={(e) => setWindowClosesDate(e.target.value)}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Behavior Toggles */}
            {step === 2 && (
              <div className="space-y-4 text-xs">
                <h4 className="font-extrabold uppercase text-gray-400">Behavior & Policy Configuration</h4>
                
                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Randomize Question Order</span>
                    <input
                      type="checkbox"
                      checked={randomizeQuestions}
                      onChange={(e) => setRandomizeQuestions(e.target.checked)}
                      className="w-4 h-4 text-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Randomize Answer Choices</span>
                    <input
                      type="checkbox"
                      checked={randomizeAnswers}
                      onChange={(e) => setRandomizeAnswers(e.target.checked)}
                      className="w-4 h-4 text-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Show Correct Answers After Submit</span>
                    <input
                      type="checkbox"
                      checked={showAnswersAfterSubmit}
                      onChange={(e) => setShowAnswersAfterSubmit(e.target.checked)}
                      className="w-4 h-4 text-amber-500"
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-300">Late Submission Policy</label>
                  <select
                    value={lateSubmissionPolicy}
                    onChange={(e) => setLateSubmissionPolicy(e.target.value as any)}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="NOT_ALLOWED">Not Allowed (Strict Cut-Off)</option>
                    <option value="ALLOWED_PENALTY">Allowed with 10% Late Penalty</option>
                    <option value="ALLOWED_FULL">Allowed with Full Marks</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: Questions Builder */}
            {step === 3 && (
              <div className="space-y-4 text-xs">
                <h4 className="font-extrabold uppercase text-gray-400">Question Types & Drafting ({questions.length} Added)</h4>

                <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="font-bold text-amber-300 text-[11px]">Q{idx + 1}: {q.questionText}</span>
                      <span className="text-[9px] text-gray-400 block font-mono">Type: {q.type}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-[#1E293B] border border-white/10 space-y-3">
                  <span className="font-bold text-white block">Add New Question</span>
                  
                  <textarea
                    rows={2}
                    placeholder="Enter question text..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />

                  <div className="flex justify-between items-center">
                    <select
                      value={newQuestionType}
                      onChange={(e) => setNewQuestionType(e.target.value as any)}
                      className="bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">True / False</option>
                      <option value="CODE_INPUT">Code Input</option>
                      <option value="FILE_UPLOAD">File Upload</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (step > 1) setStep((prev) => (prev - 1) as any);
                  else setIsBuilding(false);
                }}
                className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                {step === 1 ? 'Cancel' : '← Back'}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev + 1) as any)}
                  className="px-5 py-2 text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl transition shadow-md"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublishAssessment}
                  className="px-6 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  Publish Assessment Platform-Wide
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
