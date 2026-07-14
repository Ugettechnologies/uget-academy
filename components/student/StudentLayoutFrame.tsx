'use client';

import React, { useState, useEffect } from 'react';
import StudentSidebar from './StudentSidebar';
import { Menu, X } from 'lucide-react';
import { ThemeProvider, useTheme } from './ThemeContext';

interface StudentLayoutFrameProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
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

  // Initialize sidebar state on mount depending on screen width
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
    <div className={`${theme} min-h-screen bg-deep-violet flex text-text-primary font-sans relative overflow-x-hidden transition-colors duration-300`}>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform lg:static transition-all duration-300 ease-in-out bg-surface-card ${
          isSidebarOpen 
            ? 'translate-x-0 w-64 border-r border-border-divider' 
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0'
        }`}
      >
        <StudentSidebar user={user} onLinkClick={closeSidebar} />
      </div>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative transition-all duration-300">
        {/* Top Navbar Header */}
        <header className="h-16 bg-surface-card border-b border-border-divider flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Hamburger Button (Desktop & Mobile) */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-royal-purple/10 text-accent-purple hover:bg-royal-purple/20 transition cursor-pointer flex items-center justify-center"
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
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-royal-purple/20 flex items-center justify-center text-accent-purple font-bold text-xs">
              {user.firstName ? user.firstName.charAt(0) : ''}{user.lastName ? user.lastName.charAt(0) : ''}
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
