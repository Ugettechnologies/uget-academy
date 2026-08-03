'use client';

import React, { useState } from 'react';
import { ShieldAlert, Plus, Check, Users, UserCheck, Lock, Sparkles } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'BILLING_MANAGER' | 'READ_ONLY';
  status: 'ACTIVE' | 'PENDING';
}

export default function RoleManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'm-1', name: 'Nadim Macabey', email: 'nadim@uget-academy.online', role: 'OWNER', status: 'ACTIVE' },
    { id: 'm-[#', name: 'Aisha Bello', email: 'aisha.b@uget-academy.online', role: 'ADMIN', status: 'ACTIVE' },
    { id: 'm-3', name: 'James Carter', email: 'james.c@uget-academy.online', role: 'BILLING_MANAGER', status: 'ACTIVE' },
    { id: 'm-4', name: 'Lena Fischer', email: 'lena.f@uget-academy.online', role: 'READ_ONLY', status: 'PENDING' },
  ]);

  const permissionsMatrix = [
    { permission: 'Manage Students', owner: true, admin: true, billing: false, readOnly: false },
    { permission: 'Manage Courses & Tutors', owner: true, admin: true, billing: false, readOnly: false },
    { permission: 'Manage Instructors & Archiving', owner: true, admin: true, billing: false, readOnly: false },
    { permission: 'View Reports & Analytics', owner: true, admin: true, billing: true, readOnly: true },
    { permission: 'Invite Team Members', owner: true, admin: true, billing: false, readOnly: false },
    { permission: 'Edit Academy Settings & 2FA', owner: true, admin: false, billing: false, readOnly: false },
    { permission: 'Issue Certificates', owner: true, admin: true, billing: false, readOnly: false },
  ];

  const [isInviting, setIsInviting] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'BILLING_MANAGER' | 'READ_ONLY'>('ADMIN');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    const newMem: TeamMember = {
      id: `m-${Date.now()}`,
      name: newEmail.split('@')[0],
      email: newEmail,
      role: newRole,
      status: 'PENDING',
    };

    setTeamMembers([...teamMembers, newMem]);
    setNewEmail('');
    setIsInviting(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 text-white animate-fade-in">
      
      {/* Header & Invite Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div>
          <h3 className="text-sm font-black text-white">Platform Operations & HR Layer</h3>
          <p className="text-xs text-gray-400">Team members running platform management, billing, and ops.</p>
        </div>

        <div className="flex items-center gap-3">
          {isSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Team Invitation Sent!
            </span>
          )}

          <button
            onClick={() => setIsInviting(true)}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Invite Team Member
          </button>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Platform Management Team ({teamMembers.length})</h4>
        </div>

        <div className="divide-y divide-white/5">
          {teamMembers.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2563EB]/30 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-500/30 shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">{m.name}</span>
                  <span className="text-[10px] font-mono text-gray-400">{m.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/30">
                  {m.role}
                </span>
                <span className={`text-[10px] font-bold ${m.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PERMISSIONS MATRIX TABLE */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Granular Role Permissions Matrix</h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3">Permission Scope</th>
                <th className="px-4 py-3 text-center">Owner</th>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-center">Billing Manager</th>
                <th className="px-4 py-3 text-center">Read-Only</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3 font-bold text-white">{row.permission}</td>
                  <td className="px-4 py-3 text-center">{row.owner ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : '—'}</td>
                  <td className="px-4 py-3 text-center">{row.admin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : '—'}</td>
                  <td className="px-4 py-3 text-center">{row.billing ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : '—'}</td>
                  <td className="px-4 py-3 text-center">{row.readOnly ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
          <form onSubmit={handleInviteMember} className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white">
            <h3 className="font-extrabold text-white text-base">Invite Platform Team Member</h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Email Address</label>
              <input
                type="email"
                required
                placeholder="member@uget-academy.online"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Role Scope</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="ADMIN">Administrator</option>
                <option value="BILLING_MANAGER">Billing Manager</option>
                <option value="READ_ONLY">Read-Only Viewer</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsInviting(false)}
                className="px-4 py-2 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl transition shadow-lg shadow-blue-500/20"
              >
                Send Invitation Link
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
