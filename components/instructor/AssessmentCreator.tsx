'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Save, 
  Check, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  HelpCircle, 
  GraduationCap, 
  Video, 
  FileText,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function AssessmentCreator() {
  const [assessmentType, setAssessmentType] = useState<'ASSIGNMENT' | 'CBT_TEST' | '3_SECTION_EXAM'>('ASSIGNMENT');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState('100');
  const [courseTrack, setCourseTrack] = useState('Cybersecurity & Threat Intelligence');

  // Rich Text Editor contents
  const [instructions, setInstructions] = useState('');
  const [testQuestionsText, setTestQuestionsText] = useState('');
  const [interviewQuestionsText, setInterviewQuestionsText] = useState('');

  const [isSaved, setIsSaved] = useState(false);

  const handleBold = () => {
    setInstructions((prev) => prev + ' **bold text** ');
  };

  const handleItalic = () => {
    setInstructions((prev) => prev + ' *italic text* ');
  };

  const handleBullet = () => {
    setInstructions((prev) => prev + '\n- Item bullet point');
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white animate-fade-in">
      
      {/* Assessment Type Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            Course Track: {courseTrack}
          </span>
          <h2 className="text-xl font-black text-white mt-1">Create New Assessment</h2>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setAssessmentType('ASSIGNMENT')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              assessmentType === 'ASSIGNMENT'
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Assignment
          </button>
          <button
            type="button"
            onClick={() => setAssessmentType('CBT_TEST')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              assessmentType === 'CBT_TEST'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            CBT Test
          </button>
          <button
            type="button"
            onClick={() => setAssessmentType('3_SECTION_EXAM')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              assessmentType === '3_SECTION_EXAM'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            3-Section Exam
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAssessment} className="space-y-6">
        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">Assessment Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Week 4: Threat Intelligence & OWASP Penetration Blueprint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">Due Date & Time</label>
            <input
              type="text"
              required
              placeholder="e.g. Monday Aug 10, 11:59 PM"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        {/* BUILT-IN RICH TEXT EDITOR FOR GENERAL INSTRUCTIONS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-300">General Instructions & Guidelines</label>
            {/* Formatting Bar */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button type="button" onClick={handleBold} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={handleItalic} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={handleBullet} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <textarea
            required
            rows={5}
            placeholder="Type general instructions, guidelines, deliverable format requirements, or reference links for students..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 leading-relaxed font-sans custom-scrollbar"
          />
        </div>

        {/* TEST QUESTIONS DRAFTING EDITOR */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-300 flex items-center justify-between">
            <span>Test / Exam Questions Drafting (Type Questions or Paste Links)</span>
            <span className="text-[10px] text-purple-300 font-mono font-normal">Supports markdown formatting & links</span>
          </label>
          <textarea
            rows={5}
            placeholder="1. What algorithm produces a 256-bit hash digest? (Option A: SHA-256, Option B: MD5)&#10;2. Explain the difference between symmetric and asymmetric cryptography."
            value={testQuestionsText}
            onChange={(e) => setTestQuestionsText(e.target.value)}
            className="w-full bg-[#080B11] border border-white/10 rounded-2xl p-4 text-xs text-emerald-300 placeholder-gray-600 focus:outline-none focus:border-purple-500 leading-relaxed font-mono custom-scrollbar"
          />
        </div>

        {/* SECTION 3 INTERVIEW QUESTIONS DRAFTING (For 3-Section Exams) */}
        {assessmentType === '3_SECTION_EXAM' && (
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2 animate-fade-in">
            <label className="block text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              Section 3: Live Technical Interview Questions & Evaluation Prompts
            </label>
            <textarea
              rows={4}
              placeholder="Enter interview evaluation questions for student oral/practical examination..."
              value={interviewQuestionsText}
              onChange={(e) => setInterviewQuestionsText(e.target.value)}
              className="w-full bg-[#080B11] border border-white/10 rounded-xl p-3 text-xs text-purple-200 placeholder-gray-600 focus:outline-none font-mono"
            />
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Assessment Created & Published to Student Portals!
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-purple-600 hover:from-blue-600 hover:to-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Save className="w-4 h-4" /> Publish Assessment to Students
          </button>
        </div>
      </form>

    </div>
  );
}
