import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentLayoutFrame from '@/components/student/StudentLayoutFrame';

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
    <StudentLayoutFrame user={user}>
      {children}
    </StudentLayoutFrame>
  );
}
