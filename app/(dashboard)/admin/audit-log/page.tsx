import React from 'react';
import { requireRole } from '@/lib/require-role';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Terminal,
  Globe,
  RefreshCw
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    action?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  await requireRole(['ADMIN']);

  const params = await searchParams;
  const q = params.q || '';
  const action = params.action || '';

  // Query audit logs with server-side filters
  const logs = await prisma.auditLog.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { userEmail: { contains: q, mode: 'insensitive' } },
            { targetId: { contains: q, mode: 'insensitive' } },
            { userId: { contains: q, mode: 'insensitive' } },
          ]
        } : {},
        action ? { action: action } : {},
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Query distinct actions for filter dropdown
  const distinctActions = await prisma.auditLog.findMany({
    distinct: ['action'],
    select: {
      action: true
    }
  });

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-950 dark:text-white">
            <Activity className="w-8 h-8 text-brand-primary" />
            Audit Logs
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Read-only chronological record of all administrative system actions
          </p>
        </div>

        <Link
          href="/admin/audit-log"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Reset Filters
        </Link>
      </div>

      {/* Filters Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search Term */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Search Email or Target
            </label>
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary transition"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-450" />
            </div>
          </div>

          {/* Action Type Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Action Type
            </label>
            <div className="relative">
              <select
                name="action"
                defaultValue={action}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary transition appearance-none"
              >
                <option value="">All Actions</option>
                {distinctActions.map((act: { action: string }) => (
                  <option key={act.action} value={act.action}>
                    {act.action}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-450" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
            >
              Apply Filter
            </button>
          </div>

        </form>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">No results found</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or resetting filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4 font-bold text-center">Ip Address</th>
                  <th className="px-6 py-4 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105 dark:divide-slate-850 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition">
                    
                    {/* Actor Details */}
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {log.userEmail}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {log.userId}</p>
                    </td>

                    {/* Action Details & Collapsible Payload */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="font-extrabold uppercase tracking-wide bg-brand-primary/10 text-brand-primary dark:text-indigo-400 px-2.5 py-0.5 rounded text-[9px]">
                          {log.action}
                        </span>
                        {log.targetId && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Terminal className="w-3 h-3 text-slate-450" />
                            <span>Target: <span className="font-mono text-slate-650 dark:text-slate-350">{log.targetId}</span></span>
                          </div>
                        )}
                      </div>

                      {/* Premium details block for metadata inspect */}
                      {log.metadata && (
                        <details className="group mt-2">
                          <summary className="cursor-pointer text-[10px] text-brand-primary group-open:text-brand-primary/80 font-bold select-none list-none hover:underline">
                            Inspect Payload
                          </summary>
                          <pre className="mt-2 text-[10px] bg-slate-950 text-emerald-400 p-3 rounded-lg overflow-x-auto font-mono max-h-40 border border-slate-800">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>

                    {/* IP */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-500 font-mono">
                        <Globe className="w-3 h-3 text-slate-400" />
                        {log.ip || 'no-ip'}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 text-right space-y-0.5">
                      <div className="flex items-center justify-end gap-1.5 text-slate-900 dark:text-white font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(log.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
