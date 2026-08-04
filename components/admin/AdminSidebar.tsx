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
  CreditCard,
  Download,
  Upload,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string;
    avatarUrl?: string | null;
  };
  onLinkClick?: () => void;
  onOpenDataSyncModal?: () => void;
  onOpenStaffModal?: () => void;
}

export default function AdminSidebar({ user, onLinkClick, onOpenDataSyncModal, onOpenStaffModal }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const navSections = [
    {
      title: 'OVERVIEW & FINANCE',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, badge: 'Main' },
        { label: 'Payments & Revenue', href: '/admin/payments', icon: CreditCard, color: 'text-amber-400' },
      ],
    },
    {
      title: 'ACADEMY STRUCTURE',
      items: [
        { label: 'Courses & Tutors', href: '/admin/courses', icon: BookOpen, color: 'text-blue-400' },
        { label: 'Class Sections', href: '/admin/classes', icon: Layers, color: 'text-cyan-400' },
        { label: 'Assessments Builder', href: '/admin/assessments', icon: FileSpreadsheet, color: 'text-emerald-400' },
      ],
    },
    {
      title: 'PEOPLE & DIRECTORY',
      items: [
        { label: 'Students Directory', href: '/admin/students', icon: GraduationCap, color: 'text-purple-400' },
        { label: 'Instructors Directory', href: '/admin/instructors', icon: Users, color: 'text-indigo-400' },
        { label: 'Staff & HR Portal', href: '/staff', icon: UserCheck, color: 'text-teal-400' },
        { label: 'Team & Roles Matrix', href: '/admin/team', icon: ShieldAlert, color: 'text-rose-400' },
      ],
    },
    {
      title: 'ANALYTICS & SYSTEM',
      items: [
        { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3, color: 'text-amber-300' },
        { label: 'Settings & Security', href: '/admin/settings', icon: Settings, color: 'text-slate-400' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-white/10 flex flex-col h-full relative text-white select-none">
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
              Super Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Admin Profile Card */}
      <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 border border-white/20">
          {user.firstName ? user.firstName.charAt(0) : 'A'}{user.lastName ? user.lastName.charAt(0) : ''}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-black text-white truncate leading-tight">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[9px] text-amber-300 font-mono font-bold uppercase tracking-wider">
            Super Administrator
          </span>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div className="px-3 mt-3 flex items-center gap-2">
        {onOpenDataSyncModal && (
          <button
            onClick={onOpenDataSyncModal}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Import/Export Enrollment Data"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>Sync Data</span>
          </button>
        )}

        {onOpenStaffModal && (
          <button
            onClick={onOpenStaffModal}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Issue New Staff Credentials"
          >
            <UserCheck className="w-3 h-3 text-teal-400" />
            <span>+ Add Staff</span>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <span className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-widest block">
              {section.title}
            </span>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : item.color || 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-2 text-center">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
