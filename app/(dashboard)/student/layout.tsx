import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentSidebar from '@/components/student/StudentSidebar';
import { User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = {
    firstName: (session.firstName as string) || 'Student',
    lastName: (session.lastName as string) || '',
  };

  return (
    <div className="min-h-screen bg-[#E8F1FC] flex text-slate-800 font-sans">
      {/* Sidebar navigation */}
      <StudentSidebar user={user} />

      {/* Main content viewport */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            {/* Can display optional notifications or leave empty for design alignment */}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E0EEFF] flex items-center justify-center text-[#1E60D5]">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </header>

        {/* Dynamic content rendering */}
        <main className="flex-grow p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
