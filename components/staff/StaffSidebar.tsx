'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  UserCheck, 
  Layers, 
  Users, 
  Link2, 
  FileText, 
  LogOut,
  ShieldCheck
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
              Platform Ops & HR
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
            Platform Operator
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <Link
          href="/staff"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            pathname === '/staff'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Ops Dashboard</span>
        </Link>

        {/* Class Sections & Roster Maintenance */}
        <Link
          href="/admin/classes"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <Layers className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>Class Sections & Assigning</span>
        </Link>

        {/* Staff Intake Link Copy */}
        <Link
          href="/staff/onboarding"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            pathname === '/staff/onboarding'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Link2 className="w-4 h-4 shrink-0 text-teal-400" />
          <span>Staff Intake Portal</span>
        </Link>

        {/* Admin Overview Link */}
        <Link
          href="/admin"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 border border-white/5"
        >
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Admin Portal View</span>
        </Link>
      </nav>

      {/* Footer Notice: Payment Exclusion */}
      <div className="p-4 border-t border-white/10 text-center space-y-1">
        <span className="text-[10px] text-gray-400 font-mono block">
          ℹ️ Payment module excluded from staff portal (Admin oversight only).
        </span>
      </div>
    </aside>
  );
}
