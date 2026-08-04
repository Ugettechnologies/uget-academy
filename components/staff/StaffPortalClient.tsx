'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Users, 
  GraduationCap, 
  FileText, 
  AlertCircle, 
  Calendar, 
  Bell, 
  Send, 
  FolderLock, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  LogOut,
  Download,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface StaffPortalClientProps {
  user: StaffUser;
}

export default function StaffPortalClient({ user }: StaffPortalClientProps) {
  const [activeTab, setActiveTab] = useState<
    'RECRUITMENT' | 'STAFF_DATA' | 'STUDENTS' | 'ACTIVITY' | 'COMPLAINTS' | 'MEETINGS' | 'EVENTS' | 'DOCUMENTS' | 'REPORTS'
  >('RECRUITMENT');

  // Tab Data States
  const [candidates, setCandidates] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any>({ stats: {}, activityLogs: [] });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Modals / Inputs
  const [candidateModal, setCandidateModal] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '', phone: '', position: 'Software Engineer Instructor', stage: 'APPLIED', notes: '' });

  const [docModal, setDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', category: 'CONTRACT', fileUrl: '' });

  const [complaintModal, setComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ subject: '', details: '', priority: 'MEDIUM' });

  const [meetingModal, setMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', description: '', date: '', time: '', location: 'Boardroom' });

  const [eventModal, setEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', eventDate: '', location: 'Academy Hall', targetAudience: 'ALL' });

  const [reportModal, setReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', content: '', priority: 'NORMAL' });

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch tab data
  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'RECRUITMENT') {
        const res = await fetch('/api/staff/candidates');
        const data = await res.json();
        if (data.success) setCandidates(data.candidates);
      } else if (activeTab === 'STAFF_DATA') {
        const res = await fetch('/api/admin/staff');
        const data = await res.json();
        if (data.success) setStaffList(data.staff);
      } else if (activeTab === 'DOCUMENTS') {
        const res = await fetch('/api/staff/documents');
        const data = await res.json();
        if (data.success) setDocuments(data.documents);
      } else if (activeTab === 'COMPLAINTS') {
        const res = await fetch('/api/staff/complaints');
        const data = await res.json();
        if (data.success) setComplaints(data.complaints);
      } else if (activeTab === 'MEETINGS') {
        const res = await fetch('/api/staff/meetings');
        const data = await res.json();
        if (data.success) setMeetings(data.meetings);
      } else if (activeTab === 'EVENTS') {
        const res = await fetch('/api/staff/events');
        const data = await res.json();
        if (data.success) setEvents(data.events);
      } else if (activeTab === 'REPORTS') {
        const res = await fetch('/api/staff/reports');
        const data = await res.json();
        if (data.success) setReports(data.reports);
      } else if (activeTab === 'ACTIVITY') {
        const res = await fetch('/api/staff/activity');
        const data = await res.json();
        if (data.success) setActivityData(data);
      }
    } catch {
      showToast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  // Handlers
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Candidate added to hiring pipeline!');
        setCandidateModal(false);
        setCandidateForm({ name: '', email: '', phone: '', position: 'Software Engineer Instructor', stage: 'APPLIED', notes: '' });
        loadTabData();
      }
    } catch {
      showToast('error', 'Error adding candidate');
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Staff document saved successfully!');
        setDocModal(false);
        setDocForm({ title: '', category: 'CONTRACT', fileUrl: '' });
        loadTabData();
      }
    } catch {
      showToast('error', 'Error uploading document');
    }
  };

  const handleAddComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Complaint ticket submitted to HR & Admin!');
        setComplaintModal(false);
        setComplaintForm({ subject: '', details: '', priority: 'MEDIUM' });
        loadTabData();
      }
    } catch {
      showToast('error', 'Error submitting complaint');
    }
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Meeting scheduled!');
        setMeetingModal(false);
        setMeetingForm({ title: '', description: '', date: '', time: '', location: 'Boardroom' });
        loadTabData();
      }
    } catch {
      showToast('error', 'Error creating meeting');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Academy event posted!');
        setEventModal(false);
        setEventForm({ title: '', description: '', eventDate: '', location: 'Academy Hall', targetAudience: 'ALL' });
        loadTabData();
      }
    } catch {
      showToast('error', 'Error creating event');
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Report submitted up to Admin!');
        setReportModal(false);
        setReportForm({ title: '', content: '', priority: 'NORMAL' });
        loadTabData();
      }
    } catch {
      showToast('error', 'Error submitting report');
    }
  };

  const tabs = [
    { id: 'RECRUITMENT', label: 'Recruitment & Hiring', icon: Users, color: 'text-purple-400' },
    { id: 'STAFF_DATA', label: 'Staff Records', icon: UserCheck, color: 'text-teal-400' },
    { id: 'DOCUMENTS', label: 'Vitals & Documents', icon: FolderLock, color: 'text-amber-400' },
    { id: 'ACTIVITY', label: 'Activity Monitor', icon: Activity, color: 'text-emerald-400' },
    { id: 'COMPLAINTS', label: 'Staff Complaints', icon: AlertCircle, color: 'text-rose-400' },
    { id: 'MEETINGS', label: 'Meetings Calendar', icon: Calendar, color: 'text-cyan-400' },
    { id: 'EVENTS', label: 'Upcoming Events', icon: Bell, color: 'text-indigo-400' },
    { id: 'REPORTS', label: 'Report to Admin', icon: Send, color: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="h-16 bg-[#0F172A] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-tight">UGET Staff & Operations Portal</h1>
            <span className="text-[10px] text-teal-300 font-mono">Access Level: HR & Head of Academy</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Welcome, {user.firstName}</span>
          </div>

          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition"
            >
              &larr; Return to Admin
            </Link>
          )}

          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-2 flex gap-2 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                  active
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content Area */}
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[500px]">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
              <span className="text-xs text-gray-400 font-bold">Loading module data...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: RECRUITMENT & HIRING */}
              {activeTab === 'RECRUITMENT' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Recruitment & Hiring Pipeline</h2>
                      <p className="text-xs text-gray-400">Track candidates for instructor and staff positions</p>
                    </div>
                    <button
                      onClick={() => setCandidateModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Candidate
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['APPLIED', 'INTERVIEWING', 'HIRED'].map((stage) => {
                      const stageCandidates = candidates.filter((c) => c.stage === stage);
                      return (
                        <div key={stage} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-xs font-black text-teal-300 uppercase">{stage}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                              {stageCandidates.length}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {stageCandidates.length > 0 ? (
                              stageCandidates.map((cand) => (
                                <div key={cand.id} className="p-3 rounded-xl bg-[#1E293B] border border-white/5 space-y-1">
                                  <h4 className="text-xs font-bold text-white">{cand.name}</h4>
                                  <span className="text-[11px] text-gray-400 block">{cand.position}</span>
                                  <span className="text-[10px] text-gray-500 font-mono block">{cand.email}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-gray-500 italic py-4 text-center">No candidates in {stage.toLowerCase()}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: STAFF RECORDS */}
              {activeTab === 'STAFF_DATA' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-white">Staff Directory & Records</h2>
                    <p className="text-xs text-gray-400">Complete listing of non-instructor staff and administrators</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffList.map((st) => (
                      <div key={st.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                            {st.firstName.charAt(0)}{st.lastName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{st.firstName} {st.lastName}</h4>
                            <span className="text-[11px] text-teal-300 font-semibold">{st.staffProfile?.position || st.role}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1 border-t border-white/10 pt-2 font-mono">
                          <p>Email: {st.email}</p>
                          <p>Dept: {st.staffProfile?.department || 'Operations'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: VITALS & DOCUMENTS */}
              {activeTab === 'DOCUMENTS' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Staff Documentation, Vitals & Certificates</h2>
                      <p className="text-xs text-gray-400">Contracts, medical vitals, ID proofs, and certifications repository</p>
                    </div>
                    <button
                      onClick={() => setDocModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Upload Staff Document
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold uppercase">
                            {doc.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                          View File <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ACTIVITY MONITOR */}
              {activeTab === 'ACTIVITY' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-white">Instructor & Student Activity Monitor</h2>
                    <p className="text-xs text-gray-400">Real-time log of student lesson watching, logins, and attendance</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-xs text-gray-400 block font-bold">Total Active Students</span>
                      <span className="text-2xl font-black text-emerald-400">{activityData.stats?.activeStudentsCount || 0}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-xs text-gray-400 block font-bold">Assigned Instructors</span>
                      <span className="text-2xl font-black text-purple-400">{activityData.stats?.totalInstructorsCount || 0}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-xs text-gray-400 block font-bold">Lesson Logs Tracked</span>
                      <span className="text-2xl font-black text-cyan-400">{activityData.stats?.attendanceLogsCount || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activityData.activityLogs?.map((log: any) => (
                      <div key={log.id} className="p-3 rounded-xl bg-[#1E293B] border border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-bold text-white">{log.user?.firstName} {log.user?.lastName}</span>
                            <span className="text-gray-400 text-[11px] block">{log.action} • {log.details || 'No extra info'}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: STAFF COMPLAINTS */}
              {activeTab === 'COMPLAINTS' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Staff Complaints & Ticket Box</h2>
                      <p className="text-xs text-gray-400">Log internal complaints and monitor resolution status</p>
                    </div>
                    <button
                      onClick={() => setComplaintModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Submit Complaint
                    </button>
                  </div>

                  <div className="space-y-3">
                    {complaints.map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{c.subject}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">{c.details}</p>
                        {c.adminNote && (
                          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
                            <strong>Admin Note:</strong> {c.adminNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: MEETINGS */}
              {activeTab === 'MEETINGS' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Organize & View Meetings</h2>
                      <p className="text-xs text-gray-400">Schedule academy meetings and link agendas</p>
                    </div>
                    <button
                      onClick={() => setMeetingModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Schedule Meeting
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meetings.map((m) => (
                      <div key={m.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-cyan-400">{m.date} at {m.time}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{m.location}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{m.title}</h4>
                        <p className="text-xs text-gray-300">{m.description || 'No description'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: EVENTS */}
              {activeTab === 'EVENTS' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Upcoming Events Bulletin</h2>
                      <p className="text-xs text-gray-400">Post upcoming events for academy staff and students</p>
                    </div>
                    <button
                      onClick={() => setEventModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Post Event
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((ev) => (
                      <div key={ev.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                          {ev.targetAudience}
                        </span>
                        <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                        <p className="text-xs text-gray-300">{ev.description}</p>
                        <span className="text-[11px] text-indigo-300 font-mono block">Location: {ev.location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: REPORT TO ADMIN */}
              {activeTab === 'REPORTS' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Operational Reports up to Admin</h2>
                      <p className="text-xs text-gray-400">Compose and send formal reports directly to the Super Admin</p>
                    </div>
                    <button
                      onClick={() => setReportModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-extrabold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Submit Report to Admin
                    </button>
                  </div>

                  <div className="space-y-3">
                    {reports.map((rep) => (
                      <div key={rep.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{rep.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            rep.status === 'REVIEWED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {rep.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">{rep.content}</p>
                        {rep.adminReply && (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
                            <strong>Admin Reply:</strong> {rep.adminReply}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL HANDLERS */}
      {candidateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <h3 className="text-base font-bold">Add Hiring Candidate</h3>
            <form onSubmit={handleAddCandidate} className="space-y-3">
              <input required type="text" placeholder="Candidate Full Name" value={candidateForm.name} onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <input required type="email" placeholder="Email Address" value={candidateForm.email} onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <input type="text" placeholder="Phone Number" value={candidateForm.phone} onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <input required type="text" placeholder="Target Position" value={candidateForm.position} onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCandidateModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold">Save Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {docModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <h3 className="text-base font-bold">Upload Staff Document / Vitals</h3>
            <form onSubmit={handleAddDoc} className="space-y-3">
              <input required type="text" placeholder="Document Title (e.g. Staff Contract 2026)" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <select value={docForm.category} onChange={(e) => setDocForm({ ...docForm, category: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white">
                <option value="CONTRACT">CONTRACT</option>
                <option value="ID_PROOF">ID PROOF</option>
                <option value="CERTIFICATE">CERTIFICATE</option>
                <option value="VITALS">VITALS</option>
              </select>
              <input required type="text" placeholder="Cloudinary File URL" value={docForm.fileUrl} onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDocModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {complaintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <h3 className="text-base font-bold">Submit Staff Complaint</h3>
            <form onSubmit={handleAddComplaint} className="space-y-3">
              <input required type="text" placeholder="Subject" value={complaintForm.subject} onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <textarea required placeholder="Details of complaint..." value={complaintForm.details} onChange={(e) => setComplaintForm({ ...complaintForm, details: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white h-24" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setComplaintModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-rose-500 text-slate-950 font-bold">Submit Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {meetingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <h3 className="text-base font-bold">Schedule Academy Meeting</h3>
            <form onSubmit={handleAddMeeting} className="space-y-3">
              <input required type="text" placeholder="Meeting Title" value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <input required type="date" value={meetingForm.date} onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <input required type="time" value={meetingForm.time} onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <input type="text" placeholder="Location / Link" value={meetingForm.location} onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setMeetingModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <h3 className="text-base font-bold">Post Event Info</h3>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <input required type="text" placeholder="Event Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <textarea required placeholder="Event description..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white h-20" />
              <input required type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEventModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-indigo-500 text-slate-950 font-bold">Post Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <h3 className="text-base font-bold">Submit Operational Report to Admin</h3>
            <form onSubmit={handleAddReport} className="space-y-3">
              <input required type="text" placeholder="Report Title" value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white" />
              <textarea required placeholder="Write operational summary and details..." value={reportForm.content} onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })} className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white h-28" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReportModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-blue-500 text-white font-bold">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
