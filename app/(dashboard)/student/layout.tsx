import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  const user = {
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    email: dbUser.email,
  };

  return (
    <StudentLayoutFrame user={user}>
      {children}
    </StudentLayoutFrame>
  );
}
