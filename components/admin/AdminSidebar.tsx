'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Users, 
  GraduationCap, 
  FileSpreadsheet, 
  BarChart3, 
  ShieldAlert, 
  UserCheck, 
  Settings, 
  Sparkles,
  Link2
} from 'lucide-react';

interface AdminSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string;
    avatarUrl?: string | null;
  };
  onLinkClick?: () => void;
}

export default function AdminSidebar({ user, onLinkClick }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-white/10 flex flex-col h-full relative text-white">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin" onClick={onLinkClick} className="flex items-center gap-3">
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
            <span className="text-amber-400 font-extrabold text-[10px] tracking-widest uppercase leading-none">
              Admin Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Admin Profile Avatar Card */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500 bg-[#1E293B] shrink-0 flex items-center justify-center text-white font-black text-sm">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.firstName} fill className="object-cover" />
          ) : (
            <span>{user.firstName ? user.firstName.charAt(0) : 'A'}{user.lastName ? user.lastName.charAt(0) : ''}</span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-black text-white truncate leading-tight">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-wider">
            Super Administrator
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Dashboard */}
        <Link
          href="/admin"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            pathname === '/admin'
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </Link>

        {/* Courses & Tutor Assignment */}
        <Link
          href="/admin/courses"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/courses')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0 text-blue-400" />
          <span>Courses & Tutors</span>
        </Link>

        {/* Class Sections & Student Assignment */}
        <Link
          href="/admin/classes"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/classes')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>Class Sections</span>
        </Link>

        {/* Instructors Directory */}
        <Link
          href="/admin/instructors"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/instructors')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 shrink-0 text-purple-400" />
          <span>Instructors Directory</span>
        </Link>

        {/* Students Directory */}
        <Link
          href="/admin/students"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/students')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Students Directory</span>
        </Link>

        {/* Platform Assessments Builder */}
        <Link
          href="/admin/assessments"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/assessments')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Assessments Builder</span>
        </Link>

        {/* 5-Tab Reports & Analytics */}
        <Link
          href="/admin/reports"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/reports')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Reports & Analytics</span>
        </Link>

        {/* Non-Staff Ops Portal Link */}
        <Link
          href="/staff"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 border border-white/5"
        >
          <UserCheck className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>Ops & HR Portal</span>
        </Link>

        {/* Team & Roles Matrix */}
        <Link
          href="/admin/team"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/team')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#60A5FA]" />
          <span>Team & Roles Matrix</span>
        </Link>

        {/* Staff Intake Link Copy */}
        <Link
          href="/staff/onboarding"
          target="_blank"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <Link2 className="w-4 h-4 shrink-0 text-teal-400" />
          <span>Staff Intake Link</span>
        </Link>

        {/* Settings & Notifications */}
        <Link
          href="/admin/settings"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/settings')
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings & Security</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-center">
        <span className="text-[10px] text-gray-500 font-mono">
          UGET Academy • Admin Oversight
        </span>
      </div>
    </aside>
  );
}
