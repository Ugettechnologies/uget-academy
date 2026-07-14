'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  PlusCircle, 
  Clock, 
  CheckSquare,
  HelpCircle,
  Loader2
} from 'lucide-react';

interface AttendanceHistoryItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  sessionCode: string | null;
  course: {
    title: string;
  };
  attendances: Array<{
    status: string;
    checkInTime: string | null;
  }>;
  excuses: Array<{
    reason: string;
    status: string;
  }>;
}

export default function StudentAttendancePage() {
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Check-In form states
  const [sessionCode, setSessionCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<{ status: 'success' | 'error', text: string } | null>(null);

  // Excuse Form states
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [excuseReason, setExcuseReason] = useState('');
  const [submittingExcuse, setSubmittingExcuse] = useState(false);
  const [excuseMsg, setExcuseMsg] = useState<{ status: 'success' | 'error', text: string } | null>(null);

  // Geolocation state
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/attendance/history');
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    // Proactively query geolocation if available
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.log('Location access denied or unavailable:', err.message);
        }
      );
    }
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode) return;

    setCheckingIn(true);
    setCheckInMsg(null);

    try {
      const res = await fetch('/api/student/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCheckInMsg({
          status: 'success',
          text: `Check-in successful! Logged as ${data.attendance.status}.`,
        });
        setSessionCode('');
        fetchHistory(); // Refresh logs
      } else {
        setCheckInMsg({
          status: 'error',
          text: data.error || 'Failed to verify attendance code.',
        });
      }
    } catch (err) {
      setCheckInMsg({ status: 'error', text: 'Network error. Please try again.' });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleSubmitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !excuseReason) return;

    setSubmittingExcuse(true);
    setExcuseMsg(null);

    try {
      const res = await fetch('/api/student/attendance/excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveSessionId: selectedSessionId,
          reason: excuseReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setExcuseMsg({
          status: 'success',
          text: 'Excuse submitted successfully! Status: PENDING review.',
        });
        setSelectedSessionId('');
        setExcuseReason('');
        fetchHistory();
      } else {
        setExcuseMsg({
          status: 'error',
          text: data.error || 'Failed to submit excuse request.',
        });
      }
    } catch (err) {
      setExcuseMsg({ status: 'error', text: 'Network error submitting excuse.' });
    } finally {
      setSubmittingExcuse(false);
    }
  };

  // Find missed sessions that don't have check-ins
  const missedSessions = history.filter(
    (item) => item.attendances.length === 0 && new Date(item.startTime) < new Date()
  );

  // Stats calculation
  const totalClasses = history.length;
  const attendedCount = history.filter((item) => {
    const status = item.attendances[0]?.status;
    return status === 'PRESENT' || status === 'LATE';
  }).length;
  const excusedCount = history.filter((item) => {
    const status = item.attendances[0]?.status;
    return status === 'EXCUSED' || item.excuses.length > 0;
  }).length;
  const attendanceRate = totalClasses > 0 
    ? Math.round(((attendedCount + excusedCount) / totalClasses) * 100)
    : 100;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Top Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Calendar className="w-8 h-8 text-brand-primary" /> Live Check-In Portal
        </h1>
        <p className="text-slate-500 text-xs mt-1">Submit live cohort codes, review streaks, verify geofencing, and submit excuse letters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Check-In and Request Excuse Form */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Verify Lecture code */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-5">
            <h3 className="text-base font-black text-slate-850 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-primary" /> Check-in code
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed font-normal">
              Type the code given by the instructor to check in. If geofencing is enabled, coordinates will be compared.
            </p>

            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. NX16LIVE"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition uppercase text-center font-extrabold tracking-wider"
                />
              </div>

              {coordinates && (
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> GPS Locked: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                </div>
              )}

              {checkInMsg && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                  checkInMsg.status === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {checkInMsg.status === 'success' ? <CheckCircle2 className="w-4 flex-shrink-0" /> : <AlertCircle className="w-4 flex-shrink-0" />}
                  <span className="leading-relaxed font-semibold">{checkInMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={checkingIn}
                className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
              >
                {checkingIn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Verify Check In</span>
              </button>
            </form>
          </div>

          {/* Card: Excuse Absence Request */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-5">
            <h3 className="text-base font-black text-slate-855 tracking-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-brand-primary" /> Request Excuse
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed font-normal">
              If you missed a live cohort class due to medical or logistics reasons, submit an excuse request below.
            </p>

            {missedSessions.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium p-4 bg-slate-50 rounded-xl text-center">You have no missed session records.</p>
            ) : (
              <form onSubmit={handleSubmitExcuse} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Missed Session</label>
                  <select
                    required
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none font-semibold text-slate-700"
                  >
                    <option value="">-- Choose Lecture --</option>
                    {missedSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.title} ({new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reason / Explanation</label>
                  <textarea
                    rows={3}
                    required
                    value={excuseReason}
                    onChange={(e) => setExcuseReason(e.target.value)}
                    placeholder="Provide details for logistics or medical constraints..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-55/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none font-semibold text-slate-700"
                  />
                </div>

                {excuseMsg && (
                  <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                    excuseMsg.status === 'success' 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {excuseMsg.status === 'success' ? <CheckCircle2 className="w-4 flex-shrink-0" /> : <AlertCircle className="w-4 flex-shrink-0" />}
                    <span className="leading-relaxed font-semibold">{excuseMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingExcuse}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {submittingExcuse && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Excuse Letter</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Hand: Logs list and metrics */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Metrics summary cards */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Attendance Rate */}
            <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
              <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                <CheckSquare className="w-5.5 h-5.5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-850">{attendanceRate}%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance Rate</div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
              <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <Flame className="w-5.5 h-5.5 fill-current animate-bounce" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-850">Seeded</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live streaks</div>
              </div>
            </div>

            {/* Total Lectures */}
            <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
              <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-850">{totalClasses} Lectures</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cohort classes</div>
              </div>
            </div>

          </div>

          {/* Section: Attendance Logs Grid table */}
          <div className="bg-white rounded-3xl border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Class Attendance Logs</h4>
              <span className="text-[10px] font-bold text-slate-500">Total present/late: {attendedCount}</span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" /> Loading logs...
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs font-bold">No sessions found for your enrolled course curriculum.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-8 py-4">Lecture / Course Title</th>
                      <th className="px-6 py-4">Schedule date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Excuses details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 text-slate-700">
                    {history.map((item) => {
                      const att = item.attendances[0];
                      const excuse = item.excuses[0];
                      const now = new Date();
                      const isFuture = new Date(item.startTime) > now;
                      const hasAttended = att?.status === 'PRESENT' || att?.status === 'LATE';

                      // Status label resolver
                      let statusText = 'ABSENT';
                      let badgeStyle = 'bg-red-50 text-red-650 border-red-500/10';

                      if (isFuture) {
                        statusText = 'UPCOMING';
                        badgeStyle = 'bg-slate-50 text-slate-500 border-slate-150';
                      } else if (hasAttended) {
                        statusText = att.status;
                        badgeStyle = att.status === 'PRESENT' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10' 
                          : 'bg-amber-50 text-amber-600 border-amber-500/10';
                      } else if (excuse) {
                        statusText = `EXCUSED (${excuse.status})`;
                        badgeStyle = excuse.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                          : 'bg-blue-50 text-blue-600 border-blue-500/10';
                      }

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-8 py-4">
                            <div className="space-y-1 max-w-sm">
                              <span className="font-bold text-slate-800 line-clamp-1">{item.title}</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">{item.course.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-450 font-mono">
                            {new Date(item.startTime).toLocaleString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${badgeStyle}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right max-w-xs truncate text-[11px] text-slate-500 font-medium">
                            {excuse ? (
                              <span className="italic" title={excuse.reason}>
                                "{excuse.reason}"
                              </span>
                            ) : (
                              !isFuture && !hasAttended && <span className="text-red-400 font-bold">No excuse submitted</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
