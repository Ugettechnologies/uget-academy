import React from 'react';
import { requireRole } from '@/lib/require-role';
import { prisma } from '@/lib/prisma';
import RoleManager from '@/components/admin/RoleManager';
import { Users, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const session = await requireRole(['ADMIN', 'STAFF']);

  // Fetch all users with enrollment relationships
  const users = await prisma.user.findMany({
    include: {
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch all active courses for quick enrollment options
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      price: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  // Map to plain object array for props
  const formattedUsers = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    username: u.username || undefined,
    status: u.status || 'APPROVED',
    phone: u.phone || undefined,
    bio: u.bio || undefined,
    role: u.role as any,
    createdAt: u.createdAt.toISOString(),
    enrollments: u.enrollments.map((e) => ({
      id: e.id,
      courseId: e.course.id,
      courseTitle: e.course.title,
    })),
  }));

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-950 dark:text-white">
            <GraduationCap className="w-8 h-8 text-brand-primary" />
            Academy Student & User Management Directory
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            View comprehensive student scorecards, manage course enrollments, track academic progress, update user roles, and export complete roster datasets.
          </p>
        </div>
      </div>

      {/* Role & Student Manager Component */}
      <RoleManager 
        initialUsers={formattedUsers} 
        courses={courses}
        currentAdminId={session.userId} 
      />
    </div>
  );
}
