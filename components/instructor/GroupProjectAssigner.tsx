'use client';

import React, { useState } from 'react';
import { Users2, Plus, Check, Sparkles, FolderGit2, BookOpen, Layers } from 'lucide-react';

interface StudentGroup {
  id: string;
  groupName: string;
  projectTitle: string;
  members: string[];
  dueDate: string;
  status: 'IN_PROGRESS' | 'SUBMITTED';
}

export default function GroupProjectAssigner() {
  const courseTitle = 'Cybersecurity & Threat Intelligence';

  const [groups, setGroups] = useState<StudentGroup[]>([
    {
      id: 'grp-1',
      groupName: 'Group Alpha (Cyber Defense)',
      projectTitle: 'Enterprise SIEM & Log Aggregation Pipeline',
      members: ['Grace Hopper', 'Alan Turing'],
      dueDate: 'Aug 14, 2026',
      status: 'IN_PROGRESS',
    },
    {
      id: 'grp-2',
      groupName: 'Group Beta (Threat Auditing)',
      projectTitle: 'Zero-Trust Network Access & Firewall Ruleset',
      members: ['Margaret Hamilton', 'John von Neumann'],
      dueDate: 'Aug 14, 2026',
      status: 'IN_PROGRESS',
    },
  ]);

  const [groupNameInput, setGroupNameInput] = useState('');
  const [projectTitleInput, setProjectTitleInput] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [dueDateInput, setDueDateInput] = useState('Friday Aug 14, 11:59 PM');
  const [isSuccess, setIsSuccess] = useState(false);

  const availableStudents = [
    'Grace Hopper',
    'Alan Turing',
    'Margaret Hamilton',
    'John von Neumann',
    'Ada Lovelace Jr.',
    'Claude Shannon',
  ];

  const handleToggleMember = (studentName: string) => {
    if (selectedMembers.includes(studentName)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== studentName));
    } else {
      setSelectedMembers([...selectedMembers, studentName]);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupNameInput || !projectTitleInput || selectedMembers.length === 0) return;

    const newGrp: StudentGroup = {
      id: `grp-${Date.now()}`,
      groupName: groupNameInput,
      projectTitle: projectTitleInput,
      members: selectedMembers,
      dueDate: dueDateInput,
      status: 'IN_PROGRESS',
    };

    setGroups([...groups, newGrp]);
    setGroupNameInput('');
    setProjectTitleInput('');
    setSelectedMembers([]);

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 text-white animate-fade-in">
      
      {/* Group Creation Form */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Group & Pair Project Assigner</h2>
              <p className="text-xs text-gray-400">Split class into teams and assign shared cohort deliverables.</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-500/30">
            Track: {courseTitle}
          </span>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Group / Pair Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Group Gamma (Pentesting Pair)"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">Shared Project Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Active Directory Penetration & Remediation Project"
                value={projectTitleInput}
                onChange={(e) => setProjectTitleInput(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Member Selection Checkboxes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300">Select Group Members (Pairs or Teams)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableStudents.map((student) => {
                const isSelected = selectedMembers.includes(student);
                return (
                  <button
                    key={student}
                    type="button"
                    onClick={() => handleToggleMember(student)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{student}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {isSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Group Created & Assigned!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" /> Assign Shared Group Project
            </button>
          </div>
        </form>
      </div>

      {/* Active Groups Directory */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
          Assigned Cohort Groups ({groups.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((grp) => (
            <div
              key={grp.id}
              className="p-6 bg-[#0F172A] border border-white/10 rounded-3xl space-y-4 shadow-xl hover:border-indigo-500/30 transition"
            >
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">
                    {grp.groupName}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{grp.projectTitle}</h4>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  {grp.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Group Members:</span>
                <div className="flex flex-wrap gap-1.5">
                  {grp.members.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-[11px] font-bold"
                    >
                      👤 {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-gray-400">
                <span>Due Date: {grp.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
