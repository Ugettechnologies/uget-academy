import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, candidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, position, stage, notes } = body;

    if (!name || !email || !position) {
      return NextResponse.json({ error: 'Name, email, and position are required' }, { status: 400 });
    }

    const candidate = await prisma.candidate.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        position: position.trim(),
        stage: stage || 'APPLIED',
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({ success: true, candidate });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { candidateId, stage, notes } = body;

    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        stage: stage || undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, candidate });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}
