'use client';

import React, { useState, useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { CheckCircle2, PlayCircle, Clock, AlertCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  order: number;
  muxPlaybackId: string | null;
}

interface CourseWatchViewProps {
  course: {
    id: string;
    title: string;
    description: string;
  };
  lessons: Lesson[];
}

export default function CourseWatchView({ course, lessons }: CourseWatchViewProps) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    lessons.length > 0 ? lessons[0] : null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Reference to track active lesson in effect without re-running interval
  const activeLessonRef = useRef<Lesson | null>(activeLesson);
  useEffect(() => {
    activeLessonRef.current = activeLesson;
  }, [activeLesson]);

  // Fetch current attendance logs when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/student/stats');
        if (response.ok) {
          const data = await response.json();
          const map: Record<string, number> = {};
          data.attendanceLogs?.forEach((log: any) => {
            map[log.lessonId] = log.durationSeconds;
          });
          setAttendanceMap(map);
        }
      } catch (err) {
        console.error('Failed to load student progress:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Ping attendance endpoint while playing
  useEffect(() => {
    if (!isPlaying || !activeLesson) return;

    const interval = setInterval(async () => {
      const currentLesson = activeLessonRef.current;
      if (!currentLesson) return;

      try {
        const response = await fetch(`/api/lessons/${currentLesson.id}/attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ increment: 10 }),
        });

        if (response.ok) {
          const data = await response.json();
          setAttendanceMap((prev) => ({
            ...prev,
            [currentLesson.id]: data.durationSeconds,
          }));
        }
      } catch (err) {
        console.error('Failed to record watch attendance:', err);
      }
    }, 10000); // Ping every 10 seconds

    return () => clearInterval(interval);
  }, [isPlaying, activeLesson]);

  const formatDuration = (seconds: number = 0) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Video Player & Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video flex items-center justify-center text-white relative group">
          {activeLesson?.muxPlaybackId ? (
            <MuxPlayer
              playbackId={activeLesson.muxPlaybackId}
              metadataVideoTitle={activeLesson.title}
              metadataViewerUserId={course.id}
              primaryColor="#2563EB"
              className="w-full h-full object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-brand-accent animate-pulse">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Video is being prepared</h4>
                <p className="text-slate-400 text-xs max-w-xs mx-auto">
                  {activeLesson
                    ? 'Mux is still encoding the lesson file. Please reload the page in a moment.'
                    : 'Select a lesson from the syllabus sidebar.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full filter blur-3xl" />
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/15 text-brand-accent border border-brand-primary/20">
              <PlayCircle className="w-3.5 h-3.5" />
              Now Playing
            </span>
            {activeLesson && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Time Spent: <strong className="text-brand-accent">{formatDuration(attendanceMap[activeLesson.id])}</strong>
              </span>
            )}
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-1">
            {activeLesson?.title || 'Select a lesson'}
          </h3>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed font-normal">
            {course.description}
          </p>
        </div>
      </div>

      {/* Syllabus Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Course Syllabus</span>
              <span className="text-xs font-medium text-slate-400">
                {lessons.length} Modules
              </span>
            </h4>

            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {lessons.map((lesson) => {
                const watchSeconds = attendanceMap[lesson.id] || 0;
                const isCompleted = watchSeconds >= 60;
                const isActive = activeLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveLesson(lesson);
                    }}
                    className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border text-left transition ${
                      isActive
                        ? 'border-brand-primary/50 bg-brand-primary/10 text-white shadow-lg shadow-brand-primary/5'
                        : 'border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-primary text-white scale-110 shadow-md shadow-brand-primary/20'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-850 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        lesson.order
                      )}
                    </span>
                    <div className="space-y-1 flex-grow">
                      <span className="text-xs font-bold block line-clamp-2 leading-snug">
                        {lesson.title}
                      </span>
                      {watchSeconds > 0 && (
                        <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Progress: {formatDuration(watchSeconds)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
