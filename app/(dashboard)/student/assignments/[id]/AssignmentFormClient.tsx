'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2 } from 'lucide-react';

interface AssignmentFormClientProps {
  assignmentId: string;
  isResubmission: boolean;
}

export default function AssignmentFormClient({
  assignmentId,
  isResubmission,
}: AssignmentFormClientProps) {
  const router = useRouter();
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubLink) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          type: 'LINK',
          content: `${githubLink} | Demo: ${demoLink || 'None'} | Notes: ${notes || 'None'}`,
        }),
      });

      if (res.ok) {
        setGithubLink('');
        setDemoLink('');
        setNotes('');
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit deliverables.');
      }
    } catch (err) {
      setErrorMsg('Network error submitting assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 space-y-5">
      <h3 className="text-base font-black text-slate-800 tracking-tight">
        {isResubmission ? 'Re-submit Deliverables' : 'Submit Deliverables'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            GitHub Repository Link
          </label>
          <input
            type="url"
            required
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            placeholder="https://github.com/username/project"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition font-semibold text-slate-700"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Live Demo / Figma URL
          </label>
          <input
            type="url"
            value={demoLink}
            onChange={(e) => setDemoLink(e.target.value)}
            placeholder="https://figma.com/file/... or live URL"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition font-semibold text-slate-700"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Submission Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for your instructor..."
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
          disabled={submitting || !githubLink}
          className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{submitting ? 'Submitting...' : 'Submit Assignment'}</span>
        </button>
      </form>
    </div>
  );
}
