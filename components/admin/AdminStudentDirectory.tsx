'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  MessageSquare, 
  Check, 
  BarChart3, 
  Calendar, 
  FileSpreadsheet, 
  Layers 
} from 'lucide-react';

interface StudentDirectoryItem {
  id: string;
  name: string;
  admissionNo: string;
  email: string;
  courseTitle: string;
  classSection: string;
  attendancePercent: number;
  assignmentsCompleted: string;
  examScore: number;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'FLAGGED';
}

export default function AdminStudentDirectory() {
  const [students, setStudents] = useState<StudentDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const users = await res.json();
          const studentUsers = users
            .filter((u: any) => u.role === 'STUDENT')
            .map((u: any) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              admissionNo: u.username || `2026/STU/${u.id.slice(-4).toUpperCase()}`,
              email: u.email,
              courseTitle: u.enrollments?.[0]?.course?.title || 'General Academy Track',
              classSection: 'Class Section A',
              attendancePercent: 100,
              assignmentsCompleted: '0 Completed',
              examScore: 0,
              attendanceStatus: 'PRESENT' as const,
            }));
          setStudents(studentUsers);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDrawerStudent, setActiveDrawerStudent] = useState<StudentDirectoryItem | null>(null);
  const [adminMessageInput, setAdminMessageInput] = useState('');
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [isAttendanceOverridden, setIsAttendanceOverridden] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessageInput.trim()) return;

    setIsMessageSent(true);
    setAdminMessageInput('');
    setTimeout(() => setIsMessageSent(false), 3000);
  };

  const handleOverrideAttendance = () => {
    if (!activeDrawerStudent) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === activeDrawerStudent.id
          ? { ...s, attendanceStatus: 'PRESENT', attendancePercent: Math.min(100, s.attendancePercent + 5) }
          : s
      )
    );

    setActiveDrawerStudent((prev) =>
      prev ? { ...prev, attendanceStatus: 'PRESENT', attendancePercent: Math.min(100, prev.attendancePercent + 5) } : null
    );

    setIsAttendanceOverridden(true);
    setTimeout(() => setIsAttendanceOverridden(false), 3000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search every enrolled student by name, ID, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
        </div>

        <span className="text-xs text-gray-400 font-mono font-bold">
          Total Enrolled: <strong className="text-emerald-400">{students.length} Student{students.length === 1 ? '' : 's'}</strong>
        </span>
      </div>

      {/* Directory Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Student & Admission ID</th>
                <th className="px-6 py-4">Enrolled Track</th>
                <th className="px-6 py-4">Class Section</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4">Exam Score</th>
                <th className="px-6 py-4 text-right">Profile Drawer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
                        {stu.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{stu.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400">{stu.admissionNo}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-300 font-medium">
                    {stu.courseTitle}
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/30">
                      {stu.classSection}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {stu.attendancePercent}% ({stu.attendanceStatus})
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-purple-300">
                    {stu.examScore}%
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setActiveDrawerStudent(stu)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition shadow-md"
                    >
                      Inspect Profile Drawer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Profile Drawer Modal */}
      {activeDrawerStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0F172A] border-l border-white/10 max-w-lg w-full h-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto custom-scrollbar relative text-white">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center">
                  {activeDrawerStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">{activeDrawerStudent.name}</h3>
                  <p className="text-xs text-emerald-400 font-mono">{activeDrawerStudent.admissionNo}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveDrawerStudent(null)}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Academic Performance & Attendance Overview */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Academic & Roster Overview</h4>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Enrolled Course</span>
                  <p className="font-bold text-white">{activeDrawerStudent.courseTitle}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Class Section</span>
                  <p className="font-bold text-cyan-300">{activeDrawerStudent.classSection}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Attendance</span>
                  <p className="font-bold text-emerald-400 text-sm">{activeDrawerStudent.attendancePercent}%</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Exam Score</span>
                  <p className="font-bold text-purple-300 text-sm">{activeDrawerStudent.examScore}%</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Deliverables</span>
                  <p className="font-bold text-blue-300 text-xs">{activeDrawerStudent.assignmentsCompleted}</p>
                </div>
              </div>
            </div>

            {/* Admin Override Controls */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Admin Attendance Override
              </h4>
              <p className="text-gray-400 text-[11px]">
                Admin can directly mark student attendance as Present or resolve flagged roll call warnings.
              </p>
              {isAttendanceOverridden && (
                <span className="text-[11px] text-emerald-400 font-bold block">
                  ✓ Attendance status overridden to PRESENT!
                </span>
              )}
              <button
                type="button"
                onClick={handleOverrideAttendance}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
              >
                Mark Attendance Present Directly
              </button>
            </div>

            {/* Direct Messaging to Student */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Direct Message Student
              </h4>
              <form onSubmit={handleSendMessage} className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Type an official admin message to student..."
                  value={adminMessageInput}
                  onChange={(e) => setAdminMessageInput(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                {isMessageSent && (
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    ✓ Official Admin Message Dispatched!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!adminMessageInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition shadow-md disabled:opacity-50"
                >
                  Send Direct Message
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
