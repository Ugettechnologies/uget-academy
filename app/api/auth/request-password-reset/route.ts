import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const requestSchema = z.object({
  identifier: z.string().min(1, 'Email address or Instructor ID is required'),
  message: z.string().min(10, 'Please provide a brief message (min 10 chars)').max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input.' },
        { status: 400 }
      );
    }

    const { identifier, message: userMessage } = result.data;
    const cleanInput = identifier.trim();

    // Find the instructor by email or username
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { email: cleanInput.toLowerCase() },
              { username: cleanInput },
            ],
          },
          { role: 'INSTRUCTOR' },
        ],
      },
    });

    if (!user) {
      // Vague response for security
      return NextResponse.json({
        message: 'Your reset request has been submitted. The Academy Administrator will reach out to you shortly.',
      });
    }

    // Find all ADMIN users to send notifications to
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const notificationText = [
      `🔑 Password Reset Request`,
      `Instructor: ${user.firstName} ${user.lastName} (${user.email})`,
      `Username: ${user.username || 'Not yet assigned'}`,
      userMessage ? `Message: ${userMessage}` : null,
      `Submitted at: ${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} WAT`,
    ]
      .filter(Boolean)
      .join('\n');

    // Create a notification for each admin
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          message: notificationText,
          read: false,
        })),
      });
    }

    // Log the action
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'INSTRUCTOR_PASSWORD_RESET_REQUESTED',
        details: `Instructor "${user.email}" requested a password reset from admin.`,
      },
    });

    return NextResponse.json({
      message: 'Your password reset request has been sent to the Academy Administrator. You will receive your new password via email or notification shortly.',
    });

  } catch (error) {
    console.error('Instructor reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit password reset request.' },
      { status: 500 }
    );
  }
}
