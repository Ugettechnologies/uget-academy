import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/instructor/attendance - Get attendance records for a course and date
export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const dateStr = searchParams.get('date');

  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId.' }, { status: 400 });
  }

  const instructorId = session.userId as string;

  try {
    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized.' }, { status: 404 });
    }

    // Parse and normalize date to start-of-day UTC
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setUTCHours(0, 0, 0, 0);

    // Get all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    // Get existing attendance for this date
    const attendances = await prisma.dailyAttendance.findMany({
      where: {
        courseId,
        date,
      },
    });

    // Create a lookup map of userId -> status
    const attendanceMap = new Map(attendances.map((a) => [a.userId, a.status]));

    // Map enrollment list to include attendance status
    const result = enrollments.map((enr) => ({
      userId: enr.user.id,
      firstName: enr.user.firstName,
      lastName: enr.user.lastName,
      email: enr.user.email,
      status: attendanceMap.get(enr.user.id) || 'ABSENT', // Default to ABSENT if not marked yet
      marked: attendanceMap.has(enr.user.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance.' }, { status: 500 });
  }
}

// POST /api/instructor/attendance - Save/Update attendance records
export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { courseId, date: dateStr, attendanceList } = await request.json();

    if (!courseId || !dateStr || !Array.isArray(attendanceList)) {
      return NextResponse.json({ error: 'Invalid input parameters.' }, { status: 400 });
    }

    const instructorId = session.userId as string;

    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized.' }, { status: 404 });
    }

    // Normalize date to start-of-day UTC
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    // Perform upserts for each student in the list
    const upsertPromises = attendanceList.map((item: { userId: string; status: string }) => {
      if (!['PRESENT', 'ABSENT', 'LATE'].includes(item.status)) {
        throw new Error(`Invalid status: ${item.status}`);
      }

      return prisma.dailyAttendance.upsert({
        where: {
          userId_courseId_date: {
            userId: item.userId,
            courseId,
            date,
          },
        },
        update: {
          status: item.status,
        },
        create: {
          userId: item.userId,
          courseId,
          date,
          status: item.status,
        },
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ success: true, message: 'Attendance records updated successfully.' });
  } catch (error: any) {
    console.error('Submit attendance error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update attendance records.' }, { status: 500 });
  }
}
