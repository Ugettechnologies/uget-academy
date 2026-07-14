import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    // Get enrollments with courses and lessons containing resources
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            lessons: {
              select: {
                title: true,
                resources: true,
                updatedAt: true
              }
            }
          }
        }
      }
    });

    const materials: any[] = [];
    let idCounter = 1;

    enrollments.forEach((enrollment) => {
      enrollment.course.lessons.forEach((lesson) => {
        if (lesson.resources) {
          try {
            // Lesson.resources is stored as a Json field
            const resourcesList = typeof lesson.resources === 'string'
              ? JSON.parse(lesson.resources)
              : (lesson.resources as any);

            if (Array.isArray(resourcesList)) {
              resourcesList.forEach((res: any) => {
                materials.push({
                  id: String(idCounter++),
                  name: res.name || 'Resource File',
                  fileName: res.name || 'file.pdf',
                  url: res.url || '#',
                  lessonTitle: lesson.title,
                  courseTitle: enrollment.course.title,
                  date: new Date(lesson.updatedAt).toLocaleDateString('en-GB'),
                  uploadTime: new Date(lesson.updatedAt).toLocaleString('en-GB'),
                  uploadedBy: 'Instructor',
                  size: res.size || '320kb',
                  type: res.type || 'PDF'
                });
              });
            }
          } catch (err) {
            console.error('Error parsing resources for lesson:', lesson.title, err);
          }
        }
      });
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching student materials:', error);
    return NextResponse.json({ error: 'Failed to retrieve materials.' }, { status: 500 });
  }
}
