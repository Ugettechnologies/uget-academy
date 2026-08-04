import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        username: true,
        createdAt: true,
        enrollments: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedData = students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone || '',
      username: s.username || '',
      enrolledCourses: s.enrollments.map((e) => e.course.title).join('; '),
      registeredAt: s.createdAt.toISOString(),
    }));

    if (format === 'csv') {
      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Username', 'Enrolled Courses', 'Registered At'];
      const csvRows = [
        headers.join(','),
        ...formattedData.map((row) =>
          [
            `"${row.id}"`,
            `"${row.firstName}"`,
            `"${row.lastName}"`,
            `"${row.email}"`,
            `"${row.phone}"`,
            `"${row.username}"`,
            `"${row.enrolledCourses.replace(/"/g, '""')}"`,
            `"${row.registeredAt}"`,
          ].join(',')
        ),
      ];

      return new Response(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="uget-academy-students-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: formattedData.length,
      exportedAt: new Date().toISOString(),
      students: formattedData,
    });
  } catch (error) {
    console.error('Error exporting student data:', error);
    return NextResponse.json({ error: 'Failed to export student data' }, { status: 500 });
  }
}
