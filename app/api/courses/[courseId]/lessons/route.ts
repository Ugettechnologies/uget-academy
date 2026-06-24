import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createDirectUpload } from '@/lib/mux';

const createLessonSchema = z.object({
  title: z.string().min(3),
  order: z.number().int().nonnegative(),
});

// GET /api/courses/[courseId]/lessons - Get all lessons for a course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('List lessons error:', error);
    return NextResponse.json({ error: 'Failed to retrieve lessons.' }, { status: 500 });
  }
}

// POST /api/courses/[courseId]/lessons - Add lesson & initiate Mux upload (Instructor only)
export async function POST(
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
    const result = createLessonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input parameters.' }, { status: 400 });
    }

    const { title, order } = result.data;

    // Call Mux to create direct upload
    const upload = await createDirectUpload();

    // Save lesson in DB (store asset_id from Mux)
    const lesson = await prisma.lesson.create({
      data: {
        title,
        order,
        courseId,
        muxAssetId: upload.asset_id,
        muxPlaybackId: null, // Set upon verification/processing
      },
    });

    // Return the created lesson along with the direct upload URL for client upload
    return NextResponse.json({
      lesson,
      uploadUrl: upload.url,
    }, { status: 201 });

  } catch (error) {
    console.error('Create lesson error:', error);
    return NextResponse.json({ error: 'Failed to create lesson.' }, { status: 500 });
  }
}
