import React from 'react';
import { requireRole } from '@/lib/require-role';
import RoleManager from '@/components/admin/RoleManager';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <ShieldAlert className="w-7 h-7 text-[#60A5FA]" />
            Team & Roles Permissions Matrix (HR / Ops Layer)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage platform operation members (Owner, Admin, Billing Manager, Read-Only) and access control matrix.
          </p>
        </div>
      </div>

      <RoleManager />
    </div>
  );
}
