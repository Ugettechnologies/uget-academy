'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, User, Search, Shield, GraduationCap, Check, Circle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: 'INSTRUCTOR' | 'STUDENT';
  username?: string;
  avatarUrl?: string;
  online: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
}

export default function StudentChatView() {
  const [contacts] = useState<Contact[]>([
    {
      id: 'ins-1',
      name: 'Dr. Ada Lovelace',
      role: 'INSTRUCTOR',
      username: 'UGT2026/INSCS/A026',
      online: true,
      lastMessage: 'Let me know if you need help on the cryptography assignment.',
      lastMessageTime: '11:45 AM',
    },
    {
      id: 'ins-2',
      name: 'Prof. Alan Turing',
      role: 'INSTRUCTOR',
      username: 'UGT2026/INSDA/A088',
      online: false,
      lastMessage: 'Section 3 interview slots are updated on the calendar.',
      lastMessageTime: 'Yesterday',
    },
    {
      id: 'stu-1',
      name: 'Grace Hopper',
      role: 'STUDENT',
      username: '2026/STU/A012',
      online: true,
      lastMessage: 'Hey! Did you check out the new Code Playground?',
      lastMessageTime: '10:30 AM',
    },
    {
      id: 'stu-2',
      name: 'Margaret Hamilton',
      role: 'STUDENT',
      username: '2026/STU/A044',
      online: false,
      lastMessage: 'Thanks for sending the lecture notes!',
      lastMessageTime: 'Jul 30',
    },
  ]);

  const [activeContact, setActiveContact] = useState<Contact>(contacts[0]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Array<{ senderId: string; text: string; time: string }>>>({
    'ins-1': [
      { senderId: 'ins-1', text: 'Hello! I am your course instructor for Cybersecurity.', time: '10:00 AM' },
      { senderId: 'me', text: 'Hi Dr. Ada, I have a quick question about the exam slot picker.', time: '10:15 AM' },
      { senderId: 'ins-1', text: 'Sure thing! You can select any open calendar slot for Section 2 & Section 3.', time: '11:45 AM' },
    ],
    'stu-1': [
      { senderId: 'stu-1', text: 'Hey! Did you check out the new Code Playground?', time: '10:30 AM' },
    ],
  });

  const [newMessageText, setNewMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentMessages = messagesMap[activeContact.id] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { senderId: 'me', text: newMessageText.trim(), time: timeStr };

    setMessagesMap((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg],
    }));

    setNewMessageText('');
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[640px] text-white animate-fade-in">
      
      {/* LEFT SIDEBAR: Contacts List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0B0F19]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#60A5FA]" />
            Messages & Directory
          </h3>

          <div className="relative">
            <input
              type="text"
              placeholder="Search classmate or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#2563EB]"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
          {filteredContacts.map((contact) => {
            const isSelected = activeContact.id === contact.id;
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => setActiveContact(contact)}
                className={`w-full p-3.5 text-left transition flex items-center gap-3 ${
                  isSelected
                    ? 'bg-[#2563EB]/20 border-l-4 border-[#2563EB]'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                    {contact.name.charAt(0)}
                  </div>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B0F19]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                    {contact.lastMessageTime && (
                      <span className="text-[9px] text-gray-400 font-mono">{contact.lastMessageTime}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    {contact.role === 'INSTRUCTOR' ? (
                      <span className="text-[9px] font-extrabold uppercase text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-500/30">
                        Instructor
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-gray-400">Classmate</span>
                    )}
                  </div>

                  {contact.lastMessage && (
                    <p className="text-[11px] text-gray-400 truncate mt-1">{contact.lastMessage}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT CHAT CONVERSATION VIEW */}
      <div className="flex-1 flex flex-col justify-between bg-[#0F172A]">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white font-bold text-sm flex items-center justify-center">
              {activeContact.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                {activeContact.name}
                {activeContact.role === 'INSTRUCTOR' && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-wider font-extrabold">
                    Course Instructor
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                {activeContact.username || activeContact.role} • {activeContact.online ? 'Online now' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto custom-scrollbar">
          {currentMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
              No messages yet. Send a message to start the conversation.
            </div>
          ) : (
            currentMessages.map((msg, index) => {
              const isMe = msg.senderId === 'me';
              return (
                <div
                  key={index}
                  className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-[#2563EB] text-white rounded-br-none'
                        : 'bg-[#1E293B] text-gray-200 border border-white/10 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono mt-1 px-1">{msg.time}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#0B0F19]">
          <input
            type="text"
            placeholder={`Message ${activeContact.name}...`}
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            className="flex-1 bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2563EB]"
          />
          <button
            type="submit"
            disabled={!newMessageText.trim()}
            className="p-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
