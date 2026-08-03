'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  Send, 
  Smile, 
  Hand,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Download,
  ShieldAlert,
  ThumbsUp,
  Flame,
  Heart
} from 'lucide-react';

interface LiveVideoCallProps {
  courseTitle: string;
  onLeave: () => void;
  user: {
    firstName: string;
    lastName: string;
    email?: string;
  };
  meetingStartTime?: Date;
}

export default function LiveVideoCall({ courseTitle, onLeave, user, meetingStartTime }: LiveVideoCallProps) {
  const [micActive, setMicActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<'chat' | 'people' | 'transcript' | null>(null);

  // Link Expiration state (20 minute expiration rule)
  const [isLinkExpired, setIsLinkExpired] = useState(false);

  // Roll Call state (must click to confirm attendance and unlock post-class transcript)
  const [hasMarkedRollCall, setHasMarkedRollCall] = useState(false);
  const [rollCallWarning, setRollCallWarning] = useState(false);

  // Floating reactions
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  // Transcripts & Chat
  const [transcripts, setTranscripts] = useState<Array<{ speaker: string; text: string; time: string }>>([
    { speaker: 'Instructor Ada', text: 'Welcome cohort! Today we are covering advanced security architecture & threat modeling.', time: '10:00 AM' },
    { speaker: 'Instructor Ada', text: 'Ensure you click the Roll Call button below to mark your live attendance.', time: '10:02 AM' },
  ]);

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Instructor Ada', text: 'Welcome everyone! Roll call is now open.', time: '10:01 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const [participants] = useState([
    { name: 'Instructor Ada', role: 'Instructor', active: true, initial: 'A', mic: true, cam: true },
    { name: 'Grace Hopper', role: 'Student', active: false, initial: 'G', mic: true, cam: false },
    { name: 'Alan Turing', role: 'Student', active: false, initial: 'T', mic: false, cam: true },
  ]);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. Manage Webcam
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => setCameraActive(false));
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [
      ...prev,
      { sender: `${user.firstName} ${user.lastName}`, text: newMessage, time: nowStr }
    ]);
    setNewMessage('');
  };

  const handleRollCallClick = async () => {
    setHasMarkedRollCall(true);
    setRollCallWarning(false);
    // Simulate updating instructor attendance ledger
    try {
      await fetch('/api/student/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PRESENT', courseTitle }),
      });
    } catch {
      // fallback
    }
  };

  const sendReaction = (emoji: string) => {
    setActiveReaction(emoji);
    setTimeout(() => setActiveReaction(null), 2500);
  };

  const downloadTranscript = () => {
    if (!hasMarkedRollCall) {
      setRollCallWarning(true);
      return;
    }
    const textContent = transcripts
      .map((t) => `[${t.time}] ${t.speaker}: ${t.text}`)
      .join('\n');
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lecture_Transcript_${courseTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLinkExpired) {
    return (
      <div className="bg-[#0F172A] border border-red-900/50 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">Live Class Link Expired</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            This live lecture link expired 20 minutes after start time. Please contact your instructor if you require a reschedule.
          </p>
        </div>
        <button
          onClick={onLeave}
          className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition"
        >
          Return to Timetable
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-[#0B0F19] border border-white/10 rounded-3xl overflow-hidden min-h-[580px] w-full text-white shadow-2xl relative">
      
      {/* Floating Reaction Animation */}
      {activeReaction && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-50 animate-bounce text-5xl">
          {activeReaction}
        </div>
      )}

      {/* LEFT: Main Meeting Room View */}
      <div className="flex-1 flex flex-col justify-between p-4 bg-[#0F172A] relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center z-10 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">{courseTitle} — Live Lecture</span>
          </div>

          {/* Roll Call Attendance Button */}
          <div className="flex items-center gap-2">
            {hasMarkedRollCall ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Present (Roll Call Complete)
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRollCallClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg animate-pulse"
                title="Click to mark your presence on instructor roll call"
              >
                <CheckCircle2 className="w-4 h-4" /> Click Roll Call Ticket
              </button>
            )}
          </div>
        </div>

        {/* Video Feeds Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 my-4 items-center justify-center min-h-[280px]">
          {/* Instructor Feed / Screen Share */}
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl h-full flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
            {isScreenSharing ? (
              <div className="w-full h-full flex flex-col justify-between p-4 bg-slate-950 font-mono text-[10px] text-emerald-400 leading-relaxed overflow-hidden">
                <div className="flex justify-between items-center text-gray-400 border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5 text-blue-400" /> Screen Presentation: Lecture_Outline.py</span>
                  <span>Ada Lovelace</span>
                </div>
                <div className="space-y-1 opacity-90 py-2">
                  <p className="text-blue-400"># UGET Academy — Threat Analysis Code</p>
                  <p>def evaluate_threat_vector(payload):</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;if "EXPLOIT" in payload:</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return "SEVERITY_HIGH"</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;return "CLEAN"</p>
                </div>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-500/30 w-fit self-end">
                  Instructor Screen Presentation
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xl font-black border border-blue-500/30 shadow-md">
                  A
                </div>
                <span className="text-xs font-bold mt-3 block text-white">Instructor Ada</span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold uppercase">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Speaking...
                </span>
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black/60 text-[9px] px-2.5 py-1 rounded-lg font-bold border border-white/10 backdrop-blur-md">
              Instructor Ada (Host)
            </span>
          </div>

          {/* Student Local Feed */}
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl h-full flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
            {cameraActive ? (
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover rounded-2xl transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center text-xl font-black border border-purple-500/30 shadow-md">
                  {user.firstName[0]}
                </div>
                <span className="text-xs font-bold mt-3 block text-white">{user.firstName} (You)</span>
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black/60 text-[9px] px-2.5 py-1 rounded-lg font-bold border border-white/10 backdrop-blur-md flex items-center gap-1.5">
              {!micActive && <MicOff className="w-3 h-3 text-red-400" />}
              {user.firstName} (You)
            </span>
          </div>
        </div>

        {/* Live Speech Captions Bar */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-h-[50px] flex items-center justify-center text-center mb-3">
          <p className="text-xs text-white font-semibold">
            <span className="text-blue-400 font-extrabold mr-1">Instructor Ada:</span> 
            "{transcripts[transcripts.length - 1].text}"
          </p>
        </div>

        {/* Reaction Controls & Toolbar */}
        <div className="flex justify-between items-center border-t border-white/10 pt-3">
          {/* Reaction Bar */}
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => sendReaction('👍')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition">👍</button>
            <button type="button" onClick={() => sendReaction('👏')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition">👏</button>
            <button type="button" onClick={() => sendReaction('🔥')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition">🔥</button>
            <button type="button" onClick={() => sendReaction('❤️')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition">❤️</button>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMicActive(!micActive)}
              className={`p-3 rounded-xl border transition ${
                micActive ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}
            >
              {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`p-3 rounded-xl border transition ${
                cameraActive ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}
            >
              {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3 rounded-xl border transition ${
                isScreenSharing ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveSidebar(activeSidebar === 'transcript' ? null : 'transcript')}
              className={`p-3 rounded-xl border transition ${
                activeSidebar === 'transcript' ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
              }`}
              title="Lecture Transcripts"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveSidebar(activeSidebar === 'chat' ? null : 'chat')}
              className={`p-3 rounded-xl border transition ${
                activeSidebar === 'chat' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
              }`}
              title="Lecture Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={onLeave}
              className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-1.5 ml-2"
            >
              <PhoneOff className="w-4 h-4" /> Leave Call
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: Chat / People / Transcripts */}
      {activeSidebar && (
        <div className="w-full lg:w-80 bg-[#0F172A] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-auto lg:h-full z-20">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              {activeSidebar === 'chat' && <><MessageSquare className="w-4 h-4 text-blue-400" /> Class Chat</>}
              {activeSidebar === 'people' && <><Users className="w-4 h-4 text-blue-400" /> Call Attendees</>}
              {activeSidebar === 'transcript' && <><FileText className="w-4 h-4 text-purple-400" /> Live Transcript</>}
            </h4>
            <button onClick={() => setActiveSidebar(null)} className="text-xs text-gray-400 hover:text-white">Close</button>
          </div>

          {/* TRANSCRIPT SIDEBAR TAB */}
          {activeSidebar === 'transcript' && (
            <div className="flex-1 p-4 space-y-4 flex flex-col justify-between overflow-y-auto">
              {rollCallWarning && !hasMarkedRollCall && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>You must click <strong>Roll Call</strong> ticket to download post-class transcripts.</span>
                </div>
              )}

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {transcripts.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-300">{t.speaker}</span>
                      <span className="text-[9px] text-gray-400 font-mono">{t.time}</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-relaxed">{t.text}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={downloadTranscript}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  hasMarkedRollCall
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                {hasMarkedRollCall ? 'Download Full Transcript (.txt)' : 'Roll Call Required to Download'}
              </button>
            </div>
          )}

          {/* CHAT TAB */}
          {activeSidebar === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
              <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-1">
                {chatMessages.map((m, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-bold text-blue-300">{m.sender}</span>
                      <span className="text-gray-500 font-mono">{m.time}</span>
                    </div>
                    <p className="text-xs text-gray-200 bg-white/5 p-2.5 rounded-xl border border-white/10">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
                <button type="submit" className="p-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
