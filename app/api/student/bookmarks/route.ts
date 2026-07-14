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

  try {
    if (lessonId) {
      const bookmark = await prisma.lessonBookmark.findUnique({
        where: {
          userId_lessonId: {
            userId: session.userId as string,
            lessonId,
          },
        },
      });
      return NextResponse.json({ bookmarked: !!bookmark });
    }

    const bookmarks = await prisma.lessonBookmark.findMany({
      where: { userId: session.userId as string },
    });
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Fetch bookmarks error:', error);
    return NextResponse.json({ error: 'Failed to retrieve bookmarks.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { lessonId } = await request.json();
    if (!lessonId) {
      return NextResponse.json({ error: 'Missing lessonId.' }, { status: 400 });
    }

    const userId = session.userId as string;

    const existingBookmark = await prisma.lessonBookmark.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (existingBookmark) {
      await prisma.lessonBookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });
      return NextResponse.json({ bookmarked: false, message: 'Bookmark removed.' });
    } else {
      await prisma.lessonBookmark.create({
        data: {
          userId,
          lessonId,
        },
      });
      return NextResponse.json({ bookmarked: true, message: 'Bookmark added.' });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark.' }, { status: 500 });
  }
}
