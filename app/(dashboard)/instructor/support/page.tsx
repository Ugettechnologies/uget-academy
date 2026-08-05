'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface ComplaintTicket {
  id: string;
  subject: string;
  details: string;
  priority: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  adminNote: string | null;
  createdAt: string;
}

export default function InstructorSupportPage() {
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/complaints');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setComplaints(data.complaints || []);
        }
      }
    } catch (err) {
      console.error('Failed to load instructor complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !details) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/staff/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, details, priority }),
      });

      if (res.ok) {
        setSuccessMsg('Complaint ticket submitted successfully to HR & Admin!');
        setSubject('');
        setDetails('');
        setPriority('MEDIUM');
        fetchComplaints();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit complaint.');
      }
    } catch (err) {
      setErrorMsg('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-brand-primary" /> Instructor Complaints & Ticket Box
        </h1>
        <p className="text-slate-500 text-xs mt-1">Log instructor complaints, course issues, facilities requests, or payroll inquiries directly to HR & Academy Administration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-5">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-brand-primary" /> Submit New Complaint
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Your complaint will be logged with Administration for immediate review and resolution.
          </p>

          <form onSubmit={handleSubmitComplaint} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Complaint Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Lab environment access code issue for Section B"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urgent Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition font-bold text-slate-800"
              >
                <option value="LOW">Low Priority (General Query)</option>
                <option value="MEDIUM">Medium Priority (Standard Issue)</option>
                <option value="HIGH">High Priority (Urgent Action Required)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Complaint Details</label>
              <textarea
                rows={5}
                required
                placeholder="Provide complete context, affected student roster, or technical error messages..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none font-semibold text-slate-800"
              />
            </div>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Dispatch Complaint Ticket</span>
            </button>
          </form>
        </div>

        {/* Right History Column */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Your Submitted Complaints History</h3>

          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-455 text-xs font-bold flex items-center justify-center gap-2 border border-slate-100">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" /> Loading complaints history...
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-400 text-xs font-medium border border-slate-100">
              No complaint tickets logged yet. Use the form to submit any complaints or requests directly to HR & Academy Administration.
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-slate-800 text-sm">{item.subject}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-650 leading-relaxed font-normal bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">{item.details}</p>

                  {item.adminNote ? (
                    <div className="p-4 bg-amber-50/30 border border-amber-200/60 rounded-2xl space-y-1">
                      <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider block flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Admin Resolution Note
                      </span>
                      <p className="text-xs text-slate-700 italic font-medium">"{item.adminNote}"</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending resolution review by Administration...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
