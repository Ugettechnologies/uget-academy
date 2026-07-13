'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  ExternalLink,
  Award,
  Clock,
  AlertCircle
} from 'lucide-react';

interface AssignmentPageProps {
  params: Promise<{ id: string }>;
}

interface AssignmentDetail {
  id: string;
  name: string;
  dueDate: string;
  status: 'Graded' | 'Pending Review' | 'Open';
  grade: string;
  description: string;
  feedback?: string;
  gradedBy?: string;
}

const mockAssignmentsData: Record<string, AssignmentDetail> = {
  '1': {
    id: '1',
    name: 'Week 1: Git & GitHub Masterclass',
    dueDate: '12/04/2026',
    status: 'Graded',
    grade: '95/100',
    description: 'Set up a local Git repository, initialize tracking, perform commits, create branches, resolve a merge conflict, and push the project to a public GitHub repository. Submit your repository link.',
    feedback: 'Excellent start to the academy! Your commit history is very clean, branch names follow standard conventions, and you resolved the merge conflicts perfectly.',
    gradedBy: 'Instructor Demo'
  },
  '2': {
    id: '2',
    name: 'Week 2: Advanced HTML5 & CSS3',
    dueDate: '19/04/2026',
    status: 'Graded',
    grade: '88/100',
    description: 'Build a semantic website layout containing a header, navbar, main article section, sidebar, and footer. Use HTML5 tags and style the structure using basic CSS selectors, border box rules, and CSS variables.',
    feedback: 'Very good layout structure. Ensure you use absolute paths correctly for assets and validate your HTML tag pairing.',
    gradedBy: 'Instructor Demo'
  },
  '3': {
    id: '3',
    name: 'Week 3: CSS Flexbox & CSS Grid',
    dueDate: '26/04/2026',
    status: 'Graded',
    grade: '90/100',
    description: 'Implement a complex responsive pricing matrix and gallery layout using Flexbox and Grid. Ensure the layouts are mobile-friendly and adjust seamlessly without breaking.',
    feedback: 'The grid alignment adapts beautifully across devices. Great job using minmax in your grid layouts.',
    gradedBy: 'Instructor Demo'
  },
  '4': {
    id: '4',
    name: 'Week 4: JavaScript Fundamentals',
    dueDate: '03/05/2026',
    status: 'Graded',
    grade: '85/100',
    description: 'Solve a series of computational programming problems involving array functions (map, filter, reduce), promises, async/await handlers, and deep cloning of object systems.',
    feedback: 'Clean logic in your utility scripts. Take care when handling rejection in your async promise functions.',
    gradedBy: 'Instructor Demo'
  },
  '5': {
    id: '5',
    name: 'Week 5: DOM Manipulation & Events',
    dueDate: '10/05/2026',
    status: 'Graded',
    grade: '92/100',
    description: 'Create an interactive Todo List application with categories, task search, local storage synchronization, and transition animations using vanilla JS.',
    feedback: 'User experience is awesome. LocalStorage updates are fully synchronized without latency. Bravo.',
    gradedBy: 'Instructor Demo'
  },
  '6': {
    id: '6',
    name: 'Week 6: Asynchronous JS & API Integration',
    dueDate: '17/05/2026',
    status: 'Graded',
    grade: '94/100',
    description: 'Build a weather portal dashboard that queries a weather REST API, caches queries, handles input errors gracefully, and shows visual chart histories.',
    feedback: 'Excellent visual representation. Caching strategies are implemented very cleanly in memory.',
    gradedBy: 'Instructor Demo'
  },
  '7': {
    id: '7',
    name: 'Week 7: React Components & Props',
    dueDate: '24/05/2026',
    status: 'Graded',
    grade: '89/100',
    description: 'Rebuild the weather dashboard component architecture using React. Focus on props delegation, rendering cycles, composition rules, and clean component isolation.',
    feedback: 'Well-structured component folders. Props validation and TypeScript interfaces are neat.',
    gradedBy: 'Instructor Demo'
  },
  '8': {
    id: '8',
    name: 'Week 8: State Management & Hooks',
    dueDate: '31/05/2026',
    status: 'Graded',
    grade: '91/100',
    description: 'Implement a multi-step checkout workflow and virtual cart system utilizing custom React hooks and the React Context API.',
    feedback: 'The custom cart hook is robust. Clean reducer state transitions.',
    gradedBy: 'Instructor Demo'
  },
  '9': {
    id: '9',
    name: 'Week 9: Next.js Pages & App Router Routing',
    dueDate: '07/06/2026',
    status: 'Graded',
    grade: '93/100',
    description: 'Deploy a multi-page dynamic blog site using Next.js. Use dynamic route paths, implement metadata handlers, and enable server side generation.',
    feedback: 'Metadata layouts are optimized for SEO correctly. Fast routing speeds.',
    gradedBy: 'Instructor Demo'
  },
  '10': {
    id: '10',
    name: 'Week 10: High-Fidelity Figma UI Redesign',
    dueDate: '14/06/2026',
    status: 'Open',
    grade: '--',
    description: 'Convert a high-fidelity Figma dashboard design file into a pixel-perfect front-end layout using Next.js and Tailwind CSS (or pure CSS). Pay close attention to colors, shadows, borders, alignments, and navigation active states.'
  }
};

