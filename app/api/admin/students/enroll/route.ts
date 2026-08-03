import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit-log';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { userId, courseId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Both Student User ID and Course ID are required' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Target course not found' }, { status: 404 });
    }

    // Check existing enrollment
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: `${targetUser.firstName} ${targetUser.lastName} is already enrolled in "${course.title}".` },
        { status: 200 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    await logAdminAction({
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'UPDATE_USER_ROLE' as any, // Audit action
      targetId: userId,
      metadata: {
        actionType: 'ENROLL_STUDENT',
        studentEmail: targetUser.email,
        courseId: course.id,
        courseTitle: course.title,
      },
      ip,
    });

    return NextResponse.json({
      message: `Successfully enrolled ${targetUser.firstName} ${targetUser.lastName} into "${course.title}".`,
      enrollment,
    });
  } catch (error) {
    console.error('Admin enroll student error:', error);
    return NextResponse.json({ error: 'Failed to enroll student' }, { status: 500 });
  }
}
