'use client';

import React, { useState } from 'react';
import { User, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

interface ProfileFormProps {
  initialFirstName: string;
  initialLastName: string;
}

export default function ProfileForm({ initialFirstName, initialLastName }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password && password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/student/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          password: password || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setMessage({ type: 'success', text: 'Profile details updated successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-6">
      <h4 className="text-base font-black text-slate-800 border-b border-slate-50 pb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-[#1E60D5]" />
        Update Profile Details
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4 text-slate-750">
        {message && (
          <div
            className={`flex items-center gap-2 text-xs p-3.5 rounded-xl border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600'
                : 'bg-red-50 border-red-500/20 text-red-650'
            } animate-fade-in`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-550" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 focus:border-[#1E60D5] focus:bg-white focus:outline-none transition rounded-xl text-slate-700 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 focus:border-[#1E60D5] focus:bg-white focus:outline-none transition rounded-xl text-slate-700 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-50">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              New Password (Optional)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50/50 border border-slate-200 focus:border-[#1E60D5] focus:bg-white focus:outline-none transition rounded-xl text-slate-700 font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
              Leave blank to keep your current password.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50/50 border border-slate-200 focus:border-[#1E60D5] focus:bg-white focus:outline-none transition rounded-xl text-slate-700 font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E60D5] hover:bg-[#1E60D5]/90 py-3 px-6 text-xs font-bold text-white transition shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
