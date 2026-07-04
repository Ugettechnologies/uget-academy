import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import Link from 'next/link';

// Use dynamic rendering since we read cookies inside layout
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const role = session.role as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'STAFF';

  // Navigation Links based on role
  const navLinks = {
    STUDENT: [
      { label: 'My Dashboard', href: '/student' },
      { label: 'Browse Courses', href: '/student/courses' },
      { label: 'Payments & History', href: '/student/payments' },
      { label: 'Profile', href: '/student/profile' },
    ],
    INSTRUCTOR: [
      { label: 'Dashboard', href: '/instructor' },
      { label: 'My Courses', href: '/instructor/courses' },
      { label: 'My Students', href: '/instructor/students' },
    ],
    STAFF: [
      { label: 'Dashboard', href: '/staff' },
    ],
    ADMIN: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Verify Payments', href: '/admin/payments' },
      { label: 'Students', href: '/admin/students' },
      { label: 'Instructors', href: '/admin/instructors' },
      { label: 'Notifications', href: '/admin/notifications' },
      { label: 'Audit Log', href: '/admin/audit-log' },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={`/${role.toLowerCase()}`}>
              <Logo size="sm" className="!text-slate-900 dark:!text-white" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks[role].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 dark:text-slate-350 hover:text-brand-primary dark:hover:text-white transition"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {role === 'ADMIN' ? 'Administrator' : role === 'STAFF' ? 'Staff' : role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}
            </span>

            {/* Logout Client Form Wrapper */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 rounded-lg px-3.5 py-2 transition bg-white dark:bg-slate-800"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-2.5 px-4 overflow-x-auto whitespace-nowrap flex gap-4 scrollbar-none">
        {navLinks[role].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-primary transition"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
