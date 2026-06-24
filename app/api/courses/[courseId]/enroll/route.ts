import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await getSession();

  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.userId as string,
        courseId: course.id,
      },
    });

    return NextResponse.json({
      message: 'Enrolled successfully.',
      enrollment,
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    // If already enrolled (Prisma unique constraint failure)
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Already enrolled.' });
    }
    return NextResponse.json({ error: 'Failed to enroll in course.' }, { status: 500 });
  }
}
