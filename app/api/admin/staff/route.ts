import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword, generateStaffUsername, generateAutoPassword } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const staffMembers = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'ADMIN'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        staffProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, staff: staffMembers });
  } catch (error) {
    console.error('Error fetching staff list:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only Admin can create staff accounts' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { firstName, lastName, email, username, password, department, position, phone } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 });
    }

    const assignedUsername = username && username.trim().length > 0 ? username.trim() : generateStaffUsername();
    const rawPassword = password && password.trim().length > 0 ? password.trim() : generateAutoPassword('STAFF');

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { username: assignedUsername },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(rawPassword);

    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        username: assignedUsername,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: 'STAFF',
        emailVerified: true,
        status: 'APPROVED',
        staffProfile: {
          create: {
            department: department || 'General Operations',
            position: position || 'Staff Member',
          },
        },
      },
      include: {
        staffProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Staff account created successfully for ${newUser.firstName} ${newUser.lastName}.`,
      staff: newUser,
      username: assignedUsername,
      passwordCode: rawPassword,
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({ error: 'Failed to create staff account' }, { status: 500 });
  }
}
