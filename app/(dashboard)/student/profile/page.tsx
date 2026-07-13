import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Award } from 'lucide-react';
import ProfileForm from '@/components/student/ProfileForm';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  const session = await getSession();
  const userId = session?.userId as string;

  // Query database for user information
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect('/login');
  }

  const fullNameUpper = `${user.firstName} ${user.lastName}`.toUpperCase();
  const emailLower = user.email.toLowerCase();

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 text-xs mt-1">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Card: Headshot & Metadata */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col items-center text-center space-y-6">
          
          {/* Professional Avatar */}
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-100">
            <Image
              src="/student_avatar.png"
              alt="Student Avatar"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-slate-800 tracking-tight leading-none">
              {fullNameUpper}
            </h2>
            <p className="text-xs text-slate-400 font-semibold">{emailLower}</p>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Student</span>
              </span>
            </div>
          </div>

          <div className="w-full border-t border-slate-100 pt-6 space-y-4 text-xs text-slate-700 font-semibold">
            {/* Cohort */}
            <div className="flex justify-between items-center">
              <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">Cohort</span>
              <span className="text-slate-800 font-bold">1</span>
            </div>

            {/* Track */}
            <div className="flex justify-between items-center">
              <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">Track</span>
              <span className="text-slate-800 font-bold">UI/UX Design</span>
            </div>

            {/* Joined */}
            <div className="flex justify-between items-center">
              <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px]">Joined</span>
              <span className="text-slate-800 font-bold">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Account Details & Editing form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <h2 className="text-base font-black text-slate-800 tracking-tight">Account Information</h2>
              <button className="text-xs font-bold text-[#1E60D5] hover:underline">
                Edit profile
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-750">
              {/* Full Name Display */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-bold text-slate-700 uppercase">
                  {fullNameUpper}
                </div>
              </div>

              {/* Email Address Display */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-750">
                  {emailLower}
                </div>
                <span className="text-[9px] text-slate-450 font-bold block">Email can not be changed</span>
              </div>
            </div>
          </div>

          {/* Settings form below it */}
          <ProfileForm initialFirstName={user.firstName} initialLastName={user.lastName} />
        </div>
      </div>
    </div>
  );
}
