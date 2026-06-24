import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/instructor/grades - Get grades for a course
export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId.' }, { status: 400 });
  }

  const instructorId = session.userId as string;

  try {
    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized.' }, { status: 404 });
    }

    // Get all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    // Get existing grades for this course
    const grades = await prisma.studentGrade.findMany({
      where: { courseId },
    });

    const gradesMap = new Map(grades.map((g) => [g.userId, g]));

    // Format list of students with their grading information
    const result = enrollments.map((enr) => {
      const grade = gradesMap.get(enr.user.id);
      return {
        userId: enr.user.id,
        firstName: enr.user.firstName,
        lastName: enr.user.lastName,
        email: enr.user.email,
        score: grade ? grade.score : 0,
        creativeScore: grade ? grade.creativeScore : 0,
        interviewScore: grade ? grade.interviewScore : 0,
        remarks: grade ? grade.remarks : '',
        gradedBy: grade ? grade.gradedBy : '',
        updatedAt: grade ? grade.updatedAt : null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fetch grades error:', error);
    return NextResponse.json({ error: 'Failed to fetch grades.' }, { status: 500 });
  }
}

// POST /api/instructor/grades - Create or update student grade
export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { courseId, userId, score, creativeScore, interviewScore, remarks } = await request.json();

    if (!courseId || !userId) {
      return NextResponse.json({ error: 'Missing courseId or userId.' }, { status: 400 });
    }

    const instructorId = session.userId as string;

    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized.' }, { status: 404 });
    }

    // Get instructor name for the gradedBy field
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { firstName: true, lastName: true },
    });
    const gradedBy = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Instructor';

    // Upsert student grade
    const grade = await prisma.studentGrade.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        score: Number(score) || 0,
        creativeScore: Number(creativeScore) || 0,
        interviewScore: Number(interviewScore) || 0,
        remarks: remarks || '',
        gradedBy,
      },
      create: {
        userId,
        courseId,
        score: Number(score) || 0,
        creativeScore: Number(creativeScore) || 0,
        interviewScore: Number(interviewScore) || 0,
        remarks: remarks || '',
        gradedBy,
      },
    });

    return NextResponse.json({ success: true, grade });
  } catch (error) {
    console.error('Update student grade error:', error);
    return NextResponse.json({ error: 'Failed to update student grade.' }, { status: 500 });
  }
}
