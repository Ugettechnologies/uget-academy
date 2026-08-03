import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Double check admin or staff role
  const adminUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                _count: {
                  select: {
                    lessons: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        grades: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
        dailyAttendances: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          take: 30,
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        certificates: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            issuedAt: 'desc',
          },
        },
        assignmentSubmissions: {
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
          take: 10,
        },
        quizAttempts: {
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student user not found' }, { status: 404 });
    }

    // Calculate lesson attendance watched count per enrollment
    const lessonLogs = await prisma.attendanceLog.findMany({
      where: { userId: targetUserId },
      select: {
        lessonId: true,
        durationSeconds: true,
      },
    });

    const watchedSet = new Set(
      lessonLogs.filter((log) => log.durationSeconds >= 60).map((log) => log.lessonId)
    );

    const formattedEnrollments = await Promise.all(
      student.enrollments.map(async (enr) => {
        const lessons = await prisma.lesson.findMany({
          where: { courseId: enr.courseId },
          select: { id: true },
        });
        const totalLessons = lessons.length;
        const watchedCount = lessons.filter((l) => watchedSet.has(l.id)).length;
        const progressPercent = totalLessons > 0 ? Math.round((watchedCount / totalLessons) * 100) : 0;

        return {
          id: enr.id,
          courseId: enr.course.id,
          courseTitle: enr.course.title,
          courseDescription: enr.course.description,
          price: enr.course.price,
          enrolledAt: enr.createdAt,
          totalLessons,
          watchedCount,
          progressPercent,
        };
      })
    );

    // Calculate overall attendance rate
    const totalDaily = student.dailyAttendances.length;
    const presentDaily = student.dailyAttendances.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    const attendanceRate = totalDaily > 0 ? Math.round((presentDaily / totalDaily) * 100) : 100;

    return NextResponse.json({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      role: student.role,
      phone: student.phone,
      bio: student.bio,
      githubUrl: student.githubUrl,
      linkedinUrl: student.linkedinUrl,
      createdAt: student.createdAt,
      emailVerified: student.emailVerified,
      enrollments: formattedEnrollments,
      grades: student.grades,
      dailyAttendances: student.dailyAttendances,
      attendanceRate,
      payments: student.payments,
      certificates: student.certificates,
      assignmentSubmissions: student.assignmentSubmissions,
      quizAttempts: student.quizAttempts,
    });
  } catch (error) {
    console.error('Fetch student detail error:', error);
    return NextResponse.json({ error: 'Failed to load student detail' }, { status: 500 });
  }
}
