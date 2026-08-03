'use client';

import React, { useState, useEffect } from 'react';
import InstructorSidebar from './InstructorSidebar';
import { Menu, X, Bell, Search, BookOpen, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface InstructorLayoutFrameProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string | null;
    avatarUrl?: string | null;
    courseTrackTitle?: string;
  };
  children: React.ReactNode;
}

export default function InstructorLayoutFrame({ user, children }: InstructorLayoutFrameProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const courseTitle = user.courseTrackTitle || 'Cybersecurity & Threat Intelligence';

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex text-white font-sans relative overflow-x-hidden transition-colors duration-300">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:h-screen lg:sticky lg:top-0 transition-all duration-300 ease-in-out bg-[#0F172A] ${
          isSidebarOpen 
            ? 'translate-x-0 w-64 border-r border-white/10' 
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0'
        }`}
      >
        <InstructorSidebar user={user} onLinkClick={closeSidebar} />
      </div>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative transition-all duration-300">
        {/* Top Navbar Header */}
        <header className="h-16 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer flex items-center justify-center border border-white/10"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? (
                <>
                  <X className="w-5 h-5 lg:hidden" />
                  <Menu className="w-5 h-5 hidden lg:block" />
                </>
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Course Track Header Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="truncate max-w-[220px]">{courseTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-400" /> Instructor Notifications
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1">
                      <span className="font-bold text-white text-[11px] block">Pending Submission Grading</span>
                      <p className="text-purple-200 text-[11px]">3 new deliverables submitted for {courseTitle}.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                      <span className="font-bold text-white text-[11px] block">Roll Call Reminder</span>
                      <p className="text-gray-400 text-[11px]">Next lecture starts today at 04:00 PM WAT.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Badge Link */}
            <Link href="/instructor/profile" className="flex items-center gap-2.5 hover:opacity-80 transition">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center border border-white/20">
                {user.firstName ? user.firstName.charAt(0) : ''}{user.lastName ? user.lastName.charAt(0) : ''}
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-bold text-white leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[9px] text-purple-300 font-mono">
                  {user.username || 'Instructor'}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic content rendering */}
        <main className="flex-grow p-4 sm:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
