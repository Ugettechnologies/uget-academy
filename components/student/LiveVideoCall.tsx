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
  PlayCircle
} from 'lucide-react';

interface LiveVideoCallProps {
  courseTitle: string;
  onLeave: () => void;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function LiveVideoCall({ courseTitle, onLeave, user }: LiveVideoCallProps) {
  const [micActive, setMicActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<'chat' | 'people' | null>(null);
  
  // Real-time transcription captions
  const [transcripts, setTranscripts] = useState<Array<{ speaker: string; text: string; time: string }>>([
    { speaker: 'Instructor Ada', text: 'Welcome cohort! Today we are learning how to build highly responsive, dark-themed applications.', time: '10:00' },
  ]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  
  // Chat messages
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Instructor Ada', text: 'Please ensure you have Node.js and SQLite running locally.', time: '10:01' },
    { sender: 'Grace Hopper', text: 'Got it, compilation runs clean on my branch!', time: '10:02' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Other call participants
  const [participants] = useState([
    { name: 'Instructor Ada', role: 'Instructor', active: true, initial: 'A', mic: true, cam: true },
    { name: 'Grace Hopper', role: 'Student', active: false, initial: 'G', mic: true, cam: false },
    { name: 'Alan Turing', role: 'Student', active: false, initial: 'T', mic: false, cam: true },
    { name: 'Margaret Hamilton', role: 'Student', active: false, initial: 'H', mic: true, cam: true },
  ]);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any | null>(null);

  // 1. Manage Webcam stream
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unavailable:', err.message);
          setCameraActive(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // 2. Manage Web Speech API for voice-to-text transcription
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setTranscripts((prev) => [
            ...prev,
            { speaker: `${user.firstName} (You)`, text: finalTranscript, time: nowStr }
          ]);
          setCurrentTranscription('');
        } else {
          setCurrentTranscription(interimTranscript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err.error);
        if (err.error === 'not-allowed') {
          setMicActive(false);
        }
      };

      recognition.onend = () => {
        // Automatically restart if mic is still active
        if (micActive) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [user.firstName]);

  // Handle Speech Recognition Toggle
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (micActive) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else {
      try {
        recognitionRef.current.stop();
        setCurrentTranscription('');
      } catch (e) {}
    }
  }, [micActive]);

  // 3. Simulate Instructor Speech captions and messages to keep page dynamic
  useEffect(() => {
    const lectureDialogues = [
      "Now, let's explore how CSS variables allow us to swap layout color presets cleanly.",
      "Google Meet utilizes WebRTC coordinates to establish direct audio-video peer connections.",
      "If we toggle screen sharing, the stream shifts to a secondary canvas window.",
      "I have uploaded the new React exercises. Make sure to download modules in the materials directory.",
      "Are there any questions about how the speech-to-text recognition API records audio formats?",
      "Perfect. We will now deploy the build server to staging and run tests."
    ];

    let dialogueIdx = 0;
    const interval = setInterval(() => {
      if (dialogueIdx >= lectureDialogues.length) dialogueIdx = 0;
      
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dialogue = lectureDialogues[dialogueIdx++];
      
      // Add simulated instructor transcription caption
      setTranscripts((prev) => [
        ...prev,
        { speaker: 'Instructor Ada', text: dialogue, time: nowStr }
      ]);

      // Randomly post to chat as well
      if (Math.random() > 0.5) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'Instructor Ada', text: `Lecture note: ${dialogue}`, time: nowStr }
        ]);
      }
    }, 15000); // simulated lecture updates every 15s

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="flex flex-col lg:flex-row bg-[#0D0B14] border border-border-divider rounded-3xl overflow-hidden h-[600px] w-full text-text-primary shadow-2xl relative">
      
      {/* LEFT: Main Meeting View */}
      <div className="flex-1 flex flex-col justify-between p-4 bg-deep-violet relative overflow-hidden">
        
        {/* Meeting Header Info */}
        <div className="flex justify-between items-center z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-border-divider/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-absent animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">{courseTitle} — Live Call</span>
          </div>
          <span className="text-[10px] bg-royal-purple/35 text-accent-purple px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-royal-purple/20">
            Cohort 1
          </span>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3 my-4 items-center justify-center min-h-[300px]">
          
