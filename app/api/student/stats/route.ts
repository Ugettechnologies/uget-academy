import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    // Get all student enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    // Fetch all attendance logs for the user
    const attendanceLogs = await prisma.attendanceLog.findMany({
      where: { userId },
    });

    // Calculate total watch time in seconds
    const totalWatchTimeSeconds = attendanceLogs.reduce((acc, log) => acc + log.durationSeconds, 0);
    const totalWatchHours = (totalWatchTimeSeconds / 3600).toFixed(1);

    // Calculate lessons counts
    let totalLessonsCount = 0;
    enrollments.forEach((e) => {
      totalLessonsCount += e.course.lessons.length;
    });

    // A lesson is considered "attended" if watch time is >= 60 seconds
    const attendedLessonsCount = attendanceLogs.filter((log) => log.durationSeconds >= 60).length;

    const attendanceRate = totalLessonsCount > 0 
      ? Math.round((attendedLessonsCount / totalLessonsCount) * 100) 
      : 100;

    // Fetch recent activities
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Generate dynamic recap briefing
    let briefing = "Welcome back to UGET Academy! ";
    if (enrollments.length === 0) {
      briefing += "You are not enrolled in any courses yet. Browse our course catalog to find a course and start learning!";
    } else if (totalWatchTimeSeconds === 0) {
      briefing += `You are enrolled in ${enrollments.length} course${enrollments.length > 1 ? 's' : ''}, but haven't started watching any lessons yet. Open a lesson from your dashboard to begin!`;
    } else {
      const minutesWatched = Math.round(totalWatchTimeSeconds / 60);
      briefing += `You have spent ${minutesWatched} minutes actively learning across your ${enrollments.length} enrolled course${enrollments.length > 1 ? 's' : ''}. `;
      if (attendanceRate >= 80) {
        briefing += `Excellent! Your attendance rate is at ${attendanceRate}%, which is well above the recommended 80% threshold. Keep up the amazing work!`;
      } else if (attendanceRate >= 50) {
        briefing += `Good effort! Your attendance rate is at ${attendanceRate}%. Try to spend a bit more time in class this week to boost your completion status.`;
      } else {
        briefing += `Your attendance rate is currently ${attendanceRate}%. Regular class participation is key to mastering these tech skills. Try watching a lesson today!`;
      }
    }

    return NextResponse.json({
      totalWatchHours,
      totalWatchTimeSeconds,
      totalLessonsCount,
      attendedLessonsCount,
      attendanceRate,
      briefing,
      activities,
      attendanceLogs,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve statistics.' }, { status: 500 });
  }
}
