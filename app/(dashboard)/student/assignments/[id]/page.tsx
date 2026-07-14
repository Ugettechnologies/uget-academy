import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AssignmentFormClient from './AssignmentFormClient';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Award, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // Fetch assignment details from database
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      course: true,
      submissions: {
        where: { userId },
      },
    },
  });

  if (!assignment) {
    redirect('/student/assignments');
  }

  const submission = assignment.submissions[0];

  // Status calculation
  let statusText: 'Graded' | 'Pending Review' | 'Open' = 'Open';
  if (submission) {
    statusText = submission.grade !== null ? 'Graded' : 'Pending Review';
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Navigation */}
      <div>
        <Link href="/student/assignments" className="inline-flex items-center gap-15 text-xs font-bold text-[#1E60D5] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
        </Link>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">{assignment.title}</h1>
        <p className="text-xs text-slate-450 mt-0.5">{assignment.course.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 space-y-4">
            <h2 className="text-base font-black text-slate-800 tracking-tight">Project Guidelines & Instructions</h2>
            <div className="border-t border-slate-50 pt-4 text-xs text-slate-600 leading-relaxed space-y-4 font-normal">
              <p className="whitespace-pre-line">{assignment.description}</p>
              
              <div className="bg-[#F0F6FF] rounded-2xl p-5 border border-[#D5E6FC] space-y-2">
                <span className="text-xs font-bold text-[#1E60D5] uppercase tracking-wider block">Important Requirements:</span>
                <ul className="list-disc pl-5 text-[11px] text-slate-600 space-y-1.5 font-semibold">
                  <li>Your implementation must be fully responsive across mobile, tablet, and desktop viewports.</li>
                  <li>Verify that no CSS properties override structural flex grid elements path.</li>
                  <li>Keep clean repository files structure and follow folder conventions.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submission summary if already submitted */}
          {submission && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 space-y-4">
              <h2 className="text-base font-black text-slate-800 tracking-tight">Your Submission Summary</h2>
              <div className="border-t border-slate-50 pt-4 space-y-3.5 text-xs text-slate-605">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">GitHub Repository</span>
                  <a href={submission.content.split(' | ')[0]} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#1E60D5] hover:underline flex items-center gap-1 mt-1">
                    {submission.content.split(' | ')[0]} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {submission.content.includes(' | Demo: ') && submission.content.split(' | Demo: ')[1]?.split(' | ')[0] !== 'None' && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Figma / Live Demo URL</span>
                    <a 
                      href={submission.content.split(' | Demo: ')[1]?.split(' | ')[0]} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-sm font-semibold text-[#1E60D5] hover:underline flex items-center gap-1 mt-1"
                    >
                      {submission.content.split(' | Demo: ')[1]?.split(' | ')[0]} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel (Right Sidebar) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 space-y-5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Assignment Status</span>
              <div className="mt-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  statusText === 'Graded'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                    : statusText === 'Pending Review'
                    ? 'bg-amber-50 text-amber-600 border-amber-500/20'
                    : 'bg-blue-50 text-blue-600 border-blue-500/20 shadow-sm'
                }`}>
                  {statusText === 'Graded' && <CheckCircle2 className="w-4 h-4" />}
                  {statusText === 'Pending Review' && <Clock className="w-4 h-4" />}
                  {statusText === 'Open' && <AlertCircle className="w-4 h-4" />}
                  <span>{statusText}</span>
                </span>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Due Date</span>
                <span className="text-slate-700 font-black font-mono">
                  {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Grade</span>
                <span className="text-slate-700 font-black text-sm">
                  {submission && submission.grade !== null ? `${submission.grade}/100` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic actions form client */}
          {(!submission || (submission && assignment.allowResubmission)) && (
            <AssignmentFormClient assignmentId={assignment.id} isResubmission={!!submission} />
          )}

          {/* Graded info card feedback */}
          {statusText === 'Graded' && submission.feedback && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 space-y-4">
              <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1E60D5]" />
                Instructor Feedback
              </h3>
              <div className="border-t border-slate-50 pt-4 space-y-3.5 text-xs text-slate-650">
                <p className="leading-relaxed italic">"{submission.feedback}"</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Graded by</span>
                  <span>Lead Instructor</span>
                </div>
              </div>
            </div>
          )}

          {/* Pending Review status message */}
          {statusText === 'Pending Review' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs text-amber-700 space-y-2 font-medium">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Submission Under Review
                </p>
                <p className="leading-relaxed">Your submission has been received. An instructor will review your code files and design deliverables within 24 hours.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
