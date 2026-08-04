import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminPaymentManager from '@/components/admin/AdminPaymentManager';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return <AdminPaymentManager />;
}
