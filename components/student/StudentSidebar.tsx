'use client';

import React from 'react';
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
  ChevronDown
} from 'lucide-react';

interface StudentSidebarProps {
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function StudentSidebar({ user }: StudentSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/student',
      icon: LayoutDashboard,
    },
    {
      label: 'Assignments',
      href: '/student/assignments',
      icon: FileSpreadsheet,
      hasDropdown: true,
    },
    {
      label: 'Exams',
      href: '/student/exams',
      icon: GraduationCap,
      hasDropdown: true,
    },
    {
      label: 'Grades',
      href: '/student/grades',
      icon: BarChart3,
    },
    {
      label: 'Materials',
      href: '/student/materials',
      icon: FolderDown,
    },
    {
      label: 'Profile',
      href: '/student/profile',
      icon: User,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/student') {
      return pathname === '/student';
    }
    return pathname.startsWith(href);
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
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <div key={item.href} className="space-y-1">
              <Link
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  active
                    ? 'bg-[#E0EEFF] text-[#1E60D5]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'text-[#1E60D5]' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.hasDropdown && (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    active ? 'text-[#1E60D5] rotate-180' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer Logout Button */}
      <div className="p-6 border-t border-slate-50">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
