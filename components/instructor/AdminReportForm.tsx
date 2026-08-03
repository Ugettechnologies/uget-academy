'use client';

import React, { useState } from 'react';
import { FileText, Send, Check, Sparkles, BookOpen, Clock } from 'lucide-react';

export default function AdminReportForm() {
  const courseTitle = 'Cybersecurity & Threat Intelligence';

  const [reportType, setReportType] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [reportDate, setReportDate] = useState('Today, Aug 3, 2026');
  const [classesTaughtSummary, setClassesTaughtSummary] = useState('');
  const [attendanceObservations, setAttendanceObservations] = useState('');
  const [curriculumProgress, setCurriculumProgress] = useState('');
  const [flagsAndEscalations, setFlagsAndEscalations] = useState('');

  const [submittedReports, setSubmittedReports] = useState([
    {
      id: 'rep-1',
      type: 'DAILY',
      title: 'Daily Activity Review — Module 4 OWASP PenTesting',
      date: 'Aug 2, 2026',
      status: 'RECEIVED_BY_ADMIN',
    },
    {
      id: 'rep-2',
      type: 'WEEKLY',
      title: 'Weekly Summary Review — Week 4 Cohort Performance',
      date: 'Jul 31, 2026',
      status: 'REVIEWED',
    },
  ]);

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classesTaughtSummary || !curriculumProgress) return;

    const newRep = {
      id: `rep-${Date.now()}`,
      type: reportType,
      title: `${reportType === 'DAILY' ? 'Daily Activity Review' : 'Weekly Summary Review'} — ${courseTitle}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'RECEIVED_BY_ADMIN',
    };

    setSubmittedReports([newRep, ...submittedReports]);
    setClassesTaughtSummary('');
    setAttendanceObservations('');
    setCurriculumProgress('');
    setFlagsAndEscalations('');

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 text-white animate-fade-in">
      
      {/* Report Form */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30">
              Track: {courseTitle}
            </span>
            <h2 className="text-xl font-black text-white mt-1">Submit Report to Academy Admin</h2>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setReportType('DAILY')}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                reportType === 'DAILY' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Daily Activity Review
            </button>
            <button
              type="button"
              onClick={() => setReportType('WEEKLY')}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                reportType === 'WEEKLY' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly Summary Review
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              {reportType === 'DAILY' ? '1. Daily Classes & Topics Covered' : '1. Weekly Modules & Curriculum Progress'}
            </label>
            <textarea
              required
              rows={3}
              placeholder="Summary of lectures taught, topics delivered, and practical exercises completed..."
              value={classesTaughtSummary}
              onChange={(e) => setClassesTaughtSummary(e.target.value)}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">2. Attendance & Participation Observations</label>
              <textarea
                rows={3}
                placeholder="Notes on student attendance rates, roll call anomalies, or engagement levels..."
                value={attendanceObservations}
                onChange={(e) => setAttendanceObservations(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">3. Curriculum Milestones & Completion %</label>
              <textarea
                required
                rows={3}
                placeholder="Milestones achieved, pending syllabus topics, and target timeline for next week..."
                value={curriculumProgress}
                onChange={(e) => setCurriculumProgress(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">4. Student At-Risk Flags or Admin Escalations (Optional)</label>
            <textarea
              rows={2}
              placeholder="Highlight any students requiring admin intervention, attendance warnings, or extension approvals..."
              value={flagsAndEscalations}
              onChange={(e) => setFlagsAndEscalations(e.target.value)}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            {isSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Report Submitted to Admin Panel!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-500/20"
            >
              <Send className="w-4 h-4" /> Submit Review to Admin
            </button>
          </div>
        </form>
      </div>

      {/* Submitted Reports History */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
          Submitted Admin Reports History ({submittedReports.length})
        </h3>

        <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="divide-y divide-white/5">
            {submittedReports.map((rep) => (
              <div key={rep.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition">
                <div className="space-y-1 min-w-0">
                  <span className="text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                    {rep.type} REVIEW
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{rep.title}</h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Received
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{rep.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
