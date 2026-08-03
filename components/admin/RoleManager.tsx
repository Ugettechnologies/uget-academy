'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Shield, 
  Search, 
  Check, 
  AlertCircle, 
  Loader2, 
  Plus, 
  X, 
  Key, 
  Copy, 
  UserPlus,
  Users,
  GraduationCap,
  BookOpen,
  Download,
  Eye,
  UserCheck2,
  Award,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';

interface CourseOption {
  id: string;
  title: string;
  price: number;
}

interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  status?: string;
  phone?: string;
  bio?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'STAFF';
  createdAt: string;
  enrollments?: Enrollment[];
}

interface RoleManagerProps {
  initialUsers: UserData[];
  courses?: CourseOption[];
  currentAdminId: string;
}

interface FullStudentDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
  emailVerified: boolean;
  attendanceRate: number;
  enrollments: {
    id: string;
    courseId: string;
    courseTitle: string;
    courseDescription?: string;
    price: number;
    enrolledAt: string;
    totalLessons: number;
    watchedCount: number;
    progressPercent: number;
  }[];
  grades: {
    id: string;
    score: number;
    creativeScore: number;
    interviewScore: number;
    remarks?: string;
    updatedAt: string;
    course: { id: string; title: string };
  }[];
  dailyAttendances: {
    id: string;
    date: string;
    status: string;
    course: { id: string; title: string };
  }[];
  payments: {
    id: string;
    amount: number;
    reference: string;
    method: string;
    status: string;
    receiptUrl?: string;
    createdAt: string;
  }[];
  certificates: {
    id: string;
    certificateCode: string;
    issuedAt: string;
    course: { id: string; title: string };
  }[];
}

