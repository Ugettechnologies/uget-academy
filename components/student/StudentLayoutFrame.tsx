'use client';

import React, { useState, useEffect } from 'react';
import StudentSidebar from './StudentSidebar';
import { Menu, X, Bell, Search, Check, Calendar, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { ThemeProvider, useTheme } from './ThemeContext';
import Link from 'next/link';

interface StudentLayoutFrameProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
    username?: string | null;
  };
  children: React.ReactNode;
}

export default function StudentLayoutFrame({ user, children }: StudentLayoutFrameProps) {
  return (
    <ThemeProvider>
      <StudentLayoutContent user={user}>{children}</StudentLayoutContent>
    </ThemeProvider>
  );
}

function StudentLayoutContent({ user, children }: StudentLayoutFrameProps) {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // Mock Notification Feed
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Upcoming Class Reminder',
      message: 'Next Live Lecture: Cybersecurity Advanced Cryptography starts in 45 mins.',
      time: '45 mins from now',
      type: 'CLASS',
      read: false,
    },
    {
      id: '2',
      title: 'Assignment Deadline',
      message: 'Deliverable "High-Fidelity UI System" is due tomorrow at 11:59 PM.',
      time: '1 day left',
      type: 'ASSIGNMENT',
      read: false,
    },
    {
      id: '3',
      title: 'New DM from Instructor',
      message: 'Instructor Alex replied to your query regarding Section 2 exam slot.',
      time: '2 hours ago',
      type: 'MESSAGE',
      read: true,
    },
  ]);

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

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className={`${theme} min-h-screen bg-[#090D16] flex text-white font-sans relative overflow-x-hidden transition-colors duration-300`}>
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
        <StudentSidebar user={user} onLinkClick={closeSidebar} />
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

            {/* Quick Search Bar */}
            <div className="relative w-full hidden sm:block">
              <input
                type="text"
                placeholder="Search courses, assignments, exams..."
                className="w-full bg-[#1E293B]/70 border border-white/10 text-xs text-white placeholder-gray-400 pl-9 pr-4 py-2 rounded-xl focus:border-[#2563EB] focus:outline-none transition"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#60A5FA]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">In-App Notifications</h4>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] text-[#60A5FA] hover:underline font-bold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                          n.read
                            ? 'bg-white/5 border-white/5 text-gray-400'
                            : 'bg-blue-950/40 border-blue-500/30 text-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                            {n.type === 'CLASS' && <Calendar className="w-3.5 h-3.5 text-blue-400" />}
                            {n.type === 'ASSIGNMENT' && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                            {n.type === 'MESSAGE' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                            {n.title}
                          </span>
                          <span className="text-[9px] text-gray-400 flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Badge Link */}
            <Link href="/student/profile" className="flex items-center gap-2.5 hover:opacity-80 transition">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center border border-white/20">
                {user.firstName ? user.firstName.charAt(0) : ''}{user.lastName ? user.lastName.charAt(0) : ''}
              </div>
              <span className="text-xs font-bold text-white hidden sm:block">
                {user.firstName} {user.lastName}
              </span>
            </Link>
          </div>
        </header>

        {/* Main content viewport */}
        <main className="flex-grow p-4 sm:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
