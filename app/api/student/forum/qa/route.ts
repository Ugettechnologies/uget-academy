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
    const qaList = await prisma.directQA.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(qaList);
  } catch (error) {
    console.error('Fetch QA error:', error);
    return NextResponse.json({ error: 'Failed to fetch Q&A logs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const { courseId, question } = await request.json();
    if (!courseId || !question) {
      return NextResponse.json({ error: 'Missing courseId or question.' }, { status: 400 });
    }

    const qa = await prisma.directQA.create({
      data: {
        courseId,
        studentId: userId,
        question,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'SUBMITTED_DIRECT_QA',
        details: `Asked instructor a question: "${question.substring(0, 60)}..."`,
      },
    });

    return NextResponse.json({ success: true, qa });
  } catch (error) {
    console.error('Create QA error:', error);
    return NextResponse.json({ error: 'Failed to record question.' }, { status: 500 });
  }
}
