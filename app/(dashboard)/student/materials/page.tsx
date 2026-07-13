import React from 'react';
import { 
  FolderDown, 
  FileText, 
  Download, 
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface MaterialItem {
  name: string;
  size: string;
  category: string;
  type: string;
}

const materialsList: MaterialItem[] = [
  { name: 'UGET Academy Git & GitHub Cheat Sheet.pdf', size: '1.4 MB', category: 'Git & Setup', type: 'PDF Document' },
  { name: 'Advanced Semantic HTML Layouts Guide.pdf', size: '920 KB', category: 'HTML & CSS', type: 'PDF Document' },
  { name: 'CSS Flexbox & CSS Grid Cheatsheet.pdf', size: '2.5 MB', category: 'HTML & CSS', type: 'PDF Document' },
  { name: 'JavaScript Async Await & Promises Exercises.zip', size: '5.2 MB', category: 'JavaScript Core', type: 'Source Archive' },
  { name: 'Next.js App Router Structure & Layouts Cheat Sheet.pdf', size: '1.8 MB', category: 'React & Next.js', type: 'PDF Document' },
  { name: 'Prisma Client Schema & Postgres Pooling Configuration.txt', size: '12 KB', category: 'React & Next.js', type: 'Text Document' },
];

export default function StudentMaterialsPage() {
  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Course Materials</h1>
        <p className="text-slate-500 text-xs mt-1">Download and read study files, templates, cheatsheets, and project starter code.</p>
      </div>

      {/* Grid Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Categories checklist */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h3>
            <div className="space-y-2">
              {['All Materials', 'Git & Setup', 'HTML & CSS', 'JavaScript Core', 'React & Next.js'].map((cat, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    idx === 0
                      ? 'bg-[#E0EEFF] text-[#1E60D5]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Files list */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">Shared Documents & Assets</h2>
              <span className="text-xs text-slate-400 font-bold">{materialsList.length} items available</span>
            </div>

            <div className="divide-y divide-slate-50">
              {materialsList.map((material, idx) => (
                <div key={idx} className="p-5 px-8 flex items-center justify-between gap-6 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 leading-snug">{material.name}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        <span>{material.category}</span>
                        <span>•</span>
                        <span>{material.type}</span>
                        <span>•</span>
                        <span>{material.size}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => alert(`Downloading ${material.name}...`)}
                      className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-[#E0EEFF] text-slate-500 hover:text-[#1E60D5] flex items-center justify-center transition border border-slate-100 hover:border-blue-100 shadow-sm"
                      title="Download Resource"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
