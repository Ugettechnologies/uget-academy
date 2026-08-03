'use client';

import React, { useState } from 'react';
import { FolderDown, Upload, Link as LinkIcon, Check, FileText, Sparkles, BookOpen } from 'lucide-react';

export default function LessonUploader() {
  const courseTitle = 'Cybersecurity & Threat Intelligence';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('LECTURE_SLIDES');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');

  const [materialsList, setMaterialsList] = useState([
    {
      id: 'mat-1',
      title: 'Module 4: OWASP Top 10 Threat Analysis Slides (.pdf)',
      category: 'LECTURE_SLIDES',
      url: 'https://cdn.uget-academy.online/materials/owasp-top10-slides.pdf',
      date: 'Aug 2, 2026',
    },
    {
      id: 'mat-2',
      title: 'WireShark Network Packet Analysis Starter Kit',
      category: 'PRACTICAL_GUIDE',
      url: 'https://cdn.uget-academy.online/materials/wireshark-starter-kit.zip',
      date: 'Jul 29, 2026',
    },
  ]);

  const [isSuccess, setIsSuccess] = useState(false);

  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl) return;

    const newMat = {
      id: `mat-${Date.now()}`,
      title,
      category,
      url: fileUrl,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setMaterialsList([newMat, ...materialsList]);
    setTitle('');
    setFileUrl('');
    setDescription('');

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 text-white animate-fade-in">
      
      {/* Upload Form */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Upload & Send Course Material</h2>
              <p className="text-xs text-gray-400">Dispatches resource directly to assigned students' Materials Library.</p>
            </div>
          </div>
          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-purple-500/30">
            Track: {courseTitle}
          </span>
        </div>

        <form onSubmit={handleUploadMaterial} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Material Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Module 5: Network Forensics Exercise Kit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="LECTURE_SLIDES">Lecture Slides</option>
                <option value="PRACTICAL_GUIDE">Practical Lab Guide</option>
                <option value="SOURCE_CODE">Starter Code & Repository</option>
                <option value="REFERENCE_DOC">Reference Book / PDF</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">Resource Download URL or CDN File Link</label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://cdn.uget-academy.online/materials/file.pdf"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-500"
              />
              <LinkIcon className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {isSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Dispatched to Student Materials Library!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <Upload className="w-4 h-4" /> Send Material to Students
            </button>
          </div>
        </form>
      </div>

      {/* Dispatched Materials Directory */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
          Dispatched Materials Directory ({materialsList.length})
        </h3>

        <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="divide-y divide-white/5">
            {materialsList.map((mat) => (
              <div key={mat.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition">
                <div className="space-y-1 min-w-0">
                  <span className="text-[9px] font-extrabold uppercase bg-white/10 text-purple-300 px-2 py-0.5 rounded border border-white/10">
                    {mat.category}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{mat.title}</h4>
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-purple-300 hover:underline block truncate"
                  >
                    {mat.url}
                  </a>
                </div>

                <span className="text-[10px] text-gray-400 font-mono shrink-0">
                  {mat.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
