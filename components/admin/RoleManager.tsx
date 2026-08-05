'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Check, Users, UserCheck, Lock, Sparkles, Key } from 'lucide-react';
import CredentialDispatchModal, { CredentialData } from '@/components/admin/CredentialDispatchModal';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'BILLING_MANAGER' | 'READ_ONLY';
  status: 'ACTIVE' | 'PENDING';
}

export default function RoleManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users = await res.json();
        const team = users
          .filter((u: any) => u.role === 'ADMIN' || u.role === 'STAFF')
          .map((u: any) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            role: (u.role === 'ADMIN' ? 'ADMIN' : 'READ_ONLY') as any,
            status: (u.status === 'APPROVED' ? 'ACTIVE' : 'PENDING') as any,
          }));
        setTeamMembers(team);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

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
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Credential Dispatch Modal State
  const [activeDispatchModal, setActiveDispatchModal] = useState(false);
  const [dispatchData, setDispatchData] = useState<CredentialData | null>(null);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFirstName) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const endpoint = newRole === 'STAFF' ? '/api/admin/staff' : '/api/admin/users';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirstName.trim(),
          lastName: newLastName.trim(),
          email: newEmail.trim(),
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create team member account');
        setSubmitting(false);
        return;
      }

      setIsInviting(false);
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      fetchTeam();

      // Open Credential Dispatch Modal
      setDispatchData({
        name: `${data.staff?.firstName || data.user?.firstName || newFirstName} ${data.staff?.lastName || data.user?.lastName || newLastName}`,
        username: data.username || data.staff?.username || data.user?.username,
        passwordCode: data.passwordCode,
        email: newEmail,
        role: newRole,
      });
      setActiveDispatchModal(true);
    } catch (e) {
      setErrorMessage('Network error inviting team member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-white animate-fade-in">
      {/* Header & Invite Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div>
          <h3 className="text-sm font-black text-white">Platform Operations & HR Layer</h3>
          <p className="text-xs text-gray-400">Team members running platform management, billing, and staff ops.</p>
        </div>

        <button
          onClick={() => setIsInviting(true)}
          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Provision Staff / Admin Account
        </button>
      </div>

      {/* Team Members Directory */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Team Member</th>
                <th className="px-6 py-4">Role Access</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {teamMembers.map((mem) => (
                <tr key={mem.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-500/30 shrink-0">
                        {mem.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{mem.name}</span>
                        <span className="text-[10px] font-mono text-gray-400">{mem.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30">
                      {mem.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Active Account
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/admin/users', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              targetUserId: mem.id,
                              action: 'RESET_PASSWORD',
                            }),
                          });
                          const data = await res.json();
                          if (res.ok && data.passwordCode) {
                            setDispatchData({
                              name: mem.name,
                              username: data.username || mem.email.split('@')[0],
                              passwordCode: data.passwordCode,
                              email: mem.email,
                              role: mem.role === 'ADMIN' ? 'ADMIN' : 'STAFF',
                            });
                            setActiveDispatchModal(true);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Key className="w-3.5 h-3.5" /> Dispatch Login
                    </button>
                  </td>
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
            <h3 className="font-extrabold text-white text-base">Provision Staff / Admin Account</h3>
            <p className="text-xs text-gray-400">
              Generates an auto-generated Staff Username (e.g. UGT2026/STF/A012) and Password Code for instant WhatsApp / Email dispatch.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="First name..."
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
                  placeholder="Last name..."
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Email Address</label>
              <input
                type="email"
                required
                placeholder="staff@uget-academy.online"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Account Access Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
              >
                <option value="STAFF">HR & Staff Member (Staff Portal Access)</option>
                <option value="ADMIN">Full Administrator (Admin Portal Access)</option>
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
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {submitting ? 'Provisioning Account...' : 'Provision Account'}
              </button>
            </div>
          </form>
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
