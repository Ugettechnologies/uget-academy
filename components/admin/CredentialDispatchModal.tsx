'use client';

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Share2, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  User, 
  ExternalLink 
} from 'lucide-react';

export interface CredentialData {
  name: string;
  username: string;
  passwordCode: string;
  email: string;
  role: 'INSTRUCTOR' | 'STAFF' | 'STUDENT' | 'ADMIN';
  phone?: string | null;
}

interface CredentialDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: CredentialData | null;
}

export default function CredentialDispatchModal({
  isOpen,
  onClose,
  credentials,
}: CredentialDispatchModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !credentials) return null;

  const loginUrl =
    credentials.role === 'ADMIN'
      ? 'https://uget-academy-nine.vercel.app/admin/login'
      : credentials.role === 'STAFF'
      ? 'https://uget-academy-nine.vercel.app/staff/login'
      : credentials.role === 'INSTRUCTOR'
      ? 'https://uget-academy-nine.vercel.app/login'
      : 'https://uget-academy-nine.vercel.app/login';

  const roleTitle =
    credentials.role === 'INSTRUCTOR'
      ? 'Instructor'
      : credentials.role === 'STAFF'
      ? 'HR & Staff'
      : credentials.role === 'STUDENT'
      ? 'Student'
      : 'Administrator';

  const formattedText = `Hello ${credentials.name},

Here are your official UGET Academy ${roleTitle} login credentials:

• Username / ID: ${credentials.username}
• Password Code: ${credentials.passwordCode}
• Portal URL: ${loginUrl}

Please sign in and keep your credentials secure.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const cleanPhone = credentials.phone ? credentials.phone.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedText)}`
    : `https://wa.me/?text=${encodeURIComponent(formattedText)}`;

  const mailtoUrl = `mailto:${credentials.email}?subject=${encodeURIComponent(
    `UGET Academy ${roleTitle} Login Credentials`
  )}&body=${encodeURIComponent(formattedText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-white text-left">
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Credentials Generated & Dispatched
              </h3>
              <p className="text-xs text-amber-300 font-mono">
                Role Scope: {roleTitle} Account
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credentials Box */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-amber-500/30 space-y-3 font-mono text-xs shadow-inner">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Account Name:</span>
            <span className="font-bold text-white text-sm">{credentials.name}</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Username / Login ID:</span>
            <span className="font-bold text-emerald-400 text-sm bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
              {credentials.username}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Auto Password Code:</span>
            <span className="font-bold text-amber-300 text-sm bg-amber-950/60 px-2.5 py-1 rounded border border-amber-500/30">
              {credentials.passwordCode}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Recipient Email:</span>
            <span className="text-gray-200 text-xs truncate max-w-[200px]">{credentials.email}</span>
          </div>
        </div>

        {/* Action Buttons: WhatsApp / Email / Copy */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">
            Instant Credential Dispatch Links:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4" /> Send via WhatsApp
            </a>

            {/* Email Button */}
            <a
              href={mailtoUrl}
              className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Mail className="w-4 h-4" /> Send via Email
            </a>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" /> Copy Credentials Message
              </>
            )}
          </button>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition underline"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
