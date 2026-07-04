import React from 'react';
import { requireRole } from '@/lib/require-role';
import { prisma } from '@/lib/prisma';
import RoleManager from '@/components/admin/RoleManager';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const session = await requireRole(['ADMIN']);

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Map to the plain object array for props
  const formattedUsers = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role as any,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-950 dark:text-white">
          <Users className="w-8 h-8 text-brand-primary" />
          Access Control Directory
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Modify academy user roles (Student, Instructor, Staff, and Administrator)
        </p>
      </div>

      {/* Role Manager Component */}
      <RoleManager 
        initialUsers={formattedUsers} 
        currentAdminId={session.userId} 
      />

    </div>
  );
}
