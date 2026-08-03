'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileSpreadsheet, 
  PlusCircle, 
  CheckSquare, 
  FolderDown, 
  Users2, 
  FileText, 
  ListTodo, 
  User, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface InstructorSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string;
    username?: string | null;
    avatarUrl?: string | null;
    courseTrackTitle?: string;
  };
  onLinkClick?: () => void;
}

export default function InstructorSidebar({ user, onLinkClick }: InstructorSidebarProps) {
  const pathname = usePathname();

  const courseTitle = user.courseTrackTitle || 'Cybersecurity & Threat Intelligence';

  const isActive = (href: string) => {
    if (href === '/instructor') {
      return pathname === '/instructor';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-white/10 flex flex-col h-full relative text-white">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/instructor" onClick={onLinkClick} className="flex items-center gap-3">
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
              Instructor Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Instructor Profile & Assigned Course Card */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 bg-[#1E293B] shrink-0 flex items-center justify-center text-white font-black text-sm">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.firstName} fill className="object-cover" />
            ) : (
              <span>{user.firstName ? user.firstName.charAt(0) : 'I'}{user.lastName ? user.lastName.charAt(0) : ''}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-white truncate leading-tight">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[10px] text-purple-300 font-mono truncate font-bold">
              {user.username || 'UGT2026/INSCS/A026'}
            </span>
          </div>
        </div>

        {/* Course Track Name Badge */}
        <div className="mt-1 p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-[10px] flex items-center gap-1.5 text-purple-200">
          <BookOpen className="w-3.5 h-3.5 shrink-0 text-purple-400" />
          <span className="font-extrabold truncate">{courseTitle}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Dashboard */}
        <Link
          href="/instructor"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            pathname === '/instructor'
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </Link>

        {/* Student Roster & Attendance */}
        <Link
          href="/instructor/students"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/students')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Student Roster</span>
        </Link>

        {/* Timetable & Schedule Manager */}
        <Link
          href="/instructor/schedule"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/schedule')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0 text-blue-400" />
          <span>Class Schedule</span>
        </Link>

        {/* Assessments Directory */}
        <Link
          href="/instructor/assignments"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            pathname === '/instructor/assignments'
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Assessments</span>
        </Link>

        {/* Create Assessment (Rich Text Editor) */}
        <Link
          href="/instructor/assignments/create"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/assignments/create')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>Create Assessment</span>
        </Link>

        {/* Grading Queue */}
        <Link
          href="/instructor/grading"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/grading')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Grading Queue</span>
        </Link>

        {/* Materials Dispatch */}
        <Link
          href="/instructor/materials"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/materials')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FolderDown className="w-4 h-4 shrink-0" />
          <span>Send Materials</span>
        </Link>

        {/* Group / Project Assigner */}
        <Link
          href="/instructor/groups"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/groups')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Users2 className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>Group Projects</span>
        </Link>

        {/* Admin Reports */}
        <Link
          href="/instructor/reports"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/reports')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Reports to Admin</span>
        </Link>

        {/* Personal To-Do List */}
        <Link
          href="/instructor/todo"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/todo')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <ListTodo className="w-4 h-4 shrink-0 text-teal-400" />
          <span>To-Do List</span>
        </Link>

        {/* Profile & Settings (Logout inside) */}
        <Link
          href="/instructor/profile"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/instructor/profile')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Profile & Settings</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-center">
        <span className="text-[10px] text-gray-500 font-mono">
          UGET Academy • Instructor Portal
        </span>
      </div>
    </aside>
  );
}
