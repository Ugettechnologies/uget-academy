'use client';

import React, { useState } from 'react';
import { BarChart3, Download, Users, DollarSign, Calendar, CheckCircle2, Star, Sparkles } from 'lucide-react';

export default function AdminReportsView() {
  const [activeTab, setActiveTab] = useState<'ENROLLED' | 'REVENUE' | 'ATTENDANCE' | 'COMPLETION' | 'INSTRUCTOR'>('REVENUE');
  const [isExported, setIsExported] = useState(false);

  const handleExportData = () => {
    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Tab Navigation & Export Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div className="flex flex-wrap bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('ENROLLED')}
            className={`px-4 py-2 rounded-xl font-bold transition ${activeTab === 'ENROLLED' ? 'bg-[#2563EB] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Enrolled Growth
          </button>
          <button
            onClick={() => setActiveTab('REVENUE')}
            className={`px-4 py-2 rounded-xl font-bold transition ${activeTab === 'REVENUE' ? 'bg-amber-600 text-slate-950 shadow-md font-black' : 'text-gray-400 hover:text-white'}`}
          >
            Revenue (₦9.2M)
          </button>
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-4 py-2 rounded-xl font-bold transition ${activeTab === 'ATTENDANCE' ? 'bg-[#2563EB] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Attendance Logs
          </button>
          <button
            onClick={() => setActiveTab('COMPLETION')}
            className={`px-4 py-2 rounded-xl font-bold transition ${activeTab === 'COMPLETION' ? 'bg-[#2563EB] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Course Completion
          </button>
          <button
            onClick={() => setActiveTab('INSTRUCTOR')}
            className={`px-4 py-2 rounded-xl font-bold transition ${activeTab === 'INSTRUCTOR' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Instructor Ratings
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isExported && (
            <span className="text-xs text-emerald-400 font-bold">
              ✓ Exported {activeTab} CSV Report!
            </span>
          )}
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report CSV
          </button>
        </div>
      </div>

      {/* TAB 1: ENROLLED */}
      {activeTab === 'ENROLLED' && (
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Enrolled Growth Analytics</h3>
              <p className="text-xs text-gray-400">Total student signups across all cohorts</p>
            </div>
            <span className="text-2xl font-black text-emerald-400 font-mono">1,540 Students</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Cybersecurity Track</span>
              <p className="font-bold text-white text-base">420 Enrolled</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Data Analytics Track</span>
              <p className="font-bold text-white text-base">380 Enrolled</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Software Engineering</span>
              <p className="font-bold text-white text-base">410 Enrolled</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVENUE */}
      {activeTab === 'REVENUE' && (
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Platform Revenue Breakdown</h3>
              <p className="text-xs text-gray-400">Total settled platform revenue from course enrollments</p>
            </div>
            <span className="text-3xl font-black text-amber-400 font-mono">₦9.2M Total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">This Month Revenue</span>
              <p className="font-bold text-amber-300 text-base font-mono">₦1.14M</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Average per Course</span>
              <p className="font-bold text-white text-base font-mono">₦920,000</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">MoM Growth Rate</span>
              <p className="font-bold text-emerald-400 text-base font-mono">+20.9%</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Weekly Attendance vs Absences</h3>
              <p className="text-xs text-gray-400">Roll call verification rates across class sections</p>
            </div>
            <span className="text-2xl font-black text-blue-400 font-mono">94.2% Attendance</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E293B] border border-white/10 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-white">Class Section A (Morning Cohort)</span>
              <span className="font-mono text-emerald-400 font-bold">96% Present</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[96%]" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLETION */}
      {activeTab === 'COMPLETION' && (
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Course Completion & Pass Rates</h3>
              <p className="text-xs text-gray-400">Assessments passed and certificates issued</p>
            </div>
            <span className="text-2xl font-black text-purple-300 font-mono">88% Pass Rate</span>
          </div>
        </div>
      )}

      {/* TAB 5: INSTRUCTOR */}
      {activeTab === 'INSTRUCTOR' && (
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Instructor Performance & Ratings</h3>
              <p className="text-xs text-gray-400">Ratings, sessions taught, and student satisfaction</p>
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono">4.9 / 5.0 Rating</span>
          </div>
        </div>
      )}

    </div>
  );
}
