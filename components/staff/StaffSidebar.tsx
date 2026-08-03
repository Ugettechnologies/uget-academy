'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  UserCheck, 
  Users, 
  FileText, 
  LogOut,
  FolderOpen,
  UserPlus
} from 'lucide-react';

interface StaffSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string;
  };
  onLinkClick?: () => void;
}

export default function StaffSidebar({ user, onLinkClick }: StaffSidebarProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/staff/login';
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-white/10 flex flex-col h-full relative text-white">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/staff" onClick={onLinkClick} className="flex items-center gap-3">
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
            <span className="text-indigo-400 font-extrabold text-[10px] tracking-widest uppercase leading-none">
              HR & Staff Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Staff Card */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center border border-white/20 shrink-0">
          {user.firstName ? user.firstName.charAt(0) : 'S'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-black text-white truncate leading-tight">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase">
            Operations & HR Staff
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <Link
          href="/staff"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            pathname === '/staff'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Operations Overview</span>
        </Link>

        {/* Student Roster & Documents */}
        <Link
          href="/staff/students"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            pathname === '/staff/students'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>Student Roster & Documents</span>
        </Link>

        {/* New Staff Intake & Documents */}
        <Link
          href="/staff/onboarding"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            pathname === '/staff/onboarding'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4 shrink-0 text-teal-400" />
          <span>Staff Intake & Documents</span>
        </Link>
      </nav>

      {/* Footer Sign Out */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 border border-red-500/20 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Staff Session</span>
        </button>
      </div>
    </aside>
  );
}
