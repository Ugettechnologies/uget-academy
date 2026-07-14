'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderDown, 
  FileText, 
  Download, 
  AlertCircle,
  FileSpreadsheet,
  ChevronDown,
  Loader2,
  BookOpen
} from 'lucide-react';

interface Material {
  id: string;
  name: string;
  fileName: string;
  url: string;
  lessonTitle: string;
  courseTitle: string;
  date: string;
  uploadTime: string;
  uploadedBy: string;
  size: string;
  type: string;
}

export default function StudentMaterialsLibraryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const res = await fetch('/api/student/materials');
        if (res.ok) {
          const data = await res.json();
          setMaterials(data);
        }
      } catch (err) {
        console.error('Failed to load materials:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, []);

  const activeMaterial = materials[selectedIdx];

  return (
    <div className="space-y-6 animate-fade-in text-text-primary">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">Materials Library</h1>
        <p className="text-text-secondary text-xs mt-1">Access lecture notes, guides, and download resources uploaded by your instructor.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-surface-card border border-border-divider rounded-3xl h-[400px]">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
          <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Retrieving course materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-surface-card border border-border-divider rounded-3xl h-[400px] space-y-4">
          <div className="w-16 h-16 bg-royal-purple/10 border border-royal-purple/20 rounded-full flex items-center justify-center text-accent-purple shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="text-base font-black text-text-primary">No materials uploaded yet</h4>
            <p className="text-text-secondary text-xs leading-relaxed">
              Your instructor has not uploaded any additional files, guides, or course materials for your active classes yet. They will appear here once sent.
            </p>
          </div>
        </div>
      ) : (
        /* Split layout wrapper */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Table Checklist of documents */}
          <div className="lg:col-span-7 bg-surface-card rounded-3xl border border-border-divider overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm select-none">
                <thead>
                  <tr className="border-b border-border-divider bg-[#150E27]/40 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 w-12 text-center">
                      <input type="checkbox" className="rounded border-border-divider text-royal-purple focus:ring-royal-purple" readOnly checked />
                    </th>
                    <th className="px-4 py-4">Document Title</th>
                    <th className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      <span>Shared Date</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-divider text-text-primary">
                  {materials.map((material, idx) => {
                    const isSelected = idx === selectedIdx;
                    return (
                      <tr 
                        key={material.id} 
                        onClick={() => setSelectedIdx(idx)}
                        className={`cursor-pointer transition duration-150 ${
                          isSelected 
                            ? 'bg-royal-purple/20 text-accent-purple' 
                            : 'hover:bg-royal-purple/10'
                        }`}
                      >
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => setSelectedIdx(idx)}
                            className="rounded border-border-divider text-royal-purple focus:ring-royal-purple" 
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`text-base flex-shrink-0 ${isSelected ? 'text-royal-gold' : 'text-text-secondary'}`}>
                              📄
                            </span>
                            <div className="flex flex-col">
                              <span className={`font-semibold text-xs leading-normal ${isSelected ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
                                {material.name}
                              </span>
                              <span className="text-[9px] text-text-secondary font-semibold">
                                {material.courseTitle} • {material.lessonTitle}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-text-secondary font-semibold">{material.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Split viewer pane */}
          <div className="lg:col-span-5 space-y-6">
            {activeMaterial && (
              <div className="bg-surface-card rounded-3xl border border-border-divider overflow-hidden shadow-lg">
                <div className="px-6 py-4 bg-[#150E27]/40 border-b border-border-divider flex items-center justify-between">
                  <span className="text-xs font-black text-text-primary truncate pr-4">{activeMaterial.name}</span>
                  <a 
                    href={activeMaterial.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent-purple hover:text-accent-purple/80 transition p-2 hover:bg-royal-purple/10 rounded-xl"
                    title="Download Resource"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                {/* Simulated PDF Preview Pane */}
                <div className="p-6 bg-deep-violet flex flex-col items-center justify-center border-b border-border-divider h-[200px]">
                  <FileText className="w-12 h-12 text-royal-gold animate-bounce" />
                  <p className="text-[10px] text-text-secondary font-black uppercase mt-3 tracking-widest">Document Available for download</p>
                  <a 
                    href={activeMaterial.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 bg-royal-purple hover:bg-royal-purple/90 text-white font-bold text-xs py-2 px-5 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download {activeMaterial.type}
                  </a>
                </div>

                {/* Related details section */}
                <div className="p-6 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-divider pb-2">Document Metadata</h4>
                  
                  <div className="space-y-2.5 text-xs text-text-primary">
                    <div className="flex justify-between items-center border-b border-border-divider/55 pb-1.5">
                      <span className="text-text-secondary font-semibold">File Name</span>
                      <span className="font-bold text-text-primary truncate max-w-[200px]">{activeMaterial.fileName}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-border-divider/55 pb-1.5">
                      <span className="text-text-secondary font-semibold">Uploaded by</span>
                      <span className="font-bold text-text-primary">{activeMaterial.uploadedBy}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-border-divider/55 pb-1.5">
                      <span className="text-text-secondary font-semibold">Upload date</span>
                      <span className="font-bold text-text-primary font-mono">{activeMaterial.uploadTime}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-border-divider/55 pb-1.5">
                      <span className="text-text-secondary font-semibold">Size</span>
                      <span className="font-bold text-text-primary">{activeMaterial.size}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary font-semibold">Type</span>
                      <span className="font-bold text-accent-purple bg-royal-purple/20 px-2 py-0.5 rounded text-[10px] tracking-wide border border-royal-purple/10">{activeMaterial.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
