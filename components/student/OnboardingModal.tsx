'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  X, 
  Check, 
  LayoutDashboard, 
  Calendar, 
  Video, 
  FileSpreadsheet, 
  GraduationCap, 
  MessageCircle, 
  Code2, 
  BarChart3, 
  FolderDown, 
  User 
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to UGET Academy! 🎉',
    subtitle: 'Your Journey Starts Here',
    description: 'We are thrilled to have you! Let us take 30 seconds to show you around your new student portal so you can hit the ground running.',
    icon: Sparkles,
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Class Schedule & Reminders 📅',
    subtitle: 'Never Miss a Lecture',
    description: 'Instructors schedule live classes on your Timetable. You will get in-app & email reminders with topic details ahead of every lecture.',
    icon: Calendar,
    accentColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'Google Meet-Style Live Class 🎥',
    subtitle: 'Live Attendance & Roll Call',
    description: 'Join live lectures directly from your schedule. Remember to click the Roll Call button inside class to confirm your attendance and unlock post-class transcripts!',
    icon: Video,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Assignments & Code Playground 💻',
    subtitle: 'Hands-On Practice',
    description: 'Submit your deliverables and practice coding challenges in our built-in browser IDE with instant auto-grading.',
    icon: Code2,
    accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    title: '3-Section Tests & Exams 🎓',
    subtitle: 'CBT, Practical & Interview Exams',
    description: 'Exams combine CBT quizzes with Practical & Interview sections where you pick your preferred calendar time slot. Webcam photo capture verifies your identity.',
    icon: GraduationCap,
    accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    title: 'Direct Messaging & Q&A 💬',
    subtitle: 'Connect with Classmates & Instructors',
    description: 'Send private messages to your course instructor or chat with cohort classmates anytime in the Chat module.',
    icon: MessageCircle,
    accentColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('uget_has_completed_onboarding');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('uget_has_completed_onboarding', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];
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
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
        </div>

        {/* Step Content */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#60A5FA]">
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
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStepIndex
                  ? 'w-8 bg-[#2563EB]'
                  : index < currentStepIndex
                  ? 'w-3 bg-blue-500/50'
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white font-bold text-xs hover:from-[#2563EB]/90 hover:to-[#60A5FA]/90 transition shadow-lg shadow-blue-500/20"
          >
            {currentStepIndex === STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4" /> Get Started Now
              </>
            ) : (
              <>
                Continue <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
