'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  GraduationCap, 
  BarChart3, 
  FolderDown, 
  User, 
  LogOut,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  FileCheck,
  Award,
  ListTodo
} from 'lucide-react';

interface StudentSidebarProps {
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function StudentSidebar({ user }: StudentSidebarProps) {
  const pathname = usePathname();

  // Accordion state tracking, open by default for layout alignment
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(true);
  const [examsExpanded, setExamsExpanded] = useState(true);

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
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <Link href="/student" className="flex items-center gap-3">
          <Image
            src="/logo-clean.png"
            alt="UGET Academy Logo"
            width={36}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="font-sans font-bold tracking-tight text-slate-800 text-lg leading-tight">
              UGET
            </span>
            <span className="text-[#3B82F6] font-medium text-xs tracking-wider uppercase leading-none">
              Academy
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {/* Dashboard Link */}
        <Link
          href="/student"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/student')
              ? 'bg-[#E0EEFF] text-[#1E60D5]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${isActive('/student') ? 'text-[#1E60D5]' : 'text-slate-400'}`} />
          <span>Dashboard</span>
        </Link>

        {/* Assignments Accordion */}
        <div className="space-y-1">
          <button
            onClick={() => setAssignmentsExpanded(!assignmentsExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isGroupActive('/student/assignments')
                ? 'text-[#1E60D5]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <FileSpreadsheet className={`w-5 h-5 ${isGroupActive('/student/assignments') ? 'text-[#1E60D5]' : 'text-slate-400'}`} />
              <span>Assignments</span>
            </div>
            {assignmentsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {assignmentsExpanded && (
            <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-slate-50 ml-6">
              <Link
                href="/student/assignments"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive('/student/assignments')
                    ? 'bg-[#E0EEFF]/55 text-[#1E60D5]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span>• View Assignments</span>
              </Link>
              <Link
                href="/student/assignments/submit"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive('/student/assignments/submit')
                    ? 'bg-[#E0EEFF]/55 text-[#1E60D5]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span>• Submit Assignments</span>
              </Link>
            </div>
          )}
        </div>

        {/* Exams Accordion */}
        <div className="space-y-1">
          <button
            onClick={() => setExamsExpanded(!examsExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isGroupActive('/student/exams')
                ? 'text-[#1E60D5]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <GraduationCap className={`w-5 h-5 ${isGroupActive('/student/exams') ? 'text-[#1E60D5]' : 'text-slate-400'}`} />
              <span>Exams</span>
            </div>
            {examsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {examsExpanded && (
            <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-slate-50 ml-6">
              <Link
                href="/student/exams/practicals"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive('/student/exams/practicals')
                    ? 'bg-[#E0EEFF]/55 text-[#1E60D5]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Practicals</span>
              </Link>
              <Link
                href="/student/exams/quiz"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive('/student/exams/quiz')
                    ? 'bg-[#E0EEFF]/55 text-[#1E60D5]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Quiz</span>
              </Link>
            </div>
          )}
        </div>

        {/* Grades Link */}
        <Link
          href="/student/grades"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/student/grades')
              ? 'bg-[#E0EEFF] text-[#1E60D5]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${isActive('/student/grades') ? 'text-[#1E60D5]' : 'text-slate-400'}`} />
          <span>Grades</span>
        </Link>

        {/* Materials Link */}
        <Link
          href="/student/materials"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/student/materials')
              ? 'bg-[#E0EEFF] text-[#1E60D5]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <FolderDown className={`w-5 h-5 ${isActive('/student/materials') ? 'text-[#1E60D5]' : 'text-slate-400'}`} />
          <span>Materials</span>
        </Link>

        {/* Profile Link */}
        <Link
          href="/student/profile"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/student/profile')
              ? 'bg-[#E0EEFF] text-[#1E60D5]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <User className={`w-5 h-5 ${isActive('/student/profile') ? 'text-[#1E60D5]' : 'text-slate-400'}`} />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Footer Logout Button */}
      <div className="p-6 border-t border-slate-50">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-505 hover:text-red-650 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
