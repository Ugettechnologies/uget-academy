import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId');

  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lessonId parameter.' }, { status: 400 });
  }

  try {
    const note = await prisma.lessonNote.findUnique({
      where: {
        userId_lessonId: {
          userId: session.userId as string,
          lessonId,
        },
      },
    });

    return NextResponse.json(note || { content: '' });
  } catch (error) {
    console.error('Fetch note error:', error);
    return NextResponse.json({ error: 'Failed to retrieve note.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { lessonId, content } = await request.json();
    if (!lessonId) {
      return NextResponse.json({ error: 'Missing lessonId.' }, { status: 400 });
    }

    const userId = session.userId as string;

    const note = await prisma.lessonNote.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        content,
      },
      create: {
        userId,
        lessonId,
        content,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Upsert note error:', error);
    return NextResponse.json({ error: 'Failed to save note.' }, { status: 500 });
  }
}
