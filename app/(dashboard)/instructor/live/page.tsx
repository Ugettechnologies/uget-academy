'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Copy, 
  Check, 
  ExternalLink,
  Captions,
  Hand,
  Download,
  FileText,
  RefreshCw,
  Sparkles,
  Volume2
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
  // Video & Stream Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Video Controls State
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Speech-to-Text Transcription State
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Live Attendance Roster State
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSavedMsg, setAttendanceSavedMsg] = useState(false);

  // Course info
  const [courseId, setCourseId] = useState('');
  const [courseTitle, setCourseTitle] = useState('Cybersecurity & Threat Intelligence');

  // Initialize WebCam Stream
  useEffect(() => {
    async function startWebCam() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('WebCam / Mic access denied or unavailable:', err);
      }
    }

    startWebCam();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle Camera Toggle
  useEffect(() => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = cameraOn));
    }
  }, [cameraOn]);

  // Handle Microphone Toggle
  useEffect(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = micOn));
    }
  }, [micOn]);

  // Initialize Speech-to-Text Recognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }

        if (finalTranscript.trim().length > 0) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setTranscripts((prev) => [...prev, `[${timestamp}] Dr. Instructor: ${finalTranscript.trim()}`]);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition notice:', err);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsTranscribing(true);
      } catch (e) {
        // Recognition already started
      }
    } else {
      // Fallback sample transcript log if Web Speech API not supported
      setTranscripts([
        `[${new Date().toLocaleTimeString()}] Dr. Instructor: Welcome class to Module 4 Advanced Penetration Testing lecture.`,
        `[${new Date().toLocaleTimeString()}] Dr. Instructor: Please ensure all students mark their roll call attendance ticket in the right sidebar.`,
      ]);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Fetch Live Class Attendance Roster
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

  const handleCopyTranscript = () => {
    const fullText = transcripts.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 3000);
  };

  const handleDownloadTranscript = () => {
    const fullText = `UGET ACADEMY - LIVE LECTURE TRANSCRIPTION LOG\nCourse: ${courseTitle}\nDate: ${new Date().toLocaleDateString()}\n--------------------------------------------------\n\n` + transcripts.join('\n');
    const element = document.createElement('a');
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Lecture_Transcript_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Live Google Meet Broadcast
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Video className="w-7 h-7 text-[#1E60D5]" /> Virtual Classroom & Live Voice Transcribe
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
        {/* Left Video Stage & Live Transcript (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Video Window */}
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-900 aspect-video flex flex-col justify-between p-4 sm:p-6">
            {/* Top Video Overlay Bar */}
            <div className="flex justify-between items-center z-20">
              <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>REC • Live Lecture Broadcast</span>
              </div>

              <div className="flex items-center gap-2">
                {micOn && (
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1 font-mono">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Mic Active
                  </span>
                )}
                <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-emerald-400 text-xs font-bold font-mono">
                  {presentCount} Students Joined
                </div>
              </div>
            </div>

            {/* Real WebCam Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                cameraOn ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Camera Off Avatar Overlay */}
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center my-auto z-10 space-y-3 bg-slate-900/90">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1E60D5] to-indigo-600 text-white text-3xl font-black flex items-center justify-center shadow-xl border-4 border-white/10">
                  DR
                </div>
                <h3 className="text-white font-extrabold text-lg">Dr. Instructor (Host)</h3>
                <p className="text-slate-400 text-xs font-mono">Camera Paused • Microphone Active</p>
              </div>
            )}

            {/* Bottom Google Meet Floating Toolbar */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 z-20 pt-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 rounded-2xl">
              {/* Mic Toggle */}
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  micOn ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-red-600 text-white border-red-500'
                }`}
                title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  cameraOn ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-red-600 text-white border-red-500'
                }`}
                title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </button>

              {/* Closed Captions CC Toggle */}
              <button
                onClick={() => setCaptionsOn(!captionsOn)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  captionsOn ? 'bg-[#1E60D5] text-white border-blue-500' : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700'
                }`}
                title="Toggle Live Transcribe / Closed Captions"
              >
                <Captions className="w-5 h-5" />
              </button>

              {/* Screen Share */}
              <button
                onClick={() => setIsSharingScreen(!isSharingScreen)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  isSharingScreen ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700'
                }`}
                title="Share Screen"
              >
                <MonitorUp className="w-5 h-5" />
              </button>

              {/* Raise Hand */}
              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  handRaised ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700'
                }`}
                title="Raise Hand"
              >
                <Hand className="w-5 h-5" />
              </button>

              {/* Leave Call */}
              <Link
                href="/instructor"
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" /> End Call
              </Link>
            </div>
          </div>

          {/* REAL-TIME VOICE TRANSCRIBE TO TEXT BOX */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1E60D5]" /> Live Voice-to-Text Lecture Transcript
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Real-time continuous speech transcription recording all spoken lecture audio
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedTranscript ? 'Copied!' : 'Copy Text'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTranscript}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold transition flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download .TXT Log
                </button>
              </div>
            </div>

            {/* Live Transcript Display Log */}
            <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs max-h-56 overflow-y-auto space-y-2 border border-slate-800 shadow-inner custom-scrollbar">
              {transcripts.length === 0 ? (
                <div className="py-6 text-center text-slate-500 italic flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4 animate-pulse text-[#1E60D5]" />
                  <span>Listening to spoken microphone audio... Speak into microphone to generate live text transcript.</span>
                </div>
              ) : (
                transcripts.map((text, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-slate-800/60 pb-1.5 last:border-b-0">
                    <span className="text-emerald-400">{text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Integrated Live Attendance Roll Call Sidebar (4 Cols) */}
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
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
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
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                      student.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    P
                  </button>
                  <button
                    onClick={() => toggleStudentStatus(student.userId, 'LATE')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                      student.status === 'LATE'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    L
                  </button>
                  <button
                    onClick={() => toggleStudentStatus(student.userId, 'ABSENT')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
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
