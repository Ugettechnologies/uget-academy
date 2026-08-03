'use client';

import React, { useState } from 'react';
import { Mail, Check, Send, Sparkles } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 4000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-blue-950 p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden text-center sm:text-left">
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> UGET Tech Newsletter
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Stay Ahead in Tech & Career Growth
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Subscribe for free weekly tech insights, course launch announcements, scholarship alerts, and hands-on project guides.
          </p>
        </div>

        <div className="lg:col-span-5 w-full">
          {isSubscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" /> You're Subscribed! Check your inbox soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/20 rounded-2xl px-4 py-3.5 pl-10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition shadow-inner"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Subscribe for Free
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
