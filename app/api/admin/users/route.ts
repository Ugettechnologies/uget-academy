import { NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit-log';
import { z } from 'zod';
import crypto from 'crypto';

const updateSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  newRole: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'STAFF']).optional(),
  action: z.enum(['UPDATE_ROLE', 'RESET_PASSWORD']).default('UPDATE_ROLE'),
  passwordCode: z.string().optional(),
});

const createUserSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'STAFF']),
  passwordCode: z.string().optional(),
});

function generateInstructorCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude confusing chars like O, 0, I, 1
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `2026/${code}`;
}

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

// POST: Pre-register a new user (Admin only)
export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 });
    }

    const { firstName, lastName, email, role, passwordCode } = result.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists' }, { status: 400 });
    }

    // Generate password code
    let rawPasswordCode = '';
    if (role === 'STUDENT') {
      rawPasswordCode = crypto.randomUUID();
    } else if (role === 'INSTRUCTOR') {
      if (passwordCode && passwordCode.trim().length > 0) {
        rawPasswordCode = passwordCode.trim();
      } else {
        rawPasswordCode = generateInstructorCode();
      }
    } else {
      rawPasswordCode = passwordCode || crypto.randomUUID();
    }

    const passwordHash = await hashPassword(rawPasswordCode);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
        role,
        emailVerified: true, // Pre-verified since registration/payment done on enrollment portal
      },
    });

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    await logAdminAction({
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: `CREATE_USER` as any,
      targetId: user.id,
      metadata: {
        userEmail: user.email,
        role,
      },
      ip,
    });

    return NextResponse.json({
      message: `${role} pre-registered successfully.`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      passwordCode: rawPasswordCode,
    }, { status: 201 });

  } catch (error) {
    console.error('Create user API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update user role or reset password code (Admin only)
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
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { targetUserId, newRole, action, passwordCode } = result.data;

    // Get the target user before update for logging context
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    if (action === 'RESET_PASSWORD') {
      let rawPasswordCode = '';
      if (targetUser.role === 'STUDENT') {
        rawPasswordCode = crypto.randomUUID();
      } else if (targetUser.role === 'INSTRUCTOR') {
        if (passwordCode && passwordCode.trim().length > 0) {
          rawPasswordCode = passwordCode.trim();
        } else {
          rawPasswordCode = generateInstructorCode();
        }
      } else {
        rawPasswordCode = passwordCode || crypto.randomUUID();
      }

      const passwordHash = await hashPassword(rawPasswordCode);

      await prisma.user.update({
        where: { id: targetUserId },
        data: { passwordHash },
      });

      await logAdminAction({
        userId: adminUser.id,
        userEmail: adminUser.email,
        action: 'UPDATE_USER_PASSWORD',
        targetId: targetUserId,
        metadata: {
          targetUserEmail: targetUser.email,
          role: targetUser.role,
        },
        ip,
      });

      return NextResponse.json({
        message: 'Password code reset successfully.',
        passwordCode: rawPasswordCode,
      });
    }

    // Default UPDATE_ROLE action
    if (!newRole) {
      return NextResponse.json({ error: 'New role is required for role update' }, { status: 400 });
    }

    // Prevent modifying own role
    if (targetUserId === adminUser.id) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
    }

    const oldRole = targetUser.role;

    // Update target user's role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

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
