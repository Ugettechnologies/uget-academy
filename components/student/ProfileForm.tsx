'use client';

import React, { useState } from 'react';
import { User, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

interface ProfileFormProps {
  initialFirstName: string;
  initialLastName: string;
  initialPhone?: string | null;
  initialBio?: string | null;
  initialGithubUrl?: string | null;
  initialLinkedinUrl?: string | null;
}

export default function ProfileForm({ 
  initialFirstName, 
  initialLastName,
  initialPhone,
  initialBio,
  initialGithubUrl,
  initialLinkedinUrl
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone || '');
  const [bio, setBio] = useState(initialBio || '');
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(initialLinkedinUrl || '');

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
          phone: phone || null,
          bio: bio || null,
          githubUrl: githubUrl || null,
          linkedinUrl: linkedinUrl || null,
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
    <div className="bg-surface-card rounded-3xl p-6 sm:p-8 shadow-xl border border-border-divider space-y-6">
      <h4 className="text-base font-black text-text-primary border-b border-border-divider pb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-royal-purple" />
        Update Profile Details
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4 text-text-primary">
        {message && (
          <div
            className={`flex items-center gap-2 text-xs p-3.5 rounded-xl border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-red-500/10 border-red-500/20 text-red-500'
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

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-deep-violet/40 border border-border-divider focus:border-royal-purple focus:bg-deep-violet/60 focus:outline-none transition rounded-xl text-text-primary font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-deep-violet/40 border border-border-divider focus:border-royal-purple focus:bg-deep-violet/60 focus:outline-none transition rounded-xl text-text-primary font-semibold"
            />
          </div>
        </div>

        {/* Phone & Bio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+234 80 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-deep-violet/40 border border-border-divider focus:border-royal-purple focus:bg-deep-violet/60 focus:outline-none transition rounded-xl text-text-primary font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Professional Biography
            </label>
            <textarea
              rows={2}
              placeholder="Brief professional intro..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-deep-violet/40 border border-border-divider focus:border-royal-purple focus:bg-deep-violet/60 focus:outline-none transition rounded-xl text-text-primary font-semibold resize-none"
              maxLength={250}
            />
          </div>
        </div>

        {/* Portfolio URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              GitHub URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/your-username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-deep-violet/40 border border-border-divider focus:border-royal-purple focus:bg-deep-violet/60 focus:outline-none transition rounded-xl text-text-primary font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              LinkedIn URL
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-deep-violet/40 border border-border-divider focus:border-royal-purple focus:bg-deep-violet/60 focus:outline-none transition rounded-xl text-text-primary font-semibold"
            />
          </div>
        </div>

        {/* Password Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-divider">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              New Password (Optional)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-deep-violet/40 border border-border-divider focus:border-royal-purple focus:bg-deep-violet/60 focus:outline-none transition rounded-xl text-text-primary font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-text-secondary font-semibold mt-1 block">
              Leave blank to keep your current password.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-deep-violet/40 border border-border-divider focus:border-royal-purple focus:bg-deep-violet/60 focus:outline-none transition rounded-xl text-text-primary font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary transition"
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-royal-purple hover:bg-royal-purple/90 py-3 px-6 text-xs font-bold text-white transition shadow-lg shadow-royal-purple/10 disabled:opacity-50 cursor-pointer"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Update Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
