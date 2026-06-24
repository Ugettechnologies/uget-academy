'use client';

import React, { useState } from 'react';

interface LessonUploaderProps {
  courseId: string;
  onLessonAdded: () => void;
}

export default function LessonUploader({ courseId, onLessonAdded }: LessonUploaderProps) {
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState('1');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!videoFile) {
      setError('Please select a video file to upload.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Create Lesson & get Mux upload URL
      setStatus('Creating lesson and preparing video server...');
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          order: parseInt(order),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lesson.');
      }

      const { lesson, uploadUrl } = data;

      // 2. Upload video file directly to Mux uploadUrl using XMLHttpRequest (for progress tracking)
      setStatus('Uploading video directly to Mux...');
      
      const xhr = new XMLHttpRequest();
      
      await new Promise<void>((resolve, reject) => {
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', videoFile.type);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentage);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Failed to upload video file to Mux.'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during video upload.'));
        xhr.send(videoFile);
      });

      // 3. Verify upload and retrieve Mux playback ID
      setStatus('Verifying video processing with Mux (this may take a minute)...');
      setUploadProgress(100);

      // Poll verification endpoint
      let isVerified = false;
      const verifyUrl = `/api/lessons/${lesson.id}/verify`;

      while (!isVerified) {
        const verifyRes = await fetch(verifyUrl, { method: 'POST' });
        const verifyData = await verifyRes.json();

        if (verifyRes.status === 200) {
          isVerified = true;
          setStatus('Video uploaded and verified successfully!');
          setTitle('');
          setOrder((prev) => (parseInt(prev) + 1).toString());
          setVideoFile(null);
          setUploadProgress(0);
          onLessonAdded();
          break;
        } else if (verifyRes.status === 202) {
          // Video is processing, wait and poll again
          setStatus(`Processing: ${verifyData.status}...`);
          await new Promise((res) => setTimeout(res, 4000));
        } else {
          throw new Error(verifyData.error || 'Failed to verify Mux video.');
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during video upload.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">
        Add New Lesson Video
      </h3>

      <form onSubmit={handleUpload} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {status && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            {status}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Lesson Title
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-3 text-gray-950 dark:text-white placeholder-gray-400 focus:border-brand-primary focus:ring-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition text-sm"
                placeholder="e.g., Module 1: Project Architecture Setup"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Lesson Order
              </label>
              <input
                type="number"
                required
                min="1"
                disabled={loading}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-3 text-gray-950 dark:text-white placeholder-gray-400 focus:border-brand-primary focus:ring-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Lesson Video File (MP4, MOV, etc.)
            </label>
            <input
              type="file"
              accept="video/*"
              required
              disabled={loading}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        {uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>Uploading Video</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-primary h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-lg border border-transparent bg-brand-primary py-3 px-4 text-sm font-semibold text-white hover:bg-brand-primary/95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 transition shadow-lg shadow-brand-primary/20"
        >
          {loading ? 'Processing Upload...' : 'Upload Lesson Video'}
        </button>
      </form>
    </div>
  );
}
