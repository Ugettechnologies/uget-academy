'use client';

import React, { useState } from 'react';
import { Users, Search, FileText, CheckCircle, Clock, Eye, Download, Shield } from 'lucide-react';

interface StudentRecord {
  id: string;
  name: string;
  studentId: string;
  courseTrack: string;
  section: string;
  attendanceRate: string;
  documentStatus: 'VERIFIED' | 'PENDING' | 'MISSING';
  email: string;
}

export default function StaffStudentsPage() {
  const [students] = useState<StudentRecord[]>([
    {
      id: 'stu-1',
      name: 'Olamide Bakare',
      studentId: '2026/STU/A026',
      courseTrack: 'Software Engineering & Architecture',
      section: 'Section A (Morning)',
      attendanceRate: '94%',
      documentStatus: 'VERIFIED',
      email: 'olamide@uget.edu',
    },
    {
      id: 'stu-2',
      name: 'Chinedu Eze',
      studentId: '2026/STU/B104',
      courseTrack: 'Cybersecurity & Threat Intelligence',
      section: 'Section B (Afternoon)',
      attendanceRate: '88%',
      documentStatus: 'VERIFIED',
      email: 'chinedu@uget.edu',
    },
    {
      id: 'stu-3',
      name: 'Fatima Mohammed',
      studentId: '2026/STU/C089',
      courseTrack: 'Data Analytics & Predictive Modeling',
      section: 'Section A (Morning)',
      attendanceRate: '92%',
      documentStatus: 'PENDING',
      email: 'fatima@uget.edu',
    },
    {
      id: 'stu-4',
      name: 'Emeka Nwosu',
      studentId: '2026/STU/D210',
      courseTrack: 'UI/UX System Design & Wireframing',
      section: 'Section B (Afternoon)',
      attendanceRate: '96%',
      documentStatus: 'VERIFIED',
      email: 'emeka@uget.edu',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseTrack.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" /> Student Roster & Verification Documents
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            HR Staff maintenance for student cohort rosters, verification documents, and section placement.
          </p>
        </div>

        <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-3.5 py-2 text-xs text-indigo-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Staff Scope: View & Verify Documents Only</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by student name, ID, or course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0F172A] border border-white/10 text-xs text-white placeholder-gray-500 pl-9 pr-4 py-2.5 rounded-xl focus:border-indigo-400 focus:outline-none transition"
        />
        <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
      </div>

      {/* Students Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E293B] text-gray-300 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Course Track</th>
                <th className="py-3.5 px-4">Class Section</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Doc Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono text-indigo-300 text-[11px]">{s.studentId}</td>
                  <td className="py-3.5 px-4 text-gray-300">{s.courseTrack}</td>
                  <td className="py-3.5 px-4 text-gray-400">{s.section}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{s.attendanceRate}</td>
                  <td className="py-3.5 px-4">
                    {s.documentStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Docs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Student Verification File
            </h3>
            <div className="space-y-2 text-xs text-gray-300 border-t border-white/10 pt-3">
              <p><strong className="text-white">Student Name:</strong> {selectedStudent.name}</p>
              <p><strong className="text-white">Admission ID:</strong> {selectedStudent.studentId}</p>
              <p><strong className="text-white">Course Track:</strong> {selectedStudent.courseTrack}</p>
              <p><strong className="text-white">Email:</strong> {selectedStudent.email}</p>
              <p><strong className="text-white">Document Status:</strong> {selectedStudent.documentStatus}</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs space-y-1">
              <span className="font-bold text-white block">Submitted Identification & Qualifications</span>
              <p className="text-gray-400 text-[11px]">ID_Proof_{selectedStudent.studentId.replace(/\//g, '_')}.pdf (Verified by HR Staff)</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
