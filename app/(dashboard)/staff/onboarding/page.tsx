'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserCheck, Check, Sparkles, Send, BookOpen, ShieldCheck } from 'lucide-react';

export default function StaffOnboardingIntakePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentTrack, setDepartmentTrack] = useState('Cybersecurity Track');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-4 sm:p-8 text-white font-sans">
      <div className="max-w-xl w-full bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-clean.png"
              alt="UGET Academy Logo"
              width={34}
              height={34}
              className="h-8.5 w-auto object-contain"
              priority
            />
            <div>
              <span className="font-bold text-white text-base block leading-tight">UGET Academy</span>
              <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest">
                Official Staff Onboarding Intake
              </span>
            </div>
          </div>

          <span className="text-[10px] bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full font-bold border border-teal-500/30">
            Self-Service Intake Link
          </span>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">Staff Intake Submitted!</h2>
            <p className="text-xs text-gray-300 leading-relaxed max-w-md mx-auto">
              Thank you, {fullName}! Your qualification records and contact profile have flowed directly into the Admin Staff Directory. Your department ID will be issued shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 leading-relaxed">
              ℹ️ Please fill in your instructor profile details below. Once submitted, your data automatically registers into the UGET Academy Admin records without manual re-entry.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ada Lovelace"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-gray-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="instructor@uget-academy.online"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-gray-300">Assigned Department Track</label>
                <select
                  value={departmentTrack}
                  onChange={(e) => setDepartmentTrack(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Cybersecurity Track">Cybersecurity & Threat Intelligence</option>
                  <option value="Data Science Track">Data Analytics & Predictive Modeling</option>
                  <option value="Development Track">Software Engineering & Architecture</option>
                  <option value="Design Track">UI/UX System Design</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-300">Qualifications & Certifications</label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Ph.D. in Computer Science, CISSP Certified, 8+ Years Industry Experience..."
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-300">Instructor Bio</label>
              <textarea
                rows={3}
                placeholder="Write a brief professional bio for student course profiles..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <Send className="w-4 h-4" /> Submit Onboarding Details to Admin
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
