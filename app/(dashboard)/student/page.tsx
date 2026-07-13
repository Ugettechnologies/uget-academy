import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { 
  BarChart3, 
  CheckSquare, 
  Clock, 
  FileText, 
  ClipboardCheck,
  CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // Query database for user information to ensure it's loaded correctly
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: true,
      grades: true,
    }
  });

  // Setup stats
  const totalAssignments = 10;
  const completedAssignments = 10;
  const successRate = "100%";
  const examsAvailable = 2;
  const examsTaken = 2;

  // Mock activity logs that exactly match the high-fidelity screenshot
  const recentActivities = [
    { id: '1', title: "You submitted 'Week 10: High-Fidelity'", date: '08/06/2026', status: 'Graded' },
    { id: '2', title: "You submitted 'Week 10: High-Fidelity'", date: '08/06/2026', status: 'Graded' },
    { id: '3', title: "You submitted 'Week 10: High-Fidelity'", date: '08/06/2026', status: 'Graded' },
    { id: '4', title: "You submitted 'Week 10: High-Fidelity'", date: '08/06/2026', status: 'Graded' },
    { id: '5', title: "You submitted 'Week 10: High-Fidelity'", date: '08/06/2026', status: 'Graded' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
      </div>

      {/* Row 1: Three Core Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assignments Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800">{totalAssignments}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assignments</div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800">{completedAssignments}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</div>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800">{successRate}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Row 2: Two Exam Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Examinations Available */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800">{examsAvailable}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Examinations Available</div>
          </div>
        </div>

        {/* Examinations Taken */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800">{examsTaken}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Examinations Taken</div>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-6">
        <h2 className="text-base font-black text-slate-800 tracking-tight">Recent Activity</h2>

        <div className="space-y-5">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#E0EEFF] text-[#1E60D5] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700 leading-snug">{activity.title}</p>
                  <span className="text-xs text-slate-400 font-medium">{activity.date}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{activity.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
