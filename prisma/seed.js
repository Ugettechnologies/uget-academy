const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing records
  await prisma.supportTicket.deleteMany({});
  await prisma.directMessage.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.directQA.deleteMany({});
  await prisma.forumReport.deleteMany({});
  await prisma.forumUpvote.deleteMany({});
  await prisma.forumReply.deleteMany({});
  await prisma.forumThread.deleteMany({});
  await prisma.absenceExcuse.deleteMany({});
  await prisma.liveSessionAttendance.deleteMany({});
  await prisma.liveSession.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.assignmentSubmission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.lessonNote.deleteMany({});
  await prisma.lessonBookmark.deleteMany({});
  await prisma.attendanceLog.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.dailyAttendance.deleteMany({});
  await prisma.studentGrade.deleteMany({});
  await prisma.weeklyReport.deleteMany({});
  await prisma.courseTopic.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Deleted existing data. Generating hashes...');

  // 2. Generate passwords
  const passwordHash = bcrypt.hashSync('password123', 12);

  // 3. Create core users
  const admin = await prisma.user.create({
    data: {
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'admin@uget.online',
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const instructor = await prisma.user.create({
    data: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'instructor@uget.online',
      passwordHash,
      role: 'INSTRUCTOR',
      emailVerified: true,
    },
  });

  const demoStudent = await prisma.user.create({
    data: {
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'student@uget.online',
      passwordHash,
      role: 'STUDENT',
      emailVerified: true,
    },
  });

  console.log('Created Users:', { admin: admin.email, instructor: instructor.email, student: demoStudent.email });

  // 4. Create courses
  const frontendCourse = await prisma.course.create({
    data: {
      title: 'Frontend Web Masterclass',
      description: 'An elite training cohort covering semantic HTML5 structures, responsive layout engines, advanced CSS grid, reactive state management via React, and enterprise-grade App Router deployments in Next.js.',
      price: 150000,
      published: true,
      instructorId: instructor.id,
    },
  });

  const backendCourse = await prisma.course.create({
    data: {
      title: 'Backend Engineering & Architecture',
      description: 'Master backend system design, building RESTful web services in Node.js, database schemas with Prisma ORM, Redis caching strategies, queues, and containerization using Docker.',
      price: 180000,
      published: true,
      instructorId: instructor.id,
    },
  });

  console.log('Created Courses:', [frontendCourse.title, backendCourse.title]);

  // 5. Enroll student in Frontend course
  await prisma.enrollment.create({
    data: {
      userId: demoStudent.id,
      courseId: frontendCourse.id,
    },
  });

  console.log('Enrolled student in Frontend Web Masterclass');

  // 6. Create lessons for Frontend
  const frontendLessons = [
    {
      title: 'Git & GitHub for Professionals',
      order: 1,
      content: 'In this module we deep-dive into distributed version control concepts. You will learn professional branching models (GitFlow), advanced rebasing, cherry-picking commits, custom ssh-keys setup, and resolving git merge conflicts via editor tools.',
      resources: [
        { name: 'Git Commands Cheat Sheet', url: 'https://education.github.com/git-cheat-sheet-education.pdf' },
        { name: 'GitFlow Branching Strategy Guide', url: 'https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow' }
      ]
    },
    {
      title: 'Advanced CSS Grid & Fluid Layout Engines',
      order: 2,
      content: 'Grid template areas, CSS math functions (min, max, clamp), relative unit systems (ch, lh, svw, svh), and building a responsive dashboard design that scales perfectly across devices without relying on traditional media queries.',
      resources: [
        { name: 'Interactive Grid Playground', url: 'https://cssgridgarden.com/' }
      ]
    },
    {
      title: 'Asynchronous JavaScript, Promises & Fetch API',
      order: 3,
      content: 'Master the event loop, task queue, microtasks, async/await mechanics, handling network status codes, and fetching data from third-party REST API backends securely with rate limits in mind.',
      resources: []
    },
    {
      title: 'React State Management & Advanced Custom Hooks',
      order: 4,
      content: 'Understanding context providers, state synchronization with localStorage, building modular custom hooks to handle data fetching/caching, and debugging performance bottlenecks using React DevTools.',
      resources: []
    },
    {
      title: 'Next.js 16 App Router & Data Pre-fetching',
      order: 5,
      content: 'Server vs Client components, static site generation, incremental static regeneration, custom metadata tags for SEO compliance, and dynamic route loading with instant transitions.',
      resources: []
    }
  ];

  for (const lesson of frontendLessons) {
    await prisma.lesson.create({
      data: {
        title: lesson.title,
        order: lesson.order,
        courseId: frontendCourse.id,
        content: lesson.content,
        resources: lesson.resources,
      }
    });
  }

  // 7. Create lessons for Backend
  const backendLessons = [
    { title: 'Node.js Event-Driven Architecture & Express', order: 1 },
    { title: 'Relational Database Design & SQL Fundamentals', order: 2 },
    { title: 'ORM Abstractions with Prisma & Migrations', order: 3 },
  ];

  for (const lesson of backendLessons) {
    await prisma.lesson.create({
      data: {
        title: lesson.title,
        order: lesson.order,
        courseId: backendCourse.id,
        content: 'This module is under construction. Please check course syllabus for details.',
      }
    });
  }

  console.log('Created lessons for courses.');

  // Fetch the created lessons to create further associations
  const dbLessons = await prisma.lesson.findMany({
    where: { courseId: frontendCourse.id },
    orderBy: { order: 'asc' },
  });

  // 8. Create watch logs (progress) for student in Frontend Course
  // Student watched Lesson 1 fully (75 seconds) and Lesson 2 (65 seconds)
  await prisma.attendanceLog.create({
    data: {
      userId: demoStudent.id,
      lessonId: dbLessons[0].id,
      durationSeconds: 75,
    }
  });

  await prisma.attendanceLog.create({
    data: {
      userId: demoStudent.id,
      lessonId: dbLessons[1].id,
      durationSeconds: 65,
    }
  });

  console.log('Seeded lesson attendance watch progress.');

  // 9. Add a Bookmark and a Note for the student
  await prisma.lessonBookmark.create({
    data: {
      userId: demoStudent.id,
      lessonId: dbLessons[0].id,
    }
  });

  await prisma.lessonNote.create({
    data: {
      userId: demoStudent.id,
      lessonId: dbLessons[0].id,
      content: 'Decentralized version control means every developer has a full copy of the history. git rebase rewrites commits linearly whereas git merge preserves commits chronological order.',
    }
  });

  // 10. Create Assignments for Frontend Course
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Week 2 CSS Grid responsive layout design',
      description: 'Implement a premium responsive application dashboard matching the design guidelines. Pay close attention to colors, alignment, and hover feedback. Submit a hosted link or text repository URL.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      courseId: frontendCourse.id,
      allowResubmission: true,
    }
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Week 4 Fetch Weather Dashboard API integration',
      description: 'Implement a frontend dashboard that fetches details from the OpenWeather API. Include proper error handling for invalid locations and loading state displays.',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days in past
      courseId: frontendCourse.id,
      allowResubmission: false,
    }
  });

  console.log('Created assignments');

  // Submit assignments for student
  // Assignment 1 is submitted (pending review)
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      userId: demoStudent.id,
      type: 'LINK',
      content: 'https://github.com/gracehopper/weather-dashboard-uget',
    }
  });

  // Assignment 2 is submitted and graded
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment2.id,
      userId: demoStudent.id,
      type: 'TEXT',
      content: 'Completed weather card application with loading feedback and robust fetch handlers.',
      grade: 92,
      feedback: 'Excellent work Grace! The responsive layout adapts perfectly and the error states are highly descriptive.',
    }
  });

  // 11. Create Quizzes for Frontend Course
  const quiz = await prisma.quiz.create({
    data: {
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

  // Student attempted the quiz and passed
  await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: demoStudent.id,
      score: 100,
      passed: true,
      answers: [0, 2, 1],
    }
  });

  console.log('Created quizzes and quiz attempts');

  // 12. Create LiveSessions for attendance check-ins
  // Active session right now (started 5 mins ago, ends in 1 hour)
  const activeSession = await prisma.liveSession.create({
    data: {
      courseId: frontendCourse.id,
      title: 'Cohort Live Masterclass: Next.js Server Components Q&A',
      startTime: new Date(Date.now() - 5 * 60 * 1000),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      sessionCode: 'NX16LIVE',
      ipAddress: '127.0.0.1',
    }
  });

  // Past session (yesterday, student attended)
  const pastSession = await prisma.liveSession.create({
    data: {
      courseId: frontendCourse.id,
      title: 'Cohort Live Masterclass: Advanced CSS Grid',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
      sessionCode: 'CSSGRID8',
    }
  });

  await prisma.liveSessionAttendance.create({
    data: {
      liveSessionId: pastSession.id,
      userId: demoStudent.id,
      status: 'PRESENT',
      checkInTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 1000), // checked in 2 mins after start
    }
  });

  // Older session (last week, student missed, has excused absence)
  const olderSession = await prisma.liveSession.create({
    data: {
      courseId: frontendCourse.id,
      title: 'Cohort Live Masterclass: Git & Branching Strategy',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    }
  });

  await prisma.liveSessionAttendance.create({
    data: {
      liveSessionId: olderSession.id,
      userId: demoStudent.id,
      status: 'EXCUSED',
    }
  });

  await prisma.absenceExcuse.create({
    data: {
      liveSessionId: olderSession.id,
      userId: demoStudent.id,
      reason: 'I was feeling extremely under the weather. Attaching my clinic consult card.',
      status: 'APPROVED',
      resolvedBy: instructor.id,
      resolvedAt: new Date(),
    }
  });

  console.log('Created live sessions and attendance.');

  // 13. Create Forum posts & threads
  // Course-specific thread
  const courseThread = await prisma.forumThread.create({
    data: {
      courseId: frontendCourse.id,
      title: 'Best practices for managing custom local storage hooks in React?',
      content: 'Hello everyone! I am trying to build a custom storage hook sync state with local storage, but I am facing layout shifts during server hydration. Is it better to run the initializer in useEffect?',
      authorId: demoStudent.id,
      isPinned: true,
    }
  });

  const reply1 = await prisma.forumReply.create({
    data: {
      threadId: courseThread.id,
      content: 'Excellent question Grace. Hydration mismatch occurs because server renders standard default state whereas client local storage has custom states. Initialize state as null or standard defaults, then fetch local storage client-side in useEffect.',
      authorId: instructor.id,
      isVerifiedAnswer: true,
    }
  });

  // Upvotes
  await prisma.forumUpvote.create({
    data: {
      userId: demoStudent.id,
      replyId: reply1.id,
    }
  });

  // Academy-wide lounge thread
  const loungeThread = await prisma.forumThread.create({
    data: {
      courseId: null, // lounge
      title: 'Introduce yourself to the cohort!',
      content: 'Welcome to UGET Academy! Use this thread to share your background, technology interests, and career goals for this year.',
      authorId: admin.id,
      isPinned: true,
    }
  });

  console.log('Created forum threads and replies.');

  // Direct Q&A to instructor
  await prisma.directQA.create({
    data: {
      courseId: frontendCourse.id,
      studentId: demoStudent.id,
      question: 'Will there be any live assessments for the React hooks section or is it purely submission-based?',
      answer: 'Hi Grace, the evaluation is submission-based (weather API dashboard) with an individual code walk-through during office hours.',
      answeredAt: new Date(),
    }
  });

  // 14. Create Direct Messages
  await prisma.directMessage.create({
    data: {
      courseId: frontendCourse.id,
      senderId: instructor.id,
      receiverId: demoStudent.id,
      content: 'Hi Grace, your responsive dashboard submission looks clean! Ensure to check our announcements feed about the CSS grid review session.',
    }
  });

  // 15. Create Announcements
  await prisma.announcement.create({
    data: {
      courseId: frontendCourse.id,
      title: 'CSS Grid Q&A Cohort Review',
      content: 'Our live Q&A CSS layout grids review starts at 2 PM. Please bring your draft layouts for code feedback.',
      authorId: instructor.id,
    }
  });

  // 16. Payments seeding
  await prisma.payment.create({
    data: {
      amount: 150000,
      reference: 'PAY-UGET-FRNT-001',
      method: 'PAYSTACK',
      status: 'VERIFIED',
      userId: demoStudent.id,
    }
  });

  // 17. Support tickets
  await prisma.supportTicket.create({
    data: {
      userId: demoStudent.id,
      subject: 'Mux video player lag issues on Chrome',
      message: 'Whenever I play lesson videos, it pauses for a few seconds. Are there mirror download links?',
      status: 'RESOLVED',
      adminReply: 'Hi Grace, we updated Mux player configurations to auto-fallback on adaptive bitrate. This should fix the stuttering.',
      resolvedAt: new Date(),
    }
  });

  // 18. Notifications
  await prisma.notification.create({
    data: {
      userId: demoStudent.id,
      message: 'Your CSS dashboard assignment has been graded. Grade: 92/100.',
    }
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
