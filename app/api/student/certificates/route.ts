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
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: true,
      },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Fetch certificates error:', error);
    return NextResponse.json({ error: 'Failed to retrieve certificates.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId.' }, { status: 400 });
    }

    const userId = session.userId as string;

    // Verify course & lessons watch progression is 100%
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const attendanceLogs = await prisma.attendanceLog.findMany({
      where: { userId, lessonId: { in: course.lessons.map((l) => l.id) } },
    });

    const watchMap = new Set(
      attendanceLogs.filter((log) => log.durationSeconds >= 60).map((log) => log.lessonId)
    );

    const isComplete = course.lessons.every((lesson) => watchMap.has(lesson.id));

    if (!isComplete && course.lessons.length > 0) {
      return NextResponse.json(
        { error: 'You have not completed all lessons in this syllabus yet.' },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingCertificate) {
      return NextResponse.json({
        success: true,
        certificate: existingCertificate,
      });
    }

    // Generate unique verification code
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    const certificateCode = `UGET-CERT-${rand}`;

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateCode,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CLAIMED_CERTIFICATE',
        details: `Claimed completion certificate for course "${course.title}". Code: ${certificateCode}`,
      },
    });

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error('Claim certificate error:', error);
    return NextResponse.json({ error: 'Failed to record certificate claim.' }, { status: 500 });
  }
}
