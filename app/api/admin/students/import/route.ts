import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { students } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. Payload must contain a non-empty array of student objects.' },
        { status: 400 }
      );
    }

    const defaultPasswordHash = await hashPassword('UgetAcademy2026!');
    let importedCount = 0;
    let skippedCount = 0;

    for (const studentData of students) {
      const email = studentData.email?.trim().toLowerCase();
      const firstName = studentData.firstName?.trim() || studentData.name?.split(' ')[0] || 'Enrolled';
      const lastName = studentData.lastName?.trim() || studentData.name?.split(' ').slice(1).join(' ') || 'Student';
      const phone = studentData.phone?.trim() || null;
      const username = studentData.username?.trim() || (email ? email.split('@')[0] : null);

      if (!email) {
        skippedCount++;
        continue;
      }

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username: username || undefined }] },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone,
          username,
          passwordHash: defaultPasswordHash,
          role: 'STUDENT',
          emailVerified: true,
          status: 'APPROVED',
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} student(s) from enrollment portal.`,
      importedCount,
      skippedCount,
    });
  } catch (error) {
    console.error('Error importing student data:', error);
    return NextResponse.json({ error: 'Failed to import student data' }, { status: 500 });
  }
}
