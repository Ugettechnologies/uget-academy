'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Pin, 
  ThumbsUp, 
  Send, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  User,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface Thread {
  id: string;
  courseId: string | null;
  title: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
  replies: Array<{
    id: string;
    content: string;
    isVerifiedAnswer: boolean;
    createdAt: string;
    author: {
      firstName: string;
      lastName: string;
      role: string;
    };
    upvotes: any[];
  }>;
  upvotes: any[];
  course?: {
    title: string;
  };
}

interface QAItem {
  id: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  course: {
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
}

export default function StudentForumPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<'lounge' | 'course' | 'qa'>('lounge');

  // Thread detail overlay
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Create Thread states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [submittingThread, setSubmittingThread] = useState(false);

  // Direct QA states
  const [qaCourseId, setQaCourseId] = useState('');
  const [qaQuestion, setQaQuestion] = useState('');
  const [submittingQA, setSubmittingQA] = useState(false);
  const [qaMsg, setQaMsg] = useState('');

  const fetchForumData = async () => {
    setLoading(true);
    try {
      const [threadsRes, coursesRes, qaRes] = await Promise.all([
        fetch('/api/student/forum/threads'),
        fetch('/api/courses'),
        fetch('/api/student/forum/qa'),
      ]);

      if (threadsRes.ok) setThreads(await threadsRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (qaRes.ok) setQaList(await qaRes.json());
    } catch (err) {
      console.error('Failed to load forum logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForumData();
  }, []);

  // Handle create thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setSubmittingThread(true);
    try {
      const res = await fetch('/api/student/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          courseId: newCourseId || null,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setNewCourseId('');
        setShowCreateForm(false);
        await fetchForumData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingThread(false);
    }
  };

  // Handle reply submit
  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyContent) return;

    setSubmittingReply(true);
    try {
      const res = await fetch('/api/student/forum/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread.id,
          content: replyContent,
        }),
      });

      if (res.ok) {
        setReplyContent('');
        // Refresh detail page thread view
        const refreshedThreadsRes = await fetch('/api/student/forum/threads');
        if (refreshedThreadsRes.ok) {
          const freshThreads = await refreshedThreadsRes.json();
          setThreads(freshThreads);
          const updated = freshThreads.find((t: Thread) => t.id === selectedThread.id);
          if (updated) setSelectedThread(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Toggle upvote
  const handleToggleUpvote = async (threadId?: string, replyId?: string) => {
    try {
      const res = await fetch('/api/student/forum/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, replyId }),
      });

      if (res.ok) {
        // Refresh threads list
        const refreshedThreadsRes = await fetch('/api/student/forum/threads');
        if (refreshedThreadsRes.ok) {
          const freshThreads = await refreshedThreadsRes.json();
          setThreads(freshThreads);
          if (selectedThread) {
            const updated = freshThreads.find((t: Thread) => t.id === selectedThread.id);
            if (updated) setSelectedThread(updated);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit direct QA question
  const handleSubmitQA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaCourseId || !qaQuestion) return;

    setSubmittingQA(true);
    setQaMsg('');
    try {
      const res = await fetch('/api/student/forum/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: qaCourseId, question: qaQuestion }),
      });

      if (res.ok) {
        setQaQuestion('');
        setQaCourseId('');
        setQaMsg('Your question has been sent to the instructor.');
        // Refresh QA list
        const qaRes = await fetch('/api/student/forum/qa');
        if (qaRes.ok) setQaList(await qaRes.json());
      } else {
        setQaMsg('Failed to send question.');
      }
    } catch (err) {
      setQaMsg('Network error.');
    } finally {
      setSubmittingQA(false);
    }
  };

  // Categorize threads
  const loungeThreads = threads.filter(t => t.courseId === null);
  const courseThreads = threads.filter(t => t.courseId !== null);
  const activeThreads = activeSubTab === 'lounge' ? loungeThreads : courseThreads;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-brand-primary" /> Discussion Forums
          </h1>
          <p className="text-slate-500 text-xs mt-1">Interact with your cohort colleagues, review verified guides, or ask instructors direct items.</p>
        </div>

        {activeSubTab !== 'qa' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1E60D5] hover:bg-[#1E60D5]/95 text-white py-3 px-5 rounded-2xl transition shadow-lg shadow-[#1E60D5]/10 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Thread</span>
          </button>
        )}
      </div>

      {/* Main Tab Controls */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm flex items-center gap-2 overflow-x-auto w-fit">
        <button
          onClick={() => { setActiveSubTab('lounge'); setSelectedThread(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
            activeSubTab === 'lounge'
              ? 'bg-[#E0EEFF] text-[#1E60D5]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <span>Academy Lounge</span>
        </button>
        
        <button
          onClick={() => { setActiveSubTab('course'); setSelectedThread(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
            activeSubTab === 'course'
              ? 'bg-[#E0EEFF] text-[#1E60D5]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <span>Course categories</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('qa'); setSelectedThread(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
            activeSubTab === 'qa'
              ? 'bg-[#E0EEFF] text-[#1E60D5]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <span>Direct Q&A box</span>
        </button>
      </div>

      {/* Main Page Content Body */}
      {selectedThread ? (
        /* THREAD DETAILED REVIEW PANEL */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-50 shadow-sm space-y-6">
          <button
            onClick={() => setSelectedThread(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E60D5] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Threads list
          </button>

          {/* Original Post */}
          <div className="space-y-4 border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-[10px]">
                  {selectedThread.author.firstName[0]}{selectedThread.author.lastName[0]}
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-750 block">
                    {selectedThread.author.firstName} {selectedThread.author.lastName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    Posted on {new Date(selectedThread.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedThread.isPinned && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-md">
                    <Pin className="w-3 h-3 fill-current" /> PINNED
                  </span>
                )}
                
                <button
                  onClick={() => handleToggleUpvote(selectedThread.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-500"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{selectedThread.upvotes?.length || 0} Upvotes</span>
                </button>
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-850 tracking-tight leading-snug">{selectedThread.title}</h2>
            <p className="text-sm text-slate-650 leading-relaxed font-normal whitespace-pre-line">{selectedThread.content}</p>
          </div>

          {/* Replies Section */}
          <div className="space-y-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Replies ({selectedThread.replies?.length || 0})</h3>
            
            {selectedThread.replies?.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium p-4 bg-slate-50 rounded-2xl text-center">No replies posted yet. Be the first to answer!</p>
            ) : (
              <div className="space-y-4">
                {/* Verified reply highlighted at the top if exists */}
                {selectedThread.replies
                  .sort((a, b) => (b.isVerifiedAnswer ? 1 : 0) - (a.isVerifiedAnswer ? 1 : 0))
                  .map((reply) => (
                    <div 
                      key={reply.id} 
                      className={`p-5 rounded-3xl border transition ${
                        reply.isVerifiedAnswer 
                          ? 'border-emerald-200 bg-emerald-50/20' 
                          : 'border-slate-100 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800">
                            {reply.author.firstName} {reply.author.lastName}
                          </span>
                          <span className="text-[9px] uppercase font-extrabold tracking-wide text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                            {reply.author.role}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {reply.isVerifiedAnswer && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide border bg-emerald-50 text-emerald-600 border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Answer
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleUpvote(undefined, reply.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-700 transition"
                          >
                            <ThumbsUp className="w-3 h-3" /> {reply.upvotes?.length || 0}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-650 leading-relaxed font-normal whitespace-pre-line">{reply.content}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Submit reply Form */}
            <form onSubmit={handlePostReply} className="space-y-3 pt-3">
              <textarea
                rows={3}
                required
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a helpful response..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none font-semibold text-slate-700"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="bg-[#1E60D5] hover:bg-[#1E60D5]/95 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
                >
                  {submittingReply && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : activeSubTab === 'qa' ? (
        /* TAB: DIRECT QA PANELS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ask form (Left) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-base font-black text-slate-850 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-primary" /> Ask Instructor
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed font-normal">
              Need feedback on practical layout segments or branch structures? Ask course instructors privately.
            </p>

            <form onSubmit={handleSubmitQA} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Course Context</label>
                <select
                  required
                  value={qaCourseId}
                  onChange={(e) => setQaCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none font-semibold text-slate-700"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Private Question</label>
                <textarea
                  rows={4}
                  required
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Ask a technical or guidance question..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-55/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none font-semibold text-slate-700"
                />
              </div>

              {qaMsg && (
                <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">{qaMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingQA}
                className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {submittingQA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <Send className="w-3.5 h-3.5" />
                <span>Submit private question</span>
              </button>
            </form>
          </div>

          {/* QA history list (Right) */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Direct Question Logs</h3>
            
            {qaList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs font-medium border border-slate-50">
                You have not asked any questions yet. Private feedback helps you solve bottlenecks!
              </div>
            ) : (
              <div className="space-y-4">
                {qaList.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-50 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide bg-brand-primary/10 px-2 py-0.5 rounded">
                        {item.course.title}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Your Question</span>
                      <p className="text-xs font-semibold text-slate-805 leading-relaxed">"{item.question}"</p>
                    </div>

                    {item.answer ? (
                      <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl space-y-1">
                        <span className="text-[10px] text-emerald-600 font-extrabold block uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Instructor response
                        </span>
                        <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line italic">"{item.answer}"</p>
                        <span className="text-[9px] text-slate-400 block font-medium mt-1">Answered on {new Date(item.answeredAt!).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50/25 border border-amber-100 rounded-2xl text-[11px] text-amber-700 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 animate-spin text-amber-500" />
                        <span>Awaiting instructor review...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB: STANDARD THREADS LIST (LOUNGE & COURSE CATEGORIES) */
        <div className="grid grid-cols-1 gap-6">
          {showCreateForm && (
            /* Inline create thread form */
            <form onSubmit={handleCreateThread} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-50 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-800 tracking-tight">Create new thread</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thread Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Layout mismatch during CSS re-ordering"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition font-semibold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Forum Category / Course</label>
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none font-semibold text-slate-700"
                  >
                    <option value="">Academy Lounge (General)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your problem context in details so the cohort can help..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none font-semibold text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-500 hover:text-slate-800 text-xs font-bold px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingThread}
                  className="bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-brand-primary/10 disabled:opacity-50"
                >
                  {submittingThread && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Thread</span>
                </button>
              </div>
            </form>
          )}

          {/* List of active threads */}
          {loading ? (
            <div className="py-20 text-center text-slate-450 text-xs font-bold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" /> Loading category threads...
            </div>
          ) : activeThreads.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-400 text-xs font-medium border border-slate-50">
              No threads found in this category. Click "Create Thread" to post a message.
            </div>
          ) : (
            <div className="space-y-4">
              {activeThreads.map((thread) => (
                <div 
                  key={thread.id} 
                  onClick={() => setSelectedThread(thread)}
                  className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 hover:border-brand-primary/30 transition hover:shadow-md cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-6"
                >
                  <div className="space-y-2.5 flex-1 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-[10px]">
                        {thread.author.firstName[0]}{thread.author.lastName[0]}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-750 block">
                          {thread.author.firstName} {thread.author.lastName}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          Published {new Date(thread.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-800 text-base tracking-tight leading-snug flex items-center gap-2">
                        {thread.isPinned && <Pin className="w-4 h-4 text-amber-500 fill-current" />}
                        {thread.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">{thread.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-shrink-0 border-t sm:border-t-0 border-slate-50 pt-4 sm:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400" /> {thread.upvotes?.length || 0}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {thread.replies?.length || 0} replies
                    </span>
                    {thread.replies?.some(r => r.isVerifiedAnswer) && (
                      <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[8px] font-extrabold uppercase">
                        SOLVED
                      </span>
                    )}
                    {thread.course && (
                      <span className="hidden md:inline-flex px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[9px] font-extrabold uppercase">
                        {thread.course.title.substring(0, 15)}...
                      </span>
                    )}
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
