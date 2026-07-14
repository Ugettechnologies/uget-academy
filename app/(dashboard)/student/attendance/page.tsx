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
  Loader2,
  CalendarCheck,
  CheckCircle,
  HelpCircle as ExcuseIcon
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

  // Cohort Weeks Generator (12 Weeks cohort evaluation)
  const getCohortWeeks = () => {
    if (history.length === 0) {
      // Return 12 default placeholder weeks if no history loaded
      return Array.from({ length: 12 }, (_, i) => ({
        weekNumber: i + 1,
        totalClasses: 0,
        attendedCount: 0,
        attendancePct: null,
        status: 'Upcoming'
      }));
    }

    // Find the earliest start time in our history
    const startTimes = history.map(item => new Date(item.startTime).getTime());
    const earliestTime = Math.min(...startTimes);
    const cohortStart = new Date(earliestTime);
    
    // Normalize cohortStart to Monday
    const startDay = cohortStart.getDay();
    const diff = cohortStart.getDate() - startDay + (startDay === 0 ? -6 : 1);
    const normalizedStart = new Date(cohortStart.setDate(diff));
    normalizedStart.setHours(0, 0, 0, 0);

    const now = new Date();

    return Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date(normalizedStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      
      // Filter sessions inside this week
      const weekSessions = history.filter(item => {
        const itemTime = new Date(item.startTime).getTime();
        return itemTime >= weekStart.getTime() && itemTime <= weekEnd.getTime();
      });

      const totalClassesInWeek = weekSessions.length;
      
      // Filter student checked-in/excused sessions
      const attendedSessions = weekSessions.filter(item => {
        const att = item.attendances[0];
        const excuse = item.excuses[0];
        const hasAttended = att?.status === 'PRESENT' || att?.status === 'LATE';
        const isExcused = att?.status === 'EXCUSED' || excuse?.status === 'APPROVED';
        return hasAttended || isExcused;
      });

      const attendedCountInWeek = attendedSessions.length;
      const pct = totalClassesInWeek > 0 ? Math.round((attendedCountInWeek / totalClassesInWeek) * 100) : null;

      let status = 'Upcoming';
      if (weekStart < now) {
        status = totalClassesInWeek > 0 ? (pct === 100 ? 'Complete' : 'Deficit') : 'No Classes';
      }

      return {
        weekNumber: i + 1,
        totalClasses: totalClassesInWeek,
        attendedCount: attendedCountInWeek,
        attendancePct: pct,
        status
      };
    });
  };

  const cohortWeeks = getCohortWeeks();

  return (
    <div className="space-y-8 animate-fade-in text-text-primary">
      
      {/* Top Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
          <Calendar className="w-8 h-8 text-royal-gold" /> Live Check-In Portal
        </h1>
        <p className="text-text-secondary text-xs mt-1">Submit live cohort check-in codes, review weekly availability, verify geofencing, and submit excuse letters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Check-In and Request Excuse Form */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Verify Lecture code */}
          <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-border-divider space-y-5 shadow-lg">
            <h3 className="text-base font-black text-text-primary tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent-purple" /> Check-in code
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed font-normal">
              Type the code given by the instructor during the live lecture to check in. If geofencing is enabled, coordinates will be validated.
            </p>

            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. NX16LIVE"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  className="w-full rounded-xl border border-border-divider bg-deep-violet px-4 py-3 text-xs focus:border-royal-purple focus:outline-none transition uppercase text-center font-extrabold tracking-wider text-text-primary placeholder:text-text-secondary/50"
                />
              </div>

              {coordinates && (
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-status-present animate-pulse" /> GPS Locked: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                </div>
              )}

              {checkInMsg && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 border ${
                  checkInMsg.status === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-status-present' 
                    : 'bg-status-absent/10 border-status-absent/20 text-status-absent'
                }`}>
                  {checkInMsg.status === 'success' ? <CheckCircle2 className="w-4 flex-shrink-0" /> : <AlertCircle className="w-4 flex-shrink-0" />}
                  <span className="leading-relaxed font-semibold">{checkInMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={checkingIn}
                className="w-full bg-royal-purple hover:bg-royal-purple/95 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {checkingIn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Verify Check In</span>
              </button>
            </form>
          </div>

          {/* Card: Excuse Absence Request */}
          <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-border-divider space-y-5 shadow-lg">
            <h3 className="text-base font-black text-text-primary tracking-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-accent-purple" /> Request Excuse
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed font-normal">
              If you missed a live cohort class due to medical or logistics reasons, submit an excuse request below.
            </p>

            {missedSessions.length === 0 ? (
              <p className="text-text-secondary text-xs font-medium p-4 bg-deep-violet border border-border-divider/50 rounded-xl text-center">You have no missed session records.</p>
            ) : (
              <form onSubmit={handleSubmitExcuse} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Select Missed Session</label>
                  <select
                    required
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full bg-deep-violet border border-border-divider rounded-xl px-4 py-3 text-xs focus:border-royal-purple focus:outline-none font-semibold text-text-primary"
                  >
                    <option value="" className="bg-surface-card">-- Choose Lecture --</option>
                    {missedSessions.map((session) => (
                      <option key={session.id} value={session.id} className="bg-surface-card text-text-primary">
                        {session.title} ({new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Reason / Explanation</label>
                  <textarea
                    rows={3}
                    required
                    value={excuseReason}
                    onChange={(e) => setExcuseReason(e.target.value)}
                    placeholder="Provide details for logistics or medical constraints..."
                    className="w-full rounded-xl border border-border-divider bg-deep-violet px-4 py-3 text-xs focus:border-royal-purple focus:outline-none transition resize-none font-semibold text-text-primary placeholder:text-text-secondary/50"
                  />
                </div>

                {excuseMsg && (
                  <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 border ${
                    excuseMsg.status === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-status-present' 
                      : 'bg-status-absent/10 border-status-absent/20 text-status-absent'
                  }`}>
                    {excuseMsg.status === 'success' ? <CheckCircle2 className="w-4 flex-shrink-0" /> : <AlertCircle className="w-4 flex-shrink-0" />}
                    <span className="leading-relaxed font-semibold">{excuseMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingExcuse}
                  className="w-full bg-royal-purple hover:bg-royal-purple/95 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submittingExcuse && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Excuse Letter</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Hand: 12-Week Scorecard, Logs, and Metrics */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Metrics summary cards */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Attendance Rate */}
            <div className="bg-surface-card rounded-3xl p-5 border border-border-divider flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-status-present border border-emerald-500/15">
                <CheckSquare className="w-5.5 h-5.5" />
              </div>
              <div>
                <div className="text-xl font-black text-text-primary leading-none">{attendanceRate}%</div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Attendance Rate</div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-surface-card rounded-3xl p-5 border border-border-divider flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 bg-status-excused/10 rounded-2xl flex items-center justify-center text-status-excused border border-status-excused/15">
                <Flame className="w-5.5 h-5.5 fill-current animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-black text-text-primary leading-none">Streak</div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Active Check-ins</div>
              </div>
            </div>

            {/* Total Lectures */}
            <div className="bg-surface-card rounded-3xl p-5 border border-border-divider flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 bg-royal-purple/20 rounded-2xl flex items-center justify-center text-accent-purple border border-royal-purple/25">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <div>
                <div className="text-xl font-black text-text-primary leading-none">{totalClasses} Lectures</div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Total Scheduled</div>
              </div>
            </div>

          </div>

          {/* NEW SECTION: 12-Week Cohort Attendance scorecard grid */}
          <div className="bg-surface-card rounded-3xl border border-border-divider p-6 sm:p-8 space-y-5 shadow-lg">
            <div className="border-b border-border-divider pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-text-primary tracking-tight">12-Week Cohort Availability Progression</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Instructor weekly sessions vs student attendance. 100% weekly check-in provides full credit.</p>
              </div>
              <span className="text-[10px] bg-royal-purple/25 text-accent-purple px-3 py-1 rounded-full font-bold uppercase border border-royal-purple/10">
                12 Weeks
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4.5">
              {cohortWeeks.map((week) => {
                let badgeBg = 'bg-deep-violet text-text-secondary border-border-divider';
                let subLabel = 'Upcoming';
                let indicatorColor = 'bg-border-divider';

                if (week.status === 'Complete') {
                  badgeBg = 'bg-emerald-500/15 text-status-present border-emerald-500/20';
                  subLabel = `${week.attendedCount}/${week.totalClasses} classes`;
                  indicatorColor = 'bg-status-present';
                } else if (week.status === 'Deficit') {
                  badgeBg = 'bg-status-absent/15 text-status-absent border-status-absent/20';
                  subLabel = `${week.attendedCount}/${week.totalClasses} classes`;
                  indicatorColor = 'bg-status-absent';
                } else if (week.status === 'No Classes') {
                  badgeBg = 'bg-deep-violet text-text-secondary border-border-divider';
                  subLabel = 'No sessions';
                  indicatorColor = 'bg-border-divider';
                }

                return (
                  <div 
                    key={week.weekNumber} 
                    className={`rounded-2xl border p-3 flex flex-col justify-between h-20 transition hover:border-royal-purple/40 ${
                      week.status === 'Upcoming' ? 'bg-[#150E27]/30 border-border-divider/50' : 'bg-deep-violet/40 border-border-divider'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-text-secondary">Week {week.weekNumber}</span>
                      <span className="w-1.5 h-1.5 rounded-full" />
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black block leading-none text-text-primary">
                          {week.attendancePct !== null ? `${week.attendancePct}%` : '--'}
                        </span>
                        <span className="text-[9px] text-text-secondary block font-bold leading-none">
                          {subLabel}
                        </span>
                      </div>
                      <span className={`inline-flex items-center justify-center p-1 rounded-lg ${badgeBg} border text-[9px] font-bold`}>
                        {week.status === 'Complete' && '100%'}
                        {week.status === 'Deficit' && 'Deficit'}
                        {week.status === 'No Classes' && 'Off'}
                        {week.status === 'Upcoming' && 'Soon'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Attendance Logs Grid table */}
          <div className="bg-surface-card rounded-3xl border border-border-divider overflow-hidden shadow-lg">
            <div className="px-8 py-5 border-b border-border-divider flex justify-between items-center bg-[#150E27]/40">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Class Attendance Logs</h4>
              <span className="text-[10px] font-bold text-text-primary">Total attended: {attendedCount}</span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-text-secondary text-xs font-bold flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent-purple" /> Loading logs...
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 text-center text-text-secondary text-xs font-bold">No sessions found for your enrolled course curriculum.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-divider bg-[#150E27]/30 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <th className="px-8 py-4">Lecture / Course Title</th>
                      <th className="px-6 py-4">Schedule date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Excuses details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-divider text-text-primary">
                    {history.map((item) => {
                      const att = item.attendances[0];
                      const excuse = item.excuses[0];
                      const now = new Date();
                      const isFuture = new Date(item.startTime) > now;
                      const hasAttended = att?.status === 'PRESENT' || att?.status === 'LATE';

                      // Status label resolver
                      let statusText = 'ABSENT';
                      let badgeStyle = 'bg-status-absent/15 text-status-absent border-status-absent/25';

                      if (isFuture) {
                        statusText = 'UPCOMING';
                        badgeStyle = 'bg-deep-violet text-text-secondary border-border-divider/60';
                      } else if (hasAttended) {
                        statusText = att.status;
                        badgeStyle = att.status === 'PRESENT' 
                          ? 'bg-emerald-500/20 text-status-present border-emerald-500/25' 
                          : 'bg-status-late/15 text-status-late border-status-late/25';
                      } else if (excuse) {
                        statusText = `EXCUSED (${excuse.status})`;
                        badgeStyle = excuse.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-status-present border-emerald-500/25'
                          : 'bg-royal-purple/20 text-accent-purple border-royal-purple/25';
                      }

                      return (
                        <tr key={item.id} className="hover:bg-royal-purple/10 transition">
                          <td className="px-8 py-4">
                            <div className="space-y-1 max-w-sm">
                              <span className="font-bold text-text-primary line-clamp-1">{item.title}</span>
                              <span className="text-[10px] text-text-secondary block font-semibold">{item.course.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-text-secondary font-mono">
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
                          <td className="px-6 py-4 text-right max-w-xs truncate text-[11px] text-text-secondary font-medium">
                            {excuse ? (
                              <span className="italic" title={excuse.reason}>
                                "{excuse.reason}"
                              </span>
                            ) : (
                              !isFuture && !hasAttended && <span className="text-status-absent font-bold">No excuse submitted</span>
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
