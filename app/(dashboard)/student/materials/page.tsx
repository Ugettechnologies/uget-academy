'use client';

import React, { useState } from 'react';
import { 
  FolderDown, 
  FileText, 
  Download, 
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';

interface Material {
  id: string;
  name: string;
  date: string;
  uploadedBy: string;
  uploadTime: string;
  size: string;
  type: string;
  fileName: string;
  previewText: string;
  highlightedText?: string;
}

const mockLibraryMaterials: Material[] = [
  {
    id: '1',
    name: 'Week 10: High-Fidelity Figma UI Redesign',
    date: '15/06/2026',
    uploadedBy: 'Chet Trutor',
    uploadTime: '15/06/2026 - 22:05',
    size: '323kb',
    type: 'PDF',
    fileName: 'Week_10_High_Fidelity.pdf',
    previewText: 'HOW INNOVATION WORKS\n\nInvent a way of automatically slicing bread to make uniform sandwiches. It is lately obvious that this would probably happen in the first half of the twentieth century when electrical machines were all the rage for the first time. But why 1928? And why in the small town of Chillicothe, in the middle of Missouri? Lots of people tried to make bread-slicing machines, but they either worked poorly or they led to stale bread because it was not well packaged. The person who made it work was Otto Frederick Rohwedder, who was born in Iowa, was educated as an optician in Chicago and set up shop as a jeweler in St Joseph, Missouri, before moving back to Iowa determined - for some reason - to invent a bread slicer. He lost his first prototype in a fire in 1917 and had to start all over again. Crucially, he realized that he must invent automatic packaging of the bread at the same time lest the slices go stale.',
    highlightedText: 'Innovation happens when people are free to think, experiment and speculate. It happens when people are allowed to trade with each other. It happens when people are relatively prosperous, but desperate. It is somewhat contagious: it needs investment; it generally happens in cities. And so on. But do we really understand it? What is the best way to encourage innovation? To let singers, direct research, subsidize science, write rules and standards, or to back'
  },
  {
    id: '2',
    name: 'Week 9: Next.js Pages & App Router Routing',
    date: '08/06/2026',
    uploadedBy: 'Chet Trutor',
    uploadTime: '08/06/2026 - 18:30',
    size: '412kb',
    type: 'PDF',
    fileName: 'Nextjs_Routing_Architecture.pdf',
    previewText: 'NEXT.JS APP ROUTER ARCHITECTURE\n\nNext.js App Router introduces a new routing model built on React Server Components (RSC). Routes are declared via folder structure hierarchy where page.tsx acts as the leaf element. Layouts can be nested dynamically allowing persistent state and avoiding unneeded re-rendering cycles. Turbopack compilation streamlines local execution.',
    highlightedText: 'React Server Components execute entirely on the server, minimizing bundle payload sizes and improving overall SEO response metrics. Layout structures nest recursively within segments.'
  },
  {
    id: '3',
    name: 'Week 8: State Management & Hooks Guide',
    date: '01/06/2026',
    uploadedBy: 'Chet Trutor',
    uploadTime: '01/06/2026 - 14:15',
    size: '280kb',
    type: 'PDF',
    fileName: 'React_State_Guides.pdf',
    previewText: 'STATE PROPAGATION AND CONTEXT\n\nManaging complex layouts state context in React requires structured prop delegation rules. Context API bypasses props drilling, allowing deep nested components to consume state contexts directly. Reducer patterns ensure predictable mutations.',
    highlightedText: 'Use Context selectively to avoid unnecessary top level rendering triggers. Keep local component states isolated wherever possible.'
  },
  {
    id: '4',
    name: 'Week 7: React Components Composition',
    date: '25/05/2026',
    uploadedBy: 'Chet Trutor',
    uploadTime: '25/05/2026 - 10:45',
    size: '345kb',
    type: 'PDF',
    fileName: 'React_Composition_Rules.pdf',
    previewText: 'COMPOSITIONAL REACT ARCHITECTURES\n\nBuilding decoupled features components involves composition design keys. Nesting components using children props creates scalable architectures and supports clean interface variations without prop expansion.',
    highlightedText: 'Prefer composition over inheritance. Isolate styles layout rules in container layout wrappers rather than base components.'
  }
];

export default function StudentMaterialsLibraryPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeMaterial = mockLibraryMaterials[selectedIdx] || mockLibraryMaterials[0];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Materials Library</h1>
        <p className="text-slate-500 text-xs mt-1">Cohort 1. Web Development</p>
      </div>

      {/* Split layout wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Table Checklist of PDF documents */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm select-none">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-[#1E60D5] focus:ring-[#1E60D5]" readOnly checked />
                  </th>
                  <th className="px-4 py-4">Name</th>
                  <th className="px-6 py-4 text-right flex items-center justify-end gap-1">
                    <span>Date</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mockLibraryMaterials.map((material, idx) => {
                  const isSelected = idx === selectedIdx;
                  return (
                    <tr 
                      key={material.id} 
                      onClick={() => setSelectedIdx(idx)}
                      className={`cursor-pointer transition duration-150 ${
                        isSelected 
                          ? 'bg-[#E8F1FC] hover:bg-[#E8F1FC]' 
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => setSelectedIdx(idx)}
                          className="rounded border-slate-350 text-[#1E60D5] focus:ring-[#1E60D5]" 
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-base flex-shrink-0 ${isSelected ? 'text-[#EF4444]' : 'text-slate-400'}`}>
                            📄
                          </span>
                          <span className={`font-semibold text-xs leading-normal ${isSelected ? 'text-[#1E60D5]' : 'text-slate-705'}`}>
                            {material.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400 font-semibold">{material.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Split PDF viewer pane */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Preview name */}
          <div className="bg-white rounded-3xl border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/55 border-b border-slate-50 flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 truncate pr-4">{activeMaterial.name}</span>
              <button 
                onClick={() => alert(`Downloading ${activeMaterial.fileName}...`)}
                className="text-[#1E60D5] hover:text-[#1E60D5]/90 transition"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated PDF Preview Pane */}
            <div className="p-6 bg-slate-100 flex items-center justify-center border-b border-slate-50">
              <div className="bg-white shadow-md border border-slate-200 rounded p-6 h-[280px] w-full overflow-y-auto font-serif text-[10px] leading-relaxed text-slate-850 select-text scrollbar-thin">
                <p className="whitespace-pre-line mb-3">{activeMaterial.previewText}</p>
                {activeMaterial.highlightedText && (
                  <p className="bg-yellow-200/90 text-slate-850 p-2.5 rounded-lg border-l-4 border-yellow-500 font-medium">
                    {activeMaterial.highlightedText}
                  </p>
                )}
              </div>
            </div>

            {/* Related data section */}
            <div className="p-6 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">Related data</h4>
              
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-center border-b border-slate-50/50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Name</span>
                  <span className="font-bold text-slate-700 truncate max-w-[200px]">{activeMaterial.fileName}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-50/50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Uploaded by</span>
                  <span className="font-bold text-slate-700">{activeMaterial.uploadedBy}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-50/50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Upload date</span>
                  <span className="font-bold text-slate-700 font-mono">{activeMaterial.uploadTime}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-50/50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Size</span>
                  <span className="font-bold text-slate-700">{activeMaterial.size}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Type</span>
                  <span className="font-bold text-[#1E60D5] bg-[#E0EEFF] px-2 py-0.5 rounded text-[10px] tracking-wide">{activeMaterial.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
