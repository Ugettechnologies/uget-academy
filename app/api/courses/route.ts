import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const createCourseSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  description: z.string().min(10, 'Description is too short'),
  price: z.number().nonnegative('Price cannot be negative'),
});

// GET /api/courses - List all published courses
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('instructorId');

  try {
    const courses = await prisma.course.findMany({
      where: {
        ...(instructorId ? { instructorId } : {}),
        // If not filtering by instructor, only show published courses
        ...(!instructorId ? { published: true } : {}),
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('List courses error:', error);
    return NextResponse.json({ error: 'Failed to retrieve courses.' }, { status: 500 });
  }
}

// POST /api/courses - Create new course (Instructor only)
export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = createCourseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input parameters.' }, { status: 400 });
    }

    const { title, description, price } = result.data;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price,
        instructorId: session.userId as string,
        published: false, // Draft by default
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Failed to create course.' }, { status: 500 });
  }
}
