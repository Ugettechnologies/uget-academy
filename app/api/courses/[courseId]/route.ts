import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().nonnegative().optional(),
  published: z.boolean().optional(),
});

// GET /api/courses/[courseId] - Get single course details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await getSession();

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Check if the user is enrolled or is the instructor
    let isEnrolled = false;
    let isInstructor = false;

    if (session) {
      if (session.role === 'STUDENT') {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.userId as string,
              courseId,
            },
          },
        });
        isEnrolled = !!enrollment;
      } else if (session.role === 'INSTRUCTOR' && course.instructorId === session.userId) {
        isInstructor = true;
      } else if (session.role === 'ADMIN') {
        isEnrolled = true; // Admin can watch anything
      }
    }

    // If not enrolled/instructor, strip playback IDs to prevent piracy
    const sanitizedLessons = course.lessons.map((lesson: any) => {
      if (isEnrolled || isInstructor) return lesson;
      return {
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        courseId: lesson.courseId,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        muxPlaybackId: null, // Hidden for non-enrolled users
        muxAssetId: null,
      };
    });

    return NextResponse.json({
      ...course,
      lessons: sanitizedLessons,
      isEnrolled,
      isInstructor,
    });

  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json({ error: 'Failed to retrieve course details.' }, { status: 500 });
  }
}

// PUT /api/courses/[courseId] - Update course details (Instructor only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    if (course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const result = updateCourseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input parameters.' }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: result.data,
    });

    return NextResponse.json(updatedCourse);

  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json({ error: 'Failed to update course.' }, { status: 500 });
  }
}

// DELETE /api/courses/[courseId] - Delete course (Instructor only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    if (course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: 'Course deleted successfully.' });

  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json({ error: 'Failed to delete course.' }, { status: 500 });
  }
}
