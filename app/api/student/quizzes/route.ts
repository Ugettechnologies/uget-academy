import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    const quizzes = await prisma.quiz.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        attempts: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    return NextResponse.json({ error: 'Failed to retrieve quizzes.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { quizId, answers } = await request.json(); // answers: Array of selected answer indices
    if (!quizId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const userId = session.userId as string;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
    }

    const questions = quiz.questions as any[];
    if (answers.length !== questions.length) {
      return NextResponse.json(
        { error: `Must submit answers for all ${questions.length} questions.` },
        { status: 400 }
      );
    }

    // Auto-grade calculation
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answerIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70; // 70% passing grade threshold

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        passed,
        answers,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'COMPLETED_QUIZ',
        details: `Completed quiz "${quiz.title}" with score ${score}% (${passed ? 'PASSED' : 'FAILED'})`,
      },
    });

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ error: 'Failed to record attempt.' }, { status: 500 });
  }
}
