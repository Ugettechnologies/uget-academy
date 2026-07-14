'use client';

import React, { useState, useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import LiveVideoCall from './LiveVideoCall';
import { 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  AlertCircle, 
  Bookmark, 
  FileText, 
  Award, 
  FileSpreadsheet, 
  Download, 
  ExternalLink, 
  Save, 
  Send,
  HelpCircle,
  Trophy,
  Loader2
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  order: number;
  muxPlaybackId: string | null;
  content?: string | null;
  resources?: any; // JSON array of { name, url }
}

interface CourseWatchViewProps {
  course: {
    id: string;
    title: string;
    description: string;
  };
  lessons: Lesson[];
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function CourseWatchView({ course, lessons, user }: CourseWatchViewProps) {
  const [inLiveCall, setInLiveCall] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    lessons.length > 0 ? lessons[0] : null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'quizzes' | 'certificate'>('details');

  // Bookmarks & Notes state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState('');
  const noteSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Quizzes & Assignments state
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [submittingAssignId, setSubmittingAssignId] = useState<string | null>(null);
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Certificate state
  const [certificate, setCertificate] = useState<any | null>(null);
  const [claimingCert, setClaimingCert] = useState(false);
  const [certMessage, setCertMessage] = useState('');

  // Reference to track active lesson in effect without re-running interval
  const activeLessonRef = useRef<Lesson | null>(activeLesson);
  useEffect(() => {
    activeLessonRef.current = activeLesson;
  }, [activeLesson]);

  // Fetch watch progress (attendance logs)
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/student/stats');
      if (response.ok) {
        const data = await response.json();
        const map: Record<string, number> = {};
        data.attendanceLogs?.forEach((log: any) => {
          map[log.lessonId] = log.durationSeconds;
        });
        setAttendanceMap(map);
      }
    } catch (err) {
      console.error('Failed to load student progress:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTasksAndCert();
  }, []);

  // Fetch assignments, quizzes, and certificates
  const fetchTasksAndCert = async () => {
    setLoadingTasks(true);
    try {
      const [assignRes, quizRes, certRes] = await Promise.all([
        fetch('/api/student/assignments'),
        fetch('/api/student/quizzes'),
        fetch('/api/student/certificates'),
      ]);

      if (assignRes.ok) setAssignments(await assignRes.json());
      if (quizRes.ok) setQuizzes(await quizRes.json());
      if (certRes.ok) {
        const certs = await certRes.json();
        const activeCert = certs.find((c: any) => c.courseId === course.id);
        if (activeCert) setCertificate(activeCert);
      }
    } catch (err) {
      console.error('Failed to fetch tasks/cert:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Ping watch progress endpoint while playing
  useEffect(() => {
    if (!isPlaying || !activeLesson) return;

    const interval = setInterval(async () => {
      const currentLesson = activeLessonRef.current;
      if (!currentLesson) return;

      try {
        const response = await fetch(`/api/lessons/${currentLesson.id}/attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ increment: 10 }),
        });

        if (response.ok) {
          const data = await response.json();
          setAttendanceMap((prev) => ({
            ...prev,
            [currentLesson.id]: data.durationSeconds,
          }));
        }
      } catch (err) {
        console.error('Failed to record watch attendance:', err);
      }
    }, 10000); // Ping every 10 seconds

    return () => clearInterval(interval);
  }, [isPlaying, activeLesson]);

  // Load notes & bookmarks when active lesson changes
  useEffect(() => {
    if (!activeLesson) return;

    // Reset bookmark/note state
    setIsBookmarked(false);
    setNoteContent('');
    setNoteMessage('');

    const loadLessonDetails = async () => {
      try {
        const [bookmarkRes, noteRes] = await Promise.all([
          fetch(`/api/student/bookmarks?lessonId=${activeLesson.id}`),
          fetch(`/api/student/notes?lessonId=${activeLesson.id}`),
        ]);

        if (bookmarkRes.ok) {
          const data = await bookmarkRes.json();
          setIsBookmarked(data.bookmarked);
        }
        if (noteRes.ok) {
          const data = await noteRes.json();
          setNoteContent(data.content || '');
        }
      } catch (err) {
        console.error('Failed to load lesson bookmark/note:', err);
      }
    };

    loadLessonDetails();
  }, [activeLesson]);

  // Handle note change with auto-save
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    setNoteMessage('Saving draft...');

    if (noteSaveTimeout.current) {
      clearTimeout(noteSaveTimeout.current);
    }

    noteSaveTimeout.current = setTimeout(async () => {
      if (!activeLesson) return;
      setSavingNote(true);
      try {
        const res = await fetch('/api/student/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: activeLesson.id, content: val }),
        });
        if (res.ok) {
          setNoteMessage('All changes saved to cloud.');
        } else {
          setNoteMessage('Failed to save. Will retry.');
        }
      } catch (err) {
        setNoteMessage('Network error. Saving failed.');
      } finally {
        setSavingNote(false);
      }
    }, 1500); // Debounce save by 1.5s
  };

  // Toggle bookmark handler
  const handleToggleBookmark = async () => {
    if (!activeLesson) return;
    try {
      const res = await fetch('/api/student/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: activeLesson.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit assignment submission handler
  const handleSubmitAssignment = async (e: React.FormEvent, assignmentId: string) => {
    e.preventDefault();
    if (!githubLink) return;

    setSubmittingAssignId(assignmentId);
    try {
      const res = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          type: 'LINK',
          content: `${githubLink} | Demo: ${demoLink || 'None'} | Notes: ${submissionNotes || 'None'}`,
        }),
      });

      if (res.ok) {
        setGithubLink('');
        setDemoLink('');
        setSubmissionNotes('');
        await fetchTasksAndCert(); // Refresh tasks
      } else {
        alert('Failed to submit assignment deliverables.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAssignId(null);
    }
  };

  // Submit quiz handler
  const handleSubmitQuiz = async (quizId: string, questions: any[]) => {
    const answersArray: number[] = [];
    for (let i = 0; i < questions.length; i++) {
      if (quizAnswers[i] === undefined) {
        alert('Please answer all questions before submitting.');
        return;
      }
      answersArray.push(quizAnswers[i]);
    }

    setSubmittingQuiz(true);
    try {
      const res = await fetch('/api/student/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, answers: answersArray }),
      });

      if (res.ok) {
        setQuizAnswers({});
        setActiveQuizId(null);
        await fetchTasksAndCert();
      } else {
        alert('Failed to record quiz responses.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Claim Certificate handler
  const handleClaimCertificate = async () => {
    setClaimingCert(true);
    setCertMessage('');
    try {
      const res = await fetch('/api/student/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setCertificate(data.certificate);
        setCertMessage('Certificate generated successfully!');
      } else {
        setCertMessage(data.error || 'Failed to claim certificate.');
      }
    } catch (err) {
      setCertMessage('Network error claiming certificate.');
    } finally {
      setClaimingCert(false);
    }
  };

  const formatDuration = (seconds: number = 0) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // Calculate if course is complete (all lessons >= 60s watched)
  const isCourseComplete = lessons.every((l) => (attendanceMap[l.id] || 0) >= 60);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-text-primary">
      
      {/* Left Column: Video Player & Tabs */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Live Call Notice Banner */}
        {!inLiveCall && (
          <div className="bg-gradient-to-r from-royal-purple/35 to-accent-purple/20 border border-border-divider/50 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-status-absent text-white animate-pulse">
                ● LIVE LECTURE AVAILABLE
              </span>
              <h4 className="text-sm font-bold text-text-primary">Interactive video session is currently in progress</h4>
              <p className="text-[11px] text-text-secondary">Join to interact live with the instructor and get real-time voice-to-text transcriptions.</p>
            </div>
            <button
              onClick={() => setInLiveCall(true)}
              className="bg-royal-gold hover:bg-royal-gold/90 text-deep-violet font-bold text-xs py-3 px-5 rounded-2xl transition shadow-lg shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <PlayCircle className="w-4.5 h-4.5" />
              Join Live Video Call
            </button>
          </div>
        )}

        {/* Video Player or Live Video Call component */}
        {inLiveCall ? (
          <LiveVideoCall 
            courseTitle={course.title}
            onLeave={() => setInLiveCall(false)}
            user={user}
          />
        ) : (
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video flex items-center justify-center text-white relative group">
            {activeLesson?.muxPlaybackId ? (
              <MuxPlayer
                playbackId={activeLesson.muxPlaybackId}
                metadataVideoTitle={activeLesson.title}
                metadataViewerUserId={course.id}
                primaryColor="#6D28D9"
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            ) : activeLesson?.content ? (
              <div className="w-full h-full p-6 sm:p-8 overflow-y-auto bg-surface-card flex flex-col justify-start text-left select-text scrollbar-thin">
                <div className="border-b border-border-divider pb-4 mb-4">
                  <span className="text-[9px] bg-royal-gold/15 text-royal-gold px-2.5 py-0.5 rounded-full font-extrabold uppercase border border-royal-gold/25">
                    Written Lesson Module
                  </span>
                  <h3 className="text-base sm:text-lg font-black mt-2 text-text-primary">{activeLesson.title}</h3>
                </div>
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {activeLesson.content}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-brand-accent animate-pulse">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white">
                    {lessons.length === 0 ? 'No Lessons Available' : 'Video is being prepared'}
                  </h4>
                  <p className="text-slate-400 text-xs max-w-xs mx-auto">
                    {lessons.length === 0
                      ? 'This course does not have any lessons uploaded yet.'
                      : activeLesson
                      ? 'Mux is still encoding the lesson file. Please reload the page in a moment.'
                      : 'Select a lesson from the syllabus sidebar.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Sub-bar info */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-brand-primary/10 text-brand-primary">
              <PlayCircle className="w-3.5 h-3.5" />
              Now Playing
            </span>
            <span className="text-xs text-slate-550 font-bold">
              Lesson {activeLesson?.order}: {activeLesson?.title}
            </span>
          </div>
          {activeLesson && (
            <span className="text-xs text-slate-450 flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Time Spent: <strong className="text-brand-primary">{formatDuration(attendanceMap[activeLesson.id])}</strong>
            </span>
          )}
        </div>

        {/* Tabs Bar */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'details'
                ? 'bg-[#E0EEFF] text-[#1E60D5]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span>Details & Resources</span>
          </button>
          
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'notes'
                ? 'bg-[#E0EEFF] text-[#1E60D5]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-4.5 h-4.5" />
            <span>Notes & Bookmarks</span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'quizzes'
                ? 'bg-[#E0EEFF] text-[#1E60D5]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
            <span>Quizzes & Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-[#E0EEFF] text-[#1E60D5]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Award className="w-4.5 h-4.5" />
            <span>Certificate</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-50 shadow-sm min-h-[250px]">
          
          {/* TAB: Details & Resources */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Lesson Guidelines</h3>
                <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">
                  {activeLesson?.content || 'No description guidelines details loaded for this lesson module.'}
                </p>
              </div>

              {activeLesson?.resources && Array.isArray(activeLesson.resources) && activeLesson.resources.length > 0 && (
                <div className="border-t border-slate-50 pt-5 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Downloadable Resources</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeLesson.resources.map((res: any, idx: number) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs hover:bg-[#E0EEFF]/40 group transition"
                      >
                        <div className="flex items-center gap-2 truncate pr-4">
                          <span className="text-brand-primary">📄</span>
                          <span className="font-semibold text-slate-700 truncate group-hover:text-brand-primary transition">
                            {res.name}
                          </span>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Notes & Bookmarks */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Lesson Notes Pad</h3>
                  <p className="text-slate-450 text-xs mt-0.5">Write notes as you listen. It will auto-save to cloud storage.</p>
                </div>

                <button
                  onClick={handleToggleBookmark}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition duration-150 ${
                    isBookmarked
                      ? 'bg-amber-50 border-amber-205 text-amber-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Module'}</span>
                </button>
              </div>

              <div className="space-y-2 relative">
                <textarea
                  rows={8}
                  value={noteContent}
                  onChange={handleNoteChange}
                  placeholder="Type your notes here... (e.g. key instructions, terminal codes, branching layouts)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none font-semibold text-slate-750"
                />
                
                <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    {savingNote && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />}
                    {noteMessage}
                  </span>
                  <span>Character count: {noteContent.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Quizzes & Assignments */}
          {activeTab === 'quizzes' && (
            <div className="space-y-8">
              
              {/* QUIZZES section */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Theoretical Assessments</h3>
                
                {quizzes.length === 0 ? (
                  <p className="text-slate-400 text-xs font-medium bg-slate-55/40 p-4 rounded-xl text-center">No quizzes configured for this course syllabus.</p>
                ) : (
                  <div className="space-y-4">
                    {quizzes.map((quiz) => {
                      const attempt = quiz.attempts[0];
                      const isQuizActive = activeQuizId === quiz.id;

                      return (
                        <div key={quiz.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-5 sm:p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#1E60D5] shadow-sm">
                                <HelpCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-800">{quiz.title}</h4>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Theory evaluation • {quiz.questions?.length || 0} Questions</span>
                              </div>
                            </div>

                            <div>
                              {attempt ? (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                  attempt.passed
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                                    : 'bg-red-50 text-red-600 border-red-500/20'
                                }`}>
                                  {attempt.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                  <span>Score: {attempt.score}% ({attempt.passed ? 'PASSED' : 'FAILED'})</span>
                                </span>
                              ) : (
                                !isQuizActive && (
                                  <button
                                    onClick={() => setActiveQuizId(quiz.id)}
                                    className="bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-md shadow-[#1E60D5]/5"
                                  >
                                    Take Quiz
                                  </button>
                                )
                              )}
                            </div>
                          </div>

                          {/* Render Quiz Quiz Player */}
                          {isQuizActive && (
                            <div className="space-y-5 py-2 animate-fade-in text-slate-750">
                              {quiz.questions.map((q: any, qIdx: number) => (
                                <div key={qIdx} className="space-y-2">
                                  <p className="text-xs font-bold text-slate-850">
                                    Q{qIdx + 1}: {q.question}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {q.options.map((opt: string, optIdx: number) => {
                                      const isSelected = quizAnswers[qIdx] === optIdx;
                                      return (
                                        <button
                                          key={optIdx}
                                          type="button"
                                          onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                          className={`p-3 rounded-2xl text-xs font-semibold text-left border transition ${
                                            isSelected
                                              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                          }`}
                                        >
                                          <span className="inline-flex w-5 h-5 rounded-full bg-slate-100 text-slate-500 items-center justify-center text-[10px] font-bold mr-2">
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}

                              <div className="flex justify-end gap-3 pt-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveQuizId(null);
                                    setQuizAnswers({});
                                  }}
                                  className="text-slate-500 hover:text-slate-800 text-xs font-bold px-4 py-2"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={submittingQuiz}
                                  onClick={() => handleSubmitQuiz(quiz.id, quiz.questions)}
                                  className="bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-brand-primary/10 disabled:opacity-50"
                                >
                                  {submittingQuiz && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                  Submit Test Answers
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ASSIGNMENTS section */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Practical Assignments</h3>
                
                {assignments.length === 0 ? (
                  <p className="text-slate-400 text-xs font-medium bg-slate-55/40 p-4 rounded-xl text-center">No assignments released yet.</p>
                ) : (
                  <div className="space-y-5">
                    {assignments.map((item) => {
                      const submission = item.submissions[0];
                      const isSubmitting = submittingAssignId === item.id;
                      const isPastDue = new Date(item.dueDate) < new Date();
                      
                      return (
                        <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-5 sm:p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#1E60D5] shadow-sm">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                                <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider mt-0.5">
                                  Due: {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            <div>
                              {submission ? (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                  submission.grade !== null
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                                    : 'bg-amber-50 text-amber-600 border-amber-500/20'
                                }`}>
                                  {submission.grade !== null ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                  <span>{submission.grade !== null ? `Graded: ${submission.grade}/100` : 'Pending Evaluation'}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border bg-blue-50 text-blue-600 border-blue-500/20">
                                  Open submission
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.description}</p>

                          {/* Submit form or submitted details */}
                          {(!submission || (submission && item.allowResubmission)) ? (
                            <form onSubmit={(e) => handleSubmitAssignment(e, item.id)} className="space-y-3.5 pt-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GitHub Repository URL</label>
                                  <input
                                    type="url"
                                    required
                                    placeholder="https://github.com/username/project"
                                    value={githubLink}
                                    onChange={(e) => setGithubLink(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-[#1E60D5] focus:outline-none transition font-semibold text-slate-700"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Figma / Demo URL (Optional)</label>
                                  <input
                                    type="url"
                                    placeholder="https://vercel-deployment-url..."
                                    value={demoLink}
                                    onChange={(e) => setDemoLink(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-[#1E60D5] focus:outline-none transition font-semibold text-slate-700"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes (Optional)</label>
                                <textarea
                                  rows={2}
                                  placeholder="Write notes highlighting design decisions..."
                                  value={submissionNotes}
                                  onChange={(e) => setSubmissionNotes(e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-[#1E60D5] focus:outline-none transition resize-none font-semibold text-slate-700"
                                />
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="submit"
                                  disabled={isSubmitting || !githubLink || (isPastDue && !item.allowResubmission)}
                                  className="bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-brand-primary/10 disabled:opacity-50"
                                >
                                  {isSubmitting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Send className="w-3.5 h-3.5" />
                                  )}
                                  <span>{submission ? 'Re-submit deliverables' : 'Submit deliverables'}</span>
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Submission URL</span>
                                <a href={submission.content.split(' | ')[0]} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline font-semibold flex items-center gap-1 mt-0.5">
                                  {submission.content.split(' | ')[0]} <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              {submission.feedback && (
                                <div className="border-t border-slate-50 pt-2.5">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Instructor feedback</span>
                                  <p className="text-slate-600 leading-relaxed mt-0.5 italic">"{submission.feedback}"</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: Certificate */}
          {activeTab === 'certificate' && (
            <div className="space-y-6 flex flex-col items-center text-center max-w-xl mx-auto py-4">
              <div className="w-16 h-16 bg-[#F0F6FF] text-[#1E60D5] rounded-full flex items-center justify-center shadow-inner">
                <Trophy className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Claim Graduation Certificate</h3>
                <p className="text-slate-550 text-xs leading-relaxed max-w-md mx-auto">
                  Upon finishing all lessons in the course syllabus, you are eligible to claim a cryptographic completion certificate signed by UGET Academy instructors.
                </p>
              </div>

              {/* Status information */}
              <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-xs text-slate-650 space-y-2 text-left">
                <div className="flex justify-between items-center border-b border-slate-150/40 pb-2">
                  <span className="font-semibold text-slate-400">Lessons Completed:</span>
                  <span className="font-bold text-slate-700">
                    {lessons.filter((l) => (attendanceMap[l.id] || 0) >= 60).length} / {lessons.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-400">Academic Status:</span>
                  <span className={`font-bold ${isCourseComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isCourseComplete ? 'Complete (Eligible)' : 'In Progress (Ineligible)'}
                  </span>
                </div>
              </div>

              {certMessage && (
                <div className="p-3 text-xs bg-[#F0F6FF] border border-blue-200 text-[#1E60D5] rounded-2xl flex items-center justify-center gap-1.5 w-full">
                  <AlertCircle className="w-4 h-4" />
                  <span>{certMessage}</span>
                </div>
              )}

              {/* Action Claim button or Certificate mockup */}
              {certificate ? (
                /* Gorgeous SVG Certificate Mockup */
                <div className="w-full space-y-4">
                  <div className="bg-white border-8 border-double border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden font-serif max-w-lg mx-auto bg-[#FCFBF7] text-slate-800 select-none">
                    {/* Seal background effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-primary/5 rounded-full filter blur-xl pointer-events-none" />
                    
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#1E60D5] font-sans">Certificate of Completion</span>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 mt-1 uppercase">UGET Academy</h2>
                    
                    <p className="text-[10px] italic text-slate-500 mt-4">This certifies that</p>
                    <h3 className="text-xl font-bold text-slate-850 mt-1.5 border-b border-slate-200 pb-1 w-fit mx-auto px-4 uppercase font-sans">
                      Grace Hopper
                    </h3>
                    
                    <p className="text-[9px] text-slate-650 max-w-sm mx-auto leading-relaxed mt-4 font-sans">
                      has successfully mastered the complete curriculum, practical assignments, and theoretical examinations required for completion of
                    </p>
                    
                    <h4 className="text-xs font-black text-[#1E60D5] tracking-wide mt-2 uppercase font-sans">
                      {course.title}
                    </h4>

                    <div className="flex justify-between items-end mt-8 text-[8px] font-sans font-bold uppercase tracking-wider text-slate-400">
                      <div className="text-left">
                        <span className="block text-slate-700 font-black">ADA LOVELACE</span>
                        <span>Lead Instructor</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-slate-750 font-mono">{certificate.certificateCode}</span>
                        <span>Verification ID</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 px-6 rounded-2xl transition flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Download className="w-4 h-4" /> Print Certificate
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClaimCertificate}
                  disabled={claimingCert || !isCourseComplete}
                  className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-2xl py-3.5 px-6 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
                >
                  {claimingCert && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Award className="w-4 h-4" />
                  <span>Claim Certificate</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Right Column: Syllabus Sidebar */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between text-white min-h-[500px]">
          <div>
            <h4 className="text-sm font-black tracking-tight text-white mb-5 flex items-center justify-between">
              <span>Course Syllabus</span>
              <span className="text-[10px] font-bold text-brand-accent bg-brand-primary/10 px-2 py-0.5 rounded-lg border border-brand-primary/20">
                {lessons.length} Modules
              </span>
            </h4>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {lessons.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                  No modules uploaded yet.
                </div>
              ) : (
                lessons.map((lesson) => {
                  const watchSeconds = attendanceMap[lesson.id] || 0;
                const isCompleted = watchSeconds >= 60;
                const isActive = activeLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveLesson(lesson);
                    }}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition ${
                      isActive
                        ? 'border-brand-primary bg-brand-primary/15 text-white shadow-lg'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-primary text-white scale-110 shadow-md'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        lesson.order
                      )}
                    </span>
                    <div className="space-y-1 flex-grow">
                      <span className="text-xs font-bold block line-clamp-2 leading-snug">
                        {lesson.title}
                      </span>
                      {watchSeconds > 0 && (
                        <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Progress: {formatDuration(watchSeconds)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
