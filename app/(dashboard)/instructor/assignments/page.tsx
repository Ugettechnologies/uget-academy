'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileEdit, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  Award, 
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface AssessmentItem {
  id: string;
  title: string;
  type: 'ASSIGNMENT' | 'EXAM' | 'PRACTICAL';
  courseTitle: string;
  dueDate: string;
  status: 'PUBLISHED' | 'DRAFT';
  submissionsCount: number;
  totalStudents: number;
  maxScore: number;
}

export default function InstructorAssignmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'ASSIGNMENT' | 'EXAM' | 'PRACTICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/instructor/exams');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.exams)) {
            const mapped: AssessmentItem[] = data.exams.map((e: any) => ({
              id: e.id,
              title: e.title,
              type: e.type || 'ASSIGNMENT',
              courseTitle: e.course?.title || 'Cybersecurity & Threat Intelligence',
              dueDate: e.dueDate ? new Date(e.dueDate).toLocaleDateString() : 'No Due Date',
              status: e.isPublished ? 'PUBLISHED' : 'DRAFT',
              submissionsCount: e._count?.submissions || 0,
              totalStudents: 28,
              maxScore: e.totalMarks || 100,
            }));
            setAssessments(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to fetch assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const filteredAssessments = assessments.filter((item) => {
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileEdit className="w-8 h-8 text-[#1E60D5]" /> Course Assessments & Exams
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Create, publish, and monitor class assignments, CBT tests, and practical project deliverables.
          </p>
        </div>

        <Link
          href="/instructor/assignments/create"
          className="px-5 py-3 rounded-2xl bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-[#1E60D5]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Assessment
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              filterType === 'ALL'
                ? 'bg-[#1E60D5] text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Assessments ({assessments.length})
          </button>
          <button
            onClick={() => setFilterType('ASSIGNMENT')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              filterType === 'ASSIGNMENT'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Assignments ({assessments.filter((a) => a.type === 'ASSIGNMENT').length})
          </button>
          <button
            onClick={() => setFilterType('EXAM')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              filterType === 'EXAM'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            CBT Exams ({assessments.filter((a) => a.type === 'EXAM').length})
          </button>
          <button
            onClick={() => setFilterType('PRACTICAL')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              filterType === 'PRACTICAL'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Practicals ({assessments.filter((a) => a.type === 'PRACTICAL').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by title or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E60D5]"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Assessment Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2 border border-slate-100">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E60D5]" /> Loading assigned assessments...
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center space-y-4 border border-slate-100">
          <FileEdit className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No assessments found</h3>
          <p className="text-xs text-slate-500">Draft your first assignment or exam for your course cohort using the Rich Text Editor.</p>
          <Link
            href="/instructor/assignments/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E60D5] text-white text-xs font-bold shadow-md hover:bg-[#1E60D5]/90 transition"
          >
            <Plus className="w-4 h-4" /> Draft First Assessment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    item.type === 'EXAM'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : item.type === 'PRACTICAL'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {item.type}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.status === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{item.courseTitle}</p>
              </div>

              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Submissions</span>
                    <strong className="text-slate-800">{item.submissionsCount} / {item.totalStudents}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Max Marks</span>
                    <strong className="text-[#1E60D5]">{item.maxScore} Pts</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due: {item.dueDate}
                  </span>
                </div>

                <Link
                  href="/instructor/grading"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm"
                >
                  Inspect & Grade Submissions <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