export default function StudentAssignmentDetailPage({ params }: AssignmentPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<AssignmentDetail | undefined>(() => {
    return mockAssignmentsData[id];
  });

  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!assignment) {
    return (
      <div className="space-y-6">
        <Link href="/student/assignments" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E60D5] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
        </Link>
        <div className="bg-white rounded-3xl p-8 text-center text-slate-500 font-bold border border-slate-50">
          Assignment not found.
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubLink) return;

    setSubmitting(true);
    // Simulate API call and update local state to "Pending Review"
    setTimeout(() => {
      setAssignment(prev => {
        if (!prev) return undefined;
        return {
          ...prev,
          status: 'Pending Review'
        };
      });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation */}
      <div>
        <Link href="/student/assignments" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E60D5] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
        </Link>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">{assignment.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-4">
            <h2 className="text-base font-black text-slate-800 tracking-tight">Project Guidelines & Instructions</h2>
            <div className="border-t border-slate-50 pt-4 text-sm text-slate-650 leading-relaxed space-y-4">
              <p>{assignment.description}</p>
              
              <div className="bg-[#F0F6FF] rounded-2xl p-5 border border-[#D5E6FC] space-y-2">
                <span className="text-xs font-bold text-[#1E60D5] uppercase tracking-wider block">Important Requirements:</span>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5">
                  <li>Your implementation must be fully responsive across mobile, tablet, and desktop viewports.</li>
                  <li>Verify that no CSS properties override structural flex grid elements path.</li>
                  <li>Keep clean repository files structure and follow folder conventions.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submission content view for Graded / Pending Review */}
          {assignment.status !== 'Open' && (
            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-4">
              <h2 className="text-base font-black text-slate-800 tracking-tight">Your Submission Summary</h2>
              <div className="border-t border-slate-50 pt-4 space-y-3.5">
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">GitHub Repository</span>
                  <a href={githubLink || "https://github.com/student/uget-project"} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#1E60D5] hover:underline flex items-center gap-1 mt-1">
                    {githubLink || "https://github.com/student/uget-project"} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {demoLink && (
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Figma / Live Demo URL</span>
                    <a href={demoLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#1E60D5] hover:underline flex items-center gap-1 mt-1">
                      {demoLink} <ExternalLink className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-5">
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Assignment Status</span>
              <div className="mt-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  assignment.status === 'Graded'
                    ? 'bg-emerald-50/50 text-emerald-600 border-emerald-500/20 shadow-sm'
                    : assignment.status === 'Pending Review'
                    ? 'bg-amber-50/50 text-amber-600 border-amber-500/20'
                    : 'bg-blue-50/50 text-blue-600 border-blue-500/20 shadow-sm'
                }`}>
                  {assignment.status === 'Graded' && <CheckCircle2 className="w-4 h-4" />}
                  {assignment.status === 'Pending Review' && <Clock className="w-4 h-4" />}
                  {assignment.status === 'Open' && <AlertCircle className="w-4 h-4" />}
                  <span>{assignment.status}</span>
                </span>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Due Date</span>
                <span className="text-slate-700 font-bold">{assignment.dueDate}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Grade</span>
                <span className="text-slate-700 font-black text-sm">{assignment.grade}</span>
              </div>
            </div>
          </div>

          {/* Dynamic actions form */}
          {assignment.status === 'Open' && (
            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-5">
              <h3 className="text-base font-black text-slate-800 tracking-tight">Submit Deliverables</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GitHub Repository Link</label>
                  <input
                    type="url"
                    required
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Demo / Figma URL</label>
                  <input
                    type="url"
                    value={demoLink}
                    onChange={(e) => setDemoLink(e.target.value)}
                    placeholder="https://figma.com/file/... or live URL"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submission Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for your instructor..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-[#1E60D5] focus:bg-white focus:outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !githubLink}
                  className="w-full bg-[#1E60D5] hover:bg-[#1E60D5]/90 text-white rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1E60D5]/10 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Assignment'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Graded info card */}
          {assignment.status === 'Graded' && (
            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-4">
              <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1E60D5]" />
                Instructor Feedback
              </h3>
              <div className="border-t border-slate-50 pt-4 space-y-3.5 text-xs">
                <p className="text-slate-600 leading-relaxed italic">"{assignment.feedback}"</p>
                <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                  <span>Graded by</span>
                  <span>{assignment.gradedBy}</span>
                </div>
              </div>
            </div>
          )}

          {/* Pending Review status */}
          {assignment.status === 'Pending Review' && (
            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs text-amber-700 space-y-2">
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
