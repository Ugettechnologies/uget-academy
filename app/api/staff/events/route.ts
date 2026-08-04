import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const events = await prisma.academyEvent.findMany({
      orderBy: { eventDate: 'asc' },
    });
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, eventDate, location, targetAudience } = body;

    if (!title || !description || !eventDate) {
      return NextResponse.json({ error: 'Title, description, and date are required' }, { status: 400 });
    }

    const event = await prisma.academyEvent.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        eventDate: new Date(eventDate),
        location: location ? location.trim() : 'Main Campus',
        targetAudience: targetAudience || 'ALL',
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
