'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, UserCheck, Star, ShieldAlert, Archive, Plus, Check, Mail, BookOpen } from 'lucide-react';

interface InstructorRecord {
  id: string;
  name: string;
  departmentCode: string;
  email: string;
  courseHandled: string;
  rating: number;
  assignedStudentsCount: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'ARCHIVED';
}

export default function AdminInstructorDirectory() {
  const [instructors, setInstructors] = useState<InstructorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const users = await res.json();
          const insUsers = users
            .filter((u: any) => u.role === 'INSTRUCTOR')
            .map((u: any) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              departmentCode: u.username || `UGT2026/INS/${u.id.slice(-4).toUpperCase()}`,
              email: u.email,
              courseHandled: u.coursesAsInstructor?.[0]?.title || 'Unassigned Track',
              rating: 5.0,
              assignedStudentsCount: 0,
              status: (u.status === 'REJECTED' ? 'ARCHIVED' : 'ACTIVE') as any,
            }));
          setInstructors(insUsers);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isPreRegistering, setIsPreRegistering] = useState(false);

  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('CS');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePreRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newEmail) return;

    const formattedDept = `UGT2026/INS${newDeptCode.toUpperCase()}/A${Math.floor(100 + Math.random() * 900)}`;
    const newIns: InstructorRecord = {
      id: `ins-${Date.now()}`,
      name: `${newFirstName} ${newLastName}`,
      departmentCode: formattedDept,
      email: newEmail,
      courseHandled: 'Pending Track Assignment',
      rating: 5.0,
      assignedStudentsCount: 0,
      status: 'ACTIVE',
    };

    setInstructors([newIns, ...instructors]);
    setIsPreRegistering(false);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleArchiveInstructor = (id: string) => {
    setInstructors((prev) =>
      prev.map((ins) =>
        ins.id === id
          ? { ...ins, status: ins.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' }
          : ins
      )
    );
  };

  const filteredInstructors = instructors.filter(
    (ins) =>
      ins.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.departmentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search instructor name or department code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="flex items-center gap-3">
          {isSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Instructor Account Provisioned!
            </span>
          )}

          <button
            onClick={() => setIsPreRegistering(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" /> Provision Instructor Account
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Instructor & Department ID</th>
                <th className="px-6 py-4">Assigned Course Track</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Students Roster</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Archiving Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredInstructors.map((ins) => (
                <tr key={ins.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30 shrink-0">
                        {ins.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{ins.name}</span>
                        <span className="text-[10px] font-mono text-purple-300">{ins.departmentCode}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-200">
                    {ins.courseHandled}
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {ins.rating}
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {ins.assignedStudentsCount} Students
                  </td>

                  <td className="px-6 py-4">
                    {ins.status === 'ACTIVE' && (
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Active Staff
                      </span>
                    )}
                    {ins.status === 'ARCHIVED' && (
                      <span className="text-[10px] font-extrabold uppercase bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full border border-red-500/30">
                        Archived (On File)
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleArchiveInstructor(ins.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                        ins.status === 'ARCHIVED'
                          ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30'
                          : 'bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30'
                      }`}
                    >
                      {ins.status === 'ARCHIVED' ? 'Unarchive' : 'Archive Staff Record'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pre-Register Modal */}
      {isPreRegistering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <form onSubmit={handlePreRegister} className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white">
            <h3 className="font-extrabold text-white text-base">Provision Instructor Account</h3>
            <p className="text-xs text-gray-400">
              Generates a formatted department login ID (e.g. UGT2026/INSCS/A026) for the new instructor.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. von Neumann"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Department Track Code</label>
              <select
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="CS">Cybersecurity (INSCS)</option>
                <option value="DA">Data Analyst (INSDA)</option>
                <option value="SE">Software Eng (INSSE)</option>
                <option value="UX">UI/UX Design (INSUX)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Email Address</label>
              <input
                type="email"
                required
                placeholder="instructor@uget-academy.online"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsPreRegistering(false)}
                className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition shadow-lg shadow-purple-500/20"
              >
                Provision Account
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
