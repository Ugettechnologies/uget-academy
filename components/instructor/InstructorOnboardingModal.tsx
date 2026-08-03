'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  X, 
  Check, 
  Users, 
  Calendar, 
  PlusCircle, 
  CheckSquare, 
  Users2, 
  FileText, 
  BookOpen 
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
}

const INSTRUCTOR_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Instructor Workspace! 🎓',
    subtitle: 'Manage Your Assigned Cohort',
    description: 'Welcome Dr. Instructor! Let us guide you through the tools to manage your assigned course roster, schedule lectures, grade assessments, and report to admin.',
    icon: Sparkles,
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Student Attendance & Roster 📋',
    subtitle: 'Track Academic Progress',
    description: 'After live class roll call closes, monitor present/flagged students, deliverables submitted, and exam scores in one unified roster view.',
    icon: Users,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Live Timetable & Lecture Sync 📅',
    subtitle: 'Real-time Schedule Updates',
    description: 'Edit your class schedule anytime. Updates automatically reflect on all assigned students’ portals with class topic reminders.',
    icon: Calendar,
    accentColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'Assessment Creator & Editor ✍️',
    subtitle: 'Draft Questions & Exams',
    description: 'Use the built-in Rich Text Editor to draft assignments, CBT tests, and Section 3 interview questions/prompts directly in the browser.',
    icon: PlusCircle,
    accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    title: 'Grading Queue & DM Sync 📝',
    subtitle: 'Evaluate & Direct Message Feedback',
    description: 'Grade student entries, provide detailed feedback, and click "Send Feedback as DM" to sync directly to the student portal & email.',
    icon: CheckSquare,
    accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    title: 'Group Projects & Admin Reports 📊',
    subtitle: 'Collaborative Assigning & Reviews',
    description: 'Split your class into pairs/groups for shared projects and submit your Daily Activity & Weekly Summary reviews to the Admin.',
    icon: FileText,
    accentColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
];

export default function InstructorOnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('uget_instructor_has_completed_onboarding');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStepIndex < INSTRUCTOR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('uget_instructor_has_completed_onboarding', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentStep = INSTRUCTOR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={finishOnboarding}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Step Count */}
        <div className="flex items-center justify-between">
          <div className={`p-3.5 rounded-2xl border ${currentStep.accentColor}`}>
            <StepIcon className="w-7 h-7" />
          </div>
          <span className="text-xs font-mono font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Guide {currentStepIndex + 1} of {INSTRUCTOR_STEPS.length}
          </span>
        </div>

        {/* Step Content */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-400">
            {currentStep.subtitle}
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {currentStep.title}
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed pt-1">
            {currentStep.description}
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex gap-1.5 pt-2">
          {INSTRUCTOR_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStepIndex
                  ? 'w-8 bg-purple-600'
                  : index < currentStepIndex
                  ? 'w-3 bg-purple-500/50'
                  : 'w-3 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={finishOnboarding}
            className="text-xs text-gray-400 hover:text-white transition font-medium"
          >
            Skip Tutorial
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-500/20"
          >
            {currentStepIndex === INSTRUCTOR_STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4" /> Start Teaching Now
              </>
            ) : (
              <>
                Next Guide <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
