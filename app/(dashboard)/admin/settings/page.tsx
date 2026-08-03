import React from 'react';
import { requireRole } from '@/lib/require-role';
import AdminSettingsView from '@/components/admin/AdminSettingsView';
import { Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <Settings className="w-7 h-7 text-amber-400" />
            Admin Security & Notification Matrix Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Account security, 2FA settings, and event notification matrix toggles across Email, In-App, and Slack.
          </p>
        </div>
      </div>

      <AdminSettingsView />
    </div>
  );
}
