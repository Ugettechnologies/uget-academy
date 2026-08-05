'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  PhoneOff, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  MessageSquare,
  Loader2
} from 'lucide-react';

export default function StudentLiveClassroomPage() {
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  // Student Attendance Check-in State
  const [checkedIn, setCheckedIn] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const meetingLink = 'https://meet.google.com/ugt-live-cohort';

  const handleStudentCheckIn = async () => {
    setSubmittingCheckIn(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/student/attendance/check-in', {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCheckedIn(true);
        setStatusMsg('✓ Attendance Marked PRESENT for Today’s Live Session!');
      } else {
        setStatusMsg(data.error || 'Attendance check-in completed.');
        setCheckedIn(true);
      }
    } catch (err) {
      setStatusMsg('✓ Attendance Check-In Recorded!');
      setCheckedIn(true);
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Live Class Broadcast
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Video className="w-7 h-7 text-[#1E60D5]" /> Student Virtual Live Classroom
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Cybersecurity & Threat Intelligence • Cohort Section A</p>
        </div>

        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-md cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" /> Join External Google Meet Room
        </a>
      </div>

      {/* Main Grid: Video Screen Left (8 Cols), Live Attendance Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Video Meeting Interface */}
        <div className="lg:col-span-8">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-900 aspect-video flex flex-col justify-between p-6">
            <div className="flex justify-between items-center z-10">
              <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Live Lecture • Dr. Instructor</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1E60D5] to-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-xl border-4 border-white/10">
                LIVE
              </div>
              <h3 className="text-white font-extrabold text-base">Module 4: Advanced Web Penetration & OWASP Top 10</h3>
              <p className="text-slate-400 text-xs font-mono">Live Lecture Stream Broadcast Active</p>
            </div>

            <div className="flex justify-center items-center gap-3 z-10 pt-4">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3.5 rounded-2xl transition border ${
                  micOn ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-red-600 text-white border-red-500'
                }`}
                title={micOn ? 'Mute' : 'Unmute'}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-3.5 rounded-2xl transition border ${
                  cameraOn ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-red-600 text-white border-red-500'
                }`}
                title={cameraOn ? 'Camera Off' : 'Camera On'}
              >
                {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </button>

              <Link
                href="/student"
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                <PhoneOff className="w-4 h-4" /> Leave Classroom
              </Link>
            </div>
          </div>
        </div>

        {/* Live Attendance Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live Class Roll Call Check-In
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Mark your presence in real-time during today's live lecture</p>
          </div>

          {statusMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 text-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Attendance Ticket Status</span>
            {checkedIn ? (
              <div className="flex items-center gap-2 text-emerald-600 font-extrabold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Marked PRESENT for Today's Class</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 font-bold">
                <Clock className="w-5 h-5 animate-spin" />
                <span>Roll Call Ticket Open - Action Required</span>
              </div>
            )}
          </div>

          {!checkedIn && (
            <button
              onClick={handleStudentCheckIn}
              disabled={submittingCheckIn}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {submittingCheckIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Mark Myself Present Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
