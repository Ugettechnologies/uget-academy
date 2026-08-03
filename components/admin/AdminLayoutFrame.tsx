'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu, X, Bell, Search, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutFrameProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  children: React.ReactNode;
}

export default function AdminLayoutFrame({ user, children }: AdminLayoutFrameProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

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
        <AdminSidebar user={user} onLinkClick={closeSidebar} />
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

            {/* Universal Search Bar */}
            <div className="relative w-full hidden sm:block">
              <input
                type="text"
                placeholder="Search everywhere: students, instructors, courses, assessments..."
                className="w-full bg-[#1E293B]/70 border border-white/10 text-xs text-white placeholder-gray-400 pl-9 pr-4 py-2 rounded-xl focus:border-amber-500 focus:outline-none transition"
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
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center animate-pulse">
                  4
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" /> Admin Platform Alerts
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1">
                      <span className="font-bold text-white text-[11px] block">New Instructor Staff Intake</span>
                      <p className="text-amber-200 text-[11px]">Staff member submitted onboarding data link.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                      <span className="font-bold text-white text-[11px] block">Revenue Settlement</span>
                      <p className="text-gray-400 text-[11px]">₦9.2M Total revenue summary synced.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Badge Link */}
            <Link href="/admin/settings" className="flex items-center gap-2.5 hover:opacity-80 transition">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border border-white/20">
                {user.firstName ? user.firstName.charAt(0) : ''}{user.lastName ? user.lastName.charAt(0) : ''}
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-bold text-white leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[9px] text-amber-300 font-mono font-bold uppercase">
                  Super Admin
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
