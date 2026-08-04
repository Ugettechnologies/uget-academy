import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const meetings = await prisma.academyMeeting.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const body = await request.json();
    const { title, description, date, time, location } = body;

    if (!title || !date || !time) {
      return NextResponse.json({ error: 'Title, date, and time are required' }, { status: 400 });
    }

    const meeting = await prisma.academyMeeting.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        date: date.trim(),
        time: time.trim(),
        location: location ? location.trim() : 'Boardroom / Online',
        organizerId: userId,
      },
    });

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
