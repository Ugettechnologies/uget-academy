import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Helper to calculate distance in meters between two geocoordinates (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const { sessionCode, latitude, longitude } = await request.json();
    if (!sessionCode) {
      return NextResponse.json({ error: 'Session code is required.' }, { status: 400 });
    }

    const now = new Date();

    // Find active live session matching code
    const liveSession = await prisma.liveSession.findFirst({
      where: {
        sessionCode: {
          equals: sessionCode.trim(),
        },
        startTime: { lte: now },
        endTime: { gte: now },
      },
    });

    if (!liveSession) {
      return NextResponse.json(
        { error: 'Invalid or expired session code.' },
        { status: 404 }
      );
    }

    // Geofencing verification
    if (
      liveSession.latitude !== null &&
      liveSession.longitude !== null &&
      liveSession.radius !== null
    ) {
      if (latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { error: 'This session requires Geofencing validation. Please share location.' },
          { status: 400 }
        );
      }

      const distance = getDistance(
        latitude,
        longitude,
        liveSession.latitude,
        liveSession.longitude
      );

      if (distance > liveSession.radius) {
        return NextResponse.json(
          {
            error: `Location check failed. You are ${Math.round(
              distance
            )} meters away (allowed radius: ${liveSession.radius}m).`,
          },
          { status: 403 }
        );
      }
    }

    // Check-in status determination (LATE if checking in 15 mins after startTime)
    const minutesLate = (now.getTime() - liveSession.startTime.getTime()) / 60000;
    const status = minutesLate > 15 ? 'LATE' : 'PRESENT';

    // Upsert attendance
    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    const attendance = await prisma.liveSessionAttendance.upsert({
      where: {
        liveSessionId_userId: {
          liveSessionId: liveSession.id,
          userId,
        },
      },
      update: {
        status,
        checkInTime: now,
        ipAddress,
        latitude: latitude || null,
        longitude: longitude || null,
      },
      create: {
        liveSessionId: liveSession.id,
        userId,
        status,
        checkInTime: now,
        ipAddress,
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    // Create a daily attendance record to sync with dashboard stats
    await prisma.dailyAttendance.upsert({
      where: {
        userId_courseId_date: {
          userId,
          courseId: liveSession.courseId,
          date: new Date(now.toDateString()), // normalize to start of day
        },
      },
      update: {
        status,
      },
      create: {
        userId,
        courseId: liveSession.courseId,
        date: new Date(now.toDateString()),
        status,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'ATTENDED_LIVE_SESSION',
        details: `Checked into Live Session "${liveSession.title}" as ${status}`,
      },
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Failed to record check-in.' }, { status: 500 });
  }
}
