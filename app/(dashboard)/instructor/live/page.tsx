'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  MonitorUp, 
  PhoneOff, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldAlert, 
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface StudentRosterItem {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  marked: boolean;
}

export default function InstructorLiveClassroomPage() {
  // Video Controls State
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Attendance Roster State
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSavedMsg, setAttendanceSavedMsg] = useState(false);

  // Course info
  const [courseId, setCourseId] = useState('');
  const [courseTitle, setCourseTitle] = useState('Cybersecurity & Threat Intelligence');

  useEffect(() => {
    const fetchCourseAndRoster = async () => {
      setLoading(true);
      try {
        const coursesRes = await fetch('/api/courses');
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          if (Array.isArray(coursesData) && coursesData.length > 0) {
            const firstCourse = coursesData[0];
            setCourseId(firstCourse.id);
            setCourseTitle(firstCourse.title);

            // Fetch live attendance roster for course
            const todayStr = new Date().toISOString().split('T')[0];
            const attRes = await fetch(`/api/instructor/attendance?courseId=${firstCourse.id}&date=${todayStr}`);
            if (attRes.ok) {
              const rosterData = await attRes.json();
              if (Array.isArray(rosterData)) {
                setStudents(rosterData);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load live class roster:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndRoster();
  }, []);

  const meetingLink = `https://meet.google.com/ugt-live-${courseId.slice(-6) || 'cyber'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const toggleStudentStatus = (userId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudents((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, status, marked: true } : s))
    );
  };

  const handleSyncAttendance = async () => {
    if (!courseId) return;
    setSavingAttendance(true);
    setAttendanceSavedMsg(false);

    const todayStr = new Date().toISOString().split('T')[0];
    const attendanceList = students.map((s) => ({
      userId: s.userId,
      status: s.status,
    }));

    try {
      const res = await fetch('/api/instructor/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          date: todayStr,
          attendanceList,
        }),
      });

      if (res.ok) {
        setAttendanceSavedMsg(true);
        setTimeout(() => setAttendanceSavedMsg(false), 4000);
      }
    } catch (err) {
      console.error('Failed to sync attendance:', err);
    } finally {
      setSavingAttendance(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Live Session Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Video className="w-7 h-7 text-[#1E60D5]" /> Virtual Classroom Meeting & Live Roll Call
          </h1>
          <p className="text-xs text-slate-500 font-semibold">{courseTitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 border border-slate-200 cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Link Copied!' : 'Copy Meeting Link'}
          </button>

          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" /> Open External Google Meet
          </a>
        </div>
      </div>

      {/* Main Grid: Meeting Screen Left (8 Cols), Attendance Panel Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video Meeting Interface (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-900 aspect-video flex flex-col justify-between p-6">
            {/* Video Overlay Top Header */}
            <div className="flex justify-between items-center z-10">
              <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>REC • Live Cohort Lecture</span>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-emerald-400 text-xs font-bold font-mono">
                {presentCount} Students Joined
              </div>
            </div>

            {/* Main Stage Avatar / Video View */}
            <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1E60D5] to-indigo-600 text-white text-3xl font-black flex items-center justify-center shadow-xl border-4 border-white/10">
                DR
              </div>
              <h3 className="text-white font-extrabold text-lg">Dr. Instructor (Host)</h3>
              <p className="text-slate-400 text-xs font-mono">Broadcasting Live Lecture Stream...</p>
            </div>

            {/* Bottom Floating Control Bar */}
            <div className="flex justify-center items-center gap-3 z-10 pt-4">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3.5 rounded-2xl transition border ${
                  micOn ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-red-600 text-white border-red-500'
                }`}
                title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-3.5 rounded-2xl transition border ${
                  cameraOn ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-red-600 text-white border-red-500'
                }`}
                title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsSharingScreen(!isSharingScreen)}
                className={`p-3.5 rounded-2xl transition border ${
                  isSharingScreen ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700'
                }`}
                title="Share Screen"
              >
                <MonitorUp className="w-5 h-5" />
              </button>

              <Link
                href="/instructor"
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                <PhoneOff className="w-4 h-4" /> End Live Call
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Integrated Live Roll Call Sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E60D5]" /> Live Attendance Roll Call
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold">Mark present during live meeting call</p>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              {presentCount} / {students.length} Present
            </span>
          </div>

          {attendanceSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Attendance synced to Instructor Roster!</span>
            </div>
          )}

          {/* Student Roll Call List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {students.map((student) => (
              <div
                key={student.userId}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">
                    {student.firstName} {student.lastName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] block">
                    {student.email}
                  </span>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => toggleStudentStatus(student.userId, 'PRESENT')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                      student.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    P
                  </button>
                  <button
                    onClick={() => toggleStudentStatus(student.userId, 'LATE')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                      student.status === 'LATE'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    L
                  </button>
                  <button
                    onClick={() => toggleStudentStatus(student.userId, 'ABSENT')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                      student.status === 'ABSENT'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    A
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSyncAttendance}
            disabled={savingAttendance}
            className="w-full py-3.5 rounded-xl bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/20 disabled:opacity-50 cursor-pointer"
          >
            {savingAttendance ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Sync Attendance to Roster</span>
          </button>
        </div>
      </div>
    </div>
  );
}
