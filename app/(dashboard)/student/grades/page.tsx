import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { 
  Award, 
  TrendingUp, 
  CheckCircle, 
  BookOpen, 
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Percent,
  CalendarCheck
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentGradesDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // 1. Fetch Student Grades (overall course grades)
  const studentGrades = await prisma.studentGrade.findMany({
    where: { userId },
    include: {
      course: true,
    },
  });

  // 2. Fetch all enrolled courses & assignments to calculate progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          assignments: true,
          quizzes: true,
          sessions: {
            include: {
              attendances: {
                where: { userId }
              },
              excuses: {
                where: { userId }
              }
            }
          }
        },
      },
    },
  });

  // 3. Fetch submissions
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { userId },
    include: {
      assignment: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  // 4. Fetch quiz attempts
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // 5. Calculate Attendance Rate from Live Sessions
  let totalLiveSessions = 0;
  let attendedLiveSessions = 0;

  enrollments.forEach((e) => {
    e.course.sessions.forEach((s) => {
      totalLiveSessions++;
      const att = s.attendances[0];
      const excuse = s.excuses[0];
      if (att?.status === 'PRESENT' || att?.status === 'LATE' || att?.status === 'EXCUSED' || excuse?.status === 'APPROVED') {
        attendedLiveSessions++;
      }
    });
  });

  const attendanceRate = totalLiveSessions > 0
    ? Math.round((attendedLiveSessions / totalLiveSessions) * 100)
    : 100;

  // Assignment progression stats
  let totalAssignmentsCount = 0;
  enrollments.forEach((e) => {
    totalAssignmentsCount += e.course.assignments.length;
  });
  const submittedCount = submissions.length;
  const assignmentProgress = totalAssignmentsCount > 0
    ? Math.round((submittedCount / totalAssignmentsCount) * 100)
    : 100;

  // Quiz progression stats
  let totalQuizzesCount = 0;
  enrollments.forEach((e) => {
    totalQuizzesCount += e.course.quizzes.length;
  });
  const quizAttemptsCount = quizAttempts.length;
  const quizProgress = totalQuizzesCount > 0
    ? Math.round((quizAttemptsCount / totalQuizzesCount) * 100)
    : 100;

  // Graded assignment average
  const gradedSubmissions = submissions.filter((s) => s.grade !== null);
  const assignmentAverage = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((acc, s) => acc + s.grade!, 0) / gradedSubmissions.length)
    : 100;

  // Quiz average score
  const quizAverage = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((acc, q) => acc + q.score, 0) / quizAttempts.length)
    : 100;

  // Weighted Academic Grade formula: Attendance (20%), Quizzes (40%), Assignments (40%)
  const attendanceContribution = Math.round(attendanceRate * 0.2);
  const quizContribution = Math.round(quizAverage * 0.4);
  const assignmentContribution = Math.round(assignmentAverage * 0.4);
  const finalGrade = Math.round(attendanceContribution + quizContribution + assignmentContribution);

  // Combine assignments & quizzes into performance list
  const performanceItems: Array<{
    name: string;
    score: string;
    status: 'Graded' | 'Pending';
    date: string;
  }> = [];

  submissions.forEach((s) => {
    performanceItems.push({
      name: `Assignment: ${s.assignment.title}`,
      score: s.grade !== null ? `${s.grade}%` : '--',
      status: s.grade !== null ? 'Graded' : 'Pending',
      date: new Date(s.submittedAt).toLocaleDateString(),
    });
  });

  quizAttempts.forEach((q) => {
    performanceItems.push({
      name: `Quiz: ${q.quiz.title}`,
      score: `${q.score}%`,
      status: 'Graded',
      date: new Date(q.createdAt).toLocaleDateString(),
    });
  });

  return (
    <div className="space-y-6 animate-fade-in text-text-primary">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">My Gradeboard</h1>
        <p className="text-text-secondary text-xs mt-1">Cohort 1. Web Development • Detailed performance analytics.</p>
      </div>

      {/* Premium Purple Banner with progress metrics */}
      <div className="bg-gradient-to-r from-royal-purple to-[#8B5CF6] rounded-3xl p-8 text-white shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden border border-border-divider/50">
        {/* Glow decoration */}
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-white/10 rounded-full filter blur-3xl pointer-events-none" />
        
        {/* Overall score */}
        <div className="md:col-span-4 flex flex-col justify-center relative z-10">
          <span className="text-[10px] text-text-primary/70 font-bold uppercase tracking-wider block">Weighted Academic Grade</span>
          <span className="text-7xl font-black block leading-none mt-2 text-white">
            {finalGrade}
            <span className="text-2xl font-medium text-royal-gold">%</span>
          </span>
        </div>

        {/* Progress bars matrix */}
        <div className="md:col-span-8 space-y-4 relative z-10">
          {/* Assignments */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/95">
              <span>Assignments progression</span>
              <span>{assignmentProgress}%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-royal-gold h-full rounded-full transition-all duration-500" 
                style={{ width: `${assignmentProgress}%` }} 
              />
            </div>
          </div>

          {/* Quizzes */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/95">
              <span>Quiz progression</span>
              <span>{quizProgress}%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-royal-gold h-full rounded-full transition-all duration-500" 
                style={{ width: `${quizProgress}%` }} 
              />
            </div>
          </div>

          {/* Attendance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/95">
              <span>Attendance rate</span>
              <span>{attendanceRate}%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-royal-gold h-full rounded-full transition-all duration-500" 
                style={{ width: `${attendanceRate}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grading Evaluation Breakdown Card */}
      <div className="bg-surface-card border border-border-divider rounded-3xl p-6 sm:p-8 space-y-5">
        <h3 className="text-sm font-black text-text-primary tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-royal-gold" /> Evaluation Formula Breakdown
        </h3>
        <p className="text-text-secondary text-xs leading-relaxed">
          Your overall academic score is dynamically calculated using a weighted model comprising live cohort attendance, theoretical test scores, and practical course assessments.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Attendance contribution */}
          <div className="bg-deep-violet border border-border-divider rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-text-secondary">
              <span>Attendance</span>
              <span>20% Weight</span>
            </div>
            <div className="text-lg font-black text-text-primary">{attendanceRate}%</div>
            <div className="text-[10px] text-text-secondary font-semibold">Contribution: {attendanceContribution}%</div>
          </div>

          {/* Quizzes contribution */}
          <div className="bg-deep-violet border border-border-divider rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-text-secondary">
              <span>Tests / Quizzes</span>
              <span>40% Weight</span>
            </div>
            <div className="text-lg font-black text-text-primary">{quizAverage}%</div>
            <div className="text-[10px] text-text-secondary font-semibold">Contribution: {quizContribution}%</div>
          </div>

          {/* Assignments contribution */}
          <div className="bg-deep-violet border border-border-divider rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-text-secondary">
              <span>Assessments</span>
              <span>40% Weight</span>
            </div>
            <div className="text-lg font-black text-text-primary">{assignmentAverage}%</div>
            <div className="text-[10px] text-text-secondary font-semibold">Contribution: {assignmentContribution}%</div>
          </div>
        </div>
      </div>

      {/* Evaluation Advisory Box */}
      <div className="bg-royal-purple/10 border border-royal-purple/30 text-accent-purple rounded-2xl p-5 text-xs flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-royal-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Syllabus Evaluation Alert</p>
          <p className="leading-relaxed opacity-90 font-medium">To qualify for certificate generation, all week-by-week coursework submissions must undergo verification. Attendance should exceed 80% class watch time limits.</p>
        </div>
      </div>

      {/* Performance Breakdown Table */}
      <div className="bg-surface-card rounded-3xl border border-border-divider overflow-hidden">
        <div className="px-8 py-5 border-b border-border-divider flex items-center justify-between bg-[#150E27]/40">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Your performance logs</h2>
          <span className="text-xs font-bold text-text-primary bg-deep-violet px-3.5 py-1.5 rounded-xl border border-border-divider shadow-sm flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-royal-gold" />
            <span>Attendance: {attendedLiveSessions} of {totalLiveSessions} classes</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          {performanceItems.length === 0 ? (
            <div className="py-12 text-center text-text-secondary text-xs font-medium">No performance records or submissions found. Complete assignments or quizzes to view grades.</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-divider bg-[#150E27]/30 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                  <th className="px-8 py-4">Task/Assessment</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-divider text-text-primary">
                {performanceItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-royal-purple/10 transition">
                    <td className="px-8 py-4 font-semibold text-text-primary">{item.name}</td>
                    <td className="px-6 py-4 font-black text-text-primary">{item.score}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        item.status === 'Graded'
                          ? 'bg-emerald-500/20 text-status-present border-emerald-500/30'
                          : 'bg-status-excused/15 text-status-excused border-status-excused/30'
                      }`}>
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-text-secondary font-semibold">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
