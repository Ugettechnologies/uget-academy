import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const complaints = await prisma.staffComplaint.findMany({
      where: session.role === 'STAFF' ? { staffUserId: userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error('Error fetching staff complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
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
    const { subject, details, priority } = body;

    if (!subject || !details) {
      return NextResponse.json({ error: 'Subject and details are required' }, { status: 400 });
    }

    const complaint = await prisma.staffComplaint.create({
      data: {
        staffUserId: userId,
        subject: subject.trim(),
        details: details.trim(),
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Error creating staff complaint:', error);
    return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only Admin can resolve complaints' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { complaintId, status, adminNote } = body;

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const complaint = await prisma.staffComplaint.update({
      where: { id: complaintId },
      data: {
        status: status || undefined,
        adminNote: adminNote !== undefined ? adminNote : undefined,
      },
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
