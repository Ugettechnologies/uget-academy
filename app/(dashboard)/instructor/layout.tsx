import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import InstructorLayoutFrame from '@/components/instructor/InstructorLayoutFrame';

export const dynamic = 'force-dynamic';

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
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
    <InstructorLayoutFrame user={user}>
      {children}
    </InstructorLayoutFrame>
  );
}