          {/* Box 1: Instructor Feed or Slide Presentation */}
          <div className="bg-surface-card border border-border-divider rounded-2xl h-full flex flex-col items-center justify-center relative overflow-hidden group shadow-lg">
            {isScreenSharing ? (
              <div className="w-full h-full flex flex-col justify-between p-4 bg-slate-900 font-mono text-[9px] text-emerald-450 leading-relaxed overflow-hidden">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2 mb-2">
                  <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5 text-royal-gold" /> Screen Sharing: slides.pdf</span>
                  <span>Ada Lovelace</span>
                </div>
                <div className="space-y-1.5 opacity-90">
                  <p className="text-royal-gold">// React Component Example</p>
                  <p>const LiveLecture = &#123; courseId &#125; =&gt; &#123;</p>
                  <p>&nbsp;&nbsp;const [captions, setCaptions] = useState([]);</p>
                  <p>&nbsp;&nbsp;useEffect(() =&gt; &#123;</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;const speech = new SpeechRecognition();</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;speech.start();</p>
                  <p>&nbsp;&nbsp;&#125;, []);</p>
                  <p>&nbsp;&nbsp;return &lt;Meet feeds=&#123;captions&#125; /&gt;</p>
                  <p>&#125;</p>
                </div>
                <span className="text-[8px] bg-royal-gold/15 text-royal-gold px-2 py-0.5 rounded w-fit self-end font-bold border border-royal-gold/25 mt-2">
                  Presentation view
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-royal-purple/30 text-accent-purple flex items-center justify-center text-xl font-bold border border-royal-purple/20 shadow-md">
                  A
                </div>
                <span className="text-xs font-bold mt-3 block">Instructor Ada</span>
                <span className="text-[9px] text-status-present flex items-center gap-1 mt-1 font-semibold uppercase tracking-wider">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Speaking...
                </span>
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black/60 text-[9px] px-2.5 py-1 rounded-lg font-bold border border-white/5 backdrop-blur-md">
              Instructor Ada
            </span>
          </div>

          {/* Box 2: Student Local Feed */}
          <div className="bg-surface-card border border-border-divider rounded-2xl h-full flex flex-col items-center justify-center relative overflow-hidden group shadow-lg">
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
                <div className="w-16 h-16 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center text-xl font-bold border border-accent-purple/20 shadow-md">
                  {user.firstName[0]}
                </div>
                <span className="text-xs font-bold mt-3 block">{user.firstName} (You)</span>
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black/60 text-[9px] px-2.5 py-1 rounded-lg font-bold border border-white/5 backdrop-blur-md flex items-center gap-1.5">
              {!micActive && <MicOff className="w-3 h-3 text-status-absent" />}
              {user.firstName} (You)
            </span>
          </div>

        </div>

        {/* Live voice-to-text Captions overlay */}
        <div className="bg-black/60 backdrop-blur-md border border-border-divider/50 rounded-2xl p-3 min-h-[55px] max-h-[85px] overflow-y-auto mb-3 flex flex-col justify-end text-center z-10 select-none">
          {currentTranscription ? (
            <p className="text-xs text-text-primary leading-relaxed font-semibold italic">
              <span className="text-accent-purple font-extrabold not-italic mr-1">{user.firstName} (You):</span> 
              "{currentTranscription}..."
            </p>
          ) : transcripts.length > 0 ? (
            <p className="text-xs text-text-primary leading-relaxed font-semibold">
              <span className="text-royal-gold font-extrabold mr-1">
                {transcripts[transcripts.length - 1].speaker}:
              </span>
              "{transcripts[transcripts.length - 1].text}"
            </p>
          ) : (
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-royal-gold" /> Real-time lecture transcription active
            </p>
          )}
        </div>

        {/* Meet Controls footer */}
        <div className="flex justify-center items-center gap-3 py-1.5 z-10">
          <button
            onClick={() => setMicActive(!micActive)}
            className={`p-3 rounded-2xl border transition duration-150 cursor-pointer shadow-md ${
              micActive 
                ? 'bg-royal-purple/20 border-royal-purple text-accent-purple hover:bg-royal-purple/35' 
                : 'bg-status-absent/15 border-status-absent/35 text-status-absent hover:bg-status-absent/25'
            }`}
            title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micActive ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`p-3 rounded-2xl border transition duration-150 cursor-pointer shadow-md ${
              cameraActive 
                ? 'bg-royal-purple/20 border-royal-purple text-accent-purple hover:bg-royal-purple/35' 
                : 'bg-status-absent/15 border-status-absent/35 text-status-absent hover:bg-status-absent/25'
            }`}
            title={cameraActive ? 'Disable Camera' : 'Enable Camera'}
          >
            {cameraActive ? <Video className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-2xl border transition duration-150 cursor-pointer shadow-md ${
              isScreenSharing 
                ? 'bg-royal-purple/35 border-royal-purple text-royal-gold hover:bg-royal-purple/50' 
                : 'bg-surface-card border-border-divider text-text-secondary hover:text-text-primary hover:bg-royal-purple/10'
            }`}
            title="Mock Screen Share"
          >
            <Monitor className="w-4.5 h-4.5" />
          </button>

          <button
            className="p-3 rounded-2xl border border-border-divider bg-surface-card text-text-secondary hover:text-text-primary hover:bg-royal-purple/10 transition duration-150 cursor-pointer shadow-md"
            title="Raise Hand"
          >
            <Hand className="w-4.5 h-4.5" />
          </button>

          <div className="h-6 w-px bg-border-divider mx-1" />

          {/* Toggle Sidebar buttons */}
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'chat' ? null : 'chat')}
            className={`p-3 rounded-2xl border transition duration-150 cursor-pointer relative shadow-md ${
              activeSidebar === 'chat'
                ? 'bg-royal-purple/20 border-royal-purple text-accent-purple'
                : 'bg-surface-card border-border-divider text-text-secondary hover:text-text-primary hover:bg-royal-purple/10'
            }`}
            title="Meeting Chat"
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-status-excused" />
          </button>

          <button
            onClick={() => setActiveSidebar(activeSidebar === 'people' ? null : 'people')}
            className={`p-3 rounded-2xl border transition duration-150 cursor-pointer shadow-md ${
              activeSidebar === 'people'
                ? 'bg-royal-purple/20 border-royal-purple text-accent-purple'
                : 'bg-surface-card border-border-divider text-text-secondary hover:text-text-primary hover:bg-royal-purple/10'
            }`}
            title="Show Participants"
          >
            <Users className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={onLeave}
            className="p-3 rounded-2xl bg-status-absent hover:bg-status-absent/90 text-white transition duration-150 cursor-pointer shadow-md flex items-center gap-1 px-4 ml-2"
            title="Leave Meeting"
          >
            <PhoneOff className="w-4.5 h-4.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wide hidden sm:inline">Leave</span>
          </button>
        </div>

      </div>

      {/* RIGHT: Meeting Sidebar (Chat or Participants) */}
      {activeSidebar && (
        <div className="w-full lg:w-[280px] bg-surface-card border-t lg:border-t-0 lg:border-l border-border-divider flex flex-col h-[300px] lg:h-full z-20 animate-slide-in">
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border-divider flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              {activeSidebar === 'chat' ? (
                <>
                  <MessageSquare className="w-4 h-4 text-accent-purple" />
                  <span>Class Chat</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 text-accent-purple" />
                  <span>Call Members ({participants.length + 1})</span>
                </>
              )}
            </h4>
            <button 
              onClick={() => setActiveSidebar(null)}
              className="text-[10px] text-text-secondary hover:text-text-primary font-bold cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Chat Tab Panel */}
          {activeSidebar === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-grow p-4 space-y-3.5 overflow-y-auto max-h-[350px] scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-accent-purple">{msg.sender}</span>
                      <span className="text-[8px] text-text-secondary">{msg.time}</span>
                    </div>
                    <p className="text-[11px] text-text-primary leading-relaxed bg-[#150E27]/40 border border-border-divider/30 p-2.5 rounded-2xl">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-border-divider flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-xl border border-border-divider bg-deep-violet px-3 py-2 text-[11px] focus:outline-none focus:border-royal-purple"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-royal-purple hover:bg-royal-purple/95 text-white flex-shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Participants Tab Panel */}
          {activeSidebar === 'people' && (
            <div className="flex-grow p-4 space-y-3.5 overflow-y-auto scrollbar-thin">
              {/* Local user first */}
              <div className="flex items-center justify-between border-b border-border-divider pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-royal-purple/20 text-accent-purple flex items-center justify-center text-xs font-bold">
                    {user.firstName[0]}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold block">{user.firstName} (You)</span>
                    <span className="text-[8px] text-text-secondary uppercase font-bold tracking-wider">Student</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {micActive ? <Mic className="w-3.5 h-3.5 text-text-secondary" /> : <MicOff className="w-3.5 h-3.5 text-status-absent" />}
                  {cameraActive ? <Video className="w-3.5 h-3.5 text-text-secondary" /> : <VideoOff className="w-3.5 h-3.5 text-status-absent" />}
                </div>
              </div>

              {/* Other members */}
              {participants.map((person, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-card border border-border-divider text-text-secondary flex items-center justify-center text-xs font-bold uppercase">
                      {person.initial}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">{person.name}</span>
                      <span className="text-[8px] text-text-secondary uppercase font-bold tracking-wider">{person.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {person.mic ? <Mic className="w-3.5 h-3.5 text-text-secondary" /> : <MicOff className="w-3.5 h-3.5 text-status-absent" />}
                    {person.cam ? <Video className="w-3.5 h-3.5 text-text-secondary" /> : <VideoOff className="w-3.5 h-3.5 text-status-absent" />}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
