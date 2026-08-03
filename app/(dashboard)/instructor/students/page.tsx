'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  BookOpen, 
  FileSpreadsheet, 
  GraduationCap, 
  User, 
  MessageCircle, 
  Award,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface StudentRosterItem {
  id: string;
  name: string;
  admissionNo: string;
  email: string;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'FLAGGED';
  attendancePercent: number;
  assignmentsCompleted: string;
  examScore: number;
  overallStatus: 'ON_TRACK' | 'NEEDS_ATTENTION' | 'CRITICAL';
}

export default function InstructorStudentsPage() {
  const courseTitle = 'Cybersecurity & Threat Intelligence';

  const [students] = useState<StudentRosterItem[]>([
    {
      id: 'stu-1',
      name: 'Grace Hopper',
      admissionNo: '2026/STU/A012',
      email: 'grace.h@uget-enrollment.online',
      attendanceStatus: 'PRESENT',
      attendancePercent: 96,
      assignmentsCompleted: '4 / 4 Completed',
      examScore: 92,
      overallStatus: 'ON_TRACK',
    },
    {
      id: 'stu-2',
      name: 'Alan Turing',
      admissionNo: '2026/STU/A088',
      email: 'alan.t@uget-enrollment.online',
      attendanceStatus: 'PRESENT',
      attendancePercent: 100,
      assignmentsCompleted: '4 / 4 Completed',
      examScore: 95,
      overallStatus: 'ON_TRACK',
    },
    {
      id: 'stu-3',
      name: 'Margaret Hamilton',
      admissionNo: '2026/STU/A044',
      email: 'margaret.h@uget-enrollment.online',
      attendanceStatus: 'FLAGGED',
      attendancePercent: 70,
      assignmentsCompleted: '2 / 4 Completed',
      examScore: 68,
      overallStatus: 'NEEDS_ATTENTION',
    },
    {
      id: 'stu-4',
      name: 'John von Neumann',
      admissionNo: '2026/STU/A102',
      email: 'john.v@uget-enrollment.online',
      attendanceStatus: 'ABSENT',
      attendancePercent: 55,
      assignmentsCompleted: '1 / 4 Completed',
      examScore: 50,
      overallStatus: 'CRITICAL',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-purple-500/30">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Track: {courseTitle}
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <Users className="w-7 h-7 text-emerald-400" />
            Assigned Student Roster & Attendance Tracking
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Single view after roll call closes to track attendance, assignments, exam performance, and student status.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search student by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Student & Admission ID</th>
                <th className="px-6 py-4">Roll Call Status</th>
                <th className="px-6 py-4">Attendance %</th>
                <th className="px-6 py-4">Deliverables</th>
                <th className="px-6 py-4">Exam Score</th>
                <th className="px-6 py-4">Track Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-white/5 transition">
                  {/* Name & ID */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30 shrink-0">
                        {stu.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{stu.name}</span>
                        <span className="text-[10px] font-mono text-purple-300">{stu.admissionNo}</span>
                      </div>
                    </div>
                  </td>

                  {/* Roll Call Status */}
                  <td className="px-6 py-4">
                    {stu.attendanceStatus === 'PRESENT' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Present
                      </span>
                    )}
                    {stu.attendanceStatus === 'FLAGGED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" /> Flagged (Missed Roll Call)
                      </span>
                    )}
                    {stu.attendanceStatus === 'ABSENT' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                        <XCircle className="w-3 h-3" /> Absent
                      </span>
                    )}
                  </td>

                  {/* Attendance % */}
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {stu.attendancePercent}%
                  </td>

                  {/* Deliverables */}
                  <td className="px-6 py-4 text-gray-300 font-medium">
                    {stu.assignmentsCompleted}
                  </td>

                  {/* Exam Score */}
                  <td className="px-6 py-4 font-mono font-bold text-purple-300">
                    {stu.examScore}%
                  </td>

                  {/* Overall Status */}
                  <td className="px-6 py-4">
                    {stu.overallStatus === 'ON_TRACK' && (
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        On Track
                      </span>
                    )}
                    {stu.overallStatus === 'NEEDS_ATTENTION' && (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                        Needs Attention
                      </span>
                    )}
                    {stu.overallStatus === 'CRITICAL' && (
                      <span className="text-[10px] font-extrabold uppercase bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full border border-red-500/30 animate-pulse">
                        At Risk
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedStudent(stu)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs transition border border-white/10"
                    >
                      View Student Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-white">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-black text-base flex items-center justify-center">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{selectedStudent.name}</h3>
                  <p className="text-xs text-purple-300 font-mono">{selectedStudent.admissionNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Email Contact</span>
                <p className="font-mono text-white">{selectedStudent.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Attendance</span>
                  <p className="font-bold text-emerald-400">{selectedStudent.attendancePercent}%</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Exam Performance</span>
                  <p className="font-bold text-purple-300">{selectedStudent.examScore}%</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex gap-3">
              <Link
                href="/instructor/grading"
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl text-center transition"
              >
                Grade Deliverables
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
