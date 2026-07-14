import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    // Get all student enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    // Fetch assignments for enrolled courses
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        submissions: {
          where: { userId },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Fetch assignments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { assignmentId, type, content } = await request.json();
    if (!assignmentId || !type || !content) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const userId = session.userId as string;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
    }

    // Verify submission allowed
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId,
        },
      },
    });

    if (existingSubmission && !assignment.allowResubmission) {
      return NextResponse.json(
        { error: 'Resubmission is disabled for this assignment.' },
        { status: 400 }
      );
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId,
        },
      },
      update: {
        type,
        content,
        grade: null, // Reset grade upon resubmission
        feedback: null, // Reset feedback
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        userId,
        type,
        content,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'SUBMITTED_ASSIGNMENT',
        details: `Submitted assignment "${assignment.title}"`,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Assignment submission error:', error);
    return NextResponse.json({ error: 'Failed to record submission.' }, { status: 500 });
  }
}
