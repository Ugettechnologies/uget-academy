import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import ProfileForm from '@/components/student/ProfileForm';
import ThemeToggle from '@/components/student/ThemeToggle';
import { 
  User, 
  LogOut, 
  Award, 
  ShieldCheck, 
  Globe, 
  Share2, 
  Activity,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: { course: true },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const fullNameUpper = `${user.firstName} ${user.lastName}`.toUpperCase();
  const emailLower = user.email.toLowerCase();

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-purple-950 p-8 border border-white/10 shadow-2xl">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-extrabold uppercase border border-purple-500/30 tracking-wider">
            Account Management
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
            Profile & Settings
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
            Manage your personal profile, bio, skills, professional portfolio links, system preferences, and session controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Avatar, Metadata & Logout Button */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0F172A] rounded-3xl p-8 border border-white/10 flex flex-col items-center text-center space-y-6 relative overflow-hidden shadow-xl">
            {/* Avatar */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#2563EB] bg-[#1E293B] shadow-inner flex items-center justify-center text-white font-black text-3xl">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>

            {/* Details */}
            <div className="space-y-1.5 z-10">
              <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                {fullNameUpper}
              </h2>
              <p className="text-xs text-gray-400 font-semibold font-mono">{emailLower}</p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admission ID: {user.username || '2026/STU/A026'}</span>
                </span>
              </div>
            </div>

            {/* Badges & Track Summary */}
            <div className="w-full border-t border-white/10 pt-5 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Track</span>
                <span className="text-white font-bold truncate max-w-[170px]">
                  {user.enrollments[0]?.course.title || 'Cybersecurity Track'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Enrolled</span>
                <span className="text-white font-bold">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences & Theme Toggle Card */}
          <div className="bg-[#0F172A] rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#60A5FA]" />
              Preferences
            </h3>
            <ThemeToggle />
          </div>

          {/* Logout Section Card (Moved out of sidebar into Settings/Profile) */}
          <div className="bg-[#0F172A] rounded-3xl p-6 border border-red-900/40 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400">
              <Lock className="w-4 h-4" />
              <span>Session Controls</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Click below to securely sign out of your UGET Academy student portal session.
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

        {/* Right Side: Profile Form */}
        <div className="lg:col-span-8">
          <ProfileForm
            initialFirstName={user.firstName}
            initialLastName={user.lastName}
            initialPhone={user.phone}
            initialBio={user.bio}
            initialGithubUrl={user.githubUrl}
            initialLinkedinUrl={user.linkedinUrl}
          />
        </div>

      </div>
    </div>
  );
}
