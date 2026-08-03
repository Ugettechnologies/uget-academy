'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Upload,
  Link2,
  Send,
  Loader2,
  Info,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseTitle: string;
  submission?: {
    id: string;
    type: string;
    content: string;
    grade: number | null;
    feedback: string | null;
    submittedAt: string;
  } | null;
}

interface AssignmentsClientProps {
  assignments: AssignmentItem[];
}

export default function AssignmentsClient({ assignments }: AssignmentsClientProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'submit'>('view');
  
  // Submit Form state
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments.length > 0 ? assignments[0].id : ''
  );
  const [submissionType, setSubmissionType] = useState<'LINK' | 'TEXT' | 'FILE'>('LINK');
  const [contentUrl, setContentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId || !contentUrl.trim()) return;

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignmentId,
          type: submissionType,
          content: contentUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit assignment');
      }

      setStatusMsg({
        type: 'success',
        text: 'Deliverable submitted successfully! Your instructor will review your work.',
      });
      setContentUrl('');
      
      // Reload page to reflect submission
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Submission failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-brand-primary" />
            Assignments Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Review coursework prompts, check deadlines, and submit your project deliverables.
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'view'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            View Assignments
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'submit'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Submit Assignments
          </button>
        </div>
      </div>

      {/* VIEW ASSIGNMENTS TAB */}
      {activeTab === 'view' && (
        <div className="space-y-6 animate-fade-in">
          {assignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-black text-slate-950 dark:text-white">No Assignments Available</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You’ve completed all active assignments or they have expired. Check back later for new tasks!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {assignments.map((item) => {
                const isSubmitted = !!item.submission;
                const isGraded = item.submission?.grade !== null && item.submission?.grade !== undefined;

                return (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs hover:shadow-md transition">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-brand-primary tracking-wider bg-brand-primary/10 px-2.5 py-1 rounded-md">
                          {item.courseTitle}
                        </span>
                        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white mt-2">{item.title}</h2>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          Due date: <strong className="text-slate-900 dark:text-white">{new Date(item.dueDate).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}</strong>
                        </span>

                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          isGraded
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : isSubmitted
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                        }`}>
                          {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Open'}
                        </span>
                      </div>
                    </div>

                    {/* Prompt Description */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {item.description}
                    </p>

                    {/* Instruction Banner */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                      <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Please note:</span>
                        All Assignments should be submitted as accessible links, image or video before the due date to avoid missing the opportunity to submit as deadlines might not be postponed. Follow specific instructions given by your tutor.
                      </div>
                    </div>

                    {/* Submissions & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                      {isSubmitted ? (
                        <div className="text-xs space-y-1">
                          <span className="text-slate-400 block font-semibold">Your Submitted Deliverable:</span>
                          <a
                            href={item.submission?.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary font-bold hover:underline truncate block max-w-md"
                          >
                            {item.submission?.content}
                          </a>
                          {isGraded && (
                            <span className="text-xs font-extrabold text-emerald-500 block pt-1">
                              Grade Score: {item.submission?.grade}/100 {item.submission?.feedback ? `- "${item.submission.feedback}"` : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold italic">Deliverable pending submission</span>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAssignmentId(item.id);
                          setActiveTab('submit');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs transition shadow-xs"
                      >
                        <span>{isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBMIT ASSIGNMENTS TAB */}
      {activeTab === 'submit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-fade-in">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Submit an Assignment</h2>
            <p className="text-xs text-slate-400 mt-1">Select an assignment from the list below to begin your submission.</p>
          </div>

          {statusMsg && (
            <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
            }`}>
              {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {assignments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              No assignments available to submit right now.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              
              {/* Select Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Assignment Item
                </label>
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full px-4 py-3 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {assignments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} (Due: {new Date(item.dueDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Display prompt details of selected assignment */}
              {selectedAssignment && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{selectedAssignment.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedAssignment.description}</p>
                  <span className="text-[10px] text-slate-400 font-bold block pt-1">
                    Course: {selectedAssignment.courseTitle}
                  </span>
                </div>
              )}

              {/* Instructions banner */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Please note:</span>
                  All Assignments should be submitted as accessible links, image or video before the due date to avoid missing the opportunity to submit as deadlines might not be postponed.
                </div>
              </div>

              {/* Paste Link Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Paste Deliverable Link (Figma, GitHub, Drive, Loom, YouTube)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://figma.com/file/... or https://github.com/..."
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <Link2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !contentUrl.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-8 text-xs transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Deliverable
                </button>
              </div>

            </form>
          )}

        </div>
      )}

    </div>
  );
}
