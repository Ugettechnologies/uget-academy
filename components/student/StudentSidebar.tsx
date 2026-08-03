'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Calendar, 
  FileSpreadsheet, 
  GraduationCap, 
  MessageSquare, 
  MessageCircle, 
  Code2, 
  BarChart3, 
  FolderDown, 
  User, 
  ChevronDown,
  ChevronUp,
  FileCheck,
  Award,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface StudentSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string;
    avatarUrl?: string | null;
    username?: string | null;
  };
  onLinkClick?: () => void;
}

export default function StudentSidebar({ user, onLinkClick }: StudentSidebarProps) {
  const pathname = usePathname();

  const [assignmentsExpanded, setAssignmentsExpanded] = useState(pathname.startsWith('/student/assignments'));
  const [examsExpanded, setExamsExpanded] = useState(pathname.startsWith('/student/exams'));

  const isActive = (href: string) => {
    if (href === '/student') {
      return pathname === '/student';
    }
    return pathname === href;
  };

  const isGroupActive = (prefix: string) => {
    return pathname.startsWith(prefix);
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-white/10 flex flex-col h-full relative text-white">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/student" onClick={onLinkClick} className="flex items-center gap-3">
          <Image
            src="/logo-clean.png"
            alt="UGET Academy Logo"
            width={34}
            height={34}
            className="h-8.5 w-auto object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="font-sans font-black tracking-tight text-white text-base leading-tight">
              UGET
            </span>
            <span className="text-[#60A5FA] font-extrabold text-[10px] tracking-widest uppercase leading-none">
              Academy Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Student Profile Avatar & Name Card */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#2563EB] bg-[#1E293B] shrink-0 flex items-center justify-center text-white font-black text-sm">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.firstName} fill className="object-cover" />
          ) : (
            <span>{user.firstName ? user.firstName.charAt(0) : 'S'}{user.lastName ? user.lastName.charAt(0) : ''}</span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-extrabold text-white truncate leading-tight">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[10px] text-gray-400 font-mono truncate">
            {user.username || user.email || 'Student'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Dashboard */}
        <Link
          href="/student"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </Link>

        {/* Timetable & Attendance */}
        <Link
          href="/student/attendance"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student/attendance')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Class Schedule</span>
        </Link>

        {/* Assignments Accordion */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setAssignmentsExpanded(!assignmentsExpanded)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              isGroupActive('/student/assignments')
                ? 'text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#60A5FA]" />
              <span>Assignments</span>
            </div>
            {assignmentsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {assignmentsExpanded && (
            <div className="pl-8 pr-2 py-1 space-y-1 border-l border-white/10 ml-5">
              <Link
                href="/student/assignments"
                onClick={onLinkClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                  isActive('/student/assignments')
                    ? 'bg-blue-600/30 text-blue-300 font-bold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>• Deliverables</span>
              </Link>
              <Link
                href="/student/assignments/submit"
                onClick={onLinkClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                  isActive('/student/assignments/submit')
                    ? 'bg-blue-600/30 text-blue-300 font-bold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>• Submit Entry</span>
              </Link>
            </div>
          )}
        </div>

        {/* Exams Accordion */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setExamsExpanded(!examsExpanded)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              isGroupActive('/student/exams')
                ? 'text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 shrink-0 text-purple-400" />
              <span>Tests & Exams</span>
            </div>
            {examsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {examsExpanded && (
            <div className="pl-8 pr-2 py-1 space-y-1 border-l border-white/10 ml-5">
              <Link
                href="/student/exams"
                onClick={onLinkClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                  isActive('/student/exams')
                    ? 'bg-purple-600/30 text-purple-300 font-bold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileCheck className="w-3 h-3" />
                <span>3-Section Exams</span>
              </Link>
              <Link
                href="/student/exams/quiz"
                onClick={onLinkClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                  isActive('/student/exams/quiz')
                    ? 'bg-purple-600/30 text-purple-300 font-bold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Award className="w-3 h-3" />
                <span>CBT Quizzes</span>
              </Link>
            </div>
          )}
        </div>

        {/* Discussions & Q&A Forum */}
        <Link
          href="/student/forum"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student/forum')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>Course Q&A Forum</span>
        </Link>

        {/* Direct Messages & Chat */}
        <Link
          href="/student/chat"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student/chat')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>Classmate & Instructor Chat</span>
        </Link>

        {/* Code Playground */}
        <Link
          href="/student/playground"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student/playground')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Code Playground</span>
        </Link>

        {/* Grades & Scoreboard */}
        <Link
          href="/student/grades"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student/grades')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Grades & Scoreboard</span>
        </Link>

        {/* Materials */}
        <Link
          href="/student/materials"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student/materials')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FolderDown className="w-4 h-4 shrink-0" />
          <span>Course Materials</span>
        </Link>

        {/* Support Center */}
        <Link
          href="/student/support"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student/support')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Support Center</span>
        </Link>

        {/* Profile & Settings (Logout located inside here) */}
        <Link
          href="/student/profile"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/student/profile')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Profile & Settings</span>
        </Link>
      </nav>

      {/* Footer Notice */}
      <div className="p-3 border-t border-white/10 text-center">
        <span className="text-[10px] text-gray-500 font-mono">
          UGET Academy v2.5 • Student Portal
        </span>
      </div>
    </aside>
  );
}
