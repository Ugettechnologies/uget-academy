import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email address or Student ID / Username is required'),
  roleHint: z.enum(['STUDENT', 'INSTRUCTOR']).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address or Student ID / Username.' },
        { status: 400 }
      );
    }

    const { identifier } = result.data;
    const cleanInput = identifier.trim();

    // Query user by Email or Username (e.g. 2026/STU/A026)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput.toLowerCase() },
          { username: cleanInput },
        ],
      },
    });

    if (!user) {
      // Vague response for security
      return NextResponse.json({
        message: 'If an account matches that identifier, your reset request has been sent to the Administrator for approval.',
      });
    }

    // ─── INSTRUCTOR FLOW ──────────────────────────────────────────────────────
    if (user.role === 'INSTRUCTOR') {
      return NextResponse.json(
        {
          error: 'INSTRUCTOR_NO_SELF_RESET',
          message: 'Instructors cannot self-reset their password. Please submit a verification query to the Academy Administrator.',
        },
        { status: 403 }
      );
    }

    // ─── STUDENT FLOW: Log reset request for Admin Approval ─────────────────
    // Notify admins
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const resetMessage = [
      `🔐 Student Password Reset Request`,
      `Student: ${user.firstName} ${user.lastName} (${user.email})`,
      `Admission ID: ${user.username || 'Unassigned'}`,
      `Status: Pending Admin Approval`,
      `Submitted at: ${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} WAT`,
    ].join('\n');

    if (adminUsers.length > 0) {
      await prisma.notification.createMany({
        data: adminUsers.map((admin) => ({
          userId: admin.id,
          message: resetMessage,
          read: false,
        })),
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'STUDENT_PASSWORD_RESET_REQUESTED',
        details: `Student "${user.email}" requested a password reset. Requires Admin approval.`,
      },
    });

    return NextResponse.json({
      message: `Your password reset request for ${user.username || user.email} has been logged and sent to the Academy Administrator for approval. Upon approval, your password will be re-issued.`,
      user: {
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}
