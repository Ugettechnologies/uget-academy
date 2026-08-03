'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Check, Clock, Video, Sparkles, BookOpen } from 'lucide-react';

interface ClassScheduleItem {
  id: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  meetingLink: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}

export default function TimetableManager() {
  const courseTitle = 'Cybersecurity & Threat Intelligence';

  const [schedules, setSchedules] = useState<ClassScheduleItem[]>([
    {
      id: 'sch-1',
      topic: 'Module 4: Advanced Web Penetration & OWASP Top 10 Security Architecture',
      date: 'Today, Aug 3',
      time: '04:00 PM - 05:30 PM WAT',
      duration: '90 Mins',
      meetingLink: 'https://meet.uget-academy.online/cyber-live-101',
      status: 'LIVE',
    },
    {
      id: 'sch-2',
      topic: 'Module 5: Network Forensics & WireShark Protocol Analysis',
      date: 'Wednesday, Aug 5',
      time: '04:00 PM - 05:30 PM WAT',
      duration: '90 Mins',
      meetingLink: 'https://meet.uget-academy.online/cyber-live-102',
      status: 'SCHEDULED',
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [topicInput, setTopicInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTopicInput('');
    setDateInput('Thursday, Aug 6');
    setTimeInput('04:00 PM - 05:30 PM WAT');
    setLinkInput('https://meet.uget-academy.online/cyber-live-103');
    setIsEditing(true);
  };

  const handleOpenEdit = (sch: ClassScheduleItem) => {
    setEditingId(sch.id);
    setTopicInput(sch.topic);
    setDateInput(sch.date);
    setTimeInput(sch.time);
    setLinkInput(sch.meetingLink);
    setIsEditing(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, topic: topicInput, date: dateInput, time: timeInput, meetingLink: linkInput }
            : s
        )
      );
    } else {
      const newSch: ClassScheduleItem = {
        id: `sch-${Date.now()}`,
        topic: topicInput,
        date: dateInput,
        time: timeInput,
        duration: '90 Mins',
        meetingLink: linkInput,
        status: 'SCHEDULED',
      };
      setSchedules((prev) => [...prev, newSch]);
    }

    setIsEditing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3500);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 shrink-0 text-purple-400 mt-0.5" />
          <div>
            <p className="font-bold text-white">Live Student Portal Timetable Sync Enabled</p>
            <p className="text-[11px] text-purple-300">
              Any schedule edits you make here automatically update on all 28 assigned students' portals for <strong className="text-white">{courseTitle}</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Add Class Session
        </button>
      </div>

      {syncSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> Schedule Updated! Changes synced in real time to all assigned student portals.
        </div>
      )}

      {/* Class Schedule Directory */}
      <div className="grid grid-cols-1 gap-4">
        {schedules.map((sch) => (
          <div
            key={sch.id}
            className="p-6 bg-[#0F172A] border border-white/10 rounded-3xl space-y-4 shadow-xl hover:border-purple-500/30 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/30">
                    {courseTitle}
                  </span>
                  {sch.status === 'LIVE' && (
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      Live Session Active
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-1">{sch.topic}</h3>
              </div>

              <div className="text-right text-xs">
                <span className="text-gray-400 block">{sch.date}</span>
                <span className="font-mono font-bold text-purple-300">{sch.time}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-400" />
                <span>Link: <strong className="text-blue-300">{sch.meetingLink}</strong></span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(sch)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition border border-white/10"
                  title="Edit Schedule"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSchedule(sch.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition border border-red-500/20"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <form onSubmit={handleSaveSchedule} className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white">
            <h3 className="font-extrabold text-white text-base">
              {editingId ? 'Edit Scheduled Session' : 'Schedule New Class Session'}
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Topic Being Taught</label>
              <input
                type="text"
                required
                placeholder="e.g. Module 6: Cryptographic Protocols & SSL/TLS"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">Date</label>
                <input
                  type="text"
                  required
                  placeholder="Thursday, Aug 6"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">Time Range</label>
                <input
                  type="text"
                  required
                  placeholder="04:00 PM - 05:30 PM"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Meeting Room URL</label>
              <input
                type="text"
                required
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-blue-300 font-mono focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition shadow-lg shadow-purple-500/20"
              >
                Save & Sync Schedule
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
