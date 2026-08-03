'use client';

import React, { useState } from 'react';
import WebcamCaptureModal from '@/components/student/WebcamCaptureModal';
import ExamSlotPicker from '@/components/student/ExamSlotPicker';
import { 
  GraduationCap, 
  Award, 
  FileCheck, 
  Calendar, 
  Camera, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  Video
} from 'lucide-react';

interface ExamSection {
  id: string;
  sectionNumber: 1 | 2 | 3;
  title: string;
  type: 'CBT' | 'PRACTICAL' | 'INTERVIEW';
  duration: string;
  status: 'PENDING_SLOT' | 'SLOT_BOOKED' | 'READY' | 'COMPLETED';
  bookedSlot?: { date: string; time: string };
  score?: number;
}

export default function StudentExamsPage() {
  const [examSections, setExamSections] = useState<ExamSection[]>([
    {
      id: 'sec-1',
      sectionNumber: 1,
      title: 'Section 1: Computer-Based Test (CBT)',
      type: 'CBT',
      duration: '45 Mins',
      status: 'READY',
    },
    {
      id: 'sec-2',
      sectionNumber: 2,
      title: 'Section 2: Theoretical & Practical Architecture Exam',
      type: 'PRACTICAL',
      duration: '60 Mins',
      status: 'PENDING_SLOT',
    },
    {
      id: 'sec-3',
      sectionNumber: 3,
      title: 'Section 3: Live Technical Interview Examination',
      type: 'INTERVIEW',
      duration: '30 Mins',
      status: 'PENDING_SLOT',
    },
  ]);

  // Modal triggers
  const [activeSlotBookingSection, setActiveSlotBookingSection] = useState<ExamSection | null>(null);
  const [activeWebcamExam, setActiveWebcamExam] = useState<ExamSection | null>(null);
  const [activeExamSession, setActiveExamSession] = useState<{ section: ExamSection; photo: string } | null>(null);

  // Slot booking handler
  const handleSlotBooked = (slot: { date: string; time: string }) => {
    if (!activeSlotBookingSection) return;

    setExamSections((prev) =>
      prev.map((sec) =>
        sec.id === activeSlotBookingSection.id
          ? { ...sec, status: 'SLOT_BOOKED', bookedSlot: slot }
          : sec
      )
    );

    setActiveSlotBookingSection(null);
  };

  // Start Exam triggers Webcam Capture first
  const handleInitiateExam = (section: ExamSection) => {
    setActiveWebcamExam(section);
  };

  // Photo captured -> Launch exam test session
  const handleCameraCaptured = (photoBase64: string) => {
    if (!activeWebcamExam) return;

    setActiveExamSession({
      section: activeWebcamExam,
      photo: photoBase64,
    });
    setActiveWebcamExam(null);
  };

  // Complete exam
  const handleFinishExamSession = () => {
    if (!activeExamSession) return;

    const finishedId = activeExamSession.section.id;
    setExamSections((prev) =>
      prev.map((sec) =>
        sec.id === finishedId
          ? { ...sec, status: 'COMPLETED', score: Math.floor(85 + Math.random() * 12) }
          : sec
      )
    );

    setActiveExamSession(null);
  };

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <GraduationCap className="w-7 h-7 text-purple-400" />
            3-Section Examination Portal
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Exams consist of CBT, Practical, and Interview sections. Book evaluation calendar slots and verify webcam identity before launching.
          </p>
        </div>
      </div>

      {/* Interactive Webcam Modal */}
      {activeWebcamExam && (
        <WebcamCaptureModal
          examTitle={activeWebcamExam.title}
          onCaptureComplete={handleCameraCaptured}
          onCancel={() => setActiveWebcamExam(null)}
        />
      )}

      {/* Calendar Slot Picker Modal */}
      {activeSlotBookingSection && (
        <ExamSlotPicker
          sectionTitle={activeSlotBookingSection.title}
          sectionType={activeSlotBookingSection.type as any}
          instructorName="Dr. Ada Lovelace"
          onSelectSlot={handleSlotBooked}
          onClose={() => setActiveSlotBookingSection(null)}
        />
      )}

      {/* Active Exam Session Screen */}
      {activeExamSession ? (
        <div className="bg-[#0F172A] border border-purple-500/30 rounded-3xl p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-black text-white">{activeExamSession.section.title}</h2>
            </div>
            <span className="text-xs font-mono font-bold bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
              Timer: 44:59 Left
            </span>
          </div>

          {/* Student Captured Photo Display */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-500 shrink-0">
              <img src={activeExamSession.photo} alt="Student Captured Verification" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Identity Verified</span>
              <p className="font-bold text-white">Student WebRTC Photo Captured & Logged</p>
              <p className="text-gray-400 text-[11px]">This photo will be displayed alongside your final score on the gradeboard.</p>
            </div>
          </div>

          {/* CBT Question Example */}
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-mono font-bold text-purple-400">Question 1 of 25</span>
            <p className="text-sm font-semibold text-white">
              Which cryptographic hashing algorithm produces a fixed 256-bit output digest and is widely adopted for data integrity verification?
            </p>
            <div className="space-y-2 text-xs pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                <input type="radio" name="q1" className="text-purple-600" />
                <span>SHA-256 (Secure Hash Algorithm 256-bit)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                <input type="radio" name="q1" className="text-purple-600" />
                <span>MD5 Digest</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleFinishExamSession}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/20"
            >
              Submit Exam Answers & Record Score
            </button>
          </div>
        </div>
      ) : (
        /* Exam Sections List */
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
            Exam Sections & Evaluation Calendar
          </h3>

          <div className="grid grid-cols-1 gap-5">
            {examSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl hover:border-purple-500/30 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/30">
                      Section {sec.sectionNumber} • {sec.type}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{sec.title}</h3>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-gray-400 block">Duration</span>
                    <span className="font-mono font-bold text-purple-400">{sec.duration}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    {sec.bookedSlot ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span>Slot Reserved: <strong className="text-white">{sec.bookedSlot.date} @ {sec.bookedSlot.time}</strong></span>
                      </div>
                    ) : sec.type !== 'CBT' ? (
                      <p className="text-xs text-amber-300 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        Select an available calendar slot for instructor evaluation.
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        <Camera className="w-4 h-4 text-purple-400" />
                        Webcam photo capture required prior to starting CBT test.
                      </p>
                    )}
                  </div>

                  {sec.status === 'COMPLETED' ? (
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Score Recorded: {sec.score}%
                    </span>
                  ) : sec.type !== 'CBT' && sec.status === 'PENDING_SLOT' ? (
                    <button
                      onClick={() => setActiveSlotBookingSection(sec)}
                      className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      <Calendar className="w-4 h-4" /> Pick Available Time Slot
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInitiateExam(sec)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <Camera className="w-4 h-4" /> Verify Webcam & Start Exam
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
