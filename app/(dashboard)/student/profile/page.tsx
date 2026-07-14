import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { 
  Award, 
  LogOut, 
  Phone, 
  Globe, 
  Link2, 
  Calendar, 
  UserCheck, 
  CreditCard, 
  BookOpen, 
  GraduationCap, 
  Activity, 
  CheckCircle2, 
  Clock, 
  XCircle 
} from 'lucide-react';
import ProfileForm from '@/components/student/ProfileForm';
import ThemeToggle from '@/components/student/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  const session = await getSession();
  const userId = session?.userId as string;

  // Query database for user information with enrollments, courses, lessons, and payments
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              instructor: true,
              lessons: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      },
      payments: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Fetch student's watch progress logs (attendance logs) to compute progress
  const attendanceLogs = await prisma.attendanceLog.findMany({
    where: { userId }
  });

  // Create a map of lessonId -> watch duration
  const watchMap: Record<string, number> = {};
  attendanceLogs.forEach(log => {
    watchMap[log.lessonId] = log.durationSeconds;
  });

  // Check if a lesson is watched (>= 60 seconds)
  const isLessonWatched = (lessonId: string) => (watchMap[lessonId] || 0) >= 60;

  // Compute actual course enrollment data
  const enrolledCourses = user.enrollments.map(e => {
    const lessons = e.course.lessons;
    const totalLessons = lessons.length;
    const watchedCount = lessons.filter(l => isLessonWatched(l.id)).length;
    const progressPercent = totalLessons > 0 ? Math.round((watchedCount / totalLessons) * 100) : 0;
    
    return {
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      instructorName: `${e.course.instructor.firstName} ${e.course.instructor.lastName}`,
      instructorEmail: e.course.instructor.email,
      progress: progressPercent,
      enrolledAt: new Date(e.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  });

  const fullNameUpper = `${user.firstName} ${user.lastName}`.toUpperCase();
  const emailLower = user.email.toLowerCase();

  // Primary track name from active enrollments (or default)
  const trackName = enrolledCourses.length > 0
    ? enrolledCourses.map(c => c.title).join(', ')
    : 'No active enrollment';

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-primary">
      {/* Decorative Premium Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-royal-purple via-royal-purple/80 to-royal-gold/30 p-8 sm:p-10 border border-border-divider">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-accent-purple/10 blur-2xl" />
        <div className="absolute left-1/3 bottom-0 -ml-10 -mb-10 w-64 h-64 rounded-full bg-royal-purple/20 blur-3xl" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="text-[10px] bg-royal-gold/25 text-royal-gold px-3 py-1 rounded-full font-extrabold uppercase border border-royal-gold/30 tracking-wider">
            Student Space
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl mt-2">
            Profile & Settings
          </h1>
          <p className="text-text-primary/75 text-xs sm:text-sm font-medium leading-relaxed">
            Customize your account preferences, manage your professional links, and view your dynamic course enrollment and payment records below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Card: Headshot, Metadata, Theme and Logout */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-card rounded-3xl p-8 border border-border-divider flex flex-col items-center text-center space-y-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-royal-purple/5 rounded-bl-full border-b border-l border-border-divider/30" />
            
            {/* Professional Avatar */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-royal-purple/25 bg-deep-violet shadow-inner flex items-center justify-center text-accent-purple font-black text-3xl">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>

            {/* User Details */}
            <div className="space-y-2 z-10">
              <h2 className="text-lg font-black text-text-primary tracking-tight leading-tight">
                {fullNameUpper}
              </h2>
              <p className="text-xs text-text-secondary font-semibold">{emailLower}</p>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-royal-purple/20 text-accent-purple border border-royal-purple/35">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Student Badge</span>
                </span>
              </div>
            </div>

            {/* Enrollment Summary */}
            <div className="w-full border-t border-border-divider pt-6 space-y-4 text-xs text-text-primary font-semibold">
              <div className="flex justify-between items-center gap-2">
                <span className="text-text-secondary font-bold uppercase tracking-wider text-[10px] text-left">Primary Tracks</span>
                <span className="text-text-primary font-bold text-right truncate max-w-[180px]">{trackName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-bold uppercase tracking-wider text-[10px]">Active Enrollments</span>
                <span className="text-text-primary font-bold">{enrolledCourses.length}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-bold uppercase tracking-wider text-[10px]">Joined Academy</span>
                <span className="text-text-primary font-bold">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Theme Preferences Card */}
          <div className="bg-surface-card rounded-3xl p-6 border border-border-divider space-y-4 shadow-xl">
            <h3 className="text-xs font-black uppercase text-text-secondary tracking-widest border-b border-border-divider pb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-royal-purple" />
              Preferences
            </h3>
            <ThemeToggle />
          </div>

          {/* Logout Section Card */}
          <div className="bg-surface-card rounded-3xl p-6 border border-border-divider shadow-xl">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-status-absent/10 border border-status-absent/30 hover:bg-status-absent/25 py-3 px-4 text-xs font-bold text-status-absent transition duration-200 cursor-pointer shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout from Academy</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Card: Account Details & Editing form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-card rounded-3xl p-8 border border-border-divider space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-border-divider pb-4">
              <h2 className="text-base font-black text-text-primary tracking-tight">Account Overview</h2>
              <span className="text-[10px] bg-royal-gold/15 text-royal-gold px-3 py-1 rounded-full font-extrabold uppercase border border-royal-gold/25 tracking-wide">
                Verified Student
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-text-primary">
              {/* Full Name Display */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Full Name</label>
                <div className="w-full rounded-xl border border-border-divider bg-deep-violet/40 px-4 py-3 text-xs font-bold text-text-primary uppercase">
                  {fullNameUpper}
                </div>
              </div>

              {/* Email Address Display */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Email Address</label>
                <div className="w-full rounded-xl border border-border-divider bg-deep-violet/40 px-4 py-3 text-xs font-semibold text-text-primary">
                  {emailLower}
                </div>
              </div>

              {/* Phone Display */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Phone Number</label>
                <div className="w-full rounded-xl border border-border-divider bg-deep-violet/40 px-4 py-3 text-xs font-semibold text-text-primary">
                  {user.phone || 'Not provided'}
                </div>
              </div>

              {/* Portfolio Links Summary */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Professional Profiles</label>
                <div className="flex items-center gap-2 pt-0.5">
                  {user.githubUrl ? (
                    <a href={user.githubUrl} target="_blank" rel="noreferrer" className="p-2 bg-deep-violet/40 border border-border-divider rounded-xl hover:border-royal-purple text-text-primary transition flex items-center gap-1.5 text-[11px]" title="GitHub">
                      <Link2 className="w-4 h-4 text-accent-purple" />
                      <span className="font-bold">GitHub</span>
                    </a>
                  ) : null}
                  {user.linkedinUrl ? (
                    <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 bg-deep-violet/40 border border-border-divider rounded-xl hover:border-royal-purple text-text-primary transition flex items-center gap-1.5 text-[11px]" title="LinkedIn">
                      <Link2 className="w-4 h-4 text-accent-purple" />
                      <span className="font-bold">LinkedIn</span>
                    </a>
                  ) : null}
                  {!user.githubUrl && !user.linkedinUrl && (
                    <span className="text-xs text-text-secondary italic pt-2">No links added yet</span>
                  )}
                </div>
              </div>

              {/* Bio Display */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Biography</label>
                <p className="w-full rounded-xl border border-border-divider bg-deep-violet/40 px-4 py-3 text-xs text-text-primary leading-relaxed">
                  {user.bio || 'Add a bio below to tell instructors and peers about yourself.'}
                </p>
              </div>
            </div>
          </div>

          {/* Form component to update profile details */}
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

      {/* Dynamic Enrollments Section */}
      <div className="bg-surface-card rounded-3xl p-8 border border-border-divider space-y-6 shadow-xl">
        <h2 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-2.5 border-b border-border-divider pb-4">
          <GraduationCap className="w-6 h-6 text-royal-purple" />
          My Course Enrollments
        </h2>
        
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <BookOpen className="w-12 h-12 text-text-secondary/50 mx-auto" />
            <p className="text-text-secondary text-sm italic">You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map(course => (
              <div key={course.id} className="p-6 bg-deep-violet/30 border border-border-divider rounded-2xl flex flex-col justify-between space-y-4 hover:border-royal-purple/40 transition duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-royal-purple/5 rounded-bl-full" />
                <div className="space-y-2">
                  <h3 className="font-black text-sm text-text-primary leading-snug">{course.title}</h3>
                  <div className="flex flex-col gap-1 text-[11px] text-text-secondary">
                    <span>Instructor: <strong className="text-text-primary font-semibold">{course.instructorName}</strong></span>
                    <span>Enrolled: <strong className="text-text-primary font-semibold">{course.enrolledAt}</strong></span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase">
                    <span>Course Progress</span>
                    <span className="text-royal-gold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-deep-violet/80 h-2.5 rounded-full overflow-hidden border border-border-divider/50">
                    <div 
                      className="bg-gradient-to-r from-royal-purple to-accent-purple h-full rounded-full transition-all duration-500" 
                      style={{ width: `${course.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Payment & Invoicing Section */}
      <div className="bg-surface-card rounded-3xl p-8 border border-border-divider space-y-6 shadow-xl overflow-hidden">
        <h2 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-2.5 border-b border-border-divider pb-4">
          <CreditCard className="w-6 h-6 text-royal-purple" />
          Billing & Invoice History
        </h2>

        {user.payments.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <CreditCard className="w-12 h-12 text-text-secondary/50 mx-auto" />
            <p className="text-text-secondary text-sm italic">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-divider">
            <table className="w-full min-w-[600px] border-collapse text-left text-xs text-text-primary">
              <thead>
                <tr className="bg-deep-violet/40 border-b border-border-divider text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-divider bg-deep-violet/5">
                {user.payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-deep-violet/20 transition duration-150">
                    <td className="py-4 px-6 font-bold tracking-tight text-text-primary">
                      {payment.reference}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-royal-gold">
                      {formatNaira(payment.amount)}
                    </td>
                    <td className="py-4 px-6 text-text-secondary font-bold uppercase tracking-wide">
                      {payment.method}
                    </td>
                    <td className="py-4 px-6 text-text-secondary font-medium">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        payment.status === 'VERIFIED'
                          ? 'bg-status-present/10 border-status-present/35 text-status-present'
                          : payment.status === 'PENDING'
                          ? 'bg-status-late/10 border-status-late/35 text-status-late'
                          : 'bg-status-absent/10 border-status-absent/35 text-status-absent'
                      }`}>
                        {payment.status === 'VERIFIED' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : payment.status === 'PENDING' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{payment.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