export default function RoleManager({ initialUsers, courses = [], currentAdminId }: RoleManagerProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pre-registration form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT');
  const [departmentCode, setDepartmentCode] = useState<string>('CS');
  const [customCode, setCustomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Instructor Replacement state
  const [replaceInstructorModalUser, setReplaceInstructorModalUser] = useState<UserData | null>(null);
  const [replacementInstructorId, setReplacementInstructorId] = useState<string>('');
  const [isReplacing, setIsReplacing] = useState(false);

  // Quick Enrollment Modal state
  const [enrollModalUser, setEnrollModalUser] = useState<UserData | null>(null);
  const [enrollCourseId, setEnrollCourseId] = useState<string>('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Student Detail Slide-Over Drawer state
  const [activeDrawerStudentId, setActiveDrawerStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<FullStudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'courses' | 'grades' | 'attendance' | 'payments' | 'certificates'>('overview');

  // Result dialog for generated credentials
  const [generatedResult, setGeneratedResult] = useState<{
    email: string;
    role: string;
    code: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // KPIs
  const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
  const totalInstructors = users.filter((u) => u.role === 'INSTRUCTOR').length;
  const totalStaff = users.filter((u) => u.role === 'STAFF').length;
  const totalEnrollments = users.reduce((acc, u) => acc + (u.enrollments?.length || 0), 0);

  // Search & Filter
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query) || phone.includes(query);
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const matchesCourse =
      selectedCourseFilter === 'ALL' ||
      (u.enrollments && u.enrollments.some((e) => e.courseId === selectedCourseFilter));

    return matchesSearch && matchesRole && matchesCourse;
  });

  // Export Roster as CSV
  const handleExportCSV = () => {
    const headers = ['User ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Enrolled Courses', 'Joined Date'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.firstName.replace(/"/g, '""')}"`,
      `"${u.lastName.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      u.role,
      `"${(u.enrollments || []).map((e) => e.courseTitle).join('; ')}"`,
      new Date(u.createdAt).toISOString().split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Academy_Student_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Detail Drawer
  const handleOpenDrawer = async (user: UserData) => {
    setActiveDrawerStudentId(user.id);
    setLoadingDetail(true);
    setStudentDetail(null);
    setDrawerTab('overview');

    try {
      const res = await fetch(`/api/admin/students/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch student details');
      const data = await res.json();
      setStudentDetail(data);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Error loading student profile.' });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Quick Course Enrollment
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollModalUser || !enrollCourseId) return;

    setIsEnrolling(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/students/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: enrollModalUser.id,
          courseId: enrollCourseId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll student');
      }

      const enrolledCourse = courses.find((c) => c.id === enrollCourseId);

      // Update local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === enrollModalUser.id) {
            const currentEnr = u.enrollments || [];
            const alreadyIn = currentEnr.some((e) => e.courseId === enrollCourseId);
            if (!alreadyIn && enrolledCourse) {
              return {
                ...u,
                enrollments: [
                  ...currentEnr,
                  {
                    id: data.enrollment?.id || `enr_${Date.now()}`,
                    courseId: enrollCourseId,
                    courseTitle: enrolledCourse.title,
                  },
                ],
              };
            }
          }
          return u;
        })
      );

      setStatusMessage({ type: 'success', text: data.message || 'Student enrolled successfully!' });
      setEnrollModalUser(null);
      setEnrollCourseId('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to enroll student.' });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Role Change
  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (targetUserId === currentAdminId) {
      setStatusMessage({ type: 'error', text: 'You cannot change your own role.' });
      return;
    }

    setUpdatingUserId(targetUserId);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole as any } : u))
      );

      setStatusMessage({ type: 'success', text: data.message || 'Role updated successfully' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Create User / Pre-register
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setStatusMessage(null);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          role: newRole,
          departmentCode: newRole === 'INSTRUCTOR' ? departmentCode : undefined,
          passwordCode: newRole === 'INSTRUCTOR' && customCode ? customCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to pre-register user');
      }

      const newUser: UserData = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        username: data.username,
        role: data.user.role,
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        enrollments: [],
      };

      setUsers((prev) => [newUser, ...prev]);
      setGeneratedResult({
        email: data.user.email,
        role: data.user.role,
        code: data.passwordCode,
      });

      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewRole('STUDENT');
      setDepartmentCode('CS');
      setCustomCode('');
      setShowAddForm(false);
      setStatusMessage({ type: 'success', text: `Successfully pre-registered ${newUser.firstName} (${data.username})` });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setIsCreating(false);
    }
  };

  // Replace Departing Instructor & Reassign Courses
  const handleReplaceInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceInstructorModalUser || !replacementInstructorId) return;

    setIsReplacing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: replaceInstructorModalUser.id,
          action: 'REPLACE_INSTRUCTOR',
          replacementInstructorId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to replace instructor.');
      }

      // Deactivate departing instructor in local state
      setUsers((prev) =>
        prev.map((u) => (u.id === replaceInstructorModalUser.id ? { ...u, status: 'REJECTED' } : u))
      );

      setStatusMessage({ type: 'success', text: data.message });
      setReplaceInstructorModalUser(null);
      setReplacementInstructorId('');
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to process instructor replacement.' });
    } finally {
      setIsReplacing(false);
    }
  };

  // Approve User Application
  const handleApproveUser = async (targetUserId: string) => {
    setUpdatingUserId(targetUserId);
    setStatusMessage(null);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          action: 'APPROVE_USER',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve user.');
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId ? { ...u, status: 'APPROVED', username: data.username } : u
        )
      );

      setGeneratedResult({
        email: data.user.email,
        role: data.user.role,
        code: data.passwordCode,
      });

      setStatusMessage({
        type: 'success',
        text: `Approved ${data.user.firstName}! Assigned Username "${data.username}".`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Error approving user.' });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Password Reset
  const handleResetPassword = async (targetUserId: string) => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset/regenerate the password code for this user? This will revoke their current password immediately.'
    );
    if (!confirmReset) return;

    setResettingUserId(targetUserId);
    setStatusMessage(null);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          action: 'RESET_PASSWORD',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password code');
      }

      const targetUser = users.find((u) => u.id === targetUserId);

      setGeneratedResult({
        email: targetUser?.email || '',
        role: targetUser?.role || '',
        code: data.passwordCode,
      });

      setStatusMessage({ type: 'success', text: 'Password code regenerated successfully.' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setResettingUserId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Banner for Generated Credentials */}
      {generatedResult && (
        <div className="bg-gradient-to-r from-brand-primary/10 via-indigo-500/10 to-emerald-500/10 border border-brand-primary/20 rounded-2xl p-5 sm:p-6 space-y-3 animate-fade-in relative shadow-sm">
          <button
            onClick={() => setGeneratedResult(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <Key className="w-6 h-6 text-brand-primary mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Access Credentials Generated
              </h4>
              <p className="text-xs text-slate-500">
                Below are the active login credentials for{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {generatedResult.email}
                </span>{' '}
                ({generatedResult.role}). Share them with the student or instructor immediately.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 px-4 py-3 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Email Address</span>
                <span className="font-bold">{generatedResult.email}</span>
              </div>
              <button
                onClick={() => copyToClipboard(generatedResult.email)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1.5"
                title="Copy Email"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 px-4 py-3 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Password Code</span>
                <span className="font-bold text-brand-primary dark:text-brand-accent">{generatedResult.code}</span>
              </div>
              <button
                onClick={() => copyToClipboard(generatedResult.code)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1.5 flex items-center gap-1 hover:text-brand-accent"
                title="Copy Password Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span className="text-[10px] font-bold uppercase">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalStudents}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Enrolled across academy</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Enrollments</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalEnrollments}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Course allocations</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructors</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalInstructors}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Teaching faculty</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff & Admin</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalStaff + users.filter(u => u.role === 'ADMIN').length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Platform administrators</p>
          </div>
        </div>
      </div>

      {/* Controls Bar & Add Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary transition"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Role Filter Dropdown */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students Only</option>
              <option value="INSTRUCTOR">Instructors Only</option>
              <option value="STAFF">Staff Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>

            {/* Course Filter Dropdown */}
            {courses.length > 0 && (
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="ALL">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    Course: {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions: Export CSV & Add Member */}
          <div className="flex items-center gap-3">
            {statusMessage && (
              <div
                className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                } animate-fade-in`}
              >
                {statusMessage.type === 'success' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3.5 text-xs transition"
              title="Export Roster as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Roster</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-primary dark:hover:bg-brand-primary/90 text-white font-bold py-2 px-4 text-xs transition shadow-sm"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              {showAddForm ? 'Cancel Form' : 'Add Academy Member'}
            </button>
          </div>
        </div>

        {/* Pre-Register Member Form */}
        {showAddForm && (
          <form onSubmit={handleCreateUser} className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4 animate-fade-in">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-primary" />
              Pre-Register New Student or Instructor
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morgan"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex.morgan@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Academy Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                </select>
              </div>

              {newRole === 'INSTRUCTOR' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                    <select
                      value={departmentCode}
                      onChange={(e) => setDepartmentCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                    >
                      <option value="CS">Cybersecurity (UGT2026/INSCS/...)</option>
                      <option value="DA">Data Analyst (UGT2026/INSDA/...)</option>
                      <option value="SE">Software Engineering (UGT2026/INSSE/...)</option>
                      <option value="UI">UI/UX Design (UGT2026/INSUI/...)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Custom Password Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank for auto-generate"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary font-mono"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 flex items-end h-full">
                  <p className="text-[11px] text-slate-400 pb-2">
                    * Students are automatically assigned an Admission Number (e.g. 2026/STU/A026) and password code upon enrollment upload.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-5 text-xs transition disabled:opacity-50 shadow-sm"
              >
                {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add Member & Generate Access
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Users Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Student / User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Enrolled Courses</th>
                <th className="px-6 py-4">Role Control</th>
                <th className="px-6 py-4 text-center">Scorecard & Actions</th>
                <th className="px-6 py-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No students or users found matching your search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  const isUpdating = updatingUserId === u.id;
                  const enrCount = u.enrollments?.length || 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                      
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 uppercase shadow-sm">
                            {u.firstName[0]}
                            {u.lastName[0]}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {u.firstName} {u.lastName}
                              {isSelf && (
                                <span className="text-[9px] font-bold bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                              {u.status === 'PENDING_APPROVAL' && (
                                <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                  Pending
                                </span>
                              )}
                            </h5>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                            {u.username && (
                              <p className="text-[10px] text-brand-primary font-mono font-bold mt-0.5">
                                ID: {u.username}
                              </p>
                            )}
                            {u.phone && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{u.phone}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
                            u.role === 'ADMIN'
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : u.role === 'STAFF'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : u.role === 'INSTRUCTOR'
                              ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>

                      {/* Enrolled Courses */}
                      <td className="px-6 py-4">
                        {enrCount === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">No courses</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {u.enrollments?.map((e) => (
                              <span
                                key={e.id}
                                className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium truncate max-w-[140px]"
                                title={e.courseTitle}
                              >
                                {e.courseTitle}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Role Modify */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            disabled={isSelf || isUpdating}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50 transition"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="INSTRUCTOR">INSTRUCTOR</option>
                            <option value="STAFF">STAFF</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                        </div>
                      </td>

                      {/* Actions: View Details / Enroll / Reset Code / Approve */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Approve Action if Pending */}
                          {u.status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() => handleApproveUser(u.id)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs"
                              title="Approve registration and generate login credentials"
                            >
                              <UserCheck2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* View Scorecard Drawer */}
                          <button
                            onClick={() => handleOpenDrawer(u)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold text-[11px] transition"
                            title="View Full Student Scorecard & Profile Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Scorecard</span>
                          </button>

                          {/* Quick Enroll Modal */}
                          {courses.length > 0 && (
                            <button
                              onClick={() => {
                                setEnrollModalUser(u);
                                setEnrollCourseId(courses[0].id);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition"
                              title="Enroll in a Course"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Enroll</span>
                            </button>
                          )}

                          {/* Replace Instructor Action if INSTRUCTOR */}
                          {u.role === 'INSTRUCTOR' && (
                            <button
                              onClick={() => {
                                setReplaceInstructorModalUser(u);
                                const firstOther = users.find((ins) => ins.role === 'INSTRUCTOR' && ins.id !== u.id);
                                setReplacementInstructorId(firstOther ? firstOther.id : '');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 font-bold text-[11px] transition"
                              title="Replace outgoing instructor and transfer course rosters"
                            >
                              <Shield className="w-3 h-3" />
                              <span>Replace</span>
                            </button>
                          )}

                          {/* Reset Password Code */}
                          <button
                            disabled={isSelf || isUpdating || resettingUserId === u.id}
                            onClick={() => handleResetPassword(u.id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-accent transition text-[11px] disabled:opacity-50"
                            title="Reset Access Code"
                          >
                            {resettingUserId === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Key className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ENROLLMENT MODAL */}
      {enrollModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setEnrollModalUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Enroll Student into Course</h3>
                <p className="text-xs text-slate-400">
                  Assign <span className="font-bold text-slate-700 dark:text-slate-300">{enrollModalUser.firstName} {enrollModalUser.lastName}</span> to an active course.
                </p>
              </div>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Select Course
                </label>
                <select
                  value={enrollCourseId}
                  onChange={(e) => setEnrollCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (₦{c.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEnrollModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrolling}
                  className="px-5 py-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isEnrolling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTRUCTOR REPLACEMENT MODAL */}
      {replaceInstructorModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setReplaceInstructorModalUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Replace Instructor</h3>
                <p className="text-xs text-slate-400">
                  Reassign courses from <span className="font-bold text-slate-700 dark:text-slate-300">{replaceInstructorModalUser.firstName} {replaceInstructorModalUser.lastName}</span> ({replaceInstructorModalUser.username || replaceInstructorModalUser.email}).
                </p>
              </div>
            </div>

            <form onSubmit={handleReplaceInstructor} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Select Replacement Instructor
                </label>
                <select
                  value={replacementInstructorId}
                  onChange={(e) => setReplacementInstructorId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                >
                  <option value="">-- Choose Replacement Instructor --</option>
                  {users
                    .filter((u) => u.role === 'INSTRUCTOR' && u.id !== replaceInstructorModalUser.id)
                    .map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.firstName} {ins.lastName} ({ins.username || ins.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-[11px] text-purple-300 space-y-1">
                <p className="font-bold">Seamless Transfer Policy:</p>
                <p>• All courses and enrolled student rosters will be transferred immediately to the selected replacement instructor.</p>
                <p>• Outgoing instructor's account status will be set to inactive.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReplaceInstructorModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplacing || !replacementInstructorId}
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isReplacing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Transfer Rosters & Replace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT SCORECARD & DETAIL SLIDE-OVER DRAWER */}
      {activeDrawerStudentId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl relative">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-primary to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                  {studentDetail ? `${studentDetail.firstName[0]}${studentDetail.lastName[0]}` : '?'}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-950 dark:text-white flex items-center gap-2">
                    {studentDetail ? `${studentDetail.firstName} ${studentDetail.lastName}` : 'Loading Student...'}
                    {studentDetail && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary uppercase">
                        {studentDetail.role}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">{studentDetail?.email}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveDrawerStudentId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loading state */}
            {loadingDetail ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                <p className="text-xs text-slate-400">Fetching comprehensive scorecard...</p>
              </div>
            ) : studentDetail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Tabs Navigation */}
                <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 overflow-x-auto whitespace-nowrap scrollbar-none gap-2 pt-2">
                  <button
                    onClick={() => setDrawerTab('overview')}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
                      drawerTab === 'overview'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setDrawerTab('courses')}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
                      drawerTab === 'courses'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Courses ({studentDetail.enrollments.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('grades')}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
                      drawerTab === 'grades'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Grades ({studentDetail.grades.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('attendance')}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
                      drawerTab === 'attendance'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Attendance ({studentDetail.attendanceRate}%)
                  </button>
                  <button
                    onClick={() => setDrawerTab('payments')}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
                      drawerTab === 'payments'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Payments ({studentDetail.payments.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('certificates')}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
                      drawerTab === 'certificates'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Certificates ({studentDetail.certificates.length})
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* OVERVIEW TAB */}
                  {drawerTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                      
                      {/* Stat summary grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled</span>
                          <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {studentDetail.enrollments.length}
                          </h4>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance</span>
                          <h4 className="text-xl font-extrabold text-emerald-500 mt-1">
                            {studentDetail.attendanceRate}%
                          </h4>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Certificates</span>
                          <h4 className="text-xl font-extrabold text-indigo-500 mt-1">
                            {studentDetail.certificates.length}
                          </h4>
                        </div>
                      </div>

                      {/* Contact & Bio Info */}
                      <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Profile & Contact Details</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Phone Number</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{studentDetail.phone || 'Not provided'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Registration Date</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {new Date(studentDetail.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {studentDetail.bio && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Biography</span>
                            <p className="text-slate-700 dark:text-slate-300 text-xs italic mt-0.5">{studentDetail.bio}</p>
                          </div>
                        )}

                        <div className="flex gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          {studentDetail.githubUrl && (
                            <a href={studentDetail.githubUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline flex items-center gap-1 font-semibold">
                              GitHub Profile <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {studentDetail.linkedinUrl && (
                            <a href={studentDetail.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 font-semibold">
                              LinkedIn Profile <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Course progress preview */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Active Course Progress</h4>
                        {studentDetail.enrollments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No courses currently enrolled.</p>
                        ) : (
                          studentDetail.enrollments.map((enr) => (
                            <div key={enr.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-900 dark:text-white">{enr.courseTitle}</span>
                                <span className="font-mono text-brand-primary font-bold">{enr.progressPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{ width: `${enr.progressPercent}%` }} />
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                                <span>{enr.watchedCount} of {enr.totalLessons} lessons completed</span>
                                <span>Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}

                  {/* COURSES TAB */}
                  {drawerTab === 'courses' && (
                    <div className="space-y-4 animate-fade-in">
                      {studentDetail.enrollments.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs">
                          Student has not been enrolled into any courses yet.
                        </div>
                      ) : (
                        studentDetail.enrollments.map((enr) => (
                          <div key={enr.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{enr.courseTitle}</h4>
                                <p className="text-xs text-slate-400 line-clamp-1">{enr.courseDescription || 'Academy Course'}</p>
                              </div>
                              <span className="font-bold text-xs text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                ₦{enr.price.toLocaleString()}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span>Progress</span>
                                <span className="text-brand-primary">{enr.progressPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-brand-primary h-full rounded-full" style={{ width: `${enr.progressPercent}%` }} />
                              </div>
                            </div>

                            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                              <span>Watched {enr.watchedCount} / {enr.totalLessons} lessons</span>
                              <span>Enrolled on {new Date(enr.enrolledAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* GRADES TAB */}
                  {drawerTab === 'grades' && (
                    <div className="space-y-4 animate-fade-in">
                      {studentDetail.grades.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs">
                          No grades recorded for this student yet.
                        </div>
                      ) : (
                        studentDetail.grades.map((g) => (
                          <div key={g.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs">{g.course.title}</h4>
                              <span className="text-xs font-black px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg">
                                Overall Score: {g.score}%
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                              <div>
                                <span className="text-slate-400 text-[10px] block">Practical Exam</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{g.creativeScore}%</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block">Interview Score</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{g.interviewScore}%</span>
                              </div>
                            </div>

                            {g.remarks && (
                              <p className="text-xs text-slate-500 italic bg-slate-50/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                "{g.remarks}"
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ATTENDANCE TAB */}
                  {drawerTab === 'attendance' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block font-semibold">Overall Attendance Rate</span>
                          <span className="text-2xl font-black text-emerald-500">{studentDetail.attendanceRate}%</span>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/80" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-xs text-slate-400 uppercase">Recent Attendance Logs</h4>
                        {studentDetail.dailyAttendances.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No attendance records logged.</p>
                        ) : (
                          studentDetail.dailyAttendances.map((att) => (
                            <div key={att.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{att.course.title}</span>
                                <span className="text-[10px] text-slate-400">{new Date(att.date).toLocaleDateString()}</span>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                att.status === 'PRESENT'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : att.status === 'LATE'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}>
                                {att.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* PAYMENTS TAB */}
                  {drawerTab === 'payments' && (
                    <div className="space-y-3 animate-fade-in">
                      {studentDetail.payments.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs">
                          No payment history found for this student.
                        </div>
                      ) : (
                        studentDetail.payments.map((p) => (
                          <div key={p.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">Ref: {p.reference}</span>
                                <span className="text-[10px] text-slate-400 block">{new Date(p.createdAt).toLocaleString()}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'VERIFIED'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : p.status === 'PENDING'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}>
                                {p.status}
                              </span>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850 text-xs">
                              <span className="text-slate-400">Amount Paid: <strong className="text-slate-800 dark:text-slate-200">₦{p.amount.toLocaleString()}</strong> ({p.method})</span>
                              {p.receiptUrl && (
                                <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold flex items-center gap-1 hover:underline text-[11px]">
                                  View Receipt <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* CERTIFICATES TAB */}
                  {drawerTab === 'certificates' && (
                    <div className="space-y-3 animate-fade-in">
                      {studentDetail.certificates.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs">
                          No certificates issued yet.
                        </div>
                      ) : (
                        studentDetail.certificates.map((cert) => (
                          <div key={cert.id} className="bg-gradient-to-r from-amber-500/10 via-brand-primary/10 to-indigo-500/10 border border-amber-500/20 rounded-xl p-5 space-y-2">
                            <div className="flex items-center gap-3">
                              <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{cert.course.title}</h4>
                                <span className="font-mono text-[10px] text-brand-primary font-bold">Code: {cert.certificateCode}</span>
                              </div>
                            </div>
                            <div className="text-right text-[10px] text-slate-400">
                              Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
}
