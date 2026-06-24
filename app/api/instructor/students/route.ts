import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') || undefined;
  const instructorId = session.userId as string;

  try {
    // Retrieve students enrolled in the instructor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: instructorId,
          ...(courseId ? { id: courseId } : {}),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the list of students nicely
    const students = enrollments.map((enr) => ({
      id: enr.user.id,
      firstName: enr.user.firstName,
      lastName: enr.user.lastName,
      email: enr.user.email,
      courseId: enr.course.id,
      courseTitle: enr.course.title,
      enrolledAt: enr.createdAt,
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error('Fetch instructor students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students.' }, { status: 500 });
  }
}
