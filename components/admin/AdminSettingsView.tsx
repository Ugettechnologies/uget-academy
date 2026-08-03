'use client';

import React, { useState } from 'react';
import { Settings, Lock, Shield, Bell, Check, LogOut, Sliders } from 'lucide-react';

export default function AdminSettingsView() {
  const [notificationsMap, setNotificationsMap] = useState([
    { event: 'Student Enrollment Signup', email: true, inApp: true, slack: true },
    { event: 'Student Profile Updated', email: false, inApp: true, slack: false },
    { event: 'Assessment Submitted', email: true, inApp: true, slack: true },
    { event: 'Flagged Roll Call / Anti-Cheat Alert', email: true, inApp: true, slack: true },
    { event: 'Grading Completed', email: true, inApp: true, slack: false },
    { event: 'New Team Member Invited', email: true, inApp: fontSame(true), slack: true },
    { event: 'System Maintenance Alert', email: true, inApp: true, slack: true },
  ]);

  function fontSame(val: boolean) { return val; }

  const [slackConnected, setSlackConnected] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const toggleNotif = (index: number, channel: 'email' | 'inApp' | 'slack') => {
    setNotificationsMap((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [channel]: !item[channel] } : item
      )
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 text-white animate-fade-in">
      
      {/* Account Security Card */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" /> Account Security & 2-Factor Authentication (2FA)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-white/10 space-y-2">
            <span className="font-bold text-white block">Password Protection</span>
            <p className="text-gray-400 text-[11px]">Last changed 30 days ago. Requires 12+ characters with special symbols.</p>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition">
              Update Admin Password
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E293B] border border-white/10 space-y-2">
            <span className="font-bold text-white block">Two-Factor Authentication (2FA)</span>
            <p className="text-emerald-400 text-[11px] font-bold">✓ Enabled (Authenticator App)</p>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition">
              Configure 2FA Keys
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATION PREFERENCES MATRIX (Event types vs Email, In-App, Slack) */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#60A5FA]" /> Notification Channel Matrix & Slack Integration
            </h3>
            <p className="text-xs text-gray-400">Configure event alerts across Email, In-App, and Slack webhook channels.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              Slack Integration Connected
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3 text-center">Email</th>
                  <th className="px-4 py-3 text-center">In-App</th>
                  <th className="px-4 py-3 text-center">Slack Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {notificationsMap.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-bold text-white">{item.event}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.email}
                        onChange={() => toggleNotif(idx, 'email')}
                        className="w-4 h-4 text-amber-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.inApp}
                        onChange={() => toggleNotif(idx, 'inApp')}
                        className="w-4 h-4 text-amber-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.slack}
                        onChange={() => toggleNotif(idx, 'slack')}
                        className="w-4 h-4 text-amber-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            {isSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Notification Matrix Saved!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Logout Card */}
      <div className="bg-[#0F172A] border border-red-900/40 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-red-400">
          <Lock className="w-4 h-4" /> Session Controls
        </div>
        <p className="text-[11px] text-gray-400">
          Click below to sign out of your UGET Academy Super Administrator portal.
        </p>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600/20 border border-red-500/40 hover:bg-red-600/35 py-3 px-4 text-xs font-bold text-red-300 transition duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout from Admin Platform
          </button>
        </form>
      </div>

    </div>
  );
}
