import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const rawComplaints = await prisma.staffComplaint.findMany({
      where: (session.role === 'STAFF' || session.role === 'INSTRUCTOR') ? { staffUserId: userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Populate user info for each complaint
    const userIds = Array.from(new Set(rawComplaints.map((c) => c.staffUserId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const complaints = rawComplaints.map((c) => {
      const u = userMap.get(c.staffUserId);
      return {
        ...c,
        userName: u ? `${u.firstName} ${u.lastName}` : 'Academy User',
        userEmail: u ? u.email : '',
        userRole: u ? u.role : 'STAFF',
      };
    });

    // Also fetch Student Support Tickets if Admin or Staff
    let studentTickets: any[] = [];
    if (session.role === 'ADMIN' || session.role === 'STAFF') {
      const tickets = await prisma.supportTicket.findMany({
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      studentTickets = tickets.map((t) => ({
        id: t.id,
        staffUserId: t.userId,
        subject: t.subject,
        details: t.message,
        priority: 'MEDIUM',
        status: t.status === 'IN_PROGRESS' ? 'IN_REVIEW' : t.status,
        adminNote: t.adminReply,
        createdAt: t.createdAt,
        userName: `${t.user.firstName} ${t.user.lastName}`,
        userEmail: t.user.email,
        userRole: t.user.role,
        isStudentTicket: true,
      }));
    }

    return NextResponse.json({ success: true, complaints, studentTickets });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
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
    console.error('Error creating complaint:', error);
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
    const { complaintId, status, adminNote, isStudentTicket } = body;

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    if (isStudentTicket) {
      const ticket = await prisma.supportTicket.update({
        where: { id: complaintId },
        data: {
          status: status === 'IN_REVIEW' ? 'IN_PROGRESS' : status || undefined,
          adminReply: adminNote !== undefined ? adminNote : undefined,
          resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
        },
      });
      return NextResponse.json({ success: true, complaint: ticket });
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
