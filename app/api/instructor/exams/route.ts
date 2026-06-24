import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/instructor/exams - Get exam configuration for a course
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

    const exam = await prisma.exam.findUnique({
      where: { courseId },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error('Fetch exam error:', error);
    return NextResponse.json({ error: 'Failed to fetch course exam configuration.' }, { status: 500 });
  }
}

// POST /api/instructor/exams - Create or update exam configuration
export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { courseId, practicalTask, interviewQns } = await request.json();

    if (!courseId || practicalTask === undefined || interviewQns === undefined) {
      return NextResponse.json({ error: 'Missing courseId, practicalTask, or interviewQns.' }, { status: 400 });
    }

    const instructorId = session.userId as string;

    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized.' }, { status: 404 });
    }

    // Upsert the exam
    const exam = await prisma.exam.upsert({
      where: { courseId },
      update: {
        practicalTask,
        interviewQns,
      },
      create: {
        courseId,
        practicalTask,
        interviewQns,
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('Submit exam error:', error);
    return NextResponse.json({ error: 'Failed to save exam configuration.' }, { status: 500 });
  }
}
