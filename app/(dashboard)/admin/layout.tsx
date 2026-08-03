import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminLayoutFrame from '@/components/admin/AdminLayoutFrame';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!user || user.role !== 'ADMIN') {
    // If not admin, redirect to login
    redirect('/login');
  }

  return (
    <AdminLayoutFrame
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }}
    >
      {children}
    </AdminLayoutFrame>
  );
}
