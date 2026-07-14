'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between p-4 bg-deep-violet/40 rounded-2xl border border-border-divider transition-all duration-300 w-full">
      <div className="flex flex-col text-left">
        <span className="text-xs font-black text-text-primary">Interface Theme</span>
        <span className="text-[10px] text-text-secondary mt-0.5">Switch between dark and day mode</span>
      </div>
      
      <button
        type="button"
        onClick={toggleTheme}
        className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-royal-purple/20 border-royal-purple/35 items-center"
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <span
          className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-royal-purple shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
            theme === 'dark' ? 'translate-x-6.5' : 'translate-x-0.5'
          }`}
        >
          {theme === 'dark' ? (
            <Moon className="w-3 h-3 text-text-primary" />
          ) : (
            <Sun className="w-3 h-3 text-royal-gold" />
          )}
        </span>
      </button>
    </div>
  );
}
