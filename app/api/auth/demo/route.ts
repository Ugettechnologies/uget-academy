import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const passwordHash = bcrypt.hashSync('password123', 12);

    // 1. Upsert core users
    const admin = await prisma.user.upsert({
      where: { email: 'admin@uget.online' },
      update: {},
      create: {
        firstName: 'Alan',
        lastName: 'Turing',
        email: 'admin@uget.online',
        passwordHash,
        role: 'ADMIN',
        emailVerified: true,
      },
    });

    const instructor = await prisma.user.upsert({
      where: { email: 'instructor@uget.online' },
      update: {},
      create: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'instructor@uget.online',
        passwordHash,
        role: 'INSTRUCTOR',
        emailVerified: true,
      },
    });

    const demoStudent = await prisma.user.upsert({
      where: { email: 'student@uget.online' },
      update: {},
      create: {
        firstName: 'Grace',
        lastName: 'Hopper',
        email: 'student@uget.online',
        passwordHash,
        role: 'STUDENT',
        emailVerified: true,
      },
    });

    // 2. Upsert courses
    const frontendCourse = await prisma.course.upsert({
      where: { id: 'demo-frontend-course' },
      update: {},
      create: {
        id: 'demo-frontend-course',
        title: 'Frontend Web Masterclass',
        description: 'An elite training cohort covering semantic HTML5 structures, responsive layout engines, advanced CSS grid, reactive state management via React, and enterprise-grade App Router deployments in Next.js.',
        price: 150000,
        published: true,
        instructorId: instructor.id,
      },
    });

    const backendCourse = await prisma.course.upsert({
      where: { id: 'demo-backend-course' },
      update: {},
      create: {
        id: 'demo-backend-course',
        title: 'Backend Engineering & Architecture',
        description: 'Master backend system design, building RESTful web services in Node.js, database schemas with Prisma ORM, Redis caching strategies, queues, and containerization using Docker.',
        price: 180000,
        published: true,
        instructorId: instructor.id,
      },
    });

    // 3. Enroll student
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: demoStudent.id,
          courseId: frontendCourse.id,
        },
      },
      update: {},
      create: {
        userId: demoStudent.id,
        courseId: frontendCourse.id,
      },
    });

    // 4. Create Lessons for Frontend (Check if they already exist first to prevent double seeding)
    const frontendLessons = [
      {
        id: 'demo-lesson-1',
        title: 'Git & GitHub for Professionals',
        order: 1,
        content: 'In this module we deep-dive into distributed version control concepts. You will learn professional branching models (GitFlow), advanced rebasing, cherry-picking commits, custom ssh-keys setup, and resolving git merge conflicts via editor tools.',
        resources: [
          { name: 'Git Commands Cheat Sheet', url: 'https://education.github.com/git-cheat-sheet-education.pdf' },
          { name: 'GitFlow Branching Strategy Guide', url: 'https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow' }
        ]
      },
      {
        id: 'demo-lesson-2',
        title: 'Advanced CSS Grid & Fluid Layout Engines',
        order: 2,
        content: 'Grid template areas, CSS math functions (min, max, clamp), relative unit systems (ch, lh, svw, svh), and building a responsive dashboard design that scales perfectly across devices without relying on traditional media queries.',
        resources: [
          { name: 'Interactive Grid Playground', url: 'https://cssgridgarden.com/' }
        ]
      },
      {
        id: 'demo-lesson-3',
        title: 'Asynchronous JavaScript, Promises & Fetch API',
        order: 3,
        content: 'Master the event loop, task queue, microtasks, async/await mechanics, handling network status codes, and fetching data from third-party REST API backends securely with rate limits in mind.',
        resources: []
      },
      {
        id: 'demo-lesson-4',
        title: 'React State Management & Advanced Custom Hooks',
        order: 4,
        content: 'Understanding context providers, state synchronization with localStorage, building modular custom hooks to handle data fetching/caching, and debugging performance bottlenecks using React DevTools.',
        resources: []
      },
      {
        id: 'demo-lesson-5',
        title: 'Next.js 16 App Router & Data Pre-fetching',
        order: 5,
        content: 'Server vs Client components, static site generation, incremental static regeneration, custom metadata tags for SEO compliance, and dynamic route loading with instant transitions.',
        resources: []
      }
    ];

    for (const lesson of frontendLessons) {
      await prisma.lesson.upsert({
        where: { id: lesson.id },
        update: {
          content: lesson.content,
          resources: lesson.resources,
        },
        create: {
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          courseId: frontendCourse.id,
          content: lesson.content,
          resources: lesson.resources,
        }
      });
    }

    // 5. Create Lessons for Backend
    const backendLessons = [
      { id: 'demo-lesson-b1', title: 'Node.js Event-Driven Architecture & Express', order: 1 },
      { id: 'demo-lesson-b2', title: 'Relational Database Design & SQL Fundamentals', order: 2 },
      { id: 'demo-lesson-b3', title: 'ORM Abstractions with Prisma & Migrations', order: 3 },
    ];

    for (const lesson of backendLessons) {
      await prisma.lesson.upsert({
        where: { id: lesson.id },
        update: {},
        create: {
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          courseId: backendCourse.id,
          content: 'This module is under construction. Please check course syllabus for details.',
        }
      });
    }

    // 6. Seed watch logs (attendance log)
    // Lesson 1 watched 75s, Lesson 2 watched 65s
    await prisma.attendanceLog.upsert({
      where: { userId_lessonId: { userId: demoStudent.id, lessonId: 'demo-lesson-1' } },
      update: {},
      create: {
        userId: demoStudent.id,
        lessonId: 'demo-lesson-1',
        durationSeconds: 75,
      }
    });

    await prisma.attendanceLog.upsert({
      where: { userId_lessonId: { userId: demoStudent.id, lessonId: 'demo-lesson-2' } },
      update: {},
      create: {
        userId: demoStudent.id,
        lessonId: 'demo-lesson-2',
        durationSeconds: 65,
      }
    });

    // 7. Seed Bookmark & Note
    await prisma.lessonBookmark.upsert({
      where: { userId_lessonId: { userId: demoStudent.id, lessonId: 'demo-lesson-1' } },
      update: {},
      create: {
        userId: demoStudent.id,
        lessonId: 'demo-lesson-1',
      }
    });

    await prisma.lessonNote.upsert({
      where: { userId_lessonId: { userId: demoStudent.id, lessonId: 'demo-lesson-1' } },
      update: {},
      create: {
        userId: demoStudent.id,
        lessonId: 'demo-lesson-1',
        content: 'Decentralized version control means every developer has a full copy of the history. git rebase rewrites commits linearly whereas git merge preserves commits chronological order.',
      }
    });

    // 8. Seed Assignments & Submissions
    const assignment1 = await prisma.assignment.upsert({
      where: { id: 'demo-assign-1' },
      update: {},
      create: {
        id: 'demo-assign-1',
        title: 'Week 2 CSS Grid responsive layout design',
        description: 'Implement a premium responsive application dashboard matching the design guidelines. Pay close attention to colors, alignment, and hover feedback. Submit a hosted link or text repository URL.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
        courseId: frontendCourse.id,
        allowResubmission: true,
      }
    });

    const assignment2 = await prisma.assignment.upsert({
      where: { id: 'demo-assign-2' },
      update: {},
      create: {
        id: 'demo-assign-2',
        title: 'Week 4 Fetch Weather Dashboard API integration',
        description: 'Implement a frontend dashboard that fetches details from the OpenWeather API. Include proper error handling for invalid locations and loading state displays.',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days in past
        courseId: frontendCourse.id,
        allowResubmission: false,
      }
    });

    // Submissions
    await prisma.assignmentSubmission.upsert({
      where: { assignmentId_userId: { assignmentId: assignment1.id, userId: demoStudent.id } },
      update: {},
      create: {
        assignmentId: assignment1.id,
        userId: demoStudent.id,
        type: 'LINK',
        content: 'https://github.com/gracehopper/weather-dashboard-uget',
      }
    });

    await prisma.assignmentSubmission.upsert({
      where: { assignmentId_userId: { assignmentId: assignment2.id, userId: demoStudent.id } },
      update: {},
      create: {
        assignmentId: assignment2.id,
        userId: demoStudent.id,
        type: 'TEXT',
        content: 'Completed weather card application with loading feedback and robust fetch handlers.',
        grade: 92,
        feedback: 'Excellent work Grace! The responsive layout adapts perfectly and the error states are highly descriptive.',
      }
    });

    // 9. Seed Quizzes and Quiz Attempts
    const quiz = await prisma.quiz.upsert({
      where: { id: 'demo-quiz-1' },
      update: {},
      create: {
        id: 'demo-quiz-1',
        title: 'Week 3: JavaScript & CSS Core Evaluation',
        courseId: frontendCourse.id,
        questions: [
          {
            question: 'Which CSS property is used to define the grid track sizes?',
            options: ['grid-template-columns', 'grid-gap', 'display: grid', 'grid-column'],
            answerIndex: 0
          },
          {
            question: 'What does HTTP status code 404 stand for?',
            options: ['Success', 'Internal Server Error', 'Not Found', 'Unauthorized'],
            answerIndex: 2
          },
          {
            question: 'Which array method returns a new array with elements that pass a test condition?',
            options: ['map()', 'filter()', 'forEach()', 'reduce()'],
            answerIndex: 1
          }
        ]
      }
    });

    await prisma.quizAttempt.upsert({
      where: { id: 'demo-quiz-attempt-1' },
      update: {},
      create: {
        id: 'demo-quiz-attempt-1',
        quizId: quiz.id,
        userId: demoStudent.id,
        score: 100,
        passed: true,
        answers: [0, 2, 1],
      }
    });

    // 10. Seed LiveSessions and Attendance check-ins
    // Active session right now (started 5 mins ago, ends in 1 hour)
    const activeSession = await prisma.liveSession.upsert({
      where: { id: 'demo-live-session-active' },
      update: {
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
      },
      create: {
        id: 'demo-live-session-active',
        courseId: frontendCourse.id,
        title: 'Cohort Live Masterclass: Next.js Server Components Q&A',
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        sessionCode: 'NX16LIVE',
        ipAddress: '127.0.0.1',
      }
    });

    // Past session (yesterday)
    const pastSession = await prisma.liveSession.upsert({
      where: { id: 'demo-live-session-past' },
      update: {},
      create: {
        id: 'demo-live-session-past',
        courseId: frontendCourse.id,
        title: 'Cohort Live Masterclass: Advanced CSS Grid',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
        sessionCode: 'CSSGRID8',
      }
    });

    await prisma.liveSessionAttendance.upsert({
      where: { liveSessionId_userId: { liveSessionId: pastSession.id, userId: demoStudent.id } },
      update: {},
      create: {
        liveSessionId: pastSession.id,
        userId: demoStudent.id,
        status: 'PRESENT',
        checkInTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 1000),
      }
    });

    // Older session (last week, excused)
    const olderSession = await prisma.liveSession.upsert({
      where: { id: 'demo-live-session-older' },
      update: {},
      create: {
        id: 'demo-live-session-older',
        courseId: frontendCourse.id,
        title: 'Cohort Live Masterclass: Git & Branching Strategy',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      }
    });

    await prisma.liveSessionAttendance.upsert({
      where: { liveSessionId_userId: { liveSessionId: olderSession.id, userId: demoStudent.id } },
      update: {},
      create: {
        liveSessionId: olderSession.id,
        userId: demoStudent.id,
        status: 'EXCUSED',
      }
    });

    await prisma.absenceExcuse.upsert({
      where: { liveSessionId_userId: { liveSessionId: olderSession.id, userId: demoStudent.id } },
      update: {},
      create: {
        liveSessionId: olderSession.id,
        userId: demoStudent.id,
        reason: 'I was feeling extremely under the weather. Attaching my clinic consult card.',
        status: 'APPROVED',
        resolvedBy: instructor.id,
        resolvedAt: new Date(),
      }
    });

    // 11. Seed Forum & QA
    const courseThread = await prisma.forumThread.upsert({
      where: { id: 'demo-forum-thread-1' },
      update: {},
      create: {
        id: 'demo-forum-thread-1',
        courseId: frontendCourse.id,
        title: 'Best practices for managing custom local storage hooks in React?',
        content: 'Hello everyone! I am trying to build a custom storage hook sync state with local storage, but I am facing layout shifts during server hydration. Is it better to run the initializer in useEffect?',
        authorId: demoStudent.id,
        isPinned: true,
      }
    });

    const reply1 = await prisma.forumReply.upsert({
      where: { id: 'demo-forum-reply-1' },
      update: {},
      create: {
        id: 'demo-forum-reply-1',
        threadId: courseThread.id,
        content: 'Excellent question Grace. Hydration mismatch occurs because server renders standard default state whereas client local storage has custom states. Initialize state as null or standard defaults, then fetch local storage client-side in useEffect.',
        authorId: instructor.id,
        isVerifiedAnswer: true,
      }
    });

    const existingUpvote = await prisma.forumUpvote.findFirst({
      where: {
        userId: demoStudent.id,
        replyId: reply1.id,
      }
    });

    if (!existingUpvote) {
      await prisma.forumUpvote.create({
        data: {
          userId: demoStudent.id,
          replyId: reply1.id,
        }
      });
    }

    const loungeThread = await prisma.forumThread.upsert({
      where: { id: 'demo-forum-thread-2' },
      update: {},
      create: {
        id: 'demo-forum-thread-2',
        courseId: null,
        title: 'Introduce yourself to the cohort!',
        content: 'Welcome to UGET Academy! Use this thread to share your background, technology interests, and career goals for this year.',
        authorId: admin.id,
        isPinned: true,
      }
    });

    await prisma.directQA.upsert({
      where: { id: 'demo-direct-qa-1' },
      update: {},
      create: {
        id: 'demo-direct-qa-1',
        courseId: frontendCourse.id,
        studentId: demoStudent.id,
        question: 'Will there be any live assessments for the React hooks section or is it purely submission-based?',
        answer: 'Hi Grace, the evaluation is submission-based (weather API dashboard) with an individual code walk-through during office hours.',
        answeredAt: new Date(),
      }
    });

    // 12. Direct Messages
    await prisma.directMessage.upsert({
      where: { id: 'demo-dm-1' },
      update: {},
      create: {
        id: 'demo-dm-1',
        courseId: frontendCourse.id,
        senderId: instructor.id,
        receiverId: demoStudent.id,
        content: 'Hi Grace, your responsive dashboard submission looks clean! Ensure to check our announcements feed about the CSS grid review session.',
      }
    });

    // 13. Announcements
    await prisma.announcement.upsert({
      where: { id: 'demo-announcement-1' },
      update: {},
      create: {
        id: 'demo-announcement-1',
        courseId: frontendCourse.id,
        title: 'CSS Grid Q&A Cohort Review',
        content: 'Our live Q&A CSS layout grids review starts at 2 PM. Please bring your draft layouts for code feedback.',
        authorId: instructor.id,
      }
    });

    // 14. Payments
    await prisma.payment.upsert({
      where: { reference: 'PAY-UGET-FRNT-001' },
      update: {},
      create: {
        amount: 150000,
        reference: 'PAY-UGET-FRNT-001',
        method: 'PAYSTACK',
        status: 'VERIFIED',
        userId: demoStudent.id,
      }
    });

    // 15. Support Tickets
    await prisma.supportTicket.upsert({
      where: { id: 'demo-ticket-1' },
      update: {},
      create: {
        id: 'demo-ticket-1',
        userId: demoStudent.id,
        subject: 'Mux video player lag issues on Chrome',
        message: 'Whenever I play lesson videos, it pauses for a few seconds. Are there mirror download links?',
        status: 'RESOLVED',
        adminReply: 'Hi Grace, we updated Mux player configurations to auto-fallback on adaptive bitrate. This should fix the stuttering.',
        resolvedAt: new Date(),
      }
    });

    // 16. Notifications
    await prisma.notification.upsert({
      where: { id: 'demo-notification-1' },
      update: {},
      create: {
        id: 'demo-notification-1',
        userId: demoStudent.id,
        message: 'Your CSS dashboard assignment has been graded. Grade: 92/100.',
      }
    });

    // Log the user in and create standard session
    await createSession(demoStudent.id, demoStudent.role);

    return NextResponse.json({
      success: true,
      role: demoStudent.role,
    });
  } catch (error) {
    console.error('Demo auth initialize error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during demo setup.' },
      { status: 500 }
    );
  }
}
