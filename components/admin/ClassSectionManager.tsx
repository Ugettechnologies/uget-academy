'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, UserCheck, Check, Search, Calendar, BookOpen } from 'lucide-react';

interface ClassSection {
  id: string;
  sectionName: string;
  courseTitle: string;
  scheduleType: 'MORNING' | 'EVENING' | 'WEEKEND';
  assignedTutor: string;
  assignedStudentsCount: number;
}

export default function ClassSectionManager() {
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<{ name: string; admissionNo: string }[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const users = await res.json();
          const students = users
            .filter((u: any) => u.role === 'STUDENT')
            .map((u: any) => ({
              name: `${u.firstName} ${u.lastName}`,
              admissionNo: u.username || `2026/STU/${u.id.slice(-4).toUpperCase()}`,
            }));
          setUnassignedStudents(students);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchStudents();
  }, []);

  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('Cybersecurity & Threat Intelligence');
  const [newScheduleType, setNewScheduleType] = useState<'MORNING' | 'EVENING' | 'WEEKEND'>('MORNING');
  const [newTutor, setNewTutor] = useState('Unassigned');

  const [activeAssigningSection, setActiveAssigningSection] = useState<ClassSection | null>(null);
  const [selectedStudentToAssign, setSelectedStudentToAssign] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName) return;

    const newSec: ClassSection = {
      id: `sec-${Date.now()}`,
      sectionName: newSectionName,
      courseTitle: newCourseTitle,
      scheduleType: newScheduleType,
      assignedTutor: newTutor,
      assignedStudentsCount: 0,
    };

    setSections([...sections, newSec]);
    setNewSectionName('');
    setIsCreatingSection(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleAssignStudentToSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssigningSection || !selectedStudentToAssign) return;

    setSections((prev) =>
      prev.map((s) =>
        s.id === activeAssigningSection.id
          ? { ...s, assignedStudentsCount: s.assignedStudentsCount + 1 }
          : s
      )
    );

    setActiveAssigningSection(null);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div>
          <h3 className="text-sm font-black text-white">Class Sections Directory</h3>
          <p className="text-xs text-gray-400">Manage morning, evening, and weekend class sections for each course.</p>
        </div>

        <div className="flex items-center gap-3">
          {isSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Class Section & Student Assignment Updated!
            </span>
          )}

          <button
            onClick={() => setIsCreatingSection(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Create Class Section
          </button>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl hover:border-cyan-500/40 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/30">
                  {sec.scheduleType} SESSION
                </span>

                <span className="text-xs font-mono font-bold text-gray-400">
                  {sec.assignedStudentsCount} Enrolled
                </span>
              </div>

              <h4 className="text-base font-bold text-white">{sec.sectionName}</h4>
              <p className="text-xs text-gray-400 font-medium">Course: <strong className="text-white">{sec.courseTitle}</strong></p>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Section Tutor</span>
                <span className="font-bold text-purple-300">{sec.assignedTutor}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveAssigningSection(sec)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10 flex items-center justify-center gap-1.5"
              >
                <Users className="w-4 h-4 text-cyan-400" /> Assign Student to Section
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Section Modal */}
      {isCreatingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <form onSubmit={handleCreateSection} className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white">
            <h3 className="font-extrabold text-white text-base">Create New Class Section</h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Section Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Class Section D (Evening Cohort)"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Course Track</label>
              <input
                type="text"
                required
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Schedule Type</label>
              <select
                value={newScheduleType}
                onChange={(e) => setNewScheduleType(e.target.value as any)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="MORNING">Morning Session</option>
                <option value="EVENING">Evening Session</option>
                <option value="WEEKEND">Weekend Session</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreatingSection(false)}
                className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Save Class Section
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Student Modal */}
      {activeAssigningSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <form onSubmit={handleAssignStudentToSection} className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white">
            <h3 className="font-extrabold text-white text-base">Assign Student to Class Section</h3>
            <p className="text-xs text-gray-400">
              Target Section: <span className="text-cyan-300 font-bold">{activeAssigningSection.sectionName}</span>
            </p>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-gray-300">Select Student to Assign</label>
              <select
                value={selectedStudentToAssign}
                onChange={(e) => setSelectedStudentToAssign(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-bold"
              >
                {unassignedStudents.map((s) => (
                  <option key={s.admissionNo} value={s.name}>{s.name} ({s.admissionNo})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveAssigningSection(null)}
                className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Assign Student to Section
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
