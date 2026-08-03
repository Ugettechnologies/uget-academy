'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Archive, Check, Search, Users, UserCheck, Sparkles } from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  category: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  enrolledStudentsCount: number;
  assignedTutor: string;
  price: string;
}

export default function AdminCourseManager() {
  const [courses, setCourses] = useState<CourseItem[]>([
    {
      id: 'crs-1',
      title: 'Cybersecurity & Threat Intelligence',
      category: 'Cybersecurity Track',
      status: 'PUBLISHED',
      enrolledStudentsCount: 420,
      assignedTutor: 'Mr. Anthony',
      price: '₦150,000',
    },
    {
      id: 'crs-2',
      title: 'Data Analytics & Predictive Modeling',
      category: 'Data Science Track',
      status: 'PUBLISHED',
      enrolledStudentsCount: 380,
      assignedTutor: 'Ms. Goodness',
      price: '₦140,000',
    },
    {
      id: 'crs-3',
      title: 'Software Engineering & Architecture',
      category: 'Development Track',
      status: 'PUBLISHED',
      enrolledStudentsCount: 410,
      assignedTutor: 'Mr. Mayorkun',
      price: '₦160,000',
    },
    {
      id: 'crs-4',
      title: 'UI/UX System Design & Wireframing',
      category: 'Design Track',
      status: 'PUBLISHED',
      enrolledStudentsCount: 330,
      assignedTutor: 'Mr. Chief',
      price: '₦120,000',
    },
    {
      id: 'crs-5',
      title: 'AI & Automation Engineering',
      category: 'AI & Automation Track',
      status: 'PUBLISHED',
      enrolledStudentsCount: 290,
      assignedTutor: 'Mr. Light',
      price: '₦180,000',
    },
  ]);

  const [tutors] = useState(['Mr. Anthony', 'Ms. Goodness', 'Mr. Mayorkun', 'Mr. Chief', 'Mr. Light']);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourseToAssign, setActiveCourseToAssign] = useState<CourseItem | null>(null);
  const [selectedTutorInput, setSelectedTutorInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAssignTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseToAssign || !selectedTutorInput) return;

    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseToAssign.id
          ? { ...c, assignedTutor: selectedTutorInput, status: 'PUBLISHED' }
          : c
      )
    );

    setActiveCourseToAssign(null);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleToggleArchive = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, status: c.status === 'ARCHIVED' ? 'PUBLISHED' : 'ARCHIVED' }
          : c
      )
    );
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
        </div>

        {isSuccess && (
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <Check className="w-4 h-4" /> Tutor Assigned & Course Published!
          </span>
        )}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((crs) => (
          <div
            key={crs.id}
            className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl hover:border-blue-500/40 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded border border-blue-500/30">
                  {crs.category}
                </span>

                {crs.status === 'PUBLISHED' && (
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30">
                    Published
                  </span>
                )}
                {crs.status === 'DRAFT' && (
                  <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
                    Draft
                  </span>
                )}
                {crs.status === 'ARCHIVED' && (
                  <span className="text-[10px] font-extrabold uppercase bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded border border-red-500/30">
                    Archived
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-white">{crs.title}</h3>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Enrolled Students</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-400" /> {crs.enrolledStudentsCount} Students
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Assigned Tutor</span>
                  <span className="font-bold text-purple-300 flex items-center gap-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {crs.assignedTutor}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold text-amber-400">{crs.price}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveCourseToAssign(crs);
                    setSelectedTutorInput(crs.assignedTutor !== 'Unassigned' ? crs.assignedTutor : tutors[0]);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Assign Tutor
                </button>

                <button
                  onClick={() => handleToggleArchive(crs.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition border border-white/10"
                  title={crs.status === 'ARCHIVED' ? 'Unarchive' : 'Archive Course'}
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Tutor Modal */}
      {activeCourseToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <form onSubmit={handleAssignTutor} className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white">
            <h3 className="font-extrabold text-white text-base">
              Assign Tutor to Course
            </h3>
            <p className="text-xs text-gray-400">
              Course: <span className="text-blue-300 font-bold">{activeCourseToAssign.title}</span>
            </p>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-gray-300">Select Assigned Instructor / Tutor</label>
              <select
                value={selectedTutorInput}
                onChange={(e) => setSelectedTutorInput(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              >
                {tutors.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveCourseToAssign(null)}
                className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition shadow-lg shadow-purple-500/20"
              >
                Confirm Tutor Assignment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
