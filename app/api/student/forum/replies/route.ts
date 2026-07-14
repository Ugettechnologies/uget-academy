import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const { threadId, content } = await request.json();
    if (!threadId || !content) {
      return NextResponse.json({ error: 'Missing threadId or content.' }, { status: 400 });
    }

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found.' }, { status: 404 });
    }

    const reply = await prisma.forumReply.create({
      data: {
        threadId,
        content,
        authorId: userId,
      },
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Create reply error:', error);
    return NextResponse.json({ error: 'Failed to submit reply.' }, { status: 500 });
  }
}
