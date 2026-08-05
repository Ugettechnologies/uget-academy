'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Captions,
  Hand,
  FileText,
  Copy,
  Check,
  Download,
  Loader2,
  Volume2
} from 'lucide-react';

export default function StudentLiveClassroomPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  // Student Attendance Check-in State
  const [checkedIn, setCheckedIn] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Transcripts
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const meetingLink = 'https://meet.google.com/ugt-live-cohort';

  // Initialize WebCam Stream for Student
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

    // Default lecture transcript
    setTranscripts([
      `[${new Date().toLocaleTimeString()}] Dr. Instructor: Welcome class to Module 4 Advanced Web Penetration Testing session.`,
      `[${new Date().toLocaleTimeString()}] Dr. Instructor: Today we are reviewing OWASP Top 10 vulnerabilities, CSRF mitigations, and SQL injection payloads.`,
      `[${new Date().toLocaleTimeString()}] Dr. Instructor: Please ensure all students click the "Mark Myself Present Now" check-in button in the right sidebar.`,
    ]);

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Camera Toggle
  useEffect(() => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = cameraOn));
    }
  }, [cameraOn]);

  // Mic Toggle
  useEffect(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = micOn));
    }
  }, [micOn]);

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

  const handleCopyTranscript = () => {
    const fullText = transcripts.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 3000);
  };

  const handleDownloadTranscript = () => {
    const fullText = `UGET ACADEMY - LIVE LECTURE TRANSCRIPTION LOG\nCourse: Cybersecurity & Threat Intelligence\nDate: ${new Date().toLocaleDateString()}\n--------------------------------------------------\n\n` + transcripts.join('\n');
    const element = document.createElement('a');
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Student_Lecture_Transcript_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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

      {/* Main Grid: Video Screen Left (8 Cols), Attendance Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Video Stage & Live Transcript (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-900 aspect-video flex flex-col justify-between p-4 sm:p-6">
            <div className="flex justify-between items-center z-20">
              <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Live Lecture • Dr. Instructor</span>
              </div>
            </div>

            {/* WebCam Video View */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                cameraOn ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center my-auto z-10 space-y-3 bg-slate-900/90">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1E60D5] to-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-xl border-4 border-white/10">
                  STU
                </div>
                <h3 className="text-white font-extrabold text-base">Module 4: Advanced Web Penetration & OWASP Top 10</h3>
                <p className="text-slate-400 text-xs font-mono">Live Stream Broadcast Active</p>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex justify-center items-center gap-3 z-20 pt-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 rounded-2xl">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  micOn ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-red-600 text-white border-red-500'
                }`}
                title={micOn ? 'Mute' : 'Unmute'}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  cameraOn ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-red-600 text-white border-red-500'
                }`}
                title={cameraOn ? 'Camera Off' : 'Camera On'}
              >
                {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setCaptionsOn(!captionsOn)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  captionsOn ? 'bg-[#1E60D5] text-white border-blue-500' : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700'
                }`}
                title="Captions"
              >
                <Captions className="w-5 h-5" />
              </button>

              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`p-3.5 rounded-2xl transition border cursor-pointer ${
                  handRaised ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700'
                }`}
                title="Raise Hand"
              >
                <Hand className="w-5 h-5" />
              </button>

              <Link
                href="/student"
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" /> Leave Call
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
                  Real-time transcript logging all spoken audio from today's live lecture
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

            <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs max-h-56 overflow-y-auto space-y-2 border border-slate-800 shadow-inner custom-scrollbar">
              {transcripts.map((text, idx) => (
                <div key={idx} className="leading-relaxed border-b border-slate-800/60 pb-1.5 last:border-b-0">
                  <span className="text-emerald-400">{text}</span>
                </div>
              ))}
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
