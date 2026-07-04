'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, Search, ArrowUpDown, Check, AlertCircle, Loader2 } from 'lucide-react';

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
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  return (
    <div className="space-y-6">
      
      {/* Search Input */}
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
                <th className="px-6 py-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
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
