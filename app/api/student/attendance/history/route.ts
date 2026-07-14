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
    // Enrolled course IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);

    // Fetch all live sessions for these courses
    const liveSessions = await prisma.liveSession.findMany({
      where: { courseId: { in: courseIds } },
      orderBy: { startTime: 'desc' },
      include: {
        attendances: {
          where: { userId },
        },
        excuses: {
          where: { userId },
        },
        course: {
          select: { title: true },
        },
      },
    });

    return NextResponse.json(liveSessions);
  } catch (error) {
    console.error('Fetch attendance history error:', error);
    return NextResponse.json({ error: 'Failed to retrieve attendance history.' }, { status: 500 });
  }
}
