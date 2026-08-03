'use client';

import React, { useState } from 'react';
import LiveVideoCall from '@/components/student/LiveVideoCall';
import { Calendar, Video, Clock, CheckCircle2, AlertCircle, RefreshCw, Sparkles, User, Info } from 'lucide-react';

interface ClassSession {
  id: string;
  courseTitle: string;
  topic: string;
  instructorName: string;
  time: string;
  date: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  meetingUrl: string;
}

export default function StudentAttendancePage() {
  const [inLiveCall, setInLiveCall] = useState(false);

  const [schedule] = useState<ClassSession[]>([
    {
      id: 'sess-1',
      courseTitle: 'Cybersecurity & Threat Intelligence',
      topic: 'Module 4: Advanced Web Penetration & OWASP Top 10',
      instructorName: 'Dr. Ada Lovelace',
      date: 'Today, Aug 3',
      time: '04:00 PM - 05:30 PM WAT',
      status: 'LIVE',
      meetingUrl: 'https://meet.uget-academy.online/cyber-live-101',
    },
    {
      id: 'sess-2',
      courseTitle: 'Cybersecurity & Threat Intelligence',
      topic: 'Module 5: Network Forensics & WireShark Protocol Analysis',
      instructorName: 'Dr. Ada Lovelace',
      date: 'Wednesday, Aug 5',
      time: '04:00 PM - 05:30 PM WAT',
      status: 'UPCOMING',
      meetingUrl: 'https://meet.uget-academy.online/cyber-live-102',
    },
    {
      id: 'sess-3',
      courseTitle: 'Cybersecurity & Threat Intelligence',
      topic: 'Module 3: Defensive Architecture & Firewall Configuration',
      instructorName: 'Dr. Ada Lovelace',
      date: 'Monday, Aug 1',
      time: '04:00 PM - 05:30 PM WAT',
      status: 'COMPLETED',
      meetingUrl: 'https://meet.uget-academy.online/cyber-live-100',
    },
  ]);

  if (inLiveCall) {
    return (
      <div className="space-y-4 animate-fade-in text-white">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setInLiveCall(false)}
            className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1 font-bold"
          >
            ← Return to Timetable Directory
          </button>
        </div>
        <LiveVideoCall
          courseTitle="Cybersecurity & Threat Intelligence"
          onLeave={() => setInLiveCall(false)}
          user={{ firstName: 'Student', lastName: 'Learner' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <Calendar className="w-7 h-7 text-[#60A5FA]" />
            Class Schedule & Timetable
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Timetables updated in real time by course instructors. Join live lecture rooms below.
          </p>
        </div>
      </div>

      {/* Reminder Alert Banner */}
      <div className="p-4 rounded-2xl bg-[#2563EB]/15 border border-[#2563EB]/30 text-xs text-blue-200 flex items-start gap-3 shadow-lg">
        <Sparkles className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Next Live Class Starts Today at 04:00 PM WAT</p>
          <p className="text-[11px] text-blue-300">
            Topic: <strong className="text-white">Module 4: Advanced Web Penetration & OWASP Top 10</strong>. Links expire 20 minutes after start time. Make sure to click the Roll Call ticket inside the call to verify attendance!
          </p>
        </div>
      </div>

      {/* Schedule Table / Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
          Cohort Timetable Directory
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {schedule.map((session) => (
            <div
              key={session.id}
              className={`p-6 rounded-3xl border transition shadow-xl space-y-4 ${
                session.status === 'LIVE'
                  ? 'bg-gradient-to-r from-[#0F172A] to-blue-950/60 border-blue-500/40'
                  : 'bg-[#0F172A] border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded border border-blue-500/30">
                      {session.courseTitle}
                    </span>
                    {session.status === 'LIVE' && (
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live Now
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{session.topic}</h3>
                </div>

                <div className="text-right text-xs">
                  <span className="text-gray-400 block">{session.date}</span>
                  <span className="font-mono font-bold text-blue-400">{session.time}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Instructor: <strong className="text-white">{session.instructorName}</strong></span>
                </div>

                {session.status === 'LIVE' ? (
                  <button
                    onClick={() => setInLiveCall(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs hover:from-emerald-500 hover:to-teal-400 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Video className="w-4 h-4" /> Enter Live Class Room
                  </button>
                ) : session.status === 'UPCOMING' ? (
                  <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold">
                    Scheduled (Starts Aug 5)
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
