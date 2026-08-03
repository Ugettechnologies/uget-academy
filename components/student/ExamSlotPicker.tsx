'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Check, X, UserCheck, AlertCircle } from 'lucide-react';

interface ExamSlotPickerProps {
  sectionTitle: string;
  sectionType: 'PRACTICAL' | 'INTERVIEW';
  instructorName?: string;
  onSelectSlot: (slot: { date: string; time: string }) => void;
  onClose: () => void;
}

export default function ExamSlotPicker({ sectionTitle, sectionType, instructorName = 'Lead Instructor', onSelectSlot, onClose }: ExamSlotPickerProps) {
  // Available dates for booking
  const availableSlots = [
    {
      date: 'Tomorrow, Aug 4',
      dateStr: '2026-08-04',
      times: ['10:00 AM', '02:00 PM', '04:30 PM'],
    },
    {
      date: 'Wednesday, Aug 5',
      dateStr: '2026-08-05',
      times: ['09:30 AM', '11:00 AM', '03:00 PM', '05:00 PM'],
    },
    {
      date: 'Thursday, Aug 6',
      dateStr: '2026-08-06',
      times: ['10:00 AM', '01:30 PM', '04:00 PM'],
    },
  ];

  const [selectedDate, setSelectedDate] = useState(availableSlots[0].dateStr);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const activeSlotDate = availableSlots.find((s) => s.dateStr === selectedDate);

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onSelectSlot({ date: selectedDate, time: selectedTime });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-white">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Book Exam Slot</h3>
            <p className="text-xs text-gray-400">
              {sectionTitle} ({sectionType === 'PRACTICAL' ? 'Practical Exam' : 'Interview Session'})
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-gray-300 space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#60A5FA]" /> Evaluator: {instructorName}
          </p>
          <p className="text-[11px] text-gray-400">
            Select your preferred available date and time slot from the instructor's live evaluation calendar.
          </p>
        </div>

        {/* Date Selection Tabs */}
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
            1. Select Available Date
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(slot.dateStr);
                  setSelectedTime(null);
                }}
                className={`p-2.5 rounded-xl border text-center transition text-xs font-bold ${
                  selectedDate === slot.dateStr
                    ? 'bg-[#2563EB] border-blue-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {slot.date}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot Picker */}
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
            2. Select Session Time
          </label>
          <div className="grid grid-cols-2 gap-2">
            {activeSlotDate?.times.map((timeStr) => (
              <button
                key={timeStr}
                type="button"
                onClick={() => setSelectedTime(timeStr)}
                className={`p-3 rounded-xl border text-center transition text-xs font-mono font-bold flex items-center justify-center gap-2 ${
                  selectedTime === timeStr
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{timeStr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTime}
            onClick={handleConfirm}
            className="px-6 py-2.5 text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            <Check className="w-4 h-4" /> Reserve Slot
          </button>
        </div>

      </div>
    </div>
  );
}
