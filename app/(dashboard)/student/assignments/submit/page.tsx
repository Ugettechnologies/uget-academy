'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface SelectableAssignment {
  id: string;
  name: string;
  dueDate: string;
}

const openAssignments: SelectableAssignment[] = [
  { id: '10', name: 'Week 10: High-Fidelity Figma UI Redesign', dueDate: '14/06/2026' }
];

export default function StudentAssignmentSubmitPage() {
  const [selectedId, setSelectedId] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !githubLink) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      
      // Clear inputs
      setSelectedId('');
      setGithubLink('');
      setDemoLink('');
      setNotes('');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in text-slate-800">
      {/* Breadcrumb */}
      <div>
        <Link href="/student/assignments" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E60D5] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
        </Link>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Submit Assignments</h1>
        <p className="text-slate-500 text-xs mt-1">Submit links to your GitHub repositories, Figma source files, or hosting portals.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
        {submitted && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-250 text-xs text-emerald-700 flex items-start gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Deliverables Uploaded Successfully!</p>
              <p className="text-slate-550 leading-relaxed font-normal">Your submission has been cataloged. Instructors will evaluate your layout elements, responsiveness controls, and folder files hierarchy shortly.</p>
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
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none font-semibold text-slate-700"
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

          <button
            type="submit"
            disabled={submitting || !githubLink || !selectedId}
            className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Uploading...' : 'Submit Deliverables'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
