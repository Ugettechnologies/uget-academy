'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  FileQuestion,
  Loader2
} from 'lucide-react';

interface SelectableAssignment {
  id: string;
  name: string;
  dueDate: string;
}

interface AssignmentSubmitFormClientProps {
  openAssignments: SelectableAssignment[];
}

export default function AssignmentSubmitFormClient({
  openAssignments,
}: AssignmentSubmitFormClientProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Toggle for testing empty state mockup easily (or let it reflect actual state)
  const [forceEmptyState, setForceEmptyState] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !githubLink) return;

    setSubmitting(true);
    setErrorMsg('');
    setSubmitted(false);

    try {
      const res = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedId,
          type: 'LINK',
          content: `${githubLink} | Demo: ${demoLink || 'None'} | Notes: ${notes || 'None'}`,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setSelectedId('');
        setGithubLink('');
        setDemoLink('');
        setNotes('');
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit deliverables.');
      }
    } catch (err) {
      setErrorMsg('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasNoAssignments = openAssignments.length === 0 || forceEmptyState;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in text-slate-800">
      {/* Breadcrumb & Toggle */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <Link href="/student/assignments" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E60D5] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Submit an Assignment</h1>
          <p className="text-slate-505 text-xs mt-1">Select an assignment from the list below to begin your submission.</p>
        </div>

        {/* Dynamic empty state preview toggler for testing */}
        <button
          onClick={() => setForceEmptyState(!forceEmptyState)}
          className="text-[10px] font-extrabold uppercase tracking-wide bg-white hover:bg-[#E0EEFF] text-slate-500 hover:text-[#1E60D5] border border-slate-205 rounded-xl px-3.5 py-2 transition shadow-sm"
        >
          {forceEmptyState ? "Show Input Form" : "Force Empty State"}
        </button>
      </div>

      {hasNoAssignments ? (
        /* Empty State Layout */
        <div className="bg-white rounded-3xl p-12 border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] min-h-[360px] flex items-center justify-center">
          <div className="w-full border-2 border-dashed border-slate-150 rounded-2xl p-8 py-14 flex flex-col items-center justify-center text-center space-y-4 max-w-lg bg-slate-50/20">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400">
              <FileQuestion className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-700 tracking-tight">No Assignments Available</h3>
              <p className="text-xs text-slate-450 font-semibold leading-relaxed max-w-sm mx-auto">
                You've completed all active assignments or they have expired, check back later for new tasks!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Input Form Layout */
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-250 text-xs text-emerald-700 flex items-start gap-3 animate-fade-in font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Deliverables Uploaded Successfully!</p>
                <p className="text-slate-550 leading-relaxed font-normal">
                  Your submission has been cataloged. Instructors will evaluate your layout elements, responsiveness controls, and folder files hierarchy shortly.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-slate-750">
            {/* Dropdown Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Project / Assignment</label>
              <select
                required
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none font-semibold text-slate-700 animate-fade-in"
              >
                <option value="" className="text-slate-400">-- Choose Assignment --</option>
                {openAssignments.map((a) => (
                  <option key={a.id} value={a.id} className="text-slate-700">
                    {a.name} (Due: {a.dueDate})
                  </option>
                ))}
              </select>
            </div>

            {/* GitHub Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GitHub Repository Link</label>
              <input
                type="url"
                required
                placeholder="https://github.com/yourprofile/repository"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition font-semibold text-slate-700"
              />
            </div>

            {/* Demo Link */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Demo / Figma Prototype Link</label>
              <input
                type="url"
                placeholder="https://figma.com/file/... or Vercel URL"
                value={demoLink}
                onChange={(e) => setDemoLink(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition font-semibold text-slate-700"
              />
            </div>

            {/* Textarea Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submission Notes (Optional)</label>
              <textarea
                rows={4}
                placeholder="Explain how to run your project, or highlight design decisions made..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none font-semibold text-slate-700"
              />
            </div>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !githubLink || !selectedId}
              className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Submit Deliverables</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
