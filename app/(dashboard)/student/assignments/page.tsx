import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AssignmentsClient from './AssignmentsClient';

export const dynamic = 'force-dynamic';

export default async function StudentAssignmentsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // Fetch enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // Fetch all assignments for enrolled courses
  const assignments = await prisma.assignment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      submissions: {
        where: { userId },
      },
      course: {
        select: { title: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  const formattedAssignments = assignments.map((item) => {
    const submission = item.submissions[0] || null;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      dueDate: item.dueDate.toISOString(),
      courseTitle: item.course.title,
      submission: submission
        ? {
            id: submission.id,
            type: submission.type,
            content: submission.content,
            grade: submission.grade,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt.toISOString(),
          }
        : null,
    };
  });

  return <AssignmentsClient assignments={formattedAssignments} />;
}
