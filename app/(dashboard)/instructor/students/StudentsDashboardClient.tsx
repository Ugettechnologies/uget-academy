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
  AlertCircle
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
  const [saving, setSaving] = useState<string | boolean>(false); // can hold row id or boolean
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Specific watch for attendance date change
  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchData();
    }
  }, [attendanceDate]);

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

  // Check if courses list is empty
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
      {/* Banner / Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">Student Management</h2>
          <p className="text-xs text-slate-400 mt-1">Select a course to record attendance, submit grades, build lessons, or configure exams.</p>
        </div>
        <div className="w-full md:w-auto min-w-[240px]">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Selected Course</label>
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full appearance-none rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 pr-10 text-sm font-semibold text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 sm:gap-4 no-scrollbar">
        {[
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'grading', label: 'Grading', icon: Award },
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
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Daily Attendance Log</h3>
                    <p className="text-xs text-slate-400">Select a date to track and submit daily class attendance.</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold px-3.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No students currently enrolled in this course.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                            <th className="py-3 px-4 pl-0">Student</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4 text-center">Status Selection</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-105/50 dark:divide-slate-800/40">
                          {students.map((student) => (
                            <tr key={student.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                              <td className="py-3.5 px-4 pl-0 font-semibold text-slate-900 dark:text-slate-100">
                                {student.firstName} {student.lastName}
                              </td>
                              <td className="py-3.5 px-4 text-slate-400">{student.email}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg w-max mx-auto border border-slate-100 dark:border-slate-800">
                                  {[
                                    { id: 'PRESENT', label: 'Present', color: 'bg-emerald-500 hover:bg-emerald-600 text-white', inactiveColor: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                                    { id: 'LATE', label: 'Late', color: 'bg-amber-500 hover:bg-amber-600 text-white', inactiveColor: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                                    { id: 'ABSENT', label: 'Absent', color: 'bg-red-500 hover:bg-red-600 text-white', inactiveColor: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                                  ].map((opt) => {
                                    const selected = student.status === opt.id;
                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleAttendanceChange(student.userId, opt.id as any)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer ${
                                          selected ? opt.color : opt.inactiveColor
                                        }`}
                                      >
                                        {opt.label}
                                      </button>
                                    );
                                  })}
                                </div>
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
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2 px-5 text-sm transition shadow-md shadow-emerald-600/10 cursor-pointer"
                      >
                        {saving === true ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Attendance
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GRADING TAB */}
            {activeTab === 'grading' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">Performance Gradebook</h3>
                  <p className="text-xs text-slate-400">Log score points for final exam performance, practical exercises, and verbal interviews.</p>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No students currently enrolled in this course.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                          <th className="py-3 px-4 pl-0 min-w-[160px]">Student</th>
                          <th className="py-3 px-4 text-center min-w-[90px]">Overall (0-100)</th>
                          <th className="py-3 px-4 text-center min-w-[90px]">Practical (0-100)</th>
                          <th className="py-3 px-4 text-center min-w-[90px]">Interview (0-100)</th>
                          <th className="py-3 px-4 min-w-[220px]">Remarks</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {students.map((student) => (
                          <tr key={student.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="py-3 px-4 pl-0 font-semibold text-slate-900 dark:text-slate-100">
                              <div>{student.firstName} {student.lastName}</div>
                              <span className="text-[10px] text-slate-400 font-normal">{student.email}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={student.score || 0}
                                onChange={(e) => handleGradeChange(student.userId, 'score', Number(e.target.value))}
                                className="w-16 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={student.creativeScore || 0}
                                onChange={(e) => handleGradeChange(student.userId, 'creativeScore', Number(e.target.value))}
                                className="w-16 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={student.interviewScore || 0}
                                onChange={(e) => handleGradeChange(student.userId, 'interviewScore', Number(e.target.value))}
                                className="w-16 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                placeholder="Add comments..."
                                value={student.remarks || ''}
                                onChange={(e) => handleGradeChange(student.userId, 'remarks', e.target.value)}
                                className="w-full rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => saveStudentGrade(student)}
                                disabled={saving === student.userId}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-1.5 px-3 text-xs transition shadow-md shadow-brand-primary/10 disabled:opacity-50 cursor-pointer"
                              >
                                {saving === student.userId ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                Save
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* WEEKLY REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                {/* Reports Header Banner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Weekly Performance Reports</h3>
                    <p className="text-xs text-slate-400">Review weekly classroom summaries, key achievements, challenges, and upcoming roadmaps.</p>
                  </div>
                  {!showReportForm && (
                    <button
                      onClick={() => setShowReportForm(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold py-2.5 px-4 text-sm transition shadow-md shadow-brand-primary/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Report
                    </button>
                  )}
                </div>

                {/* Form to add weekly report */}
                {showReportForm && (
                  <form onSubmit={submitWeeklyReport} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Create Weekly Progress Report</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Week Number</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={reportForm.weekNumber}
                          onChange={(e) => setReportForm({ ...reportForm, weekNumber: Number(e.target.value) })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Weekly Summary</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Summarize course progress, main accomplishments, etc."
                          value={reportForm.summary}
                          onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Challenges Observed (Optional)</label>
                        <textarea
                          rows={3}
                          placeholder="Describe any issues students had or roadblocks faced..."
                          value={reportForm.challenges}
                          onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Next Steps & Plans (Optional)</label>
                        <textarea
                          rows={3}
                          placeholder="List activities or modules slated for next week..."
                          value={reportForm.nextSteps}
                          onChange={(e) => setReportForm({ ...reportForm, nextSteps: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReportForm(false)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 font-semibold py-2 px-4 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-750 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving === true}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-primary text-white font-semibold py-2 px-5 text-sm transition hover:bg-brand-primary/95 shadow-md shadow-brand-primary/10 cursor-pointer"
                      >
                        {saving === true && <Loader2 className="w-4 h-4 animate-spin" />}
                        Submit Report
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Reports */}
                {reports.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm shadow-sm">
                    No weekly reports submitted yet for this course.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary">
                              Week {report.weekNumber}
                            </span>
                            <h4 className="text-sm font-semibold text-slate-400 mt-1.5">
                              Submitted: {new Date(report.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </h4>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div>
                            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-400">Weekly Summary</h5>
                            <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">{report.summary}</p>
                          </div>

                          {report.challenges && (
                            <div>
                              <h5 className="text-xs uppercase tracking-wider font-bold text-slate-400">Challenges</h5>
                              <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">{report.challenges}</p>
                            </div>
                          )}

                          {report.nextSteps && (
                            <div>
                              <h5 className="text-xs uppercase tracking-wider font-bold text-slate-400">Plans for Next Week</h5>
                              <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">{report.nextSteps}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COURSE TOPICS TAB */}
            {activeTab === 'topics' && (
              <div className="space-y-6">
                {/* Topics Header Banner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Curriculum Outline & Topics</h3>
                    <p className="text-xs text-slate-400">Create, edit, and organize specific markdown outlines or video lessons for the course syllabus.</p>
                  </div>
                  {!showTopicForm && (
                    <button
                      onClick={() => {
                        setEditingTopicId(null);
                        setTopicForm({ title: '', description: '', content: '', videoUrl: '' });
                        setShowTopicForm(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold py-2.5 px-4 text-sm transition shadow-md shadow-brand-primary/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Topic
                    </button>
                  )}
                </div>

                {/* Form to add/edit course topic */}
                {showTopicForm && (
                  <form onSubmit={submitTopic} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingTopicId ? 'Edit Course Topic' : 'Add Course Topic'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Topic Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Introduction to CSS Flexbox"
                          value={topicForm.title}
                          onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Short Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Layout basics and alignment options"
                          value={topicForm.description}
                          onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Reference Video URL (Optional)</label>
                      <div className="relative">
                        <Video className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="url"
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          value={topicForm.videoUrl}
                          onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Lesson Content (Supports Markdown)</label>
                      <textarea
                        rows={6}
                        required
                        placeholder="Write outline details, links, snippets, markdown notes, etc."
                        value={topicForm.content}
                        onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                        className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowTopicForm(false)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 font-semibold py-2 px-4 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-750 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving === true}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-primary text-white font-semibold py-2 px-5 text-sm transition hover:bg-brand-primary/95 shadow-md shadow-brand-primary/10 cursor-pointer"
                      >
                        {saving === true && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingTopicId ? 'Save Changes' : 'Create Topic'}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Topics */}
                {topics.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm shadow-sm">
                    No curriculum topics created yet for this course. Click Add Topic above to create one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topics.map((topic, index) => (
                      <div key={topic.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-400 text-lg">{(index + 1).toString().padStart(2, '0')}</span>
                              <h4 className="text-base font-bold text-slate-950 dark:text-white">{topic.title}</h4>
                            </div>
                            {topic.description && (
                              <p className="text-xs text-slate-500 mt-1">{topic.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditTopic(topic)}
                              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-55 hover:text-slate-900 text-slate-500 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Edit Topic"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTopic(topic.id)}
                              disabled={saving === topic.id}
                              className="p-2 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 transition disabled:opacity-50 cursor-pointer"
                              title="Delete Topic"
                            >
                              {saving === topic.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {topic.videoUrl && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 w-max rounded-lg px-3 py-1.5">
                            <Video className="w-3.5 h-3.5" />
                            <a href={topic.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              Watch Reference Video
                            </a>
                          </div>
                        )}

                        <div className="border-t border-slate-50 dark:border-slate-800/80 pt-3">
                          <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Content Details</h5>
                          <pre className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-350 overflow-x-auto whitespace-pre-wrap">
                            {topic.content}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COURSE EXAMS TAB */}
            {activeTab === 'exams' && (
              <form onSubmit={saveExam} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">Exam Configuration</h3>
                  <p className="text-xs text-slate-400">Configure the single exit exam for this course, containing both a practical assignment task and verbal interview questions.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Practical Task Specification (Supports Markdown)</label>
                    <textarea
                      rows={8}
                      required
                      placeholder="e.g. ### Goal: Build a Responsive HTML5 Form...
Provide step-by-step guidelines for what the student should construct during the practical exam."
                      value={exam.practicalTask}
                      onChange={(e) => setExam({ ...exam, practicalTask: e.target.value })}
                      className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Verbal Interview Questions (Supports formatting)</label>
                    <textarea
                      rows={6}
                      required
                      placeholder="e.g. 1. What is the difference between inline and block elements?
2. Explain the CSS box model..."
                      value={exam.interviewQns}
                      onChange={(e) => setExam({ ...exam, interviewQns: e.target.value })}
                      className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={saving === true}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-primary text-white font-semibold py-2.5 px-5 text-sm transition hover:bg-brand-primary/95 shadow-md shadow-brand-primary/10 cursor-pointer"
                  >
                    {saving === true ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Exam Details
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
