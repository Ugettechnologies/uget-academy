'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  LogOut, 
  Download, 
  Upload, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  X as XIcon,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutFrameProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  children: React.ReactNode;
}

export default function AdminLayoutFrame({ user, children }: AdminLayoutFrameProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDataSyncModal, setShowDataSyncModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Staff creation form state
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    department: 'Operations',
    position: 'Staff Member',
    phone: '',
  });
  const [staffLoading, setStaffLoading] = useState(false);

  // Data import state
  const [importJson, setImportJson] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoading(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast('success', `Staff account issued for ${staffForm.firstName}!`);
        setShowAddStaffModal(false);
        setStaffForm({
          firstName: '',
          lastName: '',
          email: '',
          username: '',
          password: '',
          department: 'Operations',
          position: 'Staff Member',
          phone: '',
        });
      } else {
        triggerToast('error', data.error || 'Failed to create staff account');
      }
    } catch {
      triggerToast('error', 'Network error creating staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleExportCSV = async () => {
    window.open('/api/admin/students/export?format=csv', '_blank');
  };

  const handleExportJSON = async () => {
    window.open('/api/admin/students/export?format=json', '_blank');
  };

  const handleImportStudents = async () => {
    if (!importJson.trim()) {
      triggerToast('error', 'Please paste student JSON array from uget-enrollment');
      return;
    }
    setImportLoading(true);
    try {
      const parsed = JSON.parse(importJson);
      const studentsArray = Array.isArray(parsed) ? parsed : parsed.students || [];

      const res = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentsArray }),
      });
      const data = await res.json();

      if (data.success) {
        triggerToast('success', data.message);
        setShowDataSyncModal(false);
        setImportJson('');
      } else {
        triggerToast('error', data.error || 'Import failed');
      }
    } catch {
      triggerToast('error', 'Invalid JSON syntax');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex text-white font-sans relative overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:h-screen lg:sticky lg:top-0 transition-all duration-300 ease-in-out bg-[#0F172A] ${
          isSidebarOpen 
            ? 'translate-x-0 w-64 border-r border-white/10' 
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0'
        }`}
      >
        <AdminSidebar 
          user={user} 
          onLinkClick={() => setIsSidebarOpen(false)}
          onOpenDataSyncModal={() => setShowDataSyncModal(true)}
          onOpenStaffModal={() => setShowAddStaffModal(true)}
        />
      </div>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative">
        {/* Top Navbar Header */}
        <header className="h-16 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer flex items-center justify-center border border-white/10"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? (
                <>
                  <X className="w-5 h-5 lg:hidden" />
                  <Menu className="w-5 h-5 hidden lg:block" />
                </>
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Quick Sync & Add Shortcuts */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowDataSyncModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export/Import Enrollment</span>
              </button>

              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-teal-400" />
                <span>+ Create Staff Account</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" /> Admin System Alerts
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1">
                      <span className="font-bold text-white text-[11px] block">Enrollment Portal Data Available</span>
                      <p className="text-amber-200 text-[11px]">Ready to sync or export student records.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                      <span className="font-bold text-white text-[11px] block">Staff Complaints Box</span>
                      <p className="text-gray-400 text-[11px]">Check staff portal complaints and reports.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Badge Link */}
            <Link href="/admin/settings" className="flex items-center gap-2.5 hover:opacity-80 transition">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border border-white/20">
                {user.firstName ? user.firstName.charAt(0) : ''}{user.lastName ? user.lastName.charAt(0) : ''}
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-bold text-white leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[9px] text-amber-300 font-mono font-bold uppercase">
                  Super Admin
                </span>
              </div>
            </Link>

            {/* Sign Out Button */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Dynamic content rendering */}
        <main className="flex-grow p-4 sm:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* MODAL 1: STUDENT DATA EXPORT / IMPORT MODAL */}
      {showDataSyncModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold">uget-enrollment Data Sync</h2>
              </div>
              <button onClick={() => setShowDataSyncModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Exporter Section */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">Option 1: Export Student Roster</span>
              <p className="text-xs text-gray-300">Download all student records formatted for external sync or auditing.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 hover:bg-amber-400 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold flex items-center gap-2 hover:bg-white/20 transition cursor-pointer border border-white/10"
                >
                  <Download className="w-4 h-4" /> Export JSON
                </button>
              </div>
            </div>

            {/* Importer Section */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider block">Option 2: Import from uget-enrollment</span>
              <p className="text-xs text-gray-300">Paste JSON payload from uget-enrollment portal to automatically register students in academy DB.</p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='Paste JSON array here, e.g. [{"name": "John Doe", "email": "john@example.com"}, ...]'
                className="w-full h-28 bg-[#1E293B] border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 custom-scrollbar"
              />
              <button
                onClick={handleImportStudents}
                disabled={importLoading}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import Students into Academy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE STAFF CREDENTIALS MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-bold">Issue Staff Account & Credentials</h2>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">First Name *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.firstName}
                    onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Sarah"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.lastName}
                    onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Connor"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Official Staff Email *</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="hr@ugettechnologies.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Username (For Login)</label>
                  <input
                    type="text"
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="sarah.c"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Department</label>
                  <input
                    type="text"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="HR / Operations"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Job Title / Role</label>
                  <input
                    type="text"
                    value={staffForm.position}
                    onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-2.5 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="Head of Academy / HR Officer"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffLoading}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold transition cursor-pointer flex items-center gap-2"
                >
                  {staffLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Issue Credentials & Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
