import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/staff/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  // Students and Instructors are NOT allowed to access the HR/Staff page
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
