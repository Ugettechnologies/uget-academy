'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users,
  FileSpreadsheet, 
  GraduationCap, 
  FolderDown, 
  User, 
  LogOut
} from 'lucide-react';

interface InstructorSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string;
  };
  onLinkClick?: () => void;
}

export default function InstructorSidebar({ user, onLinkClick }: InstructorSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/instructor') {
      return pathname === '/instructor';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-surface-card border-r border-border-divider flex flex-col h-full relative text-text-primary">
      {/* Brand Header */}
      <div className="p-6 border-b border-border-divider flex items-center justify-between">
        <Link href="/instructor" onClick={onLinkClick} className="flex items-center gap-3">
          <Image
            src="/logo-clean.png"
            alt="UGET Academy Logo"
            width={36}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="font-sans font-bold tracking-tight text-text-primary text-lg leading-tight">
              UGET
            </span>
            <span className="text-royal-gold font-medium text-xs tracking-wider uppercase leading-none">
              Academy
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {/* Dashboard Link */}
        <Link
          href="/instructor"
          onClick={onLinkClick}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            pathname === '/instructor'
              ? 'bg-royal-purple/20 text-accent-purple border-l-2 border-royal-purple'
              : 'text-text-secondary hover:bg-royal-purple/10 hover:text-text-primary'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${pathname === '/instructor' ? 'text-accent-purple' : 'text-text-secondary'}`} />
          <span>Dashboard</span>
        </Link>

        {/* Students Link */}
        <Link
          href="/instructor/students"
          onClick={onLinkClick}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/instructor/students')
              ? 'bg-royal-purple/20 text-accent-purple border-l-2 border-royal-purple'
              : 'text-text-secondary hover:bg-royal-purple/10 hover:text-text-primary'
          }`}
        >
          <Users className={`w-5 h-5 ${isActive('/instructor/students') ? 'text-accent-purple' : 'text-text-secondary'}`} />
          <span>Students</span>
        </Link>

        {/* Assignments Link */}
        <Link
          href="/instructor/assignments"
          onClick={onLinkClick}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/instructor/assignments')
              ? 'bg-royal-purple/20 text-accent-purple border-l-2 border-royal-purple'
              : 'text-text-secondary hover:bg-royal-purple/10 hover:text-text-primary'
          }`}
        >
          <FileSpreadsheet className={`w-5 h-5 ${isActive('/instructor/assignments') ? 'text-accent-purple' : 'text-text-secondary'}`} />
          <span>Assignments</span>
        </Link>

        {/* Exams Link */}
        <Link
          href="/instructor/exams"
          onClick={onLinkClick}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/instructor/exams')
              ? 'bg-royal-purple/20 text-accent-purple border-l-2 border-royal-purple'
              : 'text-text-secondary hover:bg-royal-purple/10 hover:text-text-primary'
          }`}
        >
          <GraduationCap className={`w-5 h-5 ${isActive('/instructor/exams') ? 'text-accent-purple' : 'text-text-secondary'}`} />
          <span>Exams</span>
        </Link>

        {/* Materials Link */}
        <Link
          href="/instructor/materials"
          onClick={onLinkClick}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/instructor/materials')
              ? 'bg-royal-purple/20 text-accent-purple border-l-2 border-royal-purple'
              : 'text-text-secondary hover:bg-royal-purple/10 hover:text-text-primary'
          }`}
        >
          <FolderDown className={`w-5 h-5 ${isActive('/instructor/materials') ? 'text-accent-purple' : 'text-text-secondary'}`} />
          <span>Materials</span>
        </Link>

        {/* Profile Link */}
        <Link
          href="/instructor/profile"
          onClick={onLinkClick}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive('/instructor/profile')
              ? 'bg-royal-purple/20 text-accent-purple border-l-2 border-royal-purple'
              : 'text-text-secondary hover:bg-royal-purple/10 hover:text-text-primary'
          }`}
        >
          <User className={`w-5 h-5 ${isActive('/instructor/profile') ? 'text-accent-purple' : 'text-text-secondary'}`} />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Sidebar User Footer */}
      <div className="p-4 border-t border-border-divider flex flex-col gap-3 bg-royal-purple/5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-royal-purple/20 flex items-center justify-center text-accent-purple font-bold text-xs shrink-0">
            {user.firstName ? user.firstName.charAt(0) : ''}{user.lastName ? user.lastName.charAt(0) : ''}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-text-primary truncate leading-none mb-1">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[10px] text-text-secondary truncate font-medium">
              {user.email || 'instructor@uget.com'}
            </span>
          </div>
        </div>

        {/* Footer Logout Button */}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-status-absent hover:text-status-absent/80 hover:bg-status-absent/5 rounded-xl transition w-full text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
