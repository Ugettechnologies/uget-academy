import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activityLogs = await prisma.activityLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const attendanceLogsCount = await prisma.attendanceLog.count();
    const activeStudentsCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalInstructorsCount = await prisma.user.count({ where: { role: 'INSTRUCTOR' } });

    return NextResponse.json({
      success: true,
      stats: {
        attendanceLogsCount,
        activeStudentsCount,
        totalInstructorsCount,
      },
      activityLogs,
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}
