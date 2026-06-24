import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const session = await getSession();

  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const { increment = 10 } = await request.json().catch(() => ({}));

    // Find the lesson and its course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course.' }, { status: 403 });
    }

    // Update or create AttendanceLog
    const attendanceLog = await prisma.attendanceLog.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        durationSeconds: increment,
      },
      update: {
        durationSeconds: {
          increment,
        },
      },
    });

    // Create an ActivityLog entry if they haven't watched this lesson recently or if it's the first time
    const lastActivity = await prisma.activityLog.findFirst({
      where: {
        userId,
        action: 'WATCHED_LESSON',
        details: {
          startsWith: `Watched "${lesson.title}"`,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Log activity if no previous log or if the last watch log was > 10 minutes ago
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (!lastActivity || lastActivity.createdAt < tenMinutesAgo) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'WATCHED_LESSON',
          details: `Watched "${lesson.title}" in course "${lesson.course.title}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      durationSeconds: attendanceLog.durationSeconds,
    });
  } catch (error) {
    console.error('Attendance track error:', error);
    return NextResponse.json({ error: 'Failed to record attendance.' }, { status: 500 });
  }
}
