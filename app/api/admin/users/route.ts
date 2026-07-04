import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit-log';
import { z } from 'zod';

const updateRoleSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  newRole: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'STAFF']),
});

// GET: Fetch list of users (Admin only)
export async function GET(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Double-verify against DB
  const adminUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Fetch users API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update user role and log admin action (Admin only)
export async function PATCH(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Double-verify against DB to get the admin's email and actual permissions
  const adminUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = updateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { targetUserId, newRole } = result.data;

    // Prevent modifying own role
    if (targetUserId === adminUser.id) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
    }

    // Get the target user before update for logging context
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const oldRole = targetUser.role;

    // Update target user's role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    // Retrieve client IP
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Log the administrative action
    await logAdminAction({
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'UPDATE_USER_ROLE',
      targetId: targetUserId,
      metadata: {
        targetUserEmail: targetUser.email,
        oldRole,
        newRole,
      },
      ip,
    });

    return NextResponse.json({
      message: `User role updated successfully from ${oldRole} to ${newRole}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

  } catch (error) {
    console.error('Update user role API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
