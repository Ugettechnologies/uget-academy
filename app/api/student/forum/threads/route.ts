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
    // Get student enrollments to restrict course categories
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);

    // Fetch lounge and enrolled course threads
    const threads = await prisma.forumThread.findMany({
      where: {
        OR: [
          { courseId: null }, // lounge
          { courseId: { in: courseIds } },
        ],
      },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        replies: {
          include: {
            author: {
              select: { firstName: true, lastName: true, role: true },
            },
            upvotes: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        upvotes: true,
        course: {
          select: { title: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error('Fetch threads error:', error);
    return NextResponse.json({ error: 'Failed to retrieve threads.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const { title, content, courseId } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content.' }, { status: 400 });
    }

    // Verify courseId is null or student is enrolled
    if (courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });
      if (!enrollment) {
        return NextResponse.json({ error: 'Not enrolled in this course forum.' }, { status: 403 });
      }
    }

    const thread = await prisma.forumThread.create({
      data: {
        title,
        content,
        courseId: courseId || null,
        authorId: userId,
      },
    });

    return NextResponse.json({ success: true, thread });
  } catch (error) {
    console.error('Create thread error:', error);
    return NextResponse.json({ error: 'Failed to create thread.' }, { status: 500 });
  }
}
