'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, Search, ArrowUpDown, Check, AlertCircle, Loader2, Plus, X, Key, Copy, UserPlus } from 'lucide-react';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'STAFF';
  createdAt: string;
}

interface RoleManagerProps {
  initialUsers: UserData[];
  currentAdminId: string;
}

export default function RoleManager({ initialUsers, currentAdminId }: RoleManagerProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pre-registration form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT');
  const [customCode, setCustomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

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

      // Update state
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
        role: data.user.role,
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [newUser, ...prev]);
      setGeneratedResult({
        email: data.user.email,
        role: data.user.role,
        code: data.passwordCode,
      });

      // Reset form
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewRole('STUDENT');
      setCustomCode('');
      setShowAddForm(false);
      setStatusMessage({ type: 'success', text: `Successfully pre-registered ${newUser.firstName}` });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setIsCreating(false);
    }
  };

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
    <div className="space-y-6">
      
      {/* Dynamic Banner for Generated Credentials */}
      {generatedResult && (
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-5 sm:p-6 space-y-3 animate-fade-in relative">
          <button 
            onClick={() => setGeneratedResult(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3">
            <Key className="w-6 h-6 text-brand-primary mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Access Credentials Generated</h4>
              <p className="text-xs text-slate-500">
                Below are the login credentials for <span className="font-semibold text-slate-700 dark:text-slate-350">{generatedResult.email}</span> ({generatedResult.role}). Please copy and share them with the user immediately. For safety, this temporary password will not be shown again.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 px-4 py-3 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-850 flex items-center justify-between">
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

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 px-4 py-3 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Password Code</span>
                <span className="font-bold text-brand-accent">{generatedResult.code}</span>
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

      {/* Control Actions & Add Member Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-3">
            {statusMessage && (
              <div
                className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450'
                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                } animate-fade-in`}
              >
                {statusMessage.type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 text-sm transition shadow-sm"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {showAddForm ? 'Cancel Form' : 'Add Academy Member'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleCreateUser} className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4 animate-fade-in">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pre-Register Student / Instructor</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Academy Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                </select>
              </div>

              <div>
                {newRole === 'INSTRUCTOR' ? (
                  <>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Instructor Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2026/A456D (leave blank to auto-generate)"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </>
                ) : (
                  <div className="flex items-end h-full">
                    <p className="text-[10px] text-slate-400 pb-2">
                      * Students will be automatically assigned a secure generated UUID password code.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white font-bold py-2 px-4 text-xs transition disabled:opacity-50"
              >
                {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add Member & Generate Access
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Users Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Modify Access</th>
                <th className="px-6 py-4 text-center">Credentials Control</th>
                <th className="px-6 py-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No users match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  const isUpdating = updatingUserId === u.id;
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition">
                      <td className="px-6 py-4 space-y-0.5">
                        <h5 className="font-bold text-slate-900 dark:text-white">
                          {u.firstName} {u.lastName} {isSelf && <span className="text-[10px] text-brand-primary">(You)</span>}
                        </h5>
                        <p className="text-[11px] text-slate-450">{u.email}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                            u.role === 'ADMIN'
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : u.role === 'STAFF'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : u.role === 'INSTRUCTOR'
                              ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            disabled={isSelf || isUpdating}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50 transition"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="INSTRUCTOR">INSTRUCTOR</option>
                            <option value="STAFF">STAFF</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>

                          {isUpdating && (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSelf || isUpdating || resettingUserId === u.id}
                          onClick={() => handleResetPassword(u.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-brand-accent hover:border-brand-accent/30 transition text-[11px] font-semibold disabled:opacity-50"
                          title="Reset/Regenerate Password Code"
                        >
                          {resettingUserId === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Key className="w-3.5 h-3.5" />
                          )}
                          <span>Reset Code</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right text-slate-400">
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

    </div>
  );
}
