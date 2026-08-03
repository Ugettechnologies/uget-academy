import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  Lock, 
  Activity,
  Sparkles
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorProfilePage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') {
    redirect('/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      coursesAsInstructor: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  const courseTitle = user.coursesAsInstructor[0]?.title || 'Cybersecurity & Threat Intelligence';
  const username = user.username || 'UGT2026/INSCS/A026';

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-purple-950 p-8 border border-white/10 shadow-2xl">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-extrabold uppercase border border-purple-500/30 tracking-wider">
            Instructor Credentials
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
            Profile & Settings
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
            Instructor account parameters, course track assignments, and session controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Avatar & Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0F172A] rounded-3xl p-8 border border-white/10 flex flex-col items-center text-center space-y-6 shadow-xl">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-purple-500 bg-[#1E293B] flex items-center justify-center text-white font-black text-3xl">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-white tracking-tight">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-xs text-purple-300 font-mono font-bold">{username}</p>
              <p className="text-[11px] text-gray-400 font-mono">{user.email}</p>
            </div>

            <div className="w-full border-t border-white/10 pt-5 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Assigned Course</span>
                <span className="text-purple-300 font-bold truncate max-w-[160px]">{courseTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Role</span>
                <span className="text-emerald-400 font-bold">Verified Instructor</span>
              </div>
            </div>
          </div>

          {/* Logout Section Card */}
          <div className="bg-[#0F172A] rounded-3xl p-6 border border-red-900/40 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400">
              <Lock className="w-4 h-4" />
              <span>Session Controls</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Click below to securely sign out of your UGET Academy instructor workspace.
            </p>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600/20 border border-red-500/40 hover:bg-red-600/35 py-3 px-4 text-xs font-bold text-red-300 transition duration-200 cursor-pointer shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout from Academy</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Account Settings Summary */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Instructor Account Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">First Name</span>
                <p className="font-bold text-white text-sm">{user.firstName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Last Name</span>
                <p className="font-bold text-white text-sm">{user.lastName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Instructor ID</span>
                <p className="font-bold text-purple-300 font-mono text-sm">{username}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Email Address</span>
                <p className="font-bold text-white font-mono text-sm">{user.email}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-1">
              <p className="font-bold text-white">Course Roster Assignment</p>
              <p className="text-gray-300 text-[11px]">
                Your instructor account is provisioned by the UGET Academy Admin to manage <strong className="text-white">{courseTitle}</strong>. Roster updates and replacement transfers are managed via Admin User Management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
