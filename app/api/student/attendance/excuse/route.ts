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
    const { liveSessionId, reason } = await request.json();
    if (!liveSessionId || !reason) {
      return NextResponse.json({ error: 'Missing liveSessionId or reason.' }, { status: 400 });
    }

    const excuse = await prisma.absenceExcuse.upsert({
      where: {
        liveSessionId_userId: {
          liveSessionId,
          userId,
        },
      },
      update: {
        reason,
        status: 'PENDING',
        resolvedBy: null,
        resolvedAt: null,
      },
      create: {
        liveSessionId,
        userId,
        reason,
        status: 'PENDING',
      },
    });

    // Also update the attendance log if they have an active attendance (so status can reflect EXCUSED)
    // Wait, the excuse is reviewed by instructor, but we keep it linked.
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'SUBMITTED_ABSENCE_EXCUSE',
        details: `Submitted excuse for live session. Reason: ${reason.substring(0, 60)}...`,
      },
    });

    return NextResponse.json({ success: true, excuse });
  } catch (error) {
    console.error('Submit excuse error:', error);
    return NextResponse.json({ error: 'Failed to record excuse request.' }, { status: 500 });
  }
}
