import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/instructor/topics - Get topics for a course
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

    const topics = await prisma.courseTopic.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Fetch topics error:', error);
    return NextResponse.json({ error: 'Failed to fetch course topics.' }, { status: 500 });
  }
}

// POST /api/instructor/topics - Create a course topic
export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { courseId, title, description, content, videoUrl } = await request.json();

    if (!courseId || !title || !content) {
      return NextResponse.json({ error: 'Missing courseId, title, or content.' }, { status: 400 });
    }

    const instructorId = session.userId as string;

    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized.' }, { status: 404 });
    }

    const topic = await prisma.courseTopic.create({
      data: {
        courseId,
        title,
        description: description || '',
        content,
        videoUrl: videoUrl || '',
      },
    });

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json({ error: 'Failed to create course topic.' }, { status: 500 });
  }
}

// PUT /api/instructor/topics - Update a course topic
export async function PUT(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { topicId, title, description, content, videoUrl } = await request.json();

    if (!topicId || !title || !content) {
      return NextResponse.json({ error: 'Missing topicId, title, or content.' }, { status: 400 });
    }

    const instructorId = session.userId as string;

    // Find the topic first to get its courseId and verify authorization
    const topic = await prisma.courseTopic.findUnique({
      where: { id: topicId },
      include: { course: true },
    });

    if (!topic || topic.course.instructorId !== instructorId) {
      return NextResponse.json({ error: 'Topic not found or unauthorized.' }, { status: 404 });
    }

    const updatedTopic = await prisma.courseTopic.update({
      where: { id: topicId },
      data: {
        title,
        description: description || '',
        content,
        videoUrl: videoUrl || '',
      },
    });

    return NextResponse.json({ success: true, topic: updatedTopic });
  } catch (error) {
    console.error('Update topic error:', error);
    return NextResponse.json({ error: 'Failed to update course topic.' }, { status: 500 });
  }
}

// DELETE /api/instructor/topics - Delete a course topic
export async function DELETE(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('topicId');

  if (!topicId) {
    return NextResponse.json({ error: 'Missing topicId.' }, { status: 400 });
  }

  const instructorId = session.userId as string;

  try {
    // Find the topic first to get its courseId and verify authorization
    const topic = await prisma.courseTopic.findUnique({
      where: { id: topicId },
      include: { course: true },
    });

    if (!topic || topic.course.instructorId !== instructorId) {
      return NextResponse.json({ error: 'Topic not found or unauthorized.' }, { status: 404 });
    }

    await prisma.courseTopic.delete({
      where: { id: topicId },
    });

    return NextResponse.json({ success: true, message: 'Topic deleted successfully.' });
  } catch (error) {
    console.error('Delete topic error:', error);
    return NextResponse.json({ error: 'Failed to delete course topic.' }, { status: 500 });
  }
}
