import { NextResponse } from 'next/server';
import { getSession, hashPassword, generateStudentUsername, generateInstructorUsername } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit-log';
import { z } from 'zod';
import crypto from 'crypto';

const updateSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  newRole: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'STAFF']).optional(),
  status: z.enum(['APPROVED', 'PENDING_APPROVAL', 'REJECTED']).optional(),
  action: z.enum(['UPDATE_ROLE', 'RESET_PASSWORD', 'APPROVE_USER', 'REPLACE_INSTRUCTOR']).default('UPDATE_ROLE'),
  passwordCode: z.string().optional(),
  replacementInstructorId: z.string().optional(),
});

const createUserSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'STAFF']),
  departmentCode: z.string().optional(), // e.g. CS, DA, SE, UI
  passwordCode: z.string().optional(),
});

function generateInstructorCode(deptCode?: string): string {
  return generateInstructorUsername(deptCode);
}

// GET: Fetch list of users (Admin only)
export async function GET(request: Request) {
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
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        status: true,
        phone: true,
        bio: true,
        createdAt: true,
        coursesAsInstructor: {
          select: {
            id: true,
            title: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
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

// POST: Pre-register a new user and generate Username (e.g. 2026/STU/A026 or UGT2026/INSCS/A026)
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

    const { firstName, lastName, email, role, departmentCode, passwordCode } = result.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists' }, { status: 400 });
    }

    // Generate Username (e.g. 2026/STU/A026 for students, UGT2026/INSCS/A026 for instructors)
    let generatedUsername = '';
    if (role === 'STUDENT') {
      generatedUsername = generateStudentUsername();
    } else if (role === 'INSTRUCTOR') {
      generatedUsername = generateInstructorUsername(departmentCode);
    } else {
      generatedUsername = `ADM/${Math.floor(100 + Math.random() * 900)}`;
    }

    // Generate Password Code
    let rawPasswordCode = '';
    if (role === 'STUDENT') {
      rawPasswordCode = crypto.randomUUID();
    } else if (role === 'INSTRUCTOR') {
      if (passwordCode && passwordCode.trim().length > 0) {
        rawPasswordCode = passwordCode.trim();
      } else {
        rawPasswordCode = generateInstructorCode(departmentCode);
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
        username: generatedUsername,
        passwordHash,
        role,
        status: 'APPROVED',
        emailVerified: true,
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
        username: user.username,
        departmentCode,
        role,
      },
      ip,
    });

    return NextResponse.json({
      message: `${role} pre-registered successfully with username "${generatedUsername}".`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      username: generatedUsername,
      passwordCode: rawPasswordCode,
    }, { status: 201 });

  } catch (error) {
    console.error('Create user API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update user role, status (approve/reject), reset password code, or replace instructor
export async function PATCH(request: Request) {
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
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { targetUserId, newRole, status, action, passwordCode, replacementInstructorId } = result.data;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. APPROVE USER ACTION
    if (action === 'APPROVE_USER') {
      let assignedUsername = targetUser.username;
      if (!assignedUsername) {
        assignedUsername = targetUser.role === 'STUDENT' 
          ? generateStudentUsername() 
          : generateInstructorUsername();
      }

      let rawPasswordCode = '';
      if (passwordCode && passwordCode.trim().length > 0) {
        rawPasswordCode = passwordCode.trim();
      } else {
        rawPasswordCode = targetUser.role === 'INSTRUCTOR' ? generateInstructorCode() : crypto.randomUUID();
      }

      const passwordHash = await hashPassword(rawPasswordCode);

      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          status: 'APPROVED',
          username: assignedUsername,
          passwordHash,
          emailVerified: true,
        },
      });

      await logAdminAction({
        userId: adminUser.id,
        userEmail: adminUser.email,
        action: 'UPDATE_USER_ROLE' as any,
        targetId: targetUserId,
        metadata: {
          actionType: 'APPROVE_USER',
          targetEmail: targetUser.email,
          username: assignedUsername,
          role: targetUser.role,
        },
        ip,
      });

      return NextResponse.json({
        message: `${targetUser.firstName} ${targetUser.lastName} approved successfully!`,
        username: assignedUsername,
        passwordCode: rawPasswordCode,
        user: updatedUser,
      });
    }

    // 2. RESET PASSWORD ACTION
    if (action === 'RESET_PASSWORD') {
      let rawPasswordCode = '';
      if (passwordCode && passwordCode.trim().length > 0) {
        rawPasswordCode = passwordCode.trim();
      } else {
        rawPasswordCode = crypto.randomUUID().slice(0, 8).toUpperCase();
      }

      const passwordHash = await hashPassword(rawPasswordCode);

      let currentUsername = targetUser.username;
      if (!currentUsername) {
        currentUsername = targetUser.role === 'STUDENT' ? generateStudentUsername() : generateInstructorUsername();
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { 
          passwordHash,
          username: currentUsername,
          failedAttempts: 0,
          lockoutUntil: null,
        },
      });

      await logAdminAction({
        userId: adminUser.id,
        userEmail: adminUser.email,
        action: 'UPDATE_USER_PASSWORD',
        targetId: targetUserId,
        metadata: {
          targetUserEmail: targetUser.email,
          username: currentUsername,
          role: targetUser.role,
        },
        ip,
      });

      return NextResponse.json({
        message: `Password code for ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email}) reset successfully by Admin.`,
        username: currentUsername,
        passwordCode: rawPasswordCode,
      });
    }

    // 3. INSTRUCTOR REPLACEMENT ACTION
    if (action === 'REPLACE_INSTRUCTOR') {
      if (!replacementInstructorId) {
        return NextResponse.json({ error: 'Replacement Instructor ID is required.' }, { status: 400 });
      }

      const replacementInstructor = await prisma.user.findUnique({
        where: { id: replacementInstructorId },
      });

      if (!replacementInstructor || replacementInstructor.role !== 'INSTRUCTOR') {
        return NextResponse.json({ error: 'Selected replacement must be a valid Instructor user.' }, { status: 404 });
      }

      // Reassign all courses from target (departing) instructor to replacement instructor
      const reassignedCourses = await prisma.course.updateMany({
        where: { instructorId: targetUserId },
        data: { instructorId: replacementInstructorId },
      });

      // Deactivate departing instructor account
      await prisma.user.update({
        where: { id: targetUserId },
        data: { status: 'REJECTED' },
      });

      await logAdminAction({
        userId: adminUser.id,
        userEmail: adminUser.email,
        action: 'UPDATE_USER_ROLE' as any,
        targetId: targetUserId,
        metadata: {
          actionType: 'REPLACE_INSTRUCTOR',
          departingInstructorEmail: targetUser.email,
          replacementInstructorEmail: replacementInstructor.email,
          coursesTransferred: reassignedCourses.count,
        },
        ip,
      });

      return NextResponse.json({
        message: `Instructor replacement complete. ${reassignedCourses.count} course(s) and student rosters transferred to ${replacementInstructor.firstName} ${replacementInstructor.lastName}. Outgoing instructor account deactivated.`,
        transferredCoursesCount: reassignedCourses.count,
      });
    }

    // 4. DEFAULT UPDATE ROLE / STATUS ACTION
    if (targetUserId === adminUser.id && newRole) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(newRole ? { role: newRole } : {}),
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });

  } catch (error) {
    console.error('Update user API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
