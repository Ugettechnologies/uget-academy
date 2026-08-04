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
    const reports = await prisma.staffReport.findMany({
      where: session.role === 'STAFF' ? { staffUserId: userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching staff reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
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
    const { title, content, priority } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const report = await prisma.staffReport.create({
      data: {
        staffUserId: userId,
        title: title.trim(),
        content: content.trim(),
        priority: priority || 'NORMAL',
        status: 'SUBMITTED',
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error creating staff report:', error);
    return NextResponse.json({ error: 'Failed to submit report to Admin' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only Admin can review reports' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { reportId, adminReply, status } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const report = await prisma.staffReport.update({
      where: { id: reportId },
      data: {
        adminReply: adminReply !== undefined ? adminReply : undefined,
        status: status || 'REVIEWED',
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error updating staff report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
