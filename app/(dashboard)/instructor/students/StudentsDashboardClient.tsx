'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Award, 
  FileText, 
  BookOpen, 
  Users, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Loader2, 
  Edit, 
  Video,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  BarChart3,
  X
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string; // for attendance
  marked?: boolean; // for attendance
  score?: number; // for grades
  creativeScore?: number;
  interviewScore?: number;
  remarks?: string;
  gradedBy?: string;
}

interface WeeklyReport {
  id: string;
  weekNumber: number;
  summary: string;
  challenges?: string;
  nextSteps?: string;
  submittedAt: string;
}

interface CourseTopic {
  id: string;
  title: string;
  description?: string;
  content: string;
  videoUrl?: string;
  createdAt: string;
}

interface Exam {
  id?: string;
  practicalTask: string;
  interviewQns: string;
}

interface Props {
  courses: Course[];
  session: {
    userId: string;
    role: string;
  };
}

type TabType = 'attendance' | 'grading' | 'reports' | 'topics' | 'exams';

export default function StudentsDashboardClient({ courses, session }: Props) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses.length > 0 ? courses[0].id : ''
  );
  const [activeTab, setActiveTab] = useState<TabType>('attendance');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT'>('ALL');
  const [inspectingStudent, setInspectingStudent] = useState<Student | null>(null);

  // Tab Data
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [exam, setExam] = useState<Exam>({ practicalTask: '', interviewQns: '' });

  // Modals / Add Forms visibility
  const [showReportForm, setShowReportForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  // Form states
  const [reportForm, setReportForm] = useState({
    weekNumber: 1,
    summary: '',
    challenges: '',
    nextSteps: '',
  });

  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
  });

  // Auto-clear messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch data depending on active tab and course
  const fetchData = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'attendance') {
        const res = await fetch(
          `/api/instructor/attendance?courseId=${selectedCourseId}&date=${attendanceDate}`
        );
        if (!res.ok) throw new Error('Failed to fetch attendance data');
        const data = await res.json();
        setStudents(data);
      } else if (activeTab === 'grading') {
        const res = await fetch(`/api/instructor/grades?courseId=${selectedCourseId}`);
        if (!res.ok) throw new Error('Failed to fetch grades');
        const data = await res.json();
        setStudents(data);
      } else if (activeTab === 'reports') {
        const res = await fetch(`/api/instructor/reports?courseId=${selectedCourseId}`);
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
      } else if (activeTab === 'topics') {
        const res = await fetch(`/api/instructor/topics?courseId=${selectedCourseId}`);
        if (!res.ok) throw new Error('Failed to fetch topics');
        const data = await res.json();
        setTopics(data);
      } else if (activeTab === 'exams') {
        const res = await fetch(`/api/instructor/exams?courseId=${selectedCourseId}`);
        if (!res.ok) throw new Error('Failed to fetch exams');
        const data = await res.json();
        if (data) {
          setExam(data);
        } else {
          setExam({ practicalTask: '', interviewQns: '' });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCourseId, activeTab]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchData();
    }
  }, [attendanceDate]);

  // Computed KPIs for Selected Course
  const enrolledCount = students.length;
  const presentCount = students.filter((s) => s.status === 'PRESENT' || s.status === 'LATE').length;
  const attendanceRate = enrolledCount > 0 ? Math.round((presentCount / enrolledCount) * 100) : 0;
  
  const gradedStudents = students.filter((s) => typeof s.score === 'number' && s.score > 0);
  const avgGradeScore = gradedStudents.length > 0
    ? Math.round(gradedStudents.reduce((sum, s) => sum + (s.score || 0), 0) / gradedStudents.length)
    : 0;

  // Filtered Students list
  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const email = s.email.toLowerCase();
    const query = studentSearch.toLowerCase();
    const matchesSearch = fullName.includes(query) || email.includes(query);

    if (activeTab === 'attendance' && attendanceStatusFilter !== 'ALL') {
      return matchesSearch && (s.status === attendanceStatusFilter || (!s.status && attendanceStatusFilter === 'ABSENT'));
    }

    return matchesSearch;
  });

  // Batch Attendance Actions
  const handleBatchAttendance = (status: 'PRESENT' | 'ABSENT') => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status,
        marked: true,
      }))
    );
    setSuccessMsg(`All students marked as ${status}. Click "Save Attendance" to apply.`);
  };

  // Letter Grade Helper
  const getLetterBadge = (score: number) => {
    if (score >= 90) return { label: 'A+', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    if (score >= 80) return { label: 'A', bg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' };
    if (score >= 70) return { label: 'B', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
    if (score >= 50) return { label: 'C', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    return { label: 'F', bg: 'bg-red-500/10 text-red-500 border-red-500/20' };
  };

  // 1. Attendance actions
  const handleAttendanceChange = (userId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudents((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, status, marked: true } : s))
    );
  };

  const saveAttendance = async () => {
    setSaving(true);
    setError(null);
    try {
      const attendanceList = students.map((s) => ({
        userId: s.userId,
        status: s.status || 'ABSENT',
      }));

      const res = await fetch('/api/instructor/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          date: attendanceDate,
          attendanceList,
        }),
      });

      if (!res.ok) throw new Error('Failed to save attendance');
      setSuccessMsg('Attendance records saved successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  // 2. Grading actions
  const handleGradeChange = (userId: string, field: keyof Student, value: any) => {
    setStudents((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, [field]: value } : s))
    );
  };

  const saveStudentGrade = async (student: Student) => {
    setSaving(student.userId);
    setError(null);
    try {
      const res = await fetch('/api/instructor/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          userId: student.userId,
          score: student.score || 0,
          creativeScore: student.creativeScore || 0,
          interviewScore: student.interviewScore || 0,
          remarks: student.remarks || '',
        }),
      });

      if (!res.ok) throw new Error('Failed to save student grade');
      setSuccessMsg(`Grades updated for ${student.firstName} ${student.lastName}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update grades.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Weekly Report actions
  const submitWeeklyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/instructor/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          ...reportForm,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit weekly report');
      setSuccessMsg('Weekly report submitted successfully.');
      setShowReportForm(false);
      setReportForm({ weekNumber: reportForm.weekNumber + 1, summary: '', challenges: '', nextSteps: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setSaving(false);
    }
  };

  // 4. Topic actions
  const submitTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = '/api/instructor/topics';
      const method = editingTopicId ? 'PUT' : 'POST';
      const body = editingTopicId 
        ? { topicId: editingTopicId, ...topicForm }
        : { courseId: selectedCourseId, ...topicForm };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save course topic');
      setSuccessMsg(editingTopicId ? 'Topic updated successfully.' : 'Topic created successfully.');
      setShowTopicForm(false);
      setEditingTopicId(null);
      setTopicForm({ title: '', description: '', content: '', videoUrl: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save topic.');
    } finally {
      setSaving(false);
    }
  };

  const startEditTopic = (topic: CourseTopic) => {
    setEditingTopicId(topic.id);
    setTopicForm({
      title: topic.title,
      description: topic.description || '',
      content: topic.content,
      videoUrl: topic.videoUrl || '',
    });
    setShowTopicForm(true);
  };

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    setSaving(topicId);
    setError(null);
    try {
      const res = await fetch(`/api/instructor/topics?topicId=${topicId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete topic');
      setSuccessMsg('Topic deleted successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete topic.');
    } finally {
      setSaving(false);
    }
  };

  // 5. Exam actions
  const saveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/instructor/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          practicalTask: exam.practicalTask,
          interviewQns: exam.interviewQns,
        }),
      });

      if (!res.ok) throw new Error('Failed to save exam details');
      setSuccessMsg('Exam configuration saved successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save exam configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-16 h-16 text-slate-400" />
        <h3 className="text-xl font-bold text-slate-950 dark:text-white">No Courses Found</h3>
        <p className="text-slate-500 max-w-md text-sm">
          Before managing students, you must create a course container. Head over to the courses panel to start.
        </p>
        <a
          href="/instructor/courses"
          className="inline-flex items-center justify-center rounded-lg bg-brand-primary text-white font-semibold py-2 px-5 text-sm transition hover:bg-brand-primary/95 shadow-md shadow-brand-primary/10"
        >
          Create a Course
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner & Course Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-primary" />
            Instructor Student Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track daily class attendance, assign grades, manage curriculum topics, and organize course exams.
          </p>
        </div>
        <div className="w-full md:w-auto min-w-[260px]">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Active Course Selection
          </label>
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 pr-10 text-sm font-semibold text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stat Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Enrolled Class</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{enrolledCount}</h4>
          <p className="text-[10px] text-slate-400">Students in this course</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Attendance Rate</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <h4 className="text-2xl font-black text-emerald-500 mt-2">{attendanceRate}%</h4>
          <p className="text-[10px] text-slate-400">Present on {new Date(attendanceDate).toLocaleDateString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Class Avg Score</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <h4 className="text-2xl font-black text-indigo-500 mt-2">{avgGradeScore}%</h4>
          <p className="text-[10px] text-slate-400">{gradedStudents.length} students graded</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Course Topics</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{topics.length}</h4>
          <p className="text-[10px] text-slate-400">Curriculum topics published</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 sm:gap-4 scrollbar-none">
        {[
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'grading', label: 'Grading & Scores', icon: Award },
          { id: 'reports', label: 'Weekly Reports', icon: FileText },
          { id: 'topics', label: 'Course Topics', icon: BookOpen },
          { id: 'exams', label: 'Course Exams', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition whitespace-nowrap focus:outline-none ${
                active 
                  ? 'border-brand-primary text-brand-primary dark:text-white' 
                  : 'border-transparent text-slate-450 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-brand-primary' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-350 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-350 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {/* Tab Panels */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            <span className="text-xs font-semibold">Loading data...</span>
          </div>
        ) : (
          <div className="animate-fade-in">
            
            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Attendance Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Daily Class Attendance Log</h3>
                    <p className="text-xs text-slate-400">Select a date, search students, or use batch status presets.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Date Picker */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* Batch Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleBatchAttendance('PRESENT')}
                        className="px-2.5 py-1.5 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg transition"
                      >
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBatchAttendance('ABSENT')}
                        className="px-2.5 py-1.5 text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition"
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      placeholder="Filter student name or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={attendanceStatusFilter}
                      onChange={(e) => setAttendanceStatusFilter(e.target.value as any)}
                      className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late</option>
                      <option value="ABSENT">Absent</option>
                    </select>
                  </div>
                </div>

                {/* Students Attendance Table */}
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No students found matching your criteria.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-4 pl-0">Student Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4 text-center">Mark Status</th>
                            <th className="py-3 px-4 text-right">View Scorecard</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                          {filteredStudents.map((student) => (
                            <tr key={student.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                              <td className="py-3.5 px-4 pl-0 font-bold text-slate-900 dark:text-slate-100">
                                {student.firstName} {student.lastName}
                              </td>
                              <td className="py-3.5 px-4 text-slate-400 font-mono">{student.email}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl w-max mx-auto border border-slate-200 dark:border-slate-800">
                                  {[
                                    { id: 'PRESENT', label: 'Present', color: 'bg-emerald-500 text-white shadow-xs', inactiveColor: 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                                    { id: 'LATE', label: 'Late', color: 'bg-amber-500 text-white shadow-xs', inactiveColor: 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                                    { id: 'ABSENT', label: 'Absent', color: 'bg-red-500 text-white shadow-xs', inactiveColor: 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                                  ].map((opt) => {
                                    const selected = student.status === opt.id;
                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleAttendanceChange(student.userId, opt.id as any)}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                          selected ? opt.color : opt.inactiveColor
                                        }`}
                                      >
                                        {opt.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => setInspectingStudent(student)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary/10 text-slate-700 dark:text-slate-300 hover:text-brand-primary font-semibold text-[11px] transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Preview</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={saveAttendance}
                        disabled={saving === true}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 px-6 text-xs transition shadow-md cursor-pointer"
                      >
                        {saving === true ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Attendance Records
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GRADING TAB */}
            {activeTab === 'grading' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Performance Gradebook</h3>
                    <p className="text-xs text-slate-400">Log scores for exam performance, practical exercises, and interview assessments.</p>
                  </div>

                  <div className="relative w-full md:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No enrolled students found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4 pl-0 min-w-[160px]">Student</th>
                          <th className="py-3 px-4 text-center">Grade</th>
                          <th className="py-3 px-4 text-center min-w-[90px]">Overall Score (0-100)</th>
                          <th className="py-3 px-4 text-center min-w-[90px]">Practical Score (0-100)</th>
                          <th className="py-3 px-4 text-center min-w-[90px]">Interview Score (0-100)</th>
                          <th className="py-3 px-4 min-w-[200px]">Instructor Remarks</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {filteredStudents.map((student) => {
                          const currentScore = student.score || 0;
                          const letterBadge = getLetterBadge(currentScore);

                          return (
                            <tr key={student.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                              <td className="py-3 px-4 pl-0 font-bold text-slate-900 dark:text-slate-100">
                                <div>{student.firstName} {student.lastName}</div>
                                <span className="text-[10px] text-slate-400 font-normal font-mono">{student.email}</span>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black uppercase border ${letterBadge.bg}`}>
                                  {letterBadge.label}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={student.score || 0}
                                  onChange={(e) => handleGradeChange(student.userId, 'score', Number(e.target.value))}
                                  className="w-16 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-bold px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                />
                              </td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={student.creativeScore || 0}
                                  onChange={(e) => handleGradeChange(student.userId, 'creativeScore', Number(e.target.value))}
                                  className="w-16 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-bold px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                />
                              </td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={student.interviewScore || 0}
                                  onChange={(e) => handleGradeChange(student.userId, 'interviewScore', Number(e.target.value))}
                                  className="w-16 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-bold px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  placeholder="Add comments..."
                                  value={student.remarks || ''}
                                  onChange={(e) => handleGradeChange(student.userId, 'remarks', e.target.value)}
                                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                />
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => saveStudentGrade(student)}
                                  disabled={saving === student.userId}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-1.5 px-3 text-xs transition shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                  {saving === student.userId ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  Save
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* WEEKLY REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Weekly Class Performance Reports</h3>
                    <p className="text-xs text-slate-400">Document classroom milestones, student challenges, and roadmap plans.</p>
                  </div>
                  {!showReportForm && (
                    <button
                      onClick={() => setShowReportForm(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 px-4 text-xs transition shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Report
                    </button>
                  )}
                </div>

                {showReportForm && (
                  <form onSubmit={submitWeeklyReport} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Submit Weekly Report</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Week Number</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={reportForm.weekNumber}
                          onChange={(e) => setReportForm({ ...reportForm, weekNumber: Number(e.target.value) })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Weekly Summary</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Summarize course progress, student achievements, etc."
                          value={reportForm.summary}
                          onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Challenges Observed</label>
                        <textarea
                          rows={3}
                          placeholder="Describe any issues students had..."
                          value={reportForm.challenges}
                          onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Next Steps & Plans</label>
                        <textarea
                          rows={3}
                          placeholder="List plans for upcoming week..."
                          value={reportForm.nextSteps}
                          onChange={(e) => setReportForm({ ...reportForm, nextSteps: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReportForm(false)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 font-semibold py-2 px-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving === true}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-primary text-white font-bold py-2 px-5 text-xs transition hover:bg-brand-primary/90 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {saving === true && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Submit Report
                      </button>
                    </div>
                  </form>
                )}

                {reports.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs shadow-sm">
                    No weekly reports submitted for this course yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((rep) => (
                      <div key={rep.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                            Week {rep.weekNumber} Report
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Submitted: {new Date(rep.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{rep.summary}</p>
                        {(rep.challenges || rep.nextSteps) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                            {rep.challenges && (
                              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                                <span className="font-bold text-[10px] uppercase text-amber-600 block">Challenges</span>
                                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{rep.challenges}</p>
                              </div>
                            )}
                            {rep.nextSteps && (
                              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                                <span className="font-bold text-[10px] uppercase text-indigo-600 block">Next Steps</span>
                                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{rep.nextSteps}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COURSE TOPICS TAB */}
            {activeTab === 'topics' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Curriculum Topics</h3>
                    <p className="text-xs text-slate-400">Publish module outlines and video references for students.</p>
                  </div>
                  {!showTopicForm && (
                    <button
                      onClick={() => {
                        setEditingTopicId(null);
                        setTopicForm({ title: '', description: '', content: '', videoUrl: '' });
                        setShowTopicForm(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 px-4 text-xs transition shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Topic
                    </button>
                  )}
                </div>

                {showTopicForm && (
                  <form onSubmit={submitTopic} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingTopicId ? 'Edit Topic' : 'Add New Topic'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Topic Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Introduction to Next.js App Router"
                          value={topicForm.title}
                          onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Video Resource URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://youtube.com/..."
                          value={topicForm.videoUrl}
                          onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Short Description</label>
                      <input
                        type="text"
                        placeholder="Brief overview..."
                        value={topicForm.description}
                        onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                        className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Content / Outline</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Detailed topic outline or study notes..."
                        value={topicForm.content}
                        onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                        className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowTopicForm(false)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 font-semibold py-2 px-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving === true}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-primary text-white font-bold py-2 px-5 text-xs transition hover:bg-brand-primary/90 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {saving === true && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save Topic
                      </button>
                    </div>
                  </form>
                )}

                {topics.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs shadow-sm">
                    No curriculum topics created for this course yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map((t) => (
                      <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 relative group">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.title}</h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditTopic(t)}
                              className="p-1 text-slate-400 hover:text-brand-primary transition"
                              title="Edit Topic"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTopic(t.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition"
                              title="Delete Topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {t.description && <p className="text-xs text-slate-400">{t.description}</p>}
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                          {t.content}
                        </p>

                        {t.videoUrl && (
                          <div className="pt-1">
                            <a
                              href={t.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-brand-primary font-bold hover:underline"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Watch Reference Video
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EXAMS TAB */}
            {activeTab === 'exams' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">Practical & Interview Exam Config</h3>
                  <p className="text-xs text-slate-400">Configure practical task requirements and interview questions for this course.</p>
                </div>

                <form onSubmit={saveExam} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Practical Task Guidelines (Markdown)
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Describe the final project requirement, specs, submission format..."
                      value={exam.practicalTask}
                      onChange={(e) => setExam({ ...exam, practicalTask: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Interview Questions (JSON / Plain Text)
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="List verbal defense questions for instructors during one-on-one evaluations..."
                      value={exam.interviewQns}
                      onChange={(e) => setExam({ ...exam, interviewQns: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving === true}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-primary text-white font-bold py-2.5 px-6 text-xs transition hover:bg-brand-primary/90 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {saving === true ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Exam Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}
      </div>

      {/* STUDENT SCORECARD PREVIEW MODAL (Instructor View) */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setInspectingStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-primary to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                {inspectingStudent.firstName[0]}{inspectingStudent.lastName[0]}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {inspectingStudent.firstName} {inspectingStudent.lastName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{inspectingStudent.email}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                <span className="text-xs font-semibold text-slate-500">Attendance Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  inspectingStudent.status === 'PRESENT'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : inspectingStudent.status === 'LATE'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {inspectingStudent.status || 'UNMARKED'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Overall</span>
                  <span className="font-black text-brand-primary text-base mt-0.5 block">{inspectingStudent.score || 0}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Practical</span>
                  <span className="font-black text-slate-800 dark:text-slate-200 text-base mt-0.5 block">{inspectingStudent.creativeScore || 0}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Interview</span>
                  <span className="font-black text-slate-800 dark:text-slate-200 text-base mt-0.5 block">{inspectingStudent.interviewScore || 0}%</span>
                </div>
              </div>

              {inspectingStudent.remarks && (
                <div className="bg-slate-50/60 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Remarks</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-0.5">"{inspectingStudent.remarks}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingStudent(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 transition"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
