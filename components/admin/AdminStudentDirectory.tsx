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
  Layers,
  Upload,
  Key,
  FileText,
  Loader2
} from 'lucide-react';
import CredentialDispatchModal, { CredentialData } from '@/components/admin/CredentialDispatchModal';

interface StudentDirectoryItem {
  id: string;
  name: string;
  admissionNo: string;
  email: string;
  phone?: string | null;
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

  const fetchStudents = async () => {
    setLoading(true);
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
            phone: u.phone,
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

  useEffect(() => {
    fetchStudents();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDrawerStudent, setActiveDrawerStudent] = useState<StudentDirectoryItem | null>(null);
  const [adminMessageInput, setAdminMessageInput] = useState('');
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [isAttendanceOverridden, setIsAttendanceOverridden] = useState(false);

  // File Upload & Data Sync Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');

  // Credential Dispatch Modal State
  const [activeDispatchModal, setActiveDispatchModal] = useState(false);
  const [dispatchData, setDispatchData] = useState<CredentialData | null>(null);

  const handleDispatchStudentCredentials = async (stu: StudentDirectoryItem) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: stu.id,
          action: 'RESET_PASSWORD',
        }),
      });
      const data = await res.json();

      if (res.ok && data.passwordCode) {
        setDispatchData({
          name: stu.name,
          username: data.username || stu.admissionNo,
          passwordCode: data.passwordCode,
          email: stu.email,
          phone: stu.phone,
          role: 'STUDENT',
        });
        setActiveDispatchModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      let studentList: any[] = [];

      try {
        if (file.name.endsWith('.json')) {
          studentList = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
          if (lines.length < 2) return;

          const headers = lines[0].toLowerCase().split(',');
          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            if (row.length === 0) continue;

            const nameIdx = headers.findIndex((h) => h.includes('name'));
            const emailIdx = headers.findIndex((h) => h.includes('email'));
            const phoneIdx = headers.findIndex((h) => h.includes('phone'));

            const fullName = nameIdx !== -1 ? row[nameIdx] : `${row[0]} ${row[1] || ''}`;
            const email = emailIdx !== -1 ? row[emailIdx] : row[1];
            const phone = phoneIdx !== -1 ? row[phoneIdx] : row[2];

            if (email && email.includes('@')) {
              studentList.push({
                name: fullName || 'Enrolled Student',
                email: email,
                phone: phone || null,
              });
            }
          }
        }

        if (studentList.length > 0) {
          executeImport(studentList);
        } else {
          setUploadStatus('Invalid file format or no valid student rows found.');
        }
      } catch (err) {
        setUploadStatus('Error reading file. Please check CSV/JSON syntax.');
      }
    };

    reader.readAsText(file);
  };

  const executeImport = async (studentList: any[]) => {
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const res = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentList }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUploadStatus(`✓ ${data.message}`);
        fetchStudents();
        setJsonText('');
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadStatus(null);
        }, 2500);
      } else {
        setUploadStatus(data.error || 'Failed to import student roster');
      }
    } catch (e) {
      setUploadStatus('Network error importing student records');
    } finally {
      setIsUploading(false);
    }
  };

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
      {/* Search & Upload Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search enrolled students by name, admission ID, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-gray-400 font-mono font-bold">
            Total Enrolled: <strong className="text-emerald-400">{students.length} Student{students.length === 1 ? '' : 's'}</strong>
          </span>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Import Student Roster (.CSV / .JSON)
          </button>
        </div>
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
                <th className="px-6 py-4 text-right">Actions & Credentials</th>
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

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDispatchStudentCredentials(stu)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Send Login Credentials via WhatsApp or Email"
                      >
                        <Key className="w-3.5 h-3.5" /> Send Credentials
                      </button>

                      <button
                        onClick={() => setActiveDrawerStudent(stu)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition shadow-md cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
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

            {/* Credential Dispatch Action inside Drawer */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" /> Student Login Credentials
              </h4>
              <p className="text-gray-300 text-[11px]">
                Send auto-generated Username ID ({activeDrawerStudent.admissionNo}) and Password Code directly to student via WhatsApp or Email.
              </p>
              <button
                type="button"
                onClick={() => handleDispatchStudentCredentials(activeDrawerStudent)}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4" /> Open WhatsApp / Email Credential Dispatch
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
                  className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Send Direct Message
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal (.CSV & .JSON) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" /> Import Student Roster (.CSV / .JSON)
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Upload a student roster file (.csv or .json) containing student names, emails, and phone numbers to automatically create student accounts and assign auto-generated login credentials.
            </p>

            {/* File Drag-and-Drop Box */}
            <div className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 rounded-2xl p-6 text-center space-y-3 transition">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
              <div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs inline-block shadow-md">
                  Browse & Upload .CSV / .JSON File
                  <input
                    type="file"
                    accept=".csv, .json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">
                  Supported columns: name, email, phone (or CSV header: firstName, lastName, email)
                </p>
              </div>
            </div>

            {/* Option 2: Paste JSON */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-300 block">Or Paste Raw JSON Student Array:</span>
              <textarea
                rows={4}
                placeholder='[{"name": "John Doe", "email": "john@example.com", "phone": "08012345678"}]'
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                disabled={isUploading || !jsonText.trim()}
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonText);
                    if (Array.isArray(parsed)) executeImport(parsed);
                    else setUploadStatus('JSON payload must be an array of student objects.');
                  } catch {
                    setUploadStatus('Invalid JSON format.');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? 'Importing Roster...' : 'Import Pasted JSON Roster'}
              </button>
            </div>

            {uploadStatus && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-cyan-300 font-mono">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credential Dispatch Modal */}
      <CredentialDispatchModal
        isOpen={activeDispatchModal}
        onClose={() => setActiveDispatchModal(false)}
        credentials={dispatchData}
      />
    </div>
  );
}

