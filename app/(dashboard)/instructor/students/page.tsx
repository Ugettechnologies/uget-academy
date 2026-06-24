import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import StudentsDashboardClient from './StudentsDashboardClient';

export const dynamic = 'force-dynamic';

export default async function InstructorStudentsPage() {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    redirect('/login');
  }

  // Fetch all courses belonging to this instructor
  const courses = await prisma.course.findMany({
    where: {
      instructorId: session.userId as string,
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <StudentsDashboardClient 
        courses={courses} 
        session={{
          userId: session.userId as string,
          role: session.role as string,
        }} 
      />
    </div>
  );
}
