'use client';

import React, { useState } from 'react';
import StudentSidebar from './StudentSidebar';
import { Menu, X, User } from 'lucide-react';

interface StudentLayoutFrameProps {
  user: {
    firstName: string;
    lastName: string;
  };
  children: React.ReactNode;
}

export default function StudentLayoutFrame({ user, children }: StudentLayoutFrameProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dark min-h-screen bg-deep-violet flex text-text-primary font-sans relative overflow-x-hidden">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform lg:translate-x-0 transition-transform duration-300 ease-in-out lg:w-64 lg:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <StudentSidebar user={user} onLinkClick={closeSidebar} />
      </div>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative">
        {/* Top Navbar Header */}
        <header className="h-16 bg-surface-card border-b border-border-divider flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-royal-purple/10 text-accent-purple hover:bg-royal-purple/20 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-royal-purple/20 flex items-center justify-center text-accent-purple">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-text-secondary">
              {user.firstName} {user.lastName}
            </span>
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
