'use client';

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare,
  Loader2
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  adminReply: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export default function StudentSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/support');
      if (res.ok) {
        setTickets(await res.json());
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/student/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        setSuccessMsg('Ticket submitted successfully! Admin will reply shortly.');
        setSubject('');
        setMessage('');
        fetchTickets(); // Refresh lists
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit help ticket.');
      }
    } catch (err) {
      setErrorMsg('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Top Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-brand-primary" /> Support Center
        </h1>
        <p className="text-slate-500 text-xs mt-1">Submit support tickets, report bugs, and view administrative answers regarding logs or tuition.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form to submit ticket */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-5">
          <h3 className="text-base font-black text-slate-850 tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-brand-primary" /> New Help Ticket
          </h3>
          <p className="text-xs text-slate-450 leading-relaxed font-normal">
            Explain your issues or billing requests in details. We resolve tickets within 24 hours.
          </p>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Mux video player stutters on Chrome"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-55/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition font-semibold text-slate-705"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detailed Message</label>
              <textarea
                rows={4}
                required
                placeholder="Explain the problem context, error codes or logs..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-55/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none font-semibold text-slate-705"
              />
            </div>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Ticket</span>
            </button>
          </form>
        </div>

        {/* Right Column: Tickets History List */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Help Ticket History</h3>
          
          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-450 text-xs font-bold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" /> Loading history...
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-400 text-xs font-medium border border-slate-50">
              No tickets submitted yet. If you have questions regarding enrollment payment approvals, file access, or streaming lag, open a ticket.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                // Status Badge resolver
                let statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide border bg-blue-50 text-blue-605 border-blue-500/20">
                    <Clock className="w-3 h-3 text-blue-500" /> OPEN
                  </span>
                );

                if (ticket.status === 'IN_PROGRESS') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide border bg-amber-50 text-amber-600 border-amber-500/20">
                      <Clock className="w-3 h-3 text-amber-500" /> IN PROGRESS
                    </span>
                  );
                } else if (ticket.status === 'RESOLVED') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide border bg-emerald-50 text-emerald-600 border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED
                    </span>
                  );
                }

                return (
                  <div key={ticket.id} className="bg-white border border-slate-50 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <h4 className="font-extrabold text-slate-800 text-sm">{ticket.subject}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        {statusBadge}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Your Message</span>
                      <p className="text-xs text-slate-650 leading-relaxed font-normal">"{ticket.message}"</p>
                    </div>

                    {ticket.adminReply ? (
                      <div className="p-4 bg-emerald-50/15 border border-emerald-100 rounded-2xl space-y-1">
                        <span className="text-[9px] text-emerald-600 font-extrabold block uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Administrative resolution
                        </span>
                        <p className="text-xs text-slate-650 leading-relaxed italic">"{ticket.adminReply}"</p>
                        {ticket.resolvedAt && (
                          <span className="text-[9px] text-slate-400 block font-medium mt-1">
                            Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting support engineer assignments...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
