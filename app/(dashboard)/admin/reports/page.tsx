import React from 'react';
import { requireRole } from '@/lib/require-role';
import AdminReportsView from '@/components/admin/AdminReportsView';
import { BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <BarChart3 className="w-7 h-7 text-rose-400" />
            5-Tab Reports & Analytics Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Enrolled growth, revenue (₦9.2M), attendance logs, course completion, and instructor performance ratings.
          </p>
        </div>
      </div>

      <AdminReportsView />
    </div>
  );
}
