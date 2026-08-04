import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import StaffPortalClient from '@/components/staff/StaffPortalClient';

export const dynamic = 'force-dynamic';

export default async function StaffOpsDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  // Students and Instructors are NOT allowed to access the HR/Staff Portal
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    redirect('/unauthorized');
  }

  return (
    <StaffPortalClient
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }}
    />
  );
}
