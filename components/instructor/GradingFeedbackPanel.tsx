'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Send, 
  Check, 
  ExternalLink, 
  Clock, 
  User, 
  MessageSquare, 
  Award,
  Sparkles,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface SubmissionItem {
  id: string;
  studentName: string;
  admissionNo: string;
  assignmentTitle: string;
  submittedAt: string;
  submissionUrl: string;
  description: string;
  currentScore?: number;
  status: 'PENDING' | 'GRADED';
}

export default function GradingFeedbackPanel() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([
    {
      id: 'sub-1',
      studentName: 'Grace Hopper',
      admissionNo: '2026/STU/A012',
      assignmentTitle: 'Week 4: Threat Intelligence & OWASP Penetration Blueprint',
      submittedAt: '08:45 PM, Monday Jun 22, 2026',
      submissionUrl: 'https://github.com/uget-student/owasp-penetration-report',
      description: 'Submitted low-fi and high-fi vulnerability analysis documentation.',
      status: 'PENDING',
    },
    {
      id: 'sub-2',
      studentName: 'Alan Turing',
      admissionNo: '2026/STU/A088',
      assignmentTitle: 'Week 4: Threat Intelligence & OWASP Penetration Blueprint',
      submittedAt: '06:12 PM, Monday Jun 22, 2026',
      submissionUrl: 'https://github.com/uget-student/turing-threat-analytics',
      description: 'Completed Python log parser and threat categorization script.',
      status: 'PENDING',
    },
    {
      id: 'sub-3',
      studentName: 'Margaret Hamilton',
      admissionNo: '2026/STU/A044',
      assignmentTitle: 'Section 1: Computer-Based Test (CBT)',
      submittedAt: '10:00 AM, Aug 1, 2026',
      submissionUrl: 'Auto-Graded CBT Quiz Submission',
      description: 'Automated CBT exam log.',
      currentScore: 90,
      status: 'GRADED',
    },
  ]);

  const [activeSubmission, setActiveSubmission] = useState<SubmissionItem>(submissions[0]);
  const [scoreInput, setScoreInput] = useState('90');
  const [feedbackNotes, setFeedbackNotes] = useState('Great work! Your threat modeling breakdown is accurate and well formatted.');
  const [isGradedSuccess, setIsGradedSuccess] = useState(false);
  const [isSentDM, setIsSentDM] = useState(false);

  const handleGradeSubmit = (sendAsDM: boolean) => {
    const numericScore = parseInt(scoreInput) || 0;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === activeSubmission.id
          ? { ...s, status: 'GRADED', currentScore: numericScore }
          : s
      )
    );

    setIsGradedSuccess(true);
    if (sendAsDM) setIsSentDM(true);

    setTimeout(() => {
      setIsGradedSuccess(false);
      setIsSentDM(false);
    }, 3000);
  };

  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[620px] text-white animate-fade-in">
      
      {/* LEFT SIDEBAR: Pending Queue */}
      <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col bg-[#0B0F19]">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            Grading Submissions Queue
          </h3>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
            {submissions.filter((s) => s.status === 'PENDING').length} Pending
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
          {submissions.map((sub) => {
            const isSelected = activeSubmission.id === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setActiveSubmission(sub);
                  setScoreInput(sub.currentScore ? String(sub.currentScore) : '90');
                }}
                className={`w-full p-4 text-left transition flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-600/20 border-l-4 border-purple-500'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs truncate">{sub.studentName}</span>
                    <span className="text-[9px] font-mono text-purple-300">{sub.admissionNo}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate">{sub.assignmentTitle}</p>
                  <span className="text-[9px] text-gray-500 font-mono block">{sub.submittedAt}</span>
                </div>

                {sub.status === 'PENDING' ? (
                  <span className="text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                    Needs Grade
                  </span>
                ) : (
                  <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                    {sub.currentScore}/100
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: Submission View & Grade Form */}
      <div className="flex-1 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-[#0F172A]">
        <div className="space-y-6">
          {/* Header info */}
          <div className="flex justify-between items-start border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded border border-purple-500/30">
                Evaluating Submission
              </span>
              <h2 className="text-lg font-black text-white mt-1">{activeSubmission.assignmentTitle}</h2>
              <p className="text-xs text-gray-400">
                Student: <strong className="text-white">{activeSubmission.studentName}</strong> ({activeSubmission.admissionNo})
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-gray-400">
              Submitted: {activeSubmission.submittedAt}
            </span>
          </div>

          {/* Submission Details View */}
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Student's Deliverable Entry</h4>
            
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Submission URL / Link</span>
              <a
                href={activeSubmission.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-purple-300 hover:underline flex items-center gap-1.5 break-all"
              >
                {activeSubmission.submissionUrl} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Student Description</span>
              <p className="text-xs text-gray-200 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10 font-sans">
                {activeSubmission.description}
              </p>
            </div>
          </div>

          {/* Grade & Feedback Form */}
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" /> Grade & Direct Feedback
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-300">Score (/ 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="block text-xs font-bold text-gray-300">Detailed Feedback Notes</label>
                <textarea
                  rows={2}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 custom-scrollbar"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {isGradedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Score Saved & Synced to Student Portal! {isSentDM && '(Sent as DM)'}
            </span>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => handleGradeSubmit(false)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10"
            >
              Save Grade
            </button>
            <button
              type="button"
              onClick={() => handleGradeSubmit(true)}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <Send className="w-4 h-4" /> Save Grade & Send Feedback as DM
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
