import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AssignmentSubmitFormClient from './AssignmentSubmitFormClient';

export const dynamic = 'force-dynamic';

export default async function StudentAssignmentSubmitPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // 1. Fetch student's enrolled course IDs
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // 2. Fetch assignments matching enrolled courses
  const assignments = await prisma.assignment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      submissions: {
        where: { userId },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  // Filter outstanding open assignments
  const openAssignments = assignments.filter((a) => {
    const submission = a.submissions[0];
    if (!submission) return true;
    return a.allowResubmission; // allow if resubmission is enabled
  }).map((a) => ({
    id: a.id,
    name: a.title,
    dueDate: new Date(a.dueDate).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
  }));

  return (
    <AssignmentSubmitFormClient openAssignments={openAssignments} />
  );
}
