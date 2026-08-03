'use client';

import React, { useState } from 'react';
import { ListTodo, Plus, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react';

interface TodoTask {
  id: string;
  taskText: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
}

export default function InstructorTodoList() {
  const [tasks, setTasks] = useState<TodoTask[]>([
    {
      id: 't-1',
      taskText: 'Grade Grace Hopper & Alan Turing OWASP Penetration Reports',
      completed: false,
      priority: 'HIGH',
      dueDate: 'Today',
    },
    {
      id: 't-2',
      taskText: 'Draft Section 3 Interview Questions for Thursday Exam',
      completed: false,
      priority: 'HIGH',
      dueDate: 'Tomorrow',
    },
    {
      id: 't-3',
      taskText: 'Upload WireShark Network Protocol Lab Slides to Materials',
      completed: true,
      priority: 'MEDIUM',
      dueDate: 'Aug 2',
    },
  ]);

  const [newTaskInput, setNewTaskInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const newTask: TodoTask = {
      id: `t-${Date.now()}`,
      taskText: newTaskInput.trim(),
      completed: false,
      priority: priorityInput,
      dueDate: 'Today',
    };

    setTasks([newTask, ...tasks]);
    setNewTaskInput('');
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Add Task Box */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-teal-400" /> Plan Instructor Daily / Weekly Tasks
        </h3>

        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Add new task e.g. Review Module 5 Practical Lab Submissions..."
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            className="flex-1 bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
          />

          <select
            value={priorityInput}
            onChange={(e) => setPriorityInput(e.target.value as any)}
            className="bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <button
            type="submit"
            disabled={!newTaskInput.trim()}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </form>
      </div>

      {/* Task List Directory */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
          Your Active Tasks ({tasks.filter((t) => !t.completed).length} Remaining)
        </h4>

        <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-xl divide-y divide-white/5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 flex items-center justify-between gap-4 transition ${
                task.completed ? 'bg-white/5 opacity-60' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="text-teal-400 hover:opacity-80 transition"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 fill-teal-500 text-[#0F172A]" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <span
                  className={`text-xs font-bold ${
                    task.completed ? 'line-through text-gray-400' : 'text-white'
                  }`}
                >
                  {task.taskText}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {task.priority === 'HIGH' && (
                  <span className="text-[9px] font-extrabold uppercase bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                    High
                  </span>
                )}
                {task.priority === 'MEDIUM' && (
                  <span className="text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Medium
                  </span>
                )}
                {task.priority === 'LOW' && (
                  <span className="text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                    Low
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
