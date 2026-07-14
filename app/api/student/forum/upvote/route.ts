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
    const { threadId, replyId } = await request.json();
    if (!threadId && !replyId) {
      return NextResponse.json({ error: 'Missing threadId or replyId.' }, { status: 400 });
    }

    // Toggle upvote logic
    const existingUpvote = await prisma.forumUpvote.findFirst({
      where: {
        userId,
        threadId: threadId || null,
        replyId: replyId || null,
      },
    });

    if (existingUpvote) {
      await prisma.forumUpvote.delete({
        where: { id: existingUpvote.id },
      });
      return NextResponse.json({ success: true, upvoted: false });
    } else {
      await prisma.forumUpvote.create({
        data: {
          userId,
          threadId: threadId || null,
          replyId: replyId || null,
        },
      });
      return NextResponse.json({ success: true, upvoted: true });
    }
  } catch (error) {
    console.error('Toggle upvote error:', error);
    return NextResponse.json({ error: 'Failed to toggle upvote.' }, { status: 500 });
  }
}
