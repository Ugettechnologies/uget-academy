import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/instructor/reports - Get weekly reports for a course
export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId.' }, { status: 400 });
  }

  const instructorId = session.userId as string;

  try {
    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized.' }, { status: 404 });
    }

    const reports = await prisma.weeklyReport.findMany({
      where: { courseId },
      orderBy: { weekNumber: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly reports.' }, { status: 500 });
  }
}

// POST /api/instructor/reports - Submit or update weekly report
export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { courseId, weekNumber, summary, challenges, nextSteps } = await request.json();

    if (!courseId || weekNumber === undefined || !summary) {
      return NextResponse.json({ error: 'Missing courseId, weekNumber, or summary.' }, { status: 400 });
    }

    const instructorId = session.userId as string;

    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized.' }, { status: 404 });
    }

    // Upsert weekly report
    const report = await prisma.weeklyReport.upsert({
      where: {
        courseId_weekNumber: {
          courseId,
          weekNumber: Number(weekNumber),
        },
      },
      update: {
        summary,
        challenges: challenges || '',
        nextSteps: nextSteps || '',
        submittedAt: new Date(),
      },
      create: {
        courseId,
        instructorId,
        weekNumber: Number(weekNumber),
        summary,
        challenges: challenges || '',
        nextSteps: nextSteps || '',
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Submit report error:', error);
    return NextResponse.json({ error: 'Failed to submit weekly report.' }, { status: 500 });
  }
}
