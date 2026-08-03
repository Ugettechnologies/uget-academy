import React from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { 
  BarChart3, 
  Award, 
  CheckCircle2, 
  Camera, 
  ExternalLink, 
  Share2, 
  Download, 
  GraduationCap, 
  FileCheck,
  Sparkles
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentGradesPage() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  const userId = session.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      grades: {
        include: { course: true },
      },
      certificates: {
        include: { course: true },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const mockScoreboardItems = [
    {
      id: 'score-1',
      title: 'Module 4: Advanced Web Penetration & OWASP Top 10',
      category: 'Assignment Deliverable',
      score: 92,
      status: 'GRADED',
      date: 'Aug 2, 2026',
      hasPhoto: false,
    },
    {
      id: 'score-2',
      title: 'Section 1: Computer-Based Test (CBT)',
      category: 'CBT Quiz Exam',
      score: 88,
      status: 'GRADED',
      date: 'Aug 1, 2026',
      hasPhoto: true,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'score-3',
      title: 'Section 2: Theoretical & Practical Architecture Exam',
      category: 'Practical Exam',
      score: 90,
      status: 'GRADED',
      date: 'Jul 28, 2026',
      hasPhoto: true,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'score-4',
      title: 'Section 3: Live Technical Interview Examination',
      category: 'Interview Exam',
      score: 95,
      status: 'GRADED',
      date: 'Jul 25, 2026',
      hasPhoto: true,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const overallAverage = Math.round(
    mockScoreboardItems.reduce((acc, item) => acc + item.score, 0) / mockScoreboardItems.length
  );

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <BarChart3 className="w-7 h-7 text-[#60A5FA]" />
            Academic Scoreboard & Certificates
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Scores for assignments, tests, and 3-section exams. Verification photos display next to your exam records.
          </p>
        </div>
      </div>

      {/* Overall Score Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-blue-950 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
            Cumulative Grade Point Average
          </span>
          <h2 className="text-4xl font-black text-white">
            Overall Score: <span className="text-emerald-400">{overallAverage}%</span>
          </h2>
          <p className="text-xs text-gray-300">
            Distinction Grade • Verified by UGET Academy Academic Board
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-xl">
            A+
          </div>
        </div>
      </div>

      {/* Scoreboard Table */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
          Evaluated Scores & Captured Photos Directory
        </h3>

        <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Assessment / Module</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Verification Photo</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4 text-right">Evaluated Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {mockScoreboardItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-bold text-white">
                      {item.title}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gray-300 px-2.5 py-1 rounded-lg border border-white/10">
                        {item.category}
                      </span>
                    </td>

                    {/* Captured Webcam Photo */}
                    <td className="px-6 py-4">
                      {item.hasPhoto ? (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-purple-500/50 shrink-0">
                            <img src={item.photoUrl} alt="Webcam Captured" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Photo Logged
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 italic">Not required for deliverable</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {item.score}%
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-[11px] text-gray-400">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shareable Certificate Card */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Course Completion Certificate</h3>
              <p className="text-xs text-gray-400">Official LinkedIn-ready credential verification</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
            Issued Credential
          </span>
        </div>

        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Credential Code: UGET-2026-CERT-9941</span>
            <h4 className="text-sm font-bold text-white">Certified Cybersecurity & Threat Analyst Specialist</h4>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white font-bold text-xs transition flex items-center gap-2 shadow-md"
            >
              <Share2 className="w-4 h-4" /> Share on LinkedIn
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
