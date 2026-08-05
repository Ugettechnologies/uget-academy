import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword, generateStudentUsername, generateAutoPassword } from '@/lib/auth';

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

    let importedCount = 0;
    let skippedCount = 0;

    for (const studentData of students) {
      const email = studentData.email?.trim().toLowerCase();
      if (!email) {
        skippedCount++;
        continue;
      }

      const firstName = studentData.firstName?.trim() || studentData.name?.split(' ')[0] || 'Enrolled';
      const lastName = studentData.lastName?.trim() || studentData.name?.split(' ').slice(1).join(' ') || 'Student';
      const phone = studentData.phone?.trim() || null;

      // Smart Duplicate Detection by Email
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        skippedCount++;
        continue;
      }

      const studentUsername = studentData.username?.trim() || generateStudentUsername();
      const rawPassword = generateAutoPassword('STUDENT');
      const passwordHash = await hashPassword(rawPassword);

      await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone,
          username: studentUsername,
          passwordHash,
          role: 'STUDENT',
          emailVerified: true,
          status: 'APPROVED',
        },
      });

      importedCount++;
    }

    let message = '';
    if (importedCount > 0 && skippedCount > 0) {
      message = `Imported ${importedCount} new student(s). Skipped ${skippedCount} duplicate(s) already in academy database.`;
    } else if (importedCount > 0) {
      message = `Successfully imported all ${importedCount} new student(s) into academy database.`;
    } else {
      message = `All ${skippedCount} student(s) in payload are already registered in academy database (0 duplicates added).`;
    }

    return NextResponse.json({
      success: true,
      message,
      importedCount,
      skippedCount,
    });
  } catch (error) {
    console.error('Error importing student data:', error);
    return NextResponse.json({ error: 'Failed to import student data' }, { status: 500 });
  }
}
